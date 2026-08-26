/*
 * Modal shell used by every Studio dialog.
 * Closes on Escape and on backdrop click; restores focus to the opener.
 */
import { useEffect, useRef, type ReactNode } from 'react'
import { Icon } from './Icon'
import './modal.css'

export type ModalWidth = 'sm' | 'md' | 'lg' | 'xl'

export function Modal({
  title,
  description,
  width = 'md',
  onClose,
  footer,
  children,
}: {
  title: string
  description?: string
  width?: ModalWidth
  onClose: () => void
  footer?: ReactNode
  children: ReactNode
}) {
  const panelRef = useRef<HTMLDivElement>(null)
  const openerRef = useRef<Element | null>(null)

  useEffect(() => {
    openerRef.current = document.activeElement
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.stopPropagation()
        onClose()
      }
    }
    document.addEventListener('keydown', onKey)
    panelRef.current?.focus()
    return () => {
      document.removeEventListener('keydown', onKey)
      ;(openerRef.current as HTMLElement | null)?.focus?.()
    }
  }, [onClose])

  return (
    <div
      className="modal__backdrop"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose()
      }}
    >
      <div
        ref={panelRef}
        className={`modal modal--${width}`}
        role="dialog"
        aria-modal="true"
        aria-label={title}
        tabIndex={-1}
      >
        <header className="modal__head">
          <div>
            <h2 className="modal__title">{title}</h2>
            {description && <p className="modal__desc">{description}</p>}
          </div>
          <button className="modal__close" onClick={onClose} aria-label="Close">
            <Icon name="close" size={16} />
          </button>
        </header>

        <div className="modal__body">{children}</div>

        {footer && <footer className="modal__foot">{footer}</footer>}
      </div>
    </div>
  )
}

/** Grid of selectable option tiles, used by Add Scene / Add Source. */
export function OptionGrid({
  options,
  onPick,
  columns = 2,
}: {
  options: {
    id: string
    name: string
    description: string
    icon: Parameters<typeof Icon>[0]['name']
    color: string
  }[]
  onPick: (id: string) => void
  columns?: number
}) {
  return (
    <div className="modal__grid" style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}>
      {options.map((o) => (
        <button key={o.id} className="modal__option" onClick={() => onPick(o.id)}>
          <span className="modal__optionIcon" style={{ background: o.color }}>
            <Icon name={o.icon} size={16} />
          </span>
          <span className="modal__optionText">
            <span className="modal__optionName">{o.name}</span>
            <span className="modal__optionDesc">{o.description}</span>
          </span>
          <Icon name="chevronRight" size={15} className="modal__optionArrow" />
        </button>
      ))}
    </div>
  )
}
