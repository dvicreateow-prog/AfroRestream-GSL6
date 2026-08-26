import { Icon } from '../components/Icon'
import { useStudio } from '../state/studioStore'
import { SourcesPanel } from './panels/SourcesPanel'
import { ChatPanel } from './panels/ChatPanel'
import { GraphicsPanel } from './panels/GraphicsPanel'
import { ThemePanel } from './panels/ThemePanel'
import { CaptionsPanel } from './panels/CaptionsPanel'
import { QrPanel } from './panels/QrPanel'
import { NotesPanel } from './panels/NotesPanel'
import { AiPanel } from './panels/AiPanel'

const TITLES: Record<string, string> = {
  sources: 'Sources',
  chat: 'Chat',
  graphics: 'Graphics',
  theme: 'Theme',
  captions: 'Captions',
  qr: 'QR Codes',
  notes: 'Notes',
  ai: 'AI Assistant',
}

const PANELS: Record<string, () => React.JSX.Element> = {
  sources: SourcesPanel,
  chat: ChatPanel,
  graphics: GraphicsPanel,
  theme: ThemePanel,
  captions: CaptionsPanel,
  qr: QrPanel,
  notes: NotesPanel,
  ai: AiPanel,
}

export function RightPanel() {
  const { panel, closePanel } = useStudio()
  const Body = PANELS[panel] ?? SourcesPanel

  return (
    <aside className="panel">
      <div className="panel__head">
        <span className="panel__title">{TITLES[panel] ?? panel}</span>
        <button className="panel__close" onClick={closePanel} aria-label="Close panel">
          <Icon name="close" size={15} />
        </button>
      </div>
      <div className="panel__divider" />
      <div className="panel__body">
        <Body />
      </div>
    </aside>
  )
}
