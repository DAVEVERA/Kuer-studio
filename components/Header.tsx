'use client'

import Link from 'next/link'
import { Plus, User, Menu } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface HeaderProps {
  title?: string
  onMenuToggle?: () => void
}

export function Header({ title, onMenuToggle }: HeaderProps) {
  return (
    <header className="sticky top-0 z-30 h-16 bg-panel/80 backdrop-blur-xl border-b border-border flex items-center justify-between px-4 lg:px-6">
      <div className="flex items-center gap-3">
        <button onClick={onMenuToggle} className="lg:hidden p-2 text-muted hover:text-foreground transition-colors">
          <Menu className="h-5 w-5" />
        </button>

        <div className="lg:hidden flex items-center gap-2">
          <div className="h-7 w-7 rounded-md bg-accent flex items-center justify-center">
            <span className="text-xs font-bold text-white">K</span>
          </div>
        </div>

        {title && <h2 className="text-lg font-semibold text-foreground hidden sm:block">{title}</h2>}
      </div>

      <div className="flex items-center gap-2">
        <Link href="/create">
          <Button size="sm" className="gap-1.5">
            <Plus className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Create QR</span>
          </Button>
        </Link>
        <button className="h-9 w-9 rounded-full bg-deep-blue/50 flex items-center justify-center text-muted hover:text-foreground transition-colors border border-border">
          <User className="h-4 w-4" />
        </button>
      </div>
    </header>
  )
}
