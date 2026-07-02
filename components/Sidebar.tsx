'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard, Plus, FolderOpen, Palette, BarChart3, Download, Settings
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { sidebarNav } from '@/config/navigation'

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  LayoutDashboard, Plus, FolderOpen, Palette, BarChart3, Download, Settings,
}

export function Sidebar() {
  const pathname = usePathname()

  return (
    <aside className="hidden lg:flex flex-col w-60 h-screen bg-panel border-r border-border fixed left-0 top-0 z-40">
      <div className="flex items-center gap-2.5 px-5 h-16 border-b border-border">
        <div className="h-8 w-8 rounded-lg bg-accent flex items-center justify-center">
          <span className="text-sm font-bold text-white">K</span>
        </div>
        <div>
          <h1 className="text-sm font-semibold text-foreground tracking-tight">KUER Studio</h1>
          <p className="text-[10px] text-muted">AI QR Design</p>
        </div>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-0.5">
        {sidebarNav.map((item) => {
          const Icon = iconMap[item.icon] || LayoutDashboard
          const isActive = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href))

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-all duration-150',
                isActive
                  ? 'bg-accent/10 text-accent font-medium'
                  : 'text-muted hover:text-foreground hover:bg-white/[0.03]'
              )}
            >
              <Icon className="h-4 w-4 shrink-0" />
              {item.label}
              {isActive && (
                <div className="ml-auto h-1.5 w-1.5 rounded-full bg-accent" />
              )}
            </Link>
          )
        })}
      </nav>

      <div className="px-3 pb-4">
        <div className="p-3 rounded-lg bg-background/50 border border-border">
          <p className="text-[10px] text-muted">Free Plan</p>
          <p className="text-xs text-foreground font-medium mt-0.5">3 / 5 QR codes</p>
          <div className="h-1 bg-border rounded-full mt-2 overflow-hidden">
            <div className="h-full bg-accent rounded-full" style={{ width: '60%' }} />
          </div>
        </div>
      </div>
    </aside>
  )
}
