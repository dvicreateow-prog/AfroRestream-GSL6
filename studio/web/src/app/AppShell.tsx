/*
 * Shell for every page outside the Studio: dashboard, tools, settings, developers.
 * The Studio route renders full-bleed and does not use this shell.
 */
import { NavLink, Outlet, useLocation } from 'react-router-dom'
import { Icon, type IconName } from '../components/Icon'
import './app-shell.css'

interface NavItem {
  to: string
  label: string
  icon: IconName
  end?: boolean
}

const MAIN: NavItem[] = [
  { to: '/home', label: 'Home', icon: 'grid', end: true },
  { to: '/studio', label: 'Studio', icon: 'video' },
  { to: '/tools', label: 'Tools', icon: 'star' },
]

const SETTINGS: NavItem[] = [
  { to: '/settings/account', label: 'Account', icon: 'people' },
  { to: '/settings/streaming-setup', label: 'Streaming setup', icon: 'rtmp' },
  { to: '/settings/pull-links', label: 'Pull links', icon: 'link' },
  { to: '/settings/clips', label: 'Clips', icon: 'layers' },
  { to: '/settings/speed-test', label: 'Speed test', icon: 'signal' },
]

const DEVELOPERS: NavItem[] = [
  { to: '/developers', label: 'Guide', icon: 'notes', end: true },
  { to: '/developers/apps', label: 'Applications', icon: 'browser' },
]

function NavGroup({ title, items }: { title: string; items: NavItem[] }) {
  return (
    <div className="shell-nav__group">
      <span className="shell-nav__title">{title}</span>
      {items.map((i) => (
        <NavLink
          key={i.to}
          to={i.to}
          end={i.end}
          className={({ isActive }) => `shell-nav__link ${isActive ? 'is-active' : ''}`}
        >
          <Icon name={i.icon} size={17} />
          {i.label}
        </NavLink>
      ))}
    </div>
  )
}

export function AppShell() {
  const { pathname } = useLocation()

  return (
    <div className="shell">
      <aside className="shell-nav">
        <div className="shell-brand">
          <span className="shell-brand__mark">STUDIO</span>
          <span className="shell-brand__tag">CLONE</span>
        </div>

        <nav className="shell-nav__scroll">
          <NavGroup title="Workspace" items={MAIN} />
          <NavGroup title="Settings" items={SETTINGS} />
          <NavGroup title="Developers" items={DEVELOPERS} />
        </nav>

        <div className="shell-nav__foot">
          <NavLink to="/studio" className="shell-golive">
            <Icon name="record" size={13} />
            Open Studio
          </NavLink>
        </div>
      </aside>

      <main className="shell-main" key={pathname}>
        <div className="shell-main__inner">
          <Outlet />
        </div>
      </main>
    </div>
  )
}
