/*
 * Room client: signaling over /ws plus a full-mesh of RTCPeerConnections.
 *
 * Mesh rather than an SFU because the room caps at 10 and a mesh needs no extra
 * server process. It degrades past ~6 publishers; swapping in an SFU means replacing
 * this file and nothing else.
 *
 * Uses the "perfect negotiation" pattern so two peers offering at the same moment
 * cannot deadlock: the peer with the lexicographically smaller id is impolite and
 * wins a collision; the other rolls back and re-answers.
 */
import { wsUrl } from '../lib/api'
import type {
  ChatMessage,
  ClientMessage,
  IceServer,
  Participant,
  Role,
  RoomSnapshot,
  ServerMessage,
} from '@studio/shared'

export type RoomEvent =
  | { t: 'connected'; selfId: string; room: RoomSnapshot }
  | { t: 'room'; room: RoomSnapshot }
  | { t: 'waiting' }
  | { t: 'denied'; reason: string }
  | { t: 'stream'; participantId: string; stream: MediaStream }
  | { t: 'streamGone'; participantId: string }
  | { t: 'chat'; message: ChatMessage }
  | { t: 'closed' }
  | { t: 'error'; message: string }

type Listener = (e: RoomEvent) => void

interface PeerEntry {
  pc: RTCPeerConnection
  /** Perfect-negotiation bookkeeping. */
  makingOffer: boolean
  ignoreOffer: boolean
  polite: boolean
  stream: MediaStream
}

interface SignalPayload {
  description?: RTCSessionDescriptionInit
  candidate?: RTCIceCandidateInit
}

export class RoomClient {
  private ws: WebSocket | null = null
  private peers = new Map<string, PeerEntry>()
  private listeners = new Set<Listener>()
  private iceServers: IceServer[] = [{ urls: 'stun:stun.l.google.com:19302' }]

  private localStream: MediaStream | null = null
  private selfId = ''
  private closed = false
  private pingTimer = 0

  get id() {
    return this.selfId
  }

  on(fn: Listener) {
    this.listeners.add(fn)
    return () => {
      this.listeners.delete(fn)
    }
  }

  private emit(e: RoomEvent) {
    for (const fn of this.listeners) fn(e)
  }

  private send(msg: ClientMessage) {
    if (this.ws?.readyState === WebSocket.OPEN) this.ws.send(JSON.stringify(msg))
  }

  /* ---------------- lifecycle ---------------- */

  async connect(opts: { roomId: string; name: string; role: Role; stream?: MediaStream }) {
    this.closed = false
    this.localStream = opts.stream ?? null

    const ws = new WebSocket(wsUrl('/ws'))
    this.ws = ws

    await new Promise<void>((resolve, reject) => {
      ws.addEventListener('open', () => resolve(), { once: true })
      ws.addEventListener(
        'error',
        () => reject(new Error('Could not reach the room server')),
        { once: true },
      )
    })

    ws.addEventListener('message', (ev) => void this.onMessage(ev))
    ws.addEventListener('close', () => {
      if (!this.closed) this.emit({ t: 'closed' })
      this.teardownPeers()
    })

    this.send({ t: 'join', roomId: opts.roomId, name: opts.name, role: opts.role })

    /* Keeps intermediaries from idling the socket shut. */
    this.pingTimer = window.setInterval(() => this.send({ t: 'ping' }), 25_000)
  }

  disconnect() {
    this.closed = true
    if (this.pingTimer) clearInterval(this.pingTimer)
    this.pingTimer = 0
    this.send({ t: 'leave' })
    this.teardownPeers()
    this.ws?.close()
    this.ws = null
  }

  private teardownPeers() {
    for (const [id, p] of this.peers) {
      p.pc.onicecandidate = null
      p.pc.ontrack = null
      p.pc.onnegotiationneeded = null
      p.pc.close()
      this.emit({ t: 'streamGone', participantId: id })
    }
    this.peers.clear()
  }

  /* ---------------- local media ---------------- */

  /** Swap the outgoing stream, replacing tracks in place so no renegotiation stalls. */
  async setLocalStream(stream: MediaStream | null) {
    this.localStream = stream
    for (const { pc } of this.peers.values()) {
      const senders = pc.getSenders()
      for (const kind of ['video', 'audio'] as const) {
        const track = stream?.getTracks().find((t) => t.kind === kind) ?? null
        const sender = senders.find((s) => s.track?.kind === kind)
        if (sender) {
          await sender.replaceTrack(track).catch(() => {})
        } else if (track && stream) {
          pc.addTrack(track, stream)
        }
      }
    }
  }

  setMedia(patch: { micOn?: boolean; camOn?: boolean; screenOn?: boolean }) {
    this.send({ t: 'setMedia', ...patch })
  }

  sendChat(text: string) {
    this.send({ t: 'chat', text })
  }

  /* ---------------- host controls ---------------- */

