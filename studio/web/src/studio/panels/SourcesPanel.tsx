/*
 * Sources panel.
 *
 * Lists what is actually on stage (live engine captures) rather than store rows, so
 * the panel can never disagree with the composited output. Media clips get transport
 * controls; every source can be removed.
 */
import { useRef } from 'react'
import { Icon } from '../../components/Icon'
import { useActiveScene, useStudio } from '../../state/studioStore'
import { useEngine } from '../../engine/EngineProvider'
import type { CaptureHandle } from '../../engine/mediaEngine'

const KIND_LABEL = {
  camera: 'Camera',
  screen: 'Screen share',
  media: 'Media clip',
} as const

function initials(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? '')
    .join('')
}

function CaptureCard({ capture, onStage }: { capture: CaptureHandle; onStage: boolean }) {
  const { stopCapture, mediaControl } = useEngine()
  const toggleCaptureOnScene = useStudio((s) => s.toggleCaptureOnScene)
  const isMedia = capture.kind === 'media'
  const isVideo = isMedia && capture.el instanceof HTMLVideoElement

  return (
    <div className="srcCard">
      <span
        className="srcCard__avatar"
        style={{
          background:
            capture.kind === 'camera'
              ? 'var(--c-blue)'
              : capture.kind === 'screen'
                ? 'var(--c-cyan)'
                : 'var(--c-purple)',
        }}
      >
        {initials(capture.label)}
      </span>

      <div className="srcCard__text">
        <div className="srcCard__title">{capture.label}</div>
        <div className="srcCard__sub">{KIND_LABEL[capture.kind]}</div>
      </div>

      {isVideo && (
        <>
          <button
            className="srcCard__mini"
            onClick={() => mediaControl(capture.id, 'play')}
            aria-label="Play"
            title="Play"
          >
            <Icon name="play" size={13} />
          </button>
          <button
            className="srcCard__mini"
            onClick={() => mediaControl(capture.id, 'pause')}
            aria-label="Pause"
            title="Pause"
          >
            <Icon name="pause" size={13} />
          </button>
          <button
            className="srcCard__mini"
            onClick={() => mediaControl(capture.id, 'restart')}
            aria-label="Restart"
            title="Restart"
          >
            <Icon name="refresh" size={13} />
          </button>
        </>
      )}

      <button
        className={`srcCard__mini ${onStage ? 'srcCard__mini--on' : ''}`}
        onClick={() => toggleCaptureOnScene(capture.id)}
        aria-pressed={onStage}
        aria-label={onStage ? 'Remove from this scene' : 'Add to this scene'}
        title={onStage ? 'On this scene - click to remove' : 'Add to this scene'}
      >
        <Icon name={onStage ? 'eye' : 'plus'} size={13} />
      </button>

      <button
        className="srcCard__mini srcCard__mini--danger"
        onClick={() => stopCapture(capture.id)}
        aria-label={`Remove ${capture.label}`}
        title="Remove from stage"
      >
        <Icon name="trash" size={13} />
      </button>
    </div>
  )
}

export function SourcesPanel() {
  const openModal = useStudio((s) => s.openModal)
  const scene = useActiveScene()
  const { captures, addMedia, toggleCamera, toggleScreen, error, onStageIds, room } = useEngine()
  const fileRef = useRef<HTMLInputElement>(null)

  const live = new Set(onStageIds)
  const onStage = captures.filter((c) => live.has(c.id))
  const offStage = captures.filter((c) => !live.has(c.id))

  return (
    <>
      <button className="panel__cta" onClick={() => openModal('invite')}>
        <Icon name="link" size={14} />
        Copy Invite Link
      </button>

      {room.waiting.length > 0 && (
        <>
          <div className="panel__sectionLabel">WAITING TO JOIN</div>
          {room.waiting.map((p) => (
            <div className="srcCard" key={p.id}>
              <span className="srcCard__avatar" style={{ background: p.color }}>
                {p.name.slice(0, 2).toUpperCase()}
              </span>
              <div className="srcCard__text">
                <div className="srcCard__title">{p.name}</div>
                <div className="srcCard__sub">Asking to join</div>
              </div>
              <button
                className="srcCard__mini srcCard__mini--on"
                onClick={() => room.admit(p.id)}
                title="Let them in"
                aria-label={`Admit ${p.name}`}
              >
                <Icon name="check" size={13} />
              </button>
              <button
                className="srcCard__mini srcCard__mini--danger"
                onClick={() => room.deny(p.id)}
                title="Decline"
                aria-label={`Decline ${p.name}`}
              >
                <Icon name="close" size={13} />
              </button>
            </div>
          ))}
        </>
      )}

      <div className="panel__sectionLabel">
        ON STAGE &middot; {scene.title.toUpperCase()}
        {room.connected && (
          <span style={{ float: 'right', color: 'var(--c-green)' }}>
            {room.participants.length} in room
          </span>
        )}
      </div>
      {onStage.length ? (
        onStage.map((c) => <CaptureCard key={c.id} capture={c} onStage />)
      ) : (
        <div className="panel__empty">
          Nothing composited on this scene.{' '}
          <button className="panel__inlineLink" onClick={toggleCamera}>
            Turn on your camera
          </button>{' '}
          or add one below.
        </div>
      )}

      <div className="panel__sectionLabel">AVAILABLE</div>
      {offStage.length ? (
        offStage.map((c) => <CaptureCard key={c.id} capture={c} onStage={false} />)
      ) : (
        <div className="panel__empty">
          Every running source is on this scene.{' '}
          <button className="panel__inlineLink" onClick={toggleScreen}>
            Share a screen
          </button>{' '}
          to add another.
        </div>
      )}

      {error && (
        <div className="panel__error">
          <Icon name="warning" size={13} />
          <span>{error}</span>
        </div>
      )}

      <input
        ref={fileRef}
        type="file"
        accept="video/*,image/*"
        hidden
        onChange={(e) => {
          const f = e.target.files?.[0]
          if (f) void addMedia(f)
          /* Reset so picking the same file twice still fires. */
          e.target.value = ''
        }}
      />

      <button className="panel__add" onClick={() => fileRef.current?.click()}>
        <Icon name="upload" size={14} />
        Add video or image
      </button>

      <button
        className="panel__add"
        style={{ marginTop: 8 }}
        onClick={() => openModal('addSource')}
      >
        <Icon name="plus" size={14} />
        More sources
      </button>
    </>
  )
}
