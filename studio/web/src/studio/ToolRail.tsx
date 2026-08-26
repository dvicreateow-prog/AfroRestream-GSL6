import { Icon, type IconName } from '../components/Icon'
import { useStudio, type PanelId } from '../state/studioStore'

/*
 * Tool rail. Order follows the captured studio window; the AI tool is added from
 * the OnboardingChat / AiScene components found in the shipped bundles
 * (see TOOLS-04-sub-apps.md).
 */
const TOOLS: { id: PanelId; icon: IconName; label: string }[] = [
  { id: 'sources', icon: 'sources', label: 'Sources' },
  { id: 'chat', icon: 'chat', label: 'Chat' },
  { id: 'graphics', icon: 'graphics', label: 'Graphics' },
  { id: 'theme', icon: 'theme', label: 'Theme' },
  { id: 'captions', icon: 'captions', label: 'Captions' },
  { id: 'qr', icon: 'qr', label: 'QR codes' },
  { id: 'notes', icon: 'notes', label: 'Notes' },
  { id: 'ai', icon: 'star', label: 'AI assistant' },
]

export function ToolRail() {
  const { panel, panelOpen, setPanel } = useStudio()

  return (
    <nav className="tools" aria-label="Studio tools">
      {TOOLS.map((t) => (
        <button
          key={t.id}
          className={`tools__btn ${panel === t.id && panelOpen ? 'tools__btn--active' : ''}`}
          onClick={() => setPanel(t.id)}
          title={t.label}
          aria-label={t.label}
          aria-pressed={panel === t.id && panelOpen}
        >
          <Icon name={t.icon} size={17} />
        </button>
      ))}

      <span className="tools__spacer" />

      <button className="tools__btn" title="Help" aria-label="Help">
        <Icon name="help" size={17} />
      </button>
    </nav>
  )
}
