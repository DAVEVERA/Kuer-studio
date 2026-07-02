'use client'

import { useRouter } from 'next/navigation'
import { ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ProjectCard } from './ProjectCard'
import { EmptyState } from '@/components/EmptyState'
import type { ProjectSummary } from '@/types/project'

interface RecentProjectsProps {
  projects: ProjectSummary[]
}

export function RecentProjects({ projects }: RecentProjectsProps) {
  const router = useRouter()

  if (projects.length === 0) {
    return (
      <EmptyState
        icon="FolderOpen"
        title="No projects yet"
        description="Create your first branded QR code project to get started."
        actionLabel="Create QR"
        onAction={() => router.push('/create')}
      />
    )
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-medium text-foreground">Recent Projects</h2>
        <Button variant="ghost" size="sm" onClick={() => router.push('/projects')} className="text-xs gap-1">
          View All
          <ArrowRight className="h-3 w-3" />
        </Button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {projects.slice(0, 4).map((project, i) => (
          <ProjectCard
            key={project.id}
            project={project}
            index={i}
            onClick={() => router.push(`/projects/${project.id}`)}
          />
        ))}
      </div>
    </div>
  )
}
