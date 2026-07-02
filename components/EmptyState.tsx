'use client'

import { FolderOpen, QrCode, BarChart3, Palette, FileDown, Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  FolderOpen, QrCode, BarChart3, Palette, FileDown, Plus,
}

interface EmptyStateProps {
  icon?: string
  title: string
  description: string
  actionLabel?: string
  onAction?: () => void
}

export function EmptyState({ icon = 'FolderOpen', title, description, actionLabel, onAction }: EmptyStateProps) {
  const Icon = iconMap[icon] || FolderOpen

  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
      <div className="h-16 w-16 rounded-2xl bg-panel border border-border flex items-center justify-center mb-4">
        <Icon className="h-7 w-7 text-muted" />
      </div>
      <h3 className="text-base font-medium text-foreground mb-1">{title}</h3>
      <p className="text-sm text-muted max-w-sm">{description}</p>
      {actionLabel && onAction && (
        <Button onClick={onAction} className="mt-5 gap-1.5" size="sm">
          <Plus className="h-3.5 w-3.5" />
          {actionLabel}
        </Button>
      )}
    </div>
  )
}
