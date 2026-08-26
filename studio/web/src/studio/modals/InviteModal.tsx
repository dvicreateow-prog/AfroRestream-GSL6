import { useState } from 'react'
import { Icon } from '../../components/Icon'
import { Modal } from '../../components/Modal'
import { useStudio } from '../../state/studioStore'

const ALPHABET = 'abcdefghijkmnpqrstuvwxyz23456789'

function makeCode(): string {
  let out = ''
  for (let i = 0; i < 8; i++) out += ALPHABET[Math.floor(Math.random() * ALPHABET.length)]
  return out
}

function isEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(value.trim())
}

const ROOM_CAPACITY = 10

const labelStyle: React.CSSProperties = {
  fontSize: 11,
  color: 'var(--c-text-mute)',
  fontWeight: 'var(--fw-medium)' as unknown as number,
  letterSpacing: 0.3,
}

const inputStyle: React.CSSProperties = {
  flex: 1,
  minWidth: 0,
  background: 'var(--c-surface)',
  border: '1px solid var(--c-line)',
  borderRadius: 'var(--r-md)',
  color: 'var(--c-text)',
  fontSize: 12,
  padding: '8px 10px',
  outline: 'none',
}

const buttonStyle: React.CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: 6,
  background: 'var(--c-elevated)',
  border: '1px solid var(--c-line)',
  borderRadius: 'var(--r-md)',
  color: 'var(--c-text)',
  fontSize: 12,
  fontWeight: 'var(--fw-medium)' as unknown as number,
  padding: '8px 12px',
  cursor: 'pointer',
  whiteSpace: 'nowrap',
}

