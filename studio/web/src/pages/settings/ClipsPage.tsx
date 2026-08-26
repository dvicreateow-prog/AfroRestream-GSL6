import { useState } from 'react'
import { Icon } from '../../components/Icon'
import {
  Button, Card, PageHeader, Field, Select, Toggle,
  Badge, Stat, Tabs, Meter,
} from '../../components/ui'

type ClipStatus = 'ready' | 'processing'
type TabId = 'all' | 'ready' | 'processing'

type Clip = {
  id: string
  title: string
  duration: string
  created: string
  status: ClipStatus
}

const SEED_CLIPS: Clip[] = [
  { id: 'c1', title: 'Opening walkthrough', duration: '0:30', created: 'Aug 24, 9:12 AM', status: 'ready' },
  { id: 'c2', title: 'Guest intro - Nadia', duration: '0:15', created: 'Aug 24, 9:41 AM', status: 'ready' },
  { id: 'c3', title: 'Chat question: pricing', duration: '1:00', created: 'Aug 23, 6:02 PM', status: 'processing' },
  { id: 'c4', title: 'Live demo - scene switch', duration: '0:45', created: 'Aug 23, 5:28 PM', status: 'ready' },
  { id: 'c5', title: 'Audience poll reveal', duration: '0:30', created: 'Aug 22, 2:15 PM', status: 'processing' },
  { id: 'c6', title: 'Closing thanks', duration: '0:20', created: 'Aug 22, 1:04 PM', status: 'ready' },
]

const TABS: { id: TabId; label: string }[] = [
  { id: 'all', label: 'All' },
  { id: 'ready', label: 'Ready' },
  { id: 'processing', label: 'Processing' },
]

const LENGTHS = [
  { value: '15', label: '15 seconds' },
  { value: '30', label: '30 seconds' },
  { value: '60', label: '60 seconds' },
  { value: '90', label: '90 seconds' },
]

const RATIOS = [
  { value: '16:9', label: '16:9 - landscape' },
  { value: '9:16', label: '9:16 - vertical' },
  { value: '1:1', label: '1:1 - square' },
]

const USED_GB = 12.4
const TOTAL_GB = 50

export function ClipsPage() {
  const [clipping, setClipping] = useState(true)
  const [autoClips, setAutoClips] = useState(true)
  const [captions, setCaptions] = useState(false)
  const [length, setLength] = useState('30')
  const [ratio, setRatio] = useState('16:9')
  const [tab, setTab] = useState<TabId>('all')
  const [clips, setClips] = useState<Clip[]>(SEED_CLIPS)
  const [copiedId, setCopiedId] = useState<string | null>(null)

  const visible = clips.filter((c: Clip) => (tab === 'all' ? true : c.status === tab))

  function copyLink(clip: Clip) {
    void navigator.clipboard?.writeText('https://clips.local/' + clip.id)
    setCopiedId(clip.id)
    window.setTimeout(() => setCopiedId(null), 1600)
  }

  function removeClip(id: string) {
    setClips((prev: Clip[]) => prev.filter((c: Clip) => c.id !== id))
  }

  return (
    <div className="ui-stack">
      <PageHeader
        title="Clips"
        description="Capture highlights while you are live, then trim, caption and share them without leaving the studio."
      />

      <Card title="Clip settings" description="Controls how highlights are captured during a broadcast.">
        <div className="ui-stack">
          <Toggle
            checked={clipping}
            onChange={setClipping}
            label="Enable live clipping"
            hint="Keeps a rolling buffer of the program feed so you can grab a moment after it happens."
          />
          <Toggle
            checked={autoClips}
            onChange={setAutoClips}
            disabled={!clipping}
            label="Auto-generate clips from highlight markers"
            hint="Every marker you or a co-host drops becomes a clip when the broadcast ends."
          />
          <div className="ui-grid ui-grid--2">
            <Field label="Default clip length" hint="Measured backwards from the moment you clip.">
              <Select
                value={length}
                onChange={(v) => setLength(v)}
                options={LENGTHS}
                disabled={!clipping}
              />
            </Field>
            <Field label="Aspect ratio" hint="Vertical and square clips crop around the active speaker.">
              <Select
                value={ratio}
                onChange={(v) => setRatio(v)}
                options={RATIOS}
                disabled={!clipping}
              />
            </Field>
          </div>
          <Toggle
            checked={captions}
            onChange={setCaptions}
            disabled={!clipping}
            label="Burn in captions"
            hint="Renders word-by-word captions into the exported file."
          />
        </div>
      </Card>

      <Card
        title="Storage"
        description="Clips are kept for 90 days unless you download or pin them."
        actions={<Button variant="ghost" size="sm" icon="layers">Manage storage</Button>}
      >
        <div className="ui-stack">
          <Stat
            label="Clip storage"
            value={USED_GB + ' GB of ' + TOTAL_GB + ' GB used'}
            sub={Math.round((USED_GB / TOTAL_GB) * 100) + '% of your plan allowance'}
            tone="brand"
          />
          <Meter value={USED_GB} max={TOTAL_GB} tone="var(--brand-primary)" />
          <p style={{ color: 'var(--c-text-mute)', fontSize: 13, margin: 0 }}>
            {clips.length} clips stored - the oldest expires in 61 days.
          </p>
        </div>
      </Card>

      <Card title="Clip library" actions={<Tabs tabs={TABS} active={tab} onChange={setTab} />}>
        <div className="ui-grid ui-grid--3">
          {visible.map((clip: Clip) => (
            <div key={clip.id} className="ui-stack" style={{ gap: 'var(--sp-sm)' }}>
              <div
                style={{
                  background: 'var(--c-surface)',
                  border: '1px solid var(--c-line)',
                  borderRadius: 'var(--r-lg)',
                  aspectRatio: '16 / 9',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'var(--c-text-mute)',
                }}
              >
                <Icon name="play" size={26} />
              </div>
              <div className="ui-list__title">{clip.title}</div>
              <div className="ui-list__sub">
                {clip.duration} - {clip.created}
              </div>
              {clip.status === 'processing' ? (
                <div>
                  <Badge tone="warning">Processing</Badge>
                </div>
              ) : (
                <div className="ui-row" style={{ gap: 'var(--sp-xs)' }}>
                  <Button variant="ghost" size="sm" icon="arrowDown">
                    Download
                  </Button>
                  <Button variant="ghost" size="sm" icon="copy" onClick={() => copyLink(clip)}>
                    {copiedId === clip.id ? 'Copied' : 'Copy link'}
                  </Button>
                  <Button variant="ghost" size="sm" icon="trash" onClick={() => removeClip(clip.id)} />
                </div>
              )}
            </div>
          ))}
        </div>
      </Card>
    </div>
  )
}
