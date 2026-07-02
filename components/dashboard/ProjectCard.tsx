'use client'

import { motion } from 'framer-motion'
import { ExternalLink, Calendar } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Card } from '@/components/ui/card'
import { formatDate, getScoreColor } from '@/lib/utils'
import type { ProjectSummary } from '@/types/project'

interface ProjectCardProps {
  project: ProjectSummary
  onClick?: () => void
  index?: number
}

export function ProjectCard({ project, onClick, index = 0 }: ProjectCardProps) {
  const scoreVariant = project.best_score >= 90 ? 'success' : project.best_score >= 80 ? 'warning' : 'destructive'

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
    >
      <Card
        className="p-4 cursor-pointer hover:border-border-hover transition-all duration-200 group"
        onClick={onClick}
      >
        <div className="flex gap-3">
          <div className="h-14 w-14 rounded-lg bg-gradient-to-br from-accent/20 to-deep-blue/30 flex items-center justify-center shrink-0">
            <svg width="28" height="28" viewBox="0 0 28 28" className="text-accent/60">
              <rect x="2" y="2" width="8" height="8" rx="1" fill="currentColor" />
              <rect x="18" y="2" width="8" height="8" rx="1" fill="currentColor" />
              <rect x="2" y="18" width="8" height="8" rx="1" fill="currentColor" />
              <rect x="12" y="12" width="4" height="4" rx="0.5" fill="currentColor" />
              <rect x="18" y="18" width="8" height="8" rx="1" fill="currentColor" />
            </svg>
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <h3 className="text-sm font-medium text-foreground truncate group-hover:text-accent transition-colors">
                {project.name}
              </h3>
              <Badge variant={scoreVariant} className="text-[10px] shrink-0">
                {project.best_score}
              </Badge>
            </div>

            <div className="flex items-center gap-1 mt-0.5">
              <ExternalLink className="h-3 w-3 text-muted/60 shrink-0" />
              <p className="text-xs text-muted truncate">{project.target_url}</p>
            </div>

            <div className="flex items-center gap-3 mt-2">
              <Badge variant="outline" className="text-[10px]">
                {project.type === 'dynamic' ? 'Dynamic' : 'Static'}
              </Badge>
              <span className="text-[10px] text-muted flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                {formatDate(project.created_at)}
              </span>
            </div>
          </div>
        </div>
      </Card>
    </motion.div>
  )
}
