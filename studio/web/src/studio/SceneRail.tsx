import { Icon } from '../components/Icon'
import { useStudio, type Scene } from '../state/studioStore'

function SceneCard({ scene }: { scene: Scene }) {
  const { activeSceneId, selectScene, removeScene, scenes } = useStudio()
  const active = scene.id === activeSceneId

  return (
    <div
      className={`scene ${active ? 'scene--active' : ''}`}
      onClick={() => selectScene(scene.id)}
      role="button"
      tabIndex={0}
      aria-pressed={active}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          selectScene(scene.id)
        }
      }}
    >
      <div className="scene__thumb">
        <span className="scene__badge" style={{ background: scene.color }}>
          {scene.index}
        </span>
        <div className="scene__text">
          <div className="scene__title">{scene.title}</div>
          <div className="scene__sub">{scene.subtitle}</div>
        </div>
      </div>

      <div className="scene__foot">
        {scenes.length > 1 && (
          <button
            className="scene__more"
            aria-label={`Remove ${scene.title}`}
            onClick={(e) => {
              e.stopPropagation()
              removeScene(scene.id)
            }}
          >
            <Icon name="more" size={14} />
          </button>
        )}
      </div>
    </div>
  )
}

export function SceneRail() {
  const { scenes, openModal } = useStudio()

  return (
    <aside className="rail">
      <div className="rail__head">
        <button className="rail__add" onClick={() => openModal('addScene')}>
          <Icon name="plus" size={14} />
          Add Scene
        </button>
      </div>
      <div className="rail__list">
        {scenes.map((s) => (
          <SceneCard key={s.id} scene={s} />
        ))}
      </div>
    </aside>
  )
}
