/*
 * Renders whichever dialog the store has open. Kept separate from StudioPage so the
 * dialog bundle only mounts when something is actually open.
 */
import { useStudio } from '../state/studioStore'
import { AddSceneModal } from './modals/AddSceneModal'
import { AddSourceModal } from './modals/AddSourceModal'
import { SettingsModal } from './modals/SettingsModal'
import { InviteModal } from './modals/InviteModal'
import { CustomizeLayoutModal } from './modals/CustomizeLayoutModal'
import { ChannelsModal } from './modals/ChannelsModal'

export function StudioModals() {
  const modal = useStudio((s) => s.modal)
  const closeModal = useStudio((s) => s.closeModal)

  if (!modal) return null

  switch (modal) {
    case 'addScene':
    case 'addMediaScene':
      return <AddSceneModal onClose={closeModal} />
    case 'addSource':
      return <AddSourceModal onClose={closeModal} />
    case 'settings':
      return <SettingsModal onClose={closeModal} />
    case 'invite':
      return <InviteModal onClose={closeModal} />
    case 'customizeLayout':
      return <CustomizeLayoutModal onClose={closeModal} />
    case 'channels':
    case 'streamDetails':
      return <ChannelsModal onClose={closeModal} />
    default:
      return null
  }
}
