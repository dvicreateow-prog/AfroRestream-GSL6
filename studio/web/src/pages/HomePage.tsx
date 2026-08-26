import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Icon } from '../components/Icon'
import { Button, Card, PageHeader, Badge, EmptyState, Stat, Toggle } from '../components/ui'

type IconName = Parameters<typeof Icon>[0]['name']

interface Destination {
  id: string
  name: string
  handle: string
  icon: IconName
  enabled: boolean
}

interface EventItem {
  id: string
  title: string
  when: string
  targets: number
}

interface Recording {
  id: string
  title: string
  duration: string
  size: string
}

const SEED_DESTINATIONS: Destination[] = [
  { id: 'yt', name: 'YouTube', handle: '@northlight-live', icon: 'youtube', enabled: true },
  { id: 'tw', name: 'Twitch', handle: 'northlight_tv', icon: 'twitch', enabled: true },
  { id: 'fb', name: 'Facebook', handle: 'Northlight Media', icon: 'facebook', enabled: false },
  { id: 'rtmp', name: 'Custom RTMP', handle: 'rtmp://edge.internal/live', icon: 'rtmp', enabled: true },
]

const EVENTS: EventItem[] = [
  { id: 'e1', title: 'Product Q&A: Autumn Release', when: 'Tue 26 Aug - 15:00', targets: 3 },
  { id: 'e2', title: 'Engineering Deep Dive #14', when: 'Thu 28 Aug - 18:30', targets: 2 },
  { id: 'e3', title: 'Community Town Hall', when: 'Mon 01 Sep - 12:00', targets: 4 },
]

const RECORDINGS: Recording[] = [
  { id: 'r1', title: 'Weekly Standup Stream', duration: '48:12', size: '1.9 GB' },
  { id: 'r2', title: 'Guest Session - Mira Okafor', duration: '1:12:40', size: '3.4 GB' },
  { id: 'r3', title: 'Soundcheck & Scene Test', duration: '09:55', size: '410 MB' },
]

