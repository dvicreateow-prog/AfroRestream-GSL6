/*
 * Guest join flow: prejoin device check, then the live room.
 *
 * Guests get their own lightweight page rather than the Studio shell - they need a
 * preview, their own mute controls, and the other participants, nothing else.
 */
import { useCallback, useEffect, useRef, useState } from 'react'
import { useParams, useSearchParams } from 'react-router-dom'
import { Icon } from '../components/Icon'
import { RoomClient, type RoomEvent } from '../engine/roomClient'
import type { Participant, RoomSnapshot } from '@studio/shared'
import './join.css'

type Phase = 'prejoin' | 'connecting' | 'waiting' | 'live' | 'denied' | 'closed'

function Tile({
  name,
  color,
  stream,
  muted,
  self,
}: {
  name: string
  color: string
  stream: MediaStream | null
  muted?: boolean
  self?: boolean
}) {
  const ref = useRef<HTMLVideoElement>(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    if (el.srcObject !== stream) el.srcObject = stream
    if (stream) void el.play().catch(() => {})
  }, [stream])

  const hasVideo = !!stream?.getVideoTracks().some((t) => t.enabled && t.readyState === 'live')

  return (
    <div className="jtile">
      <video ref={ref} muted={self || muted} playsInline autoPlay className="jtile__video" />
      {!hasVideo && (
        <div className="jtile__avatar" style={{ background: color }}>
          {name.slice(0, 2).toUpperCase()}
        </div>
      )}
      <div className="jtile__name">
        {name}
        {self && ' (you)'}
      </div>
    </div>
  )
}

