import { useState } from 'react'
import { useStudio } from '../state/studioStore'
import { Header } from './Header'
import { SceneRail } from './SceneRail'
import { Stage } from './Stage'
import { RightPanel } from './RightPanel'
import { ToolRail } from './ToolRail'
import { StudioModals } from './StudioModals'
import { ShortcutsHelp } from './ShortcutsHelp'
import { useShortcuts } from './useShortcuts'
import { EngineProvider } from '../engine/EngineProvider'
import './studio.css'

/* Shortcuts must live inside EngineProvider - they call engine actions. */
function StudioBody() {
  const panelOpen = useStudio((s) => s.panelOpen)
  const [helpOpen, setHelpOpen] = useState(false)

  useShortcuts({ onShowHelp: () => setHelpOpen(true) })

  return (
    <>
      <div className="studio">
        <Header />
        <div className="studio__body">
          <SceneRail />
          <Stage />
          {panelOpen && <RightPanel />}
          <ToolRail />
        </div>
        <StudioModals />
        {helpOpen && <ShortcutsHelp onClose={() => setHelpOpen(false)} />}
      </div>
    </>
  )
}

export function StudioPage() {
  return (
    <EngineProvider>
      <StudioBody />
    </EngineProvider>
  )
}