  admit(participantId: string) {
    this.send({ t: 'admit', participantId })
  }

  deny(participantId: string) {
    this.send({ t: 'deny', participantId })
  }

  setStage(participantId: string, state: Participant['state']) {
    this.send({ t: 'setStage', participantId, state })
  }

  remove(participantId: string) {
    this.send({ t: 'removeParticipant', participantId })
  }

  /* ---------------- signaling ---------------- */

  private async onMessage(ev: MessageEvent) {
    let msg: ServerMessage
    try {
      msg = JSON.parse(String(ev.data)) as ServerMessage
    } catch {
      return
    }

    switch (msg.t) {
      case 'welcome': {
        this.selfId = msg.selfId
        if (msg.iceServers?.length) this.iceServers = msg.iceServers
        this.emit({ t: 'connected', selfId: msg.selfId, room: msg.room })
        /* Dial everyone already in the room. */
        for (const p of msg.room.participants) {
          if (p.id !== this.selfId) await this.ensurePeer(p.id)
        }
        break
      }

      case 'room':
        this.emit({ t: 'room', room: msg.room })
        break

      case 'peerJoined':
        /* The server also broadcasts a full room snapshot, so just dial the peer -
         * emitting a one-participant snapshot here would clobber the roster. */
        await this.ensurePeer(msg.participant.id)
        break

      case 'peerLeft':
        this.dropPeer(msg.participantId)
        break

      case 'signal':
        await this.onSignal(msg.from, msg.data as SignalPayload)
        break

      case 'waiting':
        this.emit({ t: 'waiting' })
        break

      case 'denied':
        this.closed = true
        this.emit({ t: 'denied', reason: msg.reason })
        break

      case 'chat':
        this.emit({ t: 'chat', message: msg.message })
        break

      case 'error':
        this.emit({ t: 'error', message: msg.message })
        break
    }
  }

  private async ensurePeer(remoteId: string): Promise<PeerEntry> {
    const existing = this.peers.get(remoteId)
    if (existing) return existing

    const pc = new RTCPeerConnection({ iceServers: this.iceServers as RTCIceServer[] })
    /* Deterministic and symmetric: exactly one side of each pair is polite. */
    const polite = this.selfId < remoteId

    const entry: PeerEntry = {
      pc,
      makingOffer: false,
      ignoreOffer: false,
      polite,
      stream: new MediaStream(),
    }
    this.peers.set(remoteId, entry)

    pc.onicecandidate = ({ candidate }) => {
      if (candidate) this.send({ t: 'signal', to: remoteId, data: { candidate } })
    }

    pc.ontrack = ({ track }) => {
      entry.stream.addTrack(track)
      this.emit({ t: 'stream', participantId: remoteId, stream: entry.stream })
    }

    pc.onnegotiationneeded = async () => {
      try {
        entry.makingOffer = true
        await pc.setLocalDescription()
        this.send({ t: 'signal', to: remoteId, data: { description: pc.localDescription! } })
      } catch {
        /* a parallel negotiation won - the other side's offer will drive us */
      } finally {
        entry.makingOffer = false
      }
    }

    pc.onconnectionstatechange = () => {
      if (pc.connectionState === 'failed') pc.restartIce()
      if (pc.connectionState === 'closed') this.dropPeer(remoteId)
    }

    if (this.localStream) {
      for (const track of this.localStream.getTracks()) {
        pc.addTrack(track, this.localStream)
      }
    }

    return entry
  }

  private async onSignal(from: string, data: SignalPayload) {
    const entry = await this.ensurePeer(from)
    const { pc } = entry

    try {
      if (data.description) {
        const desc = data.description
        const offerCollision =
          desc.type === 'offer' && (entry.makingOffer || pc.signalingState !== 'stable')

        entry.ignoreOffer = !entry.polite && offerCollision
        if (entry.ignoreOffer) return

        await pc.setRemoteDescription(desc)
        if (desc.type === 'offer') {
          await pc.setLocalDescription()
          this.send({ t: 'signal', to: from, data: { description: pc.localDescription! } })
        }
      } else if (data.candidate) {
        try {
          await pc.addIceCandidate(data.candidate)
        } catch {
          /* Candidates that arrive before the remote description, or after a
           * rolled-back offer, are expected to fail - only rethrow real errors. */
          if (!entry.ignoreOffer) throw new Error('ICE candidate rejected')
        }
      }
    } catch (e) {
      this.emit({ t: 'error', message: (e as Error).message })
    }
  }

  private dropPeer(remoteId: string) {
    const entry = this.peers.get(remoteId)
    if (!entry) return
    entry.pc.onicecandidate = null
    entry.pc.ontrack = null
    entry.pc.onnegotiationneeded = null
    entry.pc.onconnectionstatechange = null
    entry.pc.close()
    this.peers.delete(remoteId)
    this.emit({ t: 'streamGone', participantId: remoteId })
  }
}
