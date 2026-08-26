import { useState } from 'react'
import { Icon } from '../../components/Icon'
import { Modal } from '../../components/Modal'
import { useStudio } from '../../state/studioStore'

type TabId =
  | 'general'
  | 'video'
  | 'audio'
  | 'recordings'
  | 'background'
  | 'shortcuts'
  | 'profile'

type IconName = Parameters<typeof Icon>[0]['name']

const TABS: { id: TabId; name: string; icon: IconName }[] = [
  { id: 'general', name: 'General', icon: 'settings' },
  { id: 'video', name: 'Video', icon: 'cam' },
  { id: 'audio', name: 'Audio', icon: 'mic' },
  { id: 'recordings', name: 'Recordings', icon: 'record' },
  { id: 'background', name: 'Virtual background', icon: 'image' },
  { id: 'shortcuts', name: 'Shortcuts', icon: 'grid' },
  { id: 'profile', name: 'Profile', icon: 'people' },
]

const QUALITIES = ['1080p30', '720p60', '720p30', '480p30']
const CAMERAS = ['FaceTime HD Camera', 'Logitech Brio 4K', 'Capture Card (HDMI)']
const RESOLUTIONS = ['1920 x 1080', '1280 x 720', '854 x 480']
const MICS = ['Shure MV7 (USB)', 'Built-in Microphone', 'Capture Card (HDMI)']
const SPEAKERS = ['Studio Monitors', 'Built-in Output', 'Headphones']
const FORMATS = ['MP4', 'MKV']
const FILTERS = [
  'None',
  'Classic film',
  'Teal and orange',
  'Warm cinema',
  'Icy drama',
  'Faded memories',
]
const BG_COLORS = ['#1f6feb', '#8b5cf6', '#10b981', '#f59e0b']

const SHORTCUTS: { action: string; keys: string[] }[] = [
  { action: 'Go live / end stream', keys: ['Ctrl', 'Shift', 'L'] },
  { action: 'Start or stop recording', keys: ['Ctrl', 'Shift', 'R'] },
  { action: 'Mute microphone', keys: ['Ctrl', 'D'] },
  { action: 'Toggle camera', keys: ['Ctrl', 'E'] },
  { action: 'Share screen', keys: ['Ctrl', 'Shift', 'S'] },
  { action: 'Next scene', keys: ['Alt', '→'] },
  { action: 'Previous scene', keys: ['Alt', '←'] },
  { action: 'Jump to scene 1-9', keys: ['Alt', '1-9'] },
  { action: 'Open chat panel', keys: ['Ctrl', '1'] },
  { action: 'Open graphics panel', keys: ['Ctrl', '2'] },
  { action: 'Hide all overlays', keys: ['Ctrl', 'Shift', 'H'] },
  { action: 'Toggle fullscreen preview', keys: ['F'] },
]

const label: React.CSSProperties = {
  display: 'block',
  fontSize: 11,
  fontWeight: 'var(--fw-semibold)' as unknown as number,
  color: 'var(--c-text-mute)',
  textTransform: 'uppercase',
  letterSpacing: '.06em',
  marginBottom: 6,
}

const field: React.CSSProperties = {
  width: '100%',
  padding: '8px 10px',
  fontSize: 12,
  color: 'var(--c-text)',
  background: 'var(--c-surface)',
  border: '1px solid var(--c-line)',
  borderRadius: 'var(--r-md)',
  outline: 'none',
}

const rowStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  gap: 12,
  padding: '9px 10px',
  background: 'var(--c-surface)',
  border: '1px solid var(--c-line)',
  borderRadius: 'var(--r-md)',
}

function Select(props: {
  id: string
  title: string
  value: string
  options: string[]
  onChange: (v: string) => void
}) {
  return (
    <div style={{ flex: 1, minWidth: 0 }}>
      <label style={label} htmlFor={props.id}>
        {props.title}
      </label>
      <select
        id={props.id}
        style={field}
        value={props.value}
        onChange={(e) => props.onChange(e.target.value)}
      >
        {props.options.map((o) => (
          <option key={o} value={o}>
            {o}
          </option>
        ))}
      </select>
    </div>
  )
}