function formatElapsed(seconds: number): string {
  const h = Math.floor(seconds / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  const s = seconds % 60
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${pad(h)}:${pad(m)}:${pad(s)}`
}

export function HomePage() {
  const [live, setLive] = useState(false)
  const [elapsed, setElapsed] = useState(0)
  const [destinations, setDestinations] = useState<Destination[]>(SEED_DESTINATIONS)
  const [recordings, setRecordings] = useState<Recording[]>(RECORDINGS)

  useEffect(() => {
    if (!live) return
    const timer = window.setInterval(() => setElapsed((v: number) => v + 1), 1000)
    return () => window.clearInterval(timer)
  }, [live])

  const enabledCount = destinations.filter((d: Destination) => d.enabled).length

  const toggleDestination = (id: string) =>
    setDestinations((list: Destination[]) =>
      list.map((d: Destination) => (d.id === id ? { ...d, enabled: !d.enabled } : d)),
    )

  const startStream = () => {
    setElapsed(0)
    setLive(true)
  }

  return (
    <div className="ui-stack">
      <PageHeader
        title="Home"
        description="Everything about your channel at a glance."
        actions={
          <Link to="/studio">
            <Button variant="primary" icon="record">
              Go live
            </Button>
          </Link>
        }
      />

      <div className="ui-grid ui-grid--4">
        <Stat label="Total viewers" value="48,210" sub="+6.4% vs last month" tone="success" />
        <Stat label="Hours streamed" value="37.5" sub="August so far" />
        <Stat label="Destinations" value={`${enabledCount} / ${destinations.length}`} sub="enabled for next broadcast" tone="brand" />
        <Stat label="Scheduled events" value={EVENTS.length} sub="next in 2 days" />
      </div>

      <Card
        title="Stream status"
        description={live ? 'You are broadcasting right now.' : 'No active broadcast.'}
        actions={
          live ? (
            <Button variant="danger" size="sm" icon="stop" onClick={() => setLive(false)}>
              End stream
            </Button>
          ) : (
            <Badge tone="neutral">Offline</Badge>
          )
        }
      >
        {live ? (
          <div className="ui-stack">
            <div className="ui-row">
              <Badge tone="danger">Live</Badge>
              <span style={{ color: 'var(--c-text-dim)' }}>Elapsed {formatElapsed(elapsed)}</span>
            </div>
            <div className="ui-grid ui-grid--4">
              <Stat label="Bitrate" value="6,000 kbps" sub="stable" tone="success" />
              <Stat label="Frame rate" value="60 fps" sub="0 dropped frames" />
              <Stat label="Resolution" value="1920 x 1080" sub="H.264 high" />
              <Stat label="Pushing to" value={enabledCount} sub="destinations" tone="brand" />
            </div>
          </div>
        ) : (
          <EmptyState
            icon="signal"
            title="You are offline"
            description="Open the studio, pick a layout and push to every enabled destination at once."
            action={
              <Button variant="primary" icon="play" onClick={startStream}>
                Start a stream
              </Button>
            }
          />
        )}
      </Card>

      <div className="ui-grid ui-grid--2">
        <Card
          title="Destinations"
          description="Channels this broadcast will be sent to."
          actions={
            <Button size="sm" icon="plus">
              Add
            </Button>
          }
        >
          <ul className="ui-list">
            {destinations.map((d: Destination) => (
              <li className="ui-list__item" key={d.id}>
                <Icon name={d.icon} size={18} />
                <div className="ui-list__grow">
                  <div className="ui-list__title">{d.name}</div>
                  <div className="ui-list__sub">{d.handle}</div>
                </div>
                <Badge tone={d.enabled ? 'success' : 'neutral'}>{d.enabled ? 'Enabled' : 'Disabled'}</Badge>
                <Toggle checked={d.enabled} onChange={() => toggleDestination(d.id)} />
              </li>
            ))}
          </ul>
        </Card>

        <Card
          title="Upcoming events"
          description="Scheduled broadcasts on your calendar."
          actions={
            <Button size="sm" icon="calendar">
              Schedule
            </Button>
          }
        >
          <ul className="ui-list">
            {EVENTS.map((e: EventItem) => (
              <li className="ui-list__item" key={e.id}>
                <Icon name="clock" size={18} />
                <div className="ui-list__grow">
                  <div className="ui-list__title">{e.title}</div>
                  <div className="ui-list__sub">{e.when}</div>
                </div>
                <Badge tone="info">{e.targets} destinations</Badge>
                <Button size="sm" variant="ghost" icon="pencil" aria-label={`Edit ${e.title}`} />
              </li>
            ))}
          </ul>
        </Card>
      </div>

      <Card
        title="Recent recordings"
        description="Saved locally after every broadcast."
        actions={
          <Button size="sm" icon="upload">
            Upload
          </Button>
        }
      >
        <ul className="ui-list">
          {recordings.map((r: Recording) => (
            <li className="ui-list__item" key={r.id}>
              <Icon name="video" size={18} />
              <div className="ui-list__grow">
                <div className="ui-list__title">{r.title}</div>
                <div className="ui-list__sub">
                  {r.duration} - {r.size}
                </div>
              </div>
              <Button size="sm" variant="ghost" icon="play" aria-label={`Play ${r.title}`} />
              <Button
                size="sm"
                variant="ghost"
                icon="trash"
                aria-label={`Delete ${r.title}`}
                onClick={() =>
                  setRecordings((list: Recording[]) => list.filter((item: Recording) => item.id !== r.id))
                }
              />
            </li>
          ))}
        </ul>
        {recordings.length === 0 && (
          <EmptyState icon="record" title="No recordings" description="Recordings you keep will show up here." />
        )}
      </Card>
    </div>
  )
}
