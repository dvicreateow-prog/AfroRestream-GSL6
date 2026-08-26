/*
 * Keyboard shortcut reference, opened with "?" .
 * Reads the same BINDINGS table the handler uses, so the two can never disagree.
 */
import { Modal } from '../components/Modal'
import { BINDINGS, type Binding } from './useShortcuts'

/** Render "Shift+Slash" as discrete key caps. */
function Keys({ keys }: { keys: string }) {
  return (
    <span style={{ display: 'inline-flex', gap: 4, flexWrap: 'wrap' }}>
      {keys.split('+').map((k, i) => (
        <kbd
          key={`${k}-${i}`}
          style={{
            display: 'inline-grid',
            placeItems: 'center',
            minWidth: 22,
            height: 22,
            padding: '0 6px',
            borderRadius: 'var(--r-sm)',
            background: 'var(--c-elevated)',
            border: '1px solid var(--c-line)',
            borderBottomWidth: 2,
            fontFamily: 'var(--f-mono)',
            fontSize: 10,
            color: 'var(--c-text)',
          }}
        >
          {k}
        </kbd>
      ))}
    </span>
  )
}

export function ShortcutsHelp({ onClose }: { onClose: () => void }) {
  const groups = BINDINGS.reduce<Record<string, Binding[]>>((acc, b) => {
    ;(acc[b.group] ||= []).push(b)
    return acc
  }, {})

  return (
    <Modal
      title="Keyboard shortcuts"
      description="Shortcuts are ignored while you are typing in a field."
      width="lg"
      onClose={onClose}
    >
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
          gap: 20,
        }}
      >
        {Object.entries(groups).map(([group, items]) => (
          <section key={group}>
            <h3 className="modal__sectionTitle">{group}</h3>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              {items.map((b) => (
                <div
                  key={b.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: 12,
                    padding: '7px 0',
                    borderBottom: '1px solid var(--c-line-soft)',
                    fontSize: 12,
                  }}
                >
                  <span style={{ color: 'var(--c-text-dim)' }}>{b.label}</span>
                  <Keys keys={b.keys} />
                </div>
              ))}
            </div>
          </section>
        ))}
      </div>
    </Modal>
  )
}