function Toggle(props: {
  title: string
  hint?: string
  on: boolean
  onChange: (v: boolean) => void
}) {
  return (
    <button type="button" style={rowStyle} onClick={() => props.onChange(!props.on)}>
      <span style={{ textAlign: 'left' }}>
        <span
          style={{
            display: 'block',
            fontSize: 12,
            color: 'var(--c-text)',
            fontWeight: 'var(--fw-medium)' as unknown as number,
          }}
        >
          {props.title}
        </span>
        {props.hint ? (
          <span style={{ display: 'block', fontSize: 11, color: 'var(--c-text-mute)', marginTop: 2 }}>
            {props.hint}
          </span>
        ) : null}
      </span>
      <span
        style={{
          flex: '0 0 auto',
          width: 34,
          height: 19,
          borderRadius: 999,
          background: props.on ? 'var(--brand-primary)' : 'var(--c-elevated)',
          border: '1px solid var(--c-line)',
          position: 'relative',
          transition: 'background .15s',
        }}
      >
        <span
          style={{
            position: 'absolute',
            top: 2,
            left: props.on ? 16 : 2,
            width: 13,
            height: 13,
            borderRadius: 999,
            background: 'var(--c-text)',
            transition: 'left .15s',
          }}
        />
      </span>
    </button>
  )
}

function Section(props: { title: string; children: React.ReactNode }) {
  return (
    <div className="modal__section">
      <div className="modal__sectionTitle">{props.title}</div>
      <div style={{ display: 'grid', gap: 10 }}>{props.children}</div>
    </div>
  )
}

function Meter(props: { value: number; color: string }) {
  return (
    <div
      style={{
        height: 8,
        borderRadius: 999,
        background: 'var(--c-elevated)',
        border: '1px solid var(--c-line)',
        overflow: 'hidden',
      }}
    >
      <div
        style={{
          width: `${Math.max(0, Math.min(100, props.value))}%`,
          height: '100%',
          background: props.color,
          transition: 'width .2s',
        }}
      />
    </div>
  )
}

function Key(props: { children: React.ReactNode }) {
  return (
    <span
      style={{
        display: 'inline-block',
        padding: '2px 6px',
        fontSize: 10,
        fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
        color: 'var(--c-text-dim)',
        background: 'var(--c-elevated)',
        border: '1px solid var(--c-line)',
        borderBottomWidth: 2,
        borderRadius: 'var(--r-sm)',
      }}
    >
      {props.children}
    </span>
  )
}

