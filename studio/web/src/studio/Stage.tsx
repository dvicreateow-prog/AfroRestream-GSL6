import { Icon, type IconName } from '../components/Icon'
import { useActiveScene, useStudio } from '../state/studioStore'
import { useEngine } from '../engine/EngineProvider'
import { OverlayEditor } from './OverlayEditor'
import type { LayoutId } from '@studio/shared'

/* Seven layout buttons, then a divider, then Customize - per the captured row. */
const LAYOUTS: { id: LayoutId; icon: IconName; label: string }[] = [
  { id: 'solo', icon: 'layoutSolo', label: 'Solo' },
  { id: 'split', icon: 'layoutSplit', label: 'Side by side' },
  { id: 'stacked', icon: 'layoutStacked', label: 'Stacked' },
  { id: 'grid', icon: 'layoutGrid', label: 'Grid' },
  { id: 'pip', icon: 'layoutPip', label: 'Picture in picture' },
  { id: 'spotlight', icon: 'layoutSpotlight', label: 'Spotlight' },
  { id: 'screen', icon: 'layoutScreen', label: 'Screen share' },
]

export function Stage() {
  const scene = useActiveScene()
  const { setLayout, openModal, micOn, camOn, screenOn } = useStudio()
  const {
    canvasHostRef, captures, levels, error, busy, clearError,
    toggleCamera, toggleScreen, toggleMic,
  } = useEngine()

  const empty = captures.length === 0
  const micLevel = levels.mic ?? 0

  return (
    <main className="stage">
      <div className="stage__canvasWrap">
        {/* The compositor canvas is mounted here by the engine. */}
        <div ref={canvasHostRef} className="stage__canvasHost" data-empty={empty} />

        {empty && (
          <div className="stage__empty">
            <Icon name="cam" size={30} />
            <div className="stage__emptyTitle">Nothing on stage yet</div>
            <p>Turn on your camera, share your screen, or add a source from the Sources panel.</p>
          </div>
        )}

        {/* Direct manipulation of overlays; renders only in edit mode. */}
        <OverlayEditor />

        <div className="stage__watermark">STUDIO</div>
      </div>

      {error && (
        <div className="stage__error" role="alert">
          <Icon name="warning" size={15} />
          <span>{error}</span>
          <button onClick={clearError} aria-label="Dismiss">
            <Icon name="close" size={14} />
          </button>
        </div>
      )}

      <div className="layouts">
        <span className="layouts__label">Layout</span>
        {LAYOUTS.map((l) => (
          <button
            key={l.id}
            className={`layouts__btn ${scene.layout === l.id ? 'layouts__btn--active' : ''}`}
            onClick={() => setLayout(l.id)}
            title={l.label}
            aria-label={l.label}
            aria-pressed={scene.layout === l.id}
          >
            <Icon name={l.icon} size={16} />
          </button>
        ))}
        <span className="layouts__spacer" />
        <button
          className="layouts__btn"
          onClick={() => openModal('customizeLayout')}
          title="Customize layout"
          aria-label="Customize layout"
        >
          <Icon name="layoutCustom" size={16} />
        </button>
        <span className="layouts__label" style={{ marginRight: 0, marginLeft: 6 }}>
          Customize
        </span>
      </div>

      <div className="controls">
        <div className="ctl">
          <button
            className={`ctl__btn ${micOn ? '' : 'ctl__btn--off'}`}
            onClick={toggleMic}
            disabled={busy}
            aria-label={micOn ? 'Mute microphone' : 'Unmute microphone'}
          >
            <Icon name={micOn ? 'mic' : 'micOff'} size={19} />
            {micOn && (
              <span
                className="ctl__level"
                style={{ transform: `scaleY(${0.25 + micLevel * 0.75})` }}
              />
            )}
          </button>
          <span className="ctl__label">{micOn ? 'Mic' : 'Unmute'}</span>
        </div>

        <div className="ctl">
          <button
            className={`ctl__btn ${camOn ? '' : 'ctl__btn--off'}`}
            onClick={toggleCamera}
            disabled={busy}
            aria-label={camOn ? 'Turn camera off' : 'Turn camera on'}
          >
            <Icon name={camOn ? 'cam' : 'camOff'} size={19} />
          </button>
          <span className="ctl__label">{camOn ? 'Camera' : 'Start cam'}</span>
        </div>

        <div className="ctl">
          <button
            className={`ctl__btn ${screenOn ? 'ctl__btn--off' : 'ctl__btn--muted'}`}
            onClick={toggleScreen}
            disabled={busy}
            aria-label={screenOn ? 'Stop sharing' : 'Share screen'}
          >
            <Icon name={screenOn ? 'screenOff' : 'screen'} size={19} />
          </button>
          <span className="ctl__label">{screenOn ? 'Stop' : 'Share'}</span>
        </div>

        <div className="ctl">
          <button
            className="ctl__btn ctl__btn--muted"
            onClick={() => openModal('invite')}
            aria-label="Invite guests"
          >
            <Icon name="personPlus" size={19} />
          </button>
          <span className="ctl__label">Invite</span>
        </div>

        <div className="ctl">
          <button
            className="ctl__btn ctl__btn--muted"
            onClick={() => openModal('addSource')}
            aria-label="More"
          >
            <Icon name="moreH" size={19} />
          </button>
          <span className="ctl__label">More</span>
        </div>
      </div>

      <div className="stage__deviceNote">
        {camOn ? 'Camera on' : 'Camera off'}
        {'  •  '}
        {micOn ? 'Microphone live' : 'Microphone muted'}
        {captures.length > 0 && `  •  ${captures.length} on stage`}
      </div>
    </main>
  )
}
