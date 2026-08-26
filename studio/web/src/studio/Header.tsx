import { useEffect, useState } from 'react'
import { Icon } from '../components/Icon'
import { useStudio } from '../state/studioStore'
import { useEngine } from '../engine/EngineProvider'

function elapsed(from: number | null) {
  if (!from) return '00:00'
  const s = Math.floor((Date.now() - from) / 1000)
  const pad = (n: number) => String(n).padStart(2, '0')
  const h = Math.floor(s / 3600)
  const m = Math.floor((s % 3600) / 60)
  return h > 0 ? `${pad(h)}:${pad(m)}:${pad(s % 60)}` : `${pad(m)}:${pad(s % 60)}`
}

export function Header() {
  const {
    title, setTitle, live, recording, toggleRecording,
    startedAt, viewers, scenes, openModal,
  } = useStudio()
  /* Go Live drives the real pipeline: compositor -> MediaRecorder -> ffmpeg. */
  const { toggleLive, busy } = useEngine()

  /* Only tick while live, so the timer never lies about a stopped stream. */
  const [, force] = useState(0)
  useEffect(() => {
    if (!live) return
    const t = setInterval(() => force((n) => n + 1), 1000)
    return () => clearInterval(t)
  }, [live])

  return (
    <header className="hdr">
      <div className="hdr__brand">
        <span className="hdr__mark">STUDIO</span>
        <span className="hdr__tag">CLONE</span>
      </div>

      <div className="hdr__title">
        <input
          className="hdr__titleInput"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          aria-label="Stream title"
          spellCheck={false}
        />
        <Icon name="pencil" size={14} className="hdr__pencil" />
      </div>

      <button className="hdr__pill" onClick={() => openModal('channels')}>
        Channels
      </button>
      <button className="hdr__pill" onClick={() => openModal('streamDetails')}>
        Schedule
      </button>

      <div className="hdr__status">
        {live ? (
          <span className="hdr__live">
            <span className="hdr__liveDot" />
            LIVE
          </span>
        ) : (
          <span>Offline</span>
        )}
        <span className="hdr__dot">•</span>
        <span>1080p</span>
        <span className="hdr__dot">•</span>
        <span>{elapsed(startedAt)}</span>
        <span className="hdr__dot">•</span>
        <span>{viewers} viewers</span>
        <span className="hdr__dot">•</span>
        <span>{scenes.length} scenes</span>
      </div>

      <button
        className={`hdr__record ${recording ? 'hdr__record--on' : ''}`}
        onClick={toggleRecording}
        title={recording ? 'Stop recording' : 'Start recording'}
      >
        <Icon name="record" size={12} />
        {recording ? 'Recording' : 'Record'}
      </button>

      <button className="hdr__icon" onClick={() => openModal('settings')} aria-label="Settings">
        <Icon name="settings" size={17} />
      </button>

      <button
        className={`hdr__golive ${live ? 'hdr__golive--live' : ''}`}
        onClick={toggleLive}
        disabled={busy}
      >
        {busy ? 'Connecting…' : live ? 'End Stream' : 'Go Live'}
      </button>
    </header>
  )
}
