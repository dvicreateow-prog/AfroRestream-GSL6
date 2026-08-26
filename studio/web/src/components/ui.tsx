/*
 * Shared UI primitives for the dashboard, settings and tools pages.
 * Styling lives in ui.css and consumes the tokens in styles/tokens.css.
 */
import type {
  ButtonHTMLAttributes,
  InputHTMLAttributes,
  ReactNode,
  SelectHTMLAttributes,
  TextareaHTMLAttributes,
} from 'react'
import { useId, useState } from 'react'
import { Icon, type IconName } from './Icon'
import './ui.css'

/* ------------------------------------------------------------------ */
/* Button                                                              */
/* ------------------------------------------------------------------ */

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'success'
type Size = 'sm' | 'md' | 'lg'

interface BtnProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant
  size?: Size
  icon?: IconName
  iconRight?: IconName
  loading?: boolean
  block?: boolean
}

export function Button({
  variant = 'secondary',
  size = 'md',
  icon,
  iconRight,
  loading,
  block,
  children,
  className = '',
  disabled,
  ...rest
}: BtnProps) {
  const iconSize = size === 'sm' ? 14 : size === 'lg' ? 18 : 16
  return (
    <button
      className={`ui-btn ui-btn--${variant} ui-btn--${size} ${block ? 'ui-btn--block' : ''} ${className}`}
      disabled={disabled || loading}
      {...rest}
    >
      {loading ? <span className="ui-spinner" /> : icon && <Icon name={icon} size={iconSize} />}
      {children}
      {iconRight && <Icon name={iconRight} size={iconSize} />}
    </button>
  )
}

/* ------------------------------------------------------------------ */
/* Card / Section                                                      */
/* ------------------------------------------------------------------ */

export function Card({
  title,
  description,
  actions,
  children,
  padded = true,
}: {
  title?: ReactNode
  description?: ReactNode
  actions?: ReactNode
  children?: ReactNode
  padded?: boolean
}) {
  return (
    <section className="ui-card">
      {(title || actions) && (
        <header className="ui-card__head">
          <div>
            {title && <h2 className="ui-card__title">{title}</h2>}
            {description && <p className="ui-card__desc">{description}</p>}
          </div>
          {actions && <div className="ui-card__actions">{actions}</div>}
        </header>
      )}
      <div className={padded ? 'ui-card__body' : ''}>{children}</div>
    </section>
  )
}

export function PageHeader({
  title,
  description,
  actions,
}: {
  title: string
  description?: string
  actions?: ReactNode
}) {
  return (
    <header className="ui-page-head">
      <div>
        <h1 className="ui-page-title">{title}</h1>
        {description && <p className="ui-page-desc">{description}</p>}
      </div>
      {actions && <div className="ui-page-actions">{actions}</div>}
    </header>
  )
}

/* ------------------------------------------------------------------ */
/* Form controls                                                       */
/* ------------------------------------------------------------------ */

export function Field({
  label,
  hint,
  error,
  children,
}: {
  label?: string
  hint?: string
  error?: string
  children: ReactNode
}) {
  return (
    <div className="ui-field">
      {label && <label className="ui-field__label">{label}</label>}
      {children}
      {error ? (
        <p className="ui-field__error">{error}</p>
      ) : (
        hint && <p className="ui-field__hint">{hint}</p>
      )}
    </div>
  )
}

export function Input(props: InputHTMLAttributes<HTMLInputElement>) {
  return <input {...props} className={`ui-input ${props.className ?? ''}`} />
}

export function Textarea(props: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea {...props} className={`ui-input ui-textarea ${props.className ?? ''}`} />
}

/**
 * Select takes a plain value callback rather than a DOM event, so callers never
 * touch `e.target.value`.
 */
export function Select({
  options,
  onChange,
  ...rest
}: Omit<SelectHTMLAttributes<HTMLSelectElement>, 'onChange'> & {
  options: { value: string; label: string }[]
  onChange?: (value: string) => void
}) {
  return (
    <div className="ui-select">
      <select
        {...rest}
        className="ui-input"
        onChange={(e) => onChange?.(e.target.value)}
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
      <Icon name="chevronDown" size={15} />
    </div>
  )
}

