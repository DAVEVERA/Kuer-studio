'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Plus, FolderOpen, BarChart3 } from 'lucide-react'
import { AppShell } from '@/components/AppShell'
import { DashboardStats } from '@/components/dashboard/DashboardStats'
import { RecentProjects } from '@/components/dashboard/RecentProjects'
import { getProjects } from '@/services/projectService'
import { getAnalyticsSummary } from '@/services/analyticsService'
import type { ProjectSummary } from '@/types/project'

export default function DashboardPage() {
  const [projects, setProjects] = useState<ProjectSummary[]>([])
  const [totalScans, setTotalScans] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    Promise.all([getProjects(), getAnalyticsSummary()])
      .then(([projectData, analytics]) => {
        setProjects(projectData)
        setTotalScans(analytics.totalScans)
      })
      .catch((reason) => setError(reason instanceof Error ? reason.message : 'Could not load dashboard data.'))
      .finally(() => setLoading(false))
  }, [])

  const bestScore = projects.reduce((best, project) => Math.max(best, project.best_score), 0)
  const validated = projects.filter((project) => project.best_score >= 80).length

  return (
    <AppShell>
      <div className="space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div><h1 className="text-2xl font-bold">Dashboard</h1><p className="text-muted text-sm mt-1">Live overview of your QR projects and performance</p></div>
          <Link href="/create" className="win95-button-link"><Plus className="w-4 h-4" />Create New QR</Link>
        </div>

        {error && <div className="win95-error" role="alert">{error}</div>}
        <DashboardStats totalQrCodes={projects.length} validatedDesigns={validated} totalScans={totalScans} bestScore={bestScore} />

        <div className="grid lg:grid-cols-3 gap-4">
          <Link href="/create" className="win95-panel dashboard-action"><Plus /><span><strong>Create QR Code</strong><small>Start a new project</small></span></Link>
          <Link href="/projects" className="win95-panel dashboard-action"><FolderOpen /><span><strong>View All Projects</strong><small>Manage your QR codes</small></span></Link>
          <Link href="/analytics" className="win95-panel dashboard-action"><BarChart3 /><span><strong>View Analytics</strong><small>Real scan performance data</small></span></Link>
        </div>

        {loading ? <div className="win95-panel empty-state">Loading database records...</div> : <RecentProjects projects={projects.slice(0, 4)} />}
      </div>
    </AppShell>
  )
}