export function InviteModal({ onClose }: { onClose: () => void }) {
  const participants = useStudio().participants
  const [code, setCode] = useState<string>(() => makeCode())
  const [copied, setCopied] = useState(false)
  const [rotated, setRotated] = useState(false)
  const [allowScreen, setAllowScreen] = useState(true)
  const [autoAdmit, setAutoAdmit] = useState(false)
  const [email, setEmail] = useState('')
  const [invited, setInvited] = useState<string[]>([])
  const [error, setError] = useState('')

  const origin = typeof window === 'undefined' ? '' : window.location.origin
  const inviteUrl = `${origin}/join/${code}`
  const inRoom = participants.length + 1

  const copyLink = (): void => {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      void navigator.clipboard.writeText(inviteUrl)
    }
    setCopied(true)
    window.setTimeout(() => setCopied(false), 1500)
  }

  const regenerate = (): void => {
    setCode(makeCode())
    setCopied(false)
    setRotated(true)
  }

  const addEmail = (): void => {
    const value = email.trim().toLowerCase()
    if (!isEmail(value)) {
      setError('Enter a valid email address.')
      return
    }
    if (invited.includes(value)) {
      setError('That address is already on the list.')
      return
    }
    setInvited((list) => [...list, value])
    setEmail('')
    setError('')
  }

  const toggleRow = (
    id: string,
    title: string,
    hint: string,
    value: boolean,
    onToggle: (next: boolean) => void,
  ) => (
    <button
      key={id}
      type="button"
      onClick={() => onToggle(!value)}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 10,
        width: '100%',
        textAlign: 'left',
        background: 'var(--c-surface)',
        border: '1px solid var(--c-line)',
        borderRadius: 'var(--r-md)',
        padding: '9px 11px',
        cursor: 'pointer',
        marginBottom: 6,
      }}
    >
      <span style={{ flex: 1, minWidth: 0 }}>
        <span style={{ display: 'block', fontSize: 12, color: 'var(--c-text)' }}>{title}</span>
        <span style={{ display: 'block', fontSize: 11, color: 'var(--c-text-mute)', marginTop: 2 }}>
          {hint}
        </span>
      </span>
      <span
        style={{
          width: 32,
          height: 18,
          flexShrink: 0,
          borderRadius: 999,
          background: value ? 'var(--brand-primary)' : 'var(--c-elevated)',
          border: '1px solid var(--c-line)',
          position: 'relative',
          transition: 'background 120ms ease',
        }}
      >
        <span
          style={{
            position: 'absolute',
            top: 2,
            left: value ? 16 : 2,
            width: 12,
            height: 12,
            borderRadius: '50%',
            background: 'var(--c-text)',
            transition: 'left 120ms ease',
          }}
        />
      </span>
    </button>
  )

  return (
    <Modal
      title="Invite guests"
      description="Share this link so guests can join from a browser."
      width="md"
      onClose={onClose}
      footer={
        <button
          type="button"
          onClick={onClose}
          style={{
            ...buttonStyle,
            background: 'var(--brand-primary)',
            borderColor: 'var(--brand-primary)',
            fontWeight: 'var(--fw-semibold)' as unknown as number,
          }}
        >
          Done
        </button>
      }
    >
      <div className="modal__section">
        <div className="modal__sectionTitle">Guest link</div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <input readOnly value={inviteUrl} onFocus={(e) => e.currentTarget.select()} style={inputStyle} />
          <button type="button" onClick={copyLink} style={buttonStyle}>
            <Icon name={copied ? 'check' : 'copy'} size={13} />
            {copied ? 'Copied' : 'Copy'}
          </button>
          <button type="button" onClick={regenerate} style={buttonStyle}>
            <Icon name="refresh" size={13} />
            New link
          </button>
        </div>
        {rotated ? (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              marginTop: 8,
              fontSize: 11,
              color: 'var(--c-yellow)',
            }}
          >
            <Icon name="warning" size={12} />
            Link rotated. The previous link no longer works for anyone holding it.
          </div>
        ) : null}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            marginTop: 8,
            fontSize: 11,
            color: inRoom >= ROOM_CAPACITY ? 'var(--c-red)' : 'var(--c-text-mute)',
          }}
        >
          <Icon name="people" size={12} />
          {inRoom} of {ROOM_CAPACITY} people in this room
        </div>
      </div>

      <div className="modal__section">
        <div className="modal__sectionTitle">Guest permissions</div>
        {toggleRow(
          'share',
          'Guests can share their screen',
          'Lets guests push a window or tab into the scene.',
          allowScreen,
          setAllowScreen,
        )}
        {toggleRow(
          'admit',
          'Guests can join without approval',
          'Off means each guest waits in the lobby until you admit them.',
          autoAdmit,
          setAutoAdmit,
        )}
      </div>

      <div className="modal__section">
        <div className="modal__sectionTitle">Invite by email</div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <input
            type="email"
            value={email}
            placeholder="guest@studio.com"
            onChange={(e) => {
              setEmail(e.currentTarget.value)
              if (error) setError('')
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault()
                addEmail()
              }
            }}
            style={inputStyle}
          />
          <button type="button" onClick={addEmail} style={buttonStyle}>
            <Icon name="plus" size={13} />
            Add
          </button>
        </div>
        {error ? (
          <div style={{ marginTop: 6, fontSize: 11, color: 'var(--c-red)' }}>{error}</div>
        ) : null}
        {invited.length > 0 ? (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 10 }}>
            {invited.map((address) => (
              <span
                key={address}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 6,
                  background: 'var(--c-elevated)',
                  border: '1px solid var(--c-line)',
                  borderRadius: 999,
                  padding: '4px 6px 4px 10px',
                  fontSize: 11,
                  color: 'var(--c-text-dim)',
                }}
              >
                {address}
                <button
                  type="button"
                  aria-label={`Remove ${address}`}
                  onClick={() => setInvited((list) => list.filter((item) => item !== address))}
                  style={{
                    display: 'inline-flex',
                    background: 'transparent',
                    border: 'none',
                    color: 'var(--c-text-mute)',
                    cursor: 'pointer',
                    padding: 2,
                  }}
                >
                  <Icon name="close" size={11} />
                </button>
              </span>
            ))}
          </div>
        ) : (
          <div style={{ marginTop: 8, ...labelStyle }}>
            Addresses you add get the current guest link when you finish.
          </div>
        )}
      </div>
    </Modal>
  )
}
