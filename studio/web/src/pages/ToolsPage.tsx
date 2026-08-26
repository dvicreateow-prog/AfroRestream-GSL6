import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Icon } from '../components/Icon'
import type { IconName } from '../components/Icon'
import { PageHeader, Badge, Tabs, EmptyState } from '../components/ui'

export interface ToolDef {
  slug: string
  name: string
  blurb: string
  icon: IconName
  category: 'Test' | 'Convert' | 'Transcribe' | 'AI'
  status: 'ready' | 'needs-provider'
}

export const TOOLS: ToolDef[] = [
  {
    slug: 'webcam-test',
    name: 'Camera Test',
    blurb: 'Preview any connected camera and check framing, focus and lighting before you go live.',
    icon: 'cam',
    category: 'Test',
    status: 'ready',
  },
  {
    slug: 'mic-test',
    name: 'Mic Test',
    blurb: 'Watch a live input meter and play back a short recording to hear exactly how you sound.',
    icon: 'mic',
    category: 'Test',
    status: 'ready',
  },
  {
    slug: 'video-converter',
    name: 'Video Converter',
    blurb: 'Re-encode clips into a different container or codec without leaving the browser.',
    icon: 'video',
    category: 'Convert',
    status: 'ready',
  },
  {
    slug: 'audio-converter',
    name: 'Audio Converter',
    blurb: 'Swap audio files between common formats and pick the bitrate you want to keep.',
    icon: 'volume',
    category: 'Convert',
    status: 'ready',
  },
  {
    slug: 'remove-audio',
    name: 'Audio Remover',
    blurb: 'Strip the soundtrack out of a video and keep the picture perfectly intact.',
    icon: 'volumeOff',
    category: 'Convert',
    status: 'ready',
  },
  {
    slug: 'audio-extractor',
    name: 'Audio Extractor',
    blurb: 'Pull a clean audio track out of any video file and save it on its own.',
    icon: 'upload',
    category: 'Convert',
    status: 'ready',
  },
  {
    slug: 'transcribe-audio',
    name: 'Audio Transcription',
    blurb: 'Turn recordings and voice notes into timestamped, searchable text.',
    icon: 'captions',
    category: 'Transcribe',
    status: 'needs-provider',
  },
  {
    slug: 'transcribe-video',
    name: 'Video Transcription',
    blurb: 'Generate a full transcript and caption file from any uploaded video.',
    icon: 'notes',
    category: 'Transcribe',
    status: 'needs-provider',
  },
  {
    slug: 'transcribe-podcast',
    name: 'Podcast Transcription',
    blurb: 'Transcribe long-form episodes with speaker labels ready for show notes.',
    icon: 'mic',
    category: 'Transcribe',
    status: 'needs-provider',
  },
  {
    slug: 'ai-tiktok-script',
    name: 'TikTok Script Generator',
    blurb: 'Draft punchy short-form scripts with a hook, beats and a closing call to action.',
    icon: 'chat',
    category: 'AI',
    status: 'needs-provider',
  },
  {
    slug: 'ai-youtube-script',
    name: 'YouTube Script Generator',
    blurb: 'Outline a long-form episode with an intro, chaptered sections and an outro.',
    icon: 'youtube',
    category: 'AI',
    status: 'needs-provider',
  },
  {
    slug: 'ai-sales-script',
    name: 'Sales Script Generator',
    blurb: 'Write a pitch that opens warm, handles objections and lands on a clear ask.',
    icon: 'send',
    category: 'AI',
    status: 'needs-provider',
  },
  {
    slug: 'ai-clip-maker',
    name: 'Clip Maker',
    blurb: 'Find the highlight moments in a long stream and cut them into shareable clips.',
    icon: 'layers',
    category: 'AI',
    status: 'needs-provider',
  },
]

const CATEGORIES = ['All', 'Test', 'Convert', 'Transcribe', 'AI'] as const

const TAB_ICONS: Record<string, IconName> = {
  All: 'grid',
  Test: 'signal',
  Convert: 'refresh',
  Transcribe: 'captions',
  AI: 'star',
}

const tileStyle: React.CSSProperties = {
  background: 'var(--c-panel)',
  border: '1px solid var(--c-line-soft)',
  borderRadius: 'var(--r-xl)',
  padding: 18,
  display: 'flex',
  flexDirection: 'column',
  gap: 10,
  color: 'var(--c-text)',
  textDecoration: 'none',
  height: '100%',
}

const iconWrapStyle: React.CSSProperties = {
  width: 38,
  height: 38,
  borderRadius: 'var(--r-lg)',
  background: 'var(--c-surface)',
  border: '1px solid var(--c-line)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  color: 'var(--brand-primary)',
}

export function ToolsPage() {
  const [active, setActive] = useState<string>('All')

  const visible = TOOLS.filter((t) => active === 'All' || t.category === active)

  return (
    <div className="ui-stack">
      <PageHeader
        title="Tools"
        description="A free kit of small utilities for testing your gear, converting media and drafting scripts. Nothing to install."
      />

      <Tabs
        tabs={CATEGORIES.map((c) => ({
          id: c,
          label: c === 'All' ? 'All tools' : c,
          icon: TAB_ICONS[c],
        }))}
        active={active}
        onChange={setActive}
      />

      {visible.length === 0 ? (
        <EmptyState
          icon="search"
          title="Nothing here yet"
          description="No tools match this category right now."
        />
      ) : (
        <div className="ui-grid ui-grid--3">
          {visible.map((tool) => (
            <Link key={tool.slug} to={'/tools/' + tool.slug} style={tileStyle}>
              <div className="ui-row" style={{ justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={iconWrapStyle}>
                  <Icon name={tool.icon} />
                </span>
                <Badge tone={tool.status === 'ready' ? 'success' : 'warning'}>
                  {tool.status === 'ready' ? 'Ready' : 'Needs setup'}
                </Badge>
              </div>
              <div style={{ fontWeight: 600, fontSize: 15 }}>{tool.name}</div>
              <div style={{ color: 'var(--c-text-dim)', fontSize: 13, lineHeight: 1.5 }}>{tool.blurb}</div>
              <div
                style={{
                  marginTop: 'auto',
                  paddingTop: 6,
                  color: 'var(--c-text-mute)',
                  fontSize: 12,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                }}
              >
                {tool.category}
                <Icon name="chevronRight" />
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