export function Toggle({
  checked,
  onChange,
  label,
  hint,
  disabled,
}: {
  checked: boolean
  onChange: (v: boolean) => void
  label?: string
  hint?: string
  disabled?: boolean
}) {
  const id = useId()
  return (
    <div className="ui-toggle-row">
      {(label || hint) && (
        <div className="ui-toggle-text">
          {label && (
            <label htmlFor={id} className="ui-toggle-label">
              {label}
            </label>
          )}
          {hint && <p className="ui-field__hint">{hint}</p>}
        </div>
      )}
      <button
        id={id}
        role="switch"
        aria-checked={checked}
        aria-label={label}
        disabled={disabled}
        className={`ui-toggle ${checked ? 'ui-toggle--on' : ''}`}
        onClick={() => onChange(!checked)}
      >
        <span className="ui-toggle__knob" />
      </button>
    </div>
  )
}

/* Secret value with reveal + copy - used for stream keys and client secrets. */
export function SecretField({
  value,
  label,
  hint,
  readOnly = true,
  onRegenerate,
}: {
  value: string
  label?: string
  hint?: string
  readOnly?: boolean
  onRegenerate?: () => void
}) {
  const [shown, setShown] = useState(false)
  const [copied, setCopied] = useState(false)

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(value)
      setCopied(true)
      setTimeout(() => setCopied(false), 1600)
    } catch {
      /* clipboard blocked - the value is selectable in the input */
    }
  }

  return (
    <Field label={label} hint={hint}>
      <div className="ui-secret">
        <input
          className="ui-input"
          type={shown ? 'text' : 'password'}
          value={value}
          readOnly={readOnly}
          onFocus={(e) => e.currentTarget.select()}
        />
        <Button size="sm" variant="ghost" onClick={() => setShown((s) => !s)} aria-label={shown ? 'Hide' : 'Reveal'}>
          <Icon name="eye" size={15} />
        </Button>
        <Button size="sm" variant="ghost" onClick={copy}>
          <Icon name={copied ? 'check' : 'copy'} size={15} />
          {copied ? 'Copied' : 'Copy'}
        </Button>
        {onRegenerate && (
          <Button size="sm" variant="ghost" onClick={onRegenerate} icon="refresh">
            Reset
          </Button>
        )}
      </div>
    </Field>
  )
}

/* ------------------------------------------------------------------ */
/* Display                                                             */
/* ------------------------------------------------------------------ */

export function Badge({
  children,
  tone = 'neutral',
}: {
  children: ReactNode
  tone?: 'neutral' | 'success' | 'warning' | 'danger' | 'info' | 'brand'
}) {
  return <span className={`ui-badge ui-badge--${tone}`}>{children}</span>
}

export function EmptyState({
  icon = 'info',
  title,
  description,
  action,
}: {
  icon?: IconName
  title: string
  description?: string
  action?: ReactNode
}) {
  return (
    <div className="ui-empty">
      <Icon name={icon} size={28} />
      <h3>{title}</h3>
      {description && <p>{description}</p>}
      {action}
    </div>
  )
}

export function Stat({
  label,
  value,
  sub,
  tone,
}: {
  label: string
  value: ReactNode
  sub?: string
  tone?: 'success' | 'danger' | 'brand'
}) {
  return (
    <div className="ui-stat">
      <span className="ui-stat__label">{label}</span>
      <strong className={`ui-stat__value ${tone ? `ui-stat__value--${tone}` : ''}`}>{value}</strong>
      {sub && <span className="ui-stat__sub">{sub}</span>}
    </div>
  )
}

export function Tabs<T extends string>({
  tabs,
  active,
  onChange,
}: {
  tabs: { id: T; label: string; icon?: IconName }[]
  active: T
  onChange: (id: T) => void
}) {
  return (
    <div className="ui-tabs" role="tablist">
      {tabs.map((t) => (
        <button
          key={t.id}
          role="tab"
          aria-selected={active === t.id}
          className={`ui-tab ${active === t.id ? 'ui-tab--active' : ''}`}
          onClick={() => onChange(t.id)}
        >
          {t.icon && <Icon name={t.icon} size={15} />}
          {t.label}
        </button>
      ))}
    </div>
  )
}

export function Meter({ value, max = 1, tone }: { value: number; max?: number; tone?: string }) {
  const pct = Math.min(100, Math.max(0, (value / max) * 100))
  return (
    <div className="ui-meter">
      <div className="ui-meter__fill" style={{ width: `${pct}%`, background: tone }} />
    </div>
  )
}
