'use client'

import { useState } from 'react'
import { usePathname } from 'next/navigation'
import Link from 'next/link'
import { LayoutDashboard, Plus, FolderOpen, BarChart3, Settings, X } from 'lucide-react'
import { Sidebar } from './Sidebar'
import { Header } from './Header'
import { cn } from '@/lib/utils'
import { sidebarNav } from '@/config/navigation'

const mobileNav = [
  { href: '/dashboard', icon: LayoutDashboard, label: 'Home' },
  { href: '/projects', icon: FolderOpen, label: 'Projects' },
  { href: '/create', icon: Plus, label: 'Create' },
  { href: '/analytics', icon: BarChart3, label: 'Analytics' },
  { href: '/settings', icon: Settings, label: 'Settings' },
]

export function AppShell({ children }: { children: React.ReactNode }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const pathname = usePathname()

  const currentPage = sidebarNav.find(
    (item) => pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href))
  )

  return (
    <div className="min-h-screen bg-background">
      <Sidebar />

      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="fixed inset-0 bg-black/60" onClick={() => setMobileMenuOpen(false)} />
          <div className="fixed left-0 top-0 h-full w-72 bg-panel border-r border-border p-4 animate-slide-up">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-lg bg-accent flex items-center justify-center">
                  <span className="text-sm font-bold text-white">K</span>
                </div>
                <span className="text-sm font-semibold text-foreground">KUER Studio</span>
              </div>
              <button onClick={() => setMobileMenuOpen(false)} className="text-muted hover:text-foreground">
                <X className="h-5 w-5" />
              </button>
            </div>
            <nav className="space-y-1">
              {sidebarNav.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={cn(
                    'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors',
                    pathname === item.href ? 'bg-accent/10 text-accent font-medium' : 'text-muted hover:text-foreground'
                  )}
                >
                  {item.label}
                </Link>
              ))}
            </nav>
          </div>
        </div>
      )}

      <div className="lg:pl-60">
        <Header title={currentPage?.label} onMenuToggle={() => setMobileMenuOpen(true)} />
        <main className="p-4 lg:p-6 pb-24 lg:pb-6">
          {children}
        </main>
      </div>

      <nav className="fixed bottom-0 left-0 right-0 z-40 lg:hidden bg-panel/90 backdrop-blur-xl border-t border-border">
        <div className="flex items-center justify-around h-16 px-2">
          {mobileNav.map((item) => {
            const Icon = item.icon
            const isActive = pathname === item.href
            const isCreate = item.href === '/create'

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'flex flex-col items-center gap-0.5 px-3 py-1 rounded-lg transition-colors',
                  isCreate && 'relative -mt-4',
                  isActive ? 'text-accent' : 'text-muted'
                )}
              >
                {isCreate ? (
                  <div className="h-12 w-12 rounded-full bg-accent flex items-center justify-center shadow-lg shadow-accent/30">
                    <Icon className="h-5 w-5 text-white" />
                  </div>
                ) : (
                  <Icon className="h-5 w-5" />
                )}
                <span className={cn('text-[10px]', isCreate && 'mt-0.5')}>{item.label}</span>
              </Link>
            )
          })}
        </div>
      </nav>
    </div>
  )
}
