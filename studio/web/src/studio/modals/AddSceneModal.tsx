import { useState } from 'react'
import { Icon } from '../../components/Icon'
import { Modal, OptionGrid } from '../../components/Modal'
import { useStudio } from '../../state/studioStore'

type SceneKind =
  | 'camera'
  | 'screen'
  | 'presentation'
  | 'video'
  | 'image'
  | 'countdown'
  | 'browser'
  | 'rtmp'

type PickId = 'camera' | 'media' | 'countdown'

const PICKS: Record<PickId, { kind: SceneKind; name: string }> = {
  camera: { kind: 'camera', name: 'Camera' },
  media: { kind: 'video', name: 'Media' },
  countdown: { kind: 'countdown', name: 'Countdown' },
}

export function AddSceneModal({ onClose }: { onClose: () => void }) {
  const addScene = useStudio().addScene
  const [hoverBlank, setHoverBlank] = useState(false)

  const create = (kind: SceneKind, name: string) => {
    addScene(kind, name)
    onClose()
  }

  const pick = (id: string) => {
    const choice = PICKS[id as PickId]
    if (choice) create(choice.kind, choice.name)
  }

  return (
    <Modal
      title="Add scene"
      description="Pick a starting point. You can change it later."
      width="md"
      onClose={onClose}
    >
      <OptionGrid
        columns={1}
        onPick={pick}
        options={[
          {
            id: 'camera',
            name: 'Camera',
            description: 'Start with people on screen',
            icon: 'cam',
            color: '#2864f0',
          },
          {
            id: 'media',
            name: 'Media',
            description: 'Video, image, slides or a stream',
            icon: 'video',
            color: '#7c5cfc',
          },
          {
            id: 'countdown',
            name: 'Countdown',
            description: 'Hold the audience before you start',
            icon: 'countdown',
            color: '#ef4b55',
          },
        ]}
      />

      <div style={{ display: 'flex', justifyContent: 'center', marginTop: 14 }}>
        <button
          type="button"
          onMouseEnter={() => setHoverBlank(true)}
          onMouseLeave={() => setHoverBlank(false)}
          onClick={() => create('camera', 'Untitled scene')}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 7,
            padding: '7px 13px',
            borderRadius: 'var(--r-md)',
            border: '1px solid var(--c-line)',
            background: hoverBlank ? 'var(--c-elevated)' : 'transparent',
            color: hoverBlank ? 'var(--c-text)' : 'var(--c-text-dim)',
            fontSize: 12,
            fontWeight: 'var(--fw-medium)' as unknown as number,
            cursor: 'pointer',
            transition: 'background 120ms ease, color 120ms ease',
          }}
        >
          <Icon name="plus" size={13} />
          Start from a blank scene
        </button>
      </div>
    </Modal>
  )
}