export function JoinPage() {
  const { roomId = 'studio' } = useParams()
  const [params] = useSearchParams()

  const [phase, setPhase] = useState<Phase>('prejoin')
  const [name, setName] = useState(params.get('name') ?? '')
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')

  const [localStream, setLocalStream] = useState<MediaStream | null>(null)
  const [micOn, setMicOn] = useState(true)
  const [camOn, setCamOn] = useState(true)

  const [room, setRoom] = useState<RoomSnapshot | null>(null)
  const [remote, setRemote] = useState<Record<string, MediaStream>>({})
  const clientRef = useRef<RoomClient | null>(null)
  const selfIdRef = useRef('')

  /* ---- prejoin preview ---- */
  const startPreview = useCallback(async () => {
    setError('')
    try {
      const s = await navigator.mediaDevices.getUserMedia({ video: true, audio: true })
      setLocalStream(s)
    } catch (e) {
      const msg = (e as Error).message
      setError(
        /denied|NotAllowed/i.test(msg)
          ? 'Camera and microphone access was blocked. Allow it in your browser and reload.'
          : msg,
      )
    }
  }, [])

  useEffect(() => {
    void startPreview()
    return () => {
      clientRef.current?.disconnect()
      setLocalStream((s) => {
        s?.getTracks().forEach((t) => t.stop())
        return null
      })
    }
  }, [startPreview])

  /* Enable/disable rather than re-acquiring, so the peer connection is untouched. */
  useEffect(() => {
    localStream?.getAudioTracks().forEach((t) => (t.enabled = micOn))
    clientRef.current?.setMedia({ micOn })
  }, [micOn, localStream])

  useEffect(() => {
    localStream?.getVideoTracks().forEach((t) => (t.enabled = camOn))
    clientRef.current?.setMedia({ camOn })
  }, [camOn, localStream])

  /* ---- join ---- */
  const join = async () => {
    if (!name.trim()) {
      setError('Enter a name so the host knows who you are.')
      return
    }
    setPhase('connecting')
    setError('')

    const client = new RoomClient()
    clientRef.current = client

    client.on((e: RoomEvent) => {
      if (e.t === 'connected') {
        selfIdRef.current = e.selfId
        setRoom(e.room)
        setPhase('live')
      } else if (e.t === 'room') {
        setRoom(e.room)
      } else if (e.t === 'waiting') {
        setPhase('waiting')
        setNotice('Waiting for the host to let you in.')
      } else if (e.t === 'denied') {
        setPhase('denied')
        setNotice(e.reason)
      } else if (e.t === 'stream') {
        setRemote((r) => ({ ...r, [e.participantId]: e.stream }))
      } else if (e.t === 'streamGone') {
        setRemote((r) => {
          const next = { ...r }
          delete next[e.participantId]
          return next
        })
      } else if (e.t === 'closed') {
        setPhase('closed')
        setNotice('You were disconnected from the room.')
      } else if (e.t === 'error') {
        setError(e.message)
      }
    })

    try {
      await client.connect({
        roomId,
        name: name.trim(),
        role: 'guest',
        stream: localStream ?? undefined,
      })
    } catch (e) {
      setPhase('prejoin')
      setError((e as Error).message)
    }
  }

  const leave = () => {
    clientRef.current?.disconnect()
    clientRef.current = null
    setPhase('prejoin')
    setRemote({})
    setRoom(null)
  }

  /* ---- render ---- */

  const others: Participant[] =
    room?.participants.filter((p) => p.id !== selfIdRef.current) ?? []

  if (phase === 'live' || phase === 'waiting') {
    return (
      <div className="join join--room">
        <header className="join__bar">
          <span className="join__mark">STUDIO</span>
          <span className="join__room">{room?.title || roomId}</span>
          <span className="join__count">
            {(room?.participants.length ?? 1)} in room
          </span>
        </header>

        {phase === 'waiting' && (
          <div className="join__notice">
            <Icon name="clock" size={15} />
            {notice}
          </div>
        )}

        <div className="join__grid">
          <Tile name={name} color="#2864f0" stream={localStream} self />
          {others.map((p) => (
            <Tile
              key={p.id}
              name={p.name}
              color={p.color}
              stream={remote[p.id] ?? null}
              muted={!p.micOn}
            />
          ))}
        </div>

        {error && (
          <div className="join__error">
            <Icon name="warning" size={14} />
            {error}
          </div>
        )}

        <div className="join__controls">
          <button
            className={`join__ctl ${micOn ? '' : 'join__ctl--off'}`}
            onClick={() => setMicOn((v) => !v)}
            aria-label={micOn ? 'Mute microphone' : 'Unmute microphone'}
          >
            <Icon name={micOn ? 'mic' : 'micOff'} size={19} />
          </button>
          <button
            className={`join__ctl ${camOn ? '' : 'join__ctl--off'}`}
            onClick={() => setCamOn((v) => !v)}
            aria-label={camOn ? 'Turn camera off' : 'Turn camera on'}
          >
            <Icon name={camOn ? 'cam' : 'camOff'} size={19} />
          </button>
          <button className="join__ctl join__ctl--leave" onClick={leave} aria-label="Leave">
            <Icon name="close" size={19} />
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="join">
      <div className="join__card">
        <h1 className="join__title">Join the studio</h1>
        <p className="join__sub">Check your camera and mic before you go in.</p>

        <div className="join__preview">
          <Tile name={name || 'You'} color="#2864f0" stream={localStream} self />
          {!localStream && (
            <button className="join__retry" onClick={() => void startPreview()}>
              <Icon name="refresh" size={14} />
              Retry camera
            </button>
          )}
        </div>

        <div className="join__row">
          <button
            className={`join__ctl ${micOn ? '' : 'join__ctl--off'}`}
            onClick={() => setMicOn((v) => !v)}
            aria-label="Toggle microphone"
          >
            <Icon name={micOn ? 'mic' : 'micOff'} size={18} />
          </button>
          <button
            className={`join__ctl ${camOn ? '' : 'join__ctl--off'}`}
            onClick={() => setCamOn((v) => !v)}
            aria-label="Toggle camera"
          >
            <Icon name={camOn ? 'cam' : 'camOff'} size={18} />
          </button>
        </div>

        <label className="join__label" htmlFor="join-name">
          Your name
        </label>
        <input
          id="join-name"
          className="join__input"
          value={name}
          onChange={(e) => setName(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && void join()}
          placeholder="How should we introduce you?"
          autoComplete="name"
        />

        {error && (
          <div className="join__error">
            <Icon name="warning" size={14} />
            {error}
          </div>
        )}
        {(phase === 'denied' || phase === 'closed') && notice && (
          <div className="join__error">
            <Icon name="info" size={14} />
            {notice}
          </div>
        )}

        <button
          className="join__go"
          onClick={() => void join()}
          disabled={phase === 'connecting'}
        >
          {phase === 'connecting' ? 'Connecting…' : 'Join now'}
        </button>
      </div>
    </div>
  )
}
