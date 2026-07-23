'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  BarChart3,
  Download,
  FolderOpen,
  LayoutDashboard,
  Palette,
  Plus,
  Power,
  QrCode,
  Settings,
  UserRound,
} from 'lucide-react'
import { sidebarNav } from '@/config/navigation'
import { cn } from '@/lib/utils'

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  LayoutDashboard,
  Plus,
  FolderOpen,
  Palette,
  BarChart3,
  Download,
  Settings,
  UserRound,
}

type MenuName = 'file' | 'edit' | 'view' | 'help'

const menuItems: Record<MenuName, Array<{ label?: string; href?: string; separator?: boolean }>> = {
  file: [
    { label: 'New QR Code', href: '/create' },
    { label: 'Open Dashboard', href: '/dashboard' },
    { label: 'Pricing', href: '/pricing' },
    { separator: true },
    { label: 'My Account', href: '/account' },
  ],
  edit: [
    { label: 'Brand Kits', href: '/brand-kits' },
    { label: 'Project Library', href: '/projects' },
    { label: 'Preferences', href: '/settings' },
  ],
  view: sidebarNav.map((item) => ({ label: item.label, href: item.href })),
  help: [
    { label: 'KUER Help', href: '/help' },
    { label: 'Subscription Plans', href: '/pricing' },
    { label: 'About KUER Studio', href: '/' },
  ],
}

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const [startOpen, setStartOpen] = useState(false)
  const [startFlyoutOpen, setStartFlyoutOpen] = useState(false)
  const [openMenu, setOpenMenu] = useState<MenuName | null>(null)
  const [clock, setClock] = useState('--:--')
  const [minimized, setMinimized] = useState(false)
  const [maximized, setMaximized] = useState(true)
  const [embedded, setEmbedded] = useState(false)

  useEffect(() => {
    const updateClock = () => setClock(new Intl.DateTimeFormat('en-GB', {
      hour: '2-digit',
      minute: '2-digit',
    }).format(new Date()))
    updateClock()
    const timer = window.setInterval(updateClock, 30_000)
    return () => window.clearInterval(timer)
  }, [])

  useEffect(() => {
    setEmbedded(window.self !== window.top)
  }, [])

  useEffect(() => {
    setStartOpen(false)
    setStartFlyoutOpen(false)
    setOpenMenu(null)
  }, [pathname])

  const currentPage = sidebarNav.find(
    (item) => pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href))
  )
  const title = currentPage?.label ?? 'Welcome to KUER Studio'
  const CurrentIcon = currentPage ? iconMap[currentPage.icon] ?? QrCode : QrCode

  return (
    <div className="win95-desktop" onClick={() => { setStartOpen(false); setOpenMenu(null) }}>
      <div className="win95-desktop-shortcuts" aria-label="Desktop shortcuts">
        {sidebarNav.slice(0, 5).map((item) => {
          const Icon = iconMap[item.icon] ?? QrCode
          return (
            <Link key={item.href} href={item.href} className="win95-shortcut">
              <span className="win95-shortcut-icon"><Icon aria-hidden="true" /></span>
              <span>{item.label}</span>
            </Link>
          )
        })}
      </div>

      <section className={cn('win95-window app-window', minimized && 'is-minimized', !maximized && 'is-restored')} aria-label={title}>
        <div className="win95-titlebar">
          <div className="win95-titlebar-label">
            <span className="win95-app-icon"><CurrentIcon aria-hidden="true" /></span>
            <span>{title}</span>
          </div>
          <div className="win95-window-controls" aria-label="Window controls">
            <button type="button" aria-label="Minimize" onClick={() => setMinimized(true)}>_</button>
            <button type="button" aria-label={maximized ? 'Restore window' : 'Maximize'} aria-pressed={maximized} onClick={() => setMaximized((value) => !value)}>&#9633;</button>
            <Link href="/" aria-label="Close">&times;</Link>
          </div>
        </div>

        <div className="win95-menubar" role="menubar" aria-label="Application menu" onClick={(event) => event.stopPropagation()}>
          {(Object.keys(menuItems) as MenuName[]).map((menu) => (
            <div className="win95-menu-root" key={menu}>
              <button
                type="button"
                role="menuitem"
                aria-haspopup="menu"
                aria-expanded={openMenu === menu}
                className={openMenu === menu ? 'is-open' : ''}
                onClick={() => setOpenMenu((current) => current === menu ? null : menu)}
              >
                <u>{menu[0].toUpperCase()}</u>{menu.slice(1)}
              </button>
              {openMenu === menu && (
                <div className="win95-dropdown" role="menu">
                  {menuItems[menu].map((item, index) => item.separator ? (
                    <div className="win95-dropdown-separator" key={`separator-${index}`} />
                  ) : (
                    <Link key={item.href} href={item.href!} role="menuitem">{item.label}</Link>
                  ))}
                  {menu === 'file' && (
                    <>
                      <div className="win95-dropdown-separator" />
                      <form method="post" action="/auth/signout"><button type="submit" role="menuitem">Log Out</button></form>
                    </>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>

        <nav className="win95-toolbar" aria-label="Main navigation">
          {sidebarNav.map((item) => {
            const Icon = iconMap[item.icon] ?? QrCode
            const active = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href))
            return (
              <Link key={item.href} href={item.href} aria-label={item.label} aria-current={active ? 'page' : undefined}>
                <Icon aria-hidden="true" /><span>{item.label}</span>
              </Link>
            )
          })}
        </nav>

        <main className="win95-window-content">{children}</main>
        <div className="win95-statusbar" aria-label="Status">
          <span>{title}</span>
          {embedded && <a href={pathname} target="_top" className="win95-open-fullscreen">Open full screen</a>}
          <span className="win95-status-ready">Ready</span>
        </div>
      </section>

      {startOpen && (
        <div className="win95-start-menu" onClick={(event) => event.stopPropagation()}>
          <div className="win95-start-rail">KUER 95</div>
          <div className="win95-start-items">
            {sidebarNav.map((item, index) => {
              const Icon = iconMap[item.icon] ?? QrCode
              if (index === 0) {
                return (
                  <div className="win95-start-primary" key={item.href}>
                    <button type="button" onClick={() => setStartFlyoutOpen((open) => !open)} aria-expanded={startFlyoutOpen}>
                      <Icon aria-hidden="true" /><span>{item.label}</span><span aria-hidden="true">&rsaquo;</span>
                    </button>
                    {startFlyoutOpen && (
                      <div className="win95-start-flyout">
                        <Link href="/dashboard"><LayoutDashboard aria-hidden="true" /><span>View Dashboard</span></Link>
                        <Link href="/create"><Plus aria-hidden="true" /><span>Open QR Designer</span></Link>
                        <Link href="/analytics"><BarChart3 aria-hidden="true" /><span>View Analytics</span></Link>
                      </div>
                    )}
                  </div>
                )
              }
              return (
                <Link key={item.href} href={item.href} className={cn(pathname === item.href && 'is-active')}>
                  <Icon aria-hidden="true" /><span>{item.label}</span><span />
                </Link>
              )
            })}
            <div className="win95-start-separator" />
            <Link href="/"><Power aria-hidden="true" /><span>Shut Down...</span></Link>
          </div>
        </div>
      )}

      <div className="win95-taskbar" onClick={(event) => event.stopPropagation()}>
        <button
          type="button"
          className={cn('win95-start-button', startOpen && 'is-pressed')}
          aria-expanded={startOpen}
          onClick={() => { setStartOpen((open) => !open); setOpenMenu(null) }}
        >
          <span className="win95-start-mark" aria-hidden="true">&#9670;</span><strong>Start</strong>
        </button>
        <button type="button" className="win95-task-button is-active" onClick={() => setMinimized(false)}>
          <CurrentIcon aria-hidden="true" /><span>{title}</span>
        </button>
        <div className="win95-task-spacer" />
        <div className="win95-clock" aria-label={`Current time ${clock}`}>{clock}</div>
      </div>
    </div>
  )
}