export function SettingsModal({ onClose }: { onClose: () => void }) {
  const title = useStudio((s) => s.title)
  const micOn = useStudio((s) => s.micOn)

  const [tab, setTab] = useState<TabId>('general')

  const [quality, setQuality] = useState(QUALITIES[0])
  const [graphicsOverVideo, setGraphicsOverVideo] = useState(true)
  const [guestSlides, setGuestSlides] = useState(false)
  const [showAudioOnly, setShowAudioOnly] = useState(true)
  const [pushLinks, setPushLinks] = useState(false)

  const [camera, setCamera] = useState(CAMERAS[0])
  const [resolution, setResolution] = useState(RESOLUTIONS[0])
  const [mirror, setMirror] = useState(true)

  const [mic, setMic] = useState(MICS[0])
  const [speaker, setSpeaker] = useState(SPEAKERS[0])
  const [level, setLevel] = useState(46)
  const [echo, setEcho] = useState(true)
  const [noise, setNoise] = useState(true)
  const [autoGain, setAutoGain] = useState(true)

  const [autoRecord, setAutoRecord] = useState(true)
  const [format, setFormat] = useState(FORMATS[0])

  const [background, setBackground] = useState('none')
  const [filter, setFilter] = useState(FILTERS[0])

  const [displayName, setDisplayName] = useState('Studio Host')
  const [saved, setSaved] = useState(false)

  const initials =
    displayName
      .trim()
      .split(/\s+/)
      .slice(0, 2)
      .map((w) => w.charAt(0).toUpperCase())
      .join('') || '?'

  const ghostBtn: React.CSSProperties = {
    padding: '8px 14px',
    fontSize: 12,
    fontWeight: 'var(--fw-medium)' as unknown as number,
    color: 'var(--c-text-dim)',
    background: 'transparent',
    border: '1px solid var(--c-line)',
    borderRadius: 'var(--r-md)',
    cursor: 'pointer',
  }

  const primaryBtn: React.CSSProperties = {
    ...ghostBtn,
    color: '#fff',
    background: 'var(--brand-primary)',
    borderColor: 'transparent',
    fontWeight: 'var(--fw-semibold)' as unknown as number,
  }

  return (
    <Modal
      title="Settings"
      description="Configure this studio."
      width="xl"
      onClose={onClose}
      footer={
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
          <button type="button" style={ghostBtn} onClick={onClose}>
            Cancel
          </button>
          <button type="button" style={primaryBtn} onClick={onClose}>
            Save changes
          </button>
        </div>
      }
    >
      <div className="modal__split">
        <div className="modal__tabs">
          {TABS.map((t) => (
            <button
              key={t.id}
              type="button"
              className={`modal__tab${tab === t.id ? ' modal__tab--active' : ''}`}
              onClick={() => setTab(t.id)}
            >
              <Icon name={t.icon} size={14} />
              <span>{t.name}</span>
            </button>
          ))}
        </div>

        <div className="modal__pane">
          {tab === 'general' && (
            <>
              <Section title="Broadcast">
                <Select
                  id="set-quality"
                  title="Stream quality"
                  value={quality}
                  options={QUALITIES}
                  onChange={setQuality}
                />
                <div style={{ fontSize: 11, color: 'var(--c-text-mute)' }}>
                  Higher settings need more upload bandwidth. {quality} is applied to every
                  connected destination for “{title}”.
                </div>
              </Section>
              <Section title="Stage behaviour">
                <Toggle
                  title="Show graphics over video"
                  hint="Keep banners and lower thirds composited on the live output."
                  on={graphicsOverVideo}
                  onChange={setGraphicsOverVideo}
                />
                <Toggle
                  title="Guests can control slides"
                  hint="Let invited guests advance presentation scenes."
                  on={guestSlides}
                  onChange={setGuestSlides}
                />
                <Toggle
                  title="Show non-video participants"
                  hint="Audio-only guests appear as name tiles on stage."
                  on={showAudioOnly}
                  onChange={setShowAudioOnly}
                />
                <Toggle
                  title="Push links to chat"
                  hint="Share on-screen links into every connected chat room."
                  on={pushLinks}
                  onChange={setPushLinks}
                />
              </Section>
            </>
          )}

          {tab === 'video' && (
            <>
              <Section title="Camera">
                <div style={{ display: 'flex', gap: 10 }}>
                  <Select
                    id="set-camera"
                    title="Camera"
                    value={camera}
                    options={CAMERAS}
                    onChange={setCamera}
                  />
                  <Select
                    id="set-resolution"
                    title="Resolution"
                    value={resolution}
                    options={RESOLUTIONS}
                    onChange={setResolution}
                  />
                </div>
                <Toggle
                  title="Mirror my camera"
                  hint="Only affects your preview, not the live output."
                  on={mirror}
                  onChange={setMirror}
                />
              </Section>
              <Section title="Preview">
                <div
                  style={{
                    position: 'relative',
                    aspectRatio: '16 / 9',
                    borderRadius: 'var(--r-lg)',
                    border: '1px solid var(--c-line)',
                    background:
                      'linear-gradient(140deg, var(--c-elevated), var(--c-panel) 70%)',
                    display: 'grid',
                    placeItems: 'center',
                    gap: 6,
                    transform: mirror ? 'scaleX(-1)' : 'none',
                  }}
                >
                  <div style={{ display: 'grid', placeItems: 'center', gap: 6 }}>
                    <Icon name="cam" size={22} />
                    <span style={{ fontSize: 11, color: 'var(--c-text-mute)' }}>
                      {camera} · {resolution}
                    </span>
                  </div>
                </div>
              </Section>
            </>
          )}

          {tab === 'audio' && (
            <>
              <Section title="Devices">
                <Select id="set-mic" title="Microphone" value={mic} options={MICS} onChange={setMic} />
                <Select
                  id="set-speaker"
                  title="Speaker"
                  value={speaker}
                  options={SPEAKERS}
                  onChange={setSpeaker}
                />
              </Section>
              <Section title="Input level">
                <Meter value={micOn ? level : 0} color="var(--c-green)" />
                <input
                  type="range"
                  min={0}
                  max={100}
                  value={level}
                  aria-label="Input gain"
                  onChange={(e) => setLevel(Number(e.target.value))}
                  style={{ width: '100%', accentColor: 'var(--brand-primary)' }}
                />
                <div style={{ fontSize: 11, color: 'var(--c-text-mute)' }}>
                  {micOn ? `Gain ${level}%` : 'Microphone is muted on the stage.'}
                </div>
              </Section>
              <Section title="Processing">
                <Toggle title="Echo cancellation" on={echo} onChange={setEcho} />
                <Toggle title="Noise suppression" on={noise} onChange={setNoise} />
                <Toggle title="Auto gain" on={autoGain} onChange={setAutoGain} />
              </Section>
            </>
          )}

          {tab === 'recordings' && (
            <>
              <Section title="Capture">
                <Toggle
                  title="Record every broadcast"
                  hint="A local copy is written whenever you go live."
                  on={autoRecord}
                  onChange={setAutoRecord}
                />
                <Select
                  id="set-format"
                  title="File format"
                  value={format}
                  options={FORMATS}
                  onChange={setFormat}
                />
              </Section>
              <Section title="Storage">
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    fontSize: 12,
                    color: 'var(--c-text-dim)',
                  }}
                >
                  <span>34.2 GB of 100 GB used</span>
                  <span style={{ color: 'var(--c-text-mute)' }}>~28 h of {format}</span>
                </div>
                <Meter value={34} color="var(--c-cyan)" />
              </Section>
            </>
          )}

          {tab === 'background' && (
            <>
              <Section title="Background">
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                  {[
                    { id: 'none', name: 'None', color: 'transparent' },
                    { id: 'blur', name: 'Blur', color: 'var(--c-elevated)' },
                    ...BG_COLORS.map((c, i) => ({ id: c, name: `Colour ${i + 1}`, color: c })),
                  ].map((opt) => (
                    <button
                      key={opt.id}
                      type="button"
                      title={opt.name}
                      onClick={() => setBackground(opt.id)}
                      style={{
                        width: 76,
                        height: 52,
                        borderRadius: 'var(--r-md)',
                        background: opt.color,
                        color: 'var(--c-text-dim)',
                        fontSize: 10,
                        display: 'grid',
                        placeItems: 'center',
                        cursor: 'pointer',
                        border:
                          background === opt.id
                            ? '2px solid var(--brand-primary)'
                            : '1px solid var(--c-line)',
                      }}
                    >
                      {opt.id === 'none' || opt.id === 'blur' ? opt.name : null}
                    </button>
                  ))}
                </div>
              </Section>
              <Section title="Colour filter">
                <Select
                  id="set-filter"
                  title="Look"
                  value={filter}
                  options={FILTERS}
                  onChange={setFilter}
                />
              </Section>
            </>
          )}

          {tab === 'shortcuts' && (
            <Section title="Keyboard shortcuts">
              <div style={{ display: 'grid', gap: 2 }}>
                {SHORTCUTS.map((s) => (
                  <div
                    key={s.action}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      gap: 12,
                      padding: '7px 10px',
                      borderRadius: 'var(--r-sm)',
                      background: 'var(--c-surface)',
                      fontSize: 12,
                      color: 'var(--c-text-dim)',
                    }}
                  >
                    <span>{s.action}</span>
                    <span style={{ display: 'flex', gap: 4, flex: '0 0 auto' }}>
                      {s.keys.map((k) => (
                        <Key key={k}>{k}</Key>
                      ))}
                    </span>
                  </div>
                ))}
              </div>
            </Section>
          )}

          {tab === 'profile' && (
            <Section title="Your profile">
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <span
                  style={{
                    width: 56,
                    height: 56,
                    flex: '0 0 auto',
                    borderRadius: 999,
                    background: 'var(--c-purple)',
                    color: '#fff',
                    display: 'grid',
                    placeItems: 'center',
                    fontSize: 18,
                    fontWeight: 'var(--fw-semibold)' as unknown as number,
                  }}
                >
                  {initials}
                </span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <label style={label} htmlFor="set-name">
                    Display name
                  </label>
                  <input
                    id="set-name"
                    style={field}
                    value={displayName}
                    onChange={(e) => {
                      setDisplayName(e.target.value)
                      setSaved(false)
                    }}
                    placeholder="How guests see you on stage"
                  />
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <button type="button" style={primaryBtn} onClick={() => setSaved(true)}>
                  Save
                </button>
                {saved ? (
                  <span
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 5,
                      fontSize: 11,
                      color: 'var(--c-green)',
                    }}
                  >
                    <Icon name="check" size={12} />
                    Profile updated
                  </span>
                ) : null}
              </div>
            </Section>
          )}
        </div>
      </div>
    </Modal>
  )
}
