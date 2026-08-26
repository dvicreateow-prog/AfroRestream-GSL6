/*
 * Host-side room binding.
 *
 * The guest page has always been able to join a room, but the Studio never did -
 * so a guest could connect, see other guests, and still never appear on the host's
 * stage or in the broadcast. This closes that: the host joins as host, publishes
 * its own camera and mic so guests can see it, and feeds every remote stream into
 * the compositor as a capture.
 */
import { useCallback, useEffect, useRef, useState } from 'react'
import { RoomClient, type RoomEvent } from './roomClient'
import { engine } from './mediaEngine'
import type { ChatMessage, Participant, RoomSnapshot } from '@studio/shared'

export interface RoomBinding {
  connected: boolean
  connecting: boolean
  error: string
  participants: Participant[]
  waiting: Participant[]
  messages: ChatMessage[]
  selfId: string
  join: (roomId: string) => Promise<void>
  leave: () => void
  admit: (participantId: string) => void
  deny: (participantId: string) => void
  removeGuest: (participantId: string) => void
  sendChat: (text: string) => void
}

export function useRoom(): RoomBinding {
  const clientRef = useRef<RoomClient | null>(null)
  /* participantId -> engine capture id, so a leaver can be torn off the stage. */
  const captureByPeer = useRef(new Map<string, string>())

  const [connected, setConnected] = useState(false)
  const [connecting, setConnecting] = useState(false)
  const [error, setError] = useState('')
  const [participants, setParticipants] = useState<Participant[]>([])
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [selfId, setSelfId] = useState('')

  const dropPeerCapture = useCallback((participantId: string) => {
    const captureId = captureByPeer.current.get(participantId)
    if (!captureId) return
    engine.stopCapture(captureId)
    captureByPeer.current.delete(participantId)
  }, [])

  const leave = useCallback(() => {
    clientRef.current?.disconnect()
    clientRef.current = null
    for (const peerId of [...captureByPeer.current.keys()]) dropPeerCapture(peerId)
    setConnected(false)
    setParticipants([])
    setSelfId('')
  }, [dropPeerCapture])

  /* Tear the room down when the Studio unmounts. */
  useEffect(() => leave, [leave])

  const join = useCallback(
    async (roomId: string) => {
      if (clientRef.current) return
      setConnecting(true)
      setError('')

      const client = new RoomClient()
      clientRef.current = client

      client.on((e: RoomEvent) => {
        switch (e.t) {
          case 'connected':
            setSelfId(e.selfId)
            setParticipants(e.room.participants)
            setConnected(true)
            break

          case 'room':
            setParticipants((e.room as RoomSnapshot).participants)
            break

          case 'stream': {
            /* A guest's media has arrived - put it on the stage. */
            const existing = captureByPeer.current.get(e.participantId)
            if (existing) engine.stopCapture(existing)
            const name =
              participantsRef.current.find((p) => p.id === e.participantId)?.name ?? 'Guest'
            const handle = engine.addStream('camera', name, e.stream)
            captureByPeer.current.set(e.participantId, handle.id)
            break
          }

          case 'streamGone':
            dropPeerCapture(e.participantId)
            break

          case 'chat':
            setMessages((m) => [...m.slice(-199), e.message])
            break

          case 'denied':
            setError(e.reason)
            leave()
            break

          case 'closed':
            setConnected(false)
            break

          case 'error':
            setError(e.message)
            break
        }
      })

      try {
        /* Publish the host's own camera and mic so guests can see and hear them.
         * The compositor output is not sent to guests - they get the raw camera,
         * which keeps the mesh cheap and avoids a feedback loop. */
        const local = engine.hostPublishStream()
        await client.connect({ roomId, name: 'Host', role: 'host', stream: local ?? undefined })
      } catch (e) {
        setError((e as Error).message)
        clientRef.current = null
      } finally {
        setConnecting(false)
      }
    },
    [dropPeerCapture, leave],
  )

  /* Keep a ref of participants so the event handler can name incoming streams
   * without re-subscribing on every roster change. */
  const participantsRef = useRef<Participant[]>([])
  useEffect(() => {
    participantsRef.current = participants
  }, [participants])

  /* Rename a capture once the roster catches up with the stream. */
  useEffect(() => {
    for (const [peerId, captureId] of captureByPeer.current) {
      const p = participants.find((x) => x.id === peerId)
      if (p) engine.renameCapture(captureId, p.name)
    }
  }, [participants])

  const admit = useCallback((id: string) => clientRef.current?.admit(id), [])
  const deny = useCallback((id: string) => clientRef.current?.deny(id), [])
  const removeGuest = useCallback((id: string) => clientRef.current?.remove(id), [])
  const sendChat = useCallback((text: string) => clientRef.current?.sendChat(text), [])

  return {
    connected,
    connecting,
    error,
    participants: participants.filter((p) => p.approved),
    waiting: participants.filter((p) => !p.approved),
    messages,
    selfId,
    join,
    leave,
    admit,
    deny,
    removeGuest,
    sendChat,
  }
}
