'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { Plus, Search, Grid3x3, List, CheckCircle2, AlertTriangle } from 'lucide-react'
import { AppShell } from '@/components/AppShell'
import { formatDate } from '@/lib/utils'
import { getProjects } from '@/services/projectService'
import type { ProjectSummary } from '@/types/project'

export default function ProjectsPage() {
  const [projects, setProjects] = useState<ProjectSummary[]>([])
  const [search, setSearch] = useState('')
  const [view, setView] = useState<'grid' | 'list'>('grid')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    getProjects().then(setProjects).catch((reason) => setError(reason instanceof Error ? reason.message : 'Could not load projects.')).finally(() => setLoading(false))
  }, [])

  const filtered = useMemo(() => projects.filter((project) => {
    const term = search.toLowerCase()
    return project.name.toLowerCase().includes(term) || project.target_url.toLowerCase().includes(term)
  }), [projects, search])

  return (
    <AppShell>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div><h1 className="text-2xl font-bold">Projects</h1><p className="text-muted text-sm mt-1">{projects.length} QR projects</p></div>
          <Link href="/create" className="win95-button-link"><Plus className="w-4 h-4" />New Project</Link>
        </div>

        <div className="project-controls">
          <label className="project-search"><Search aria-hidden="true" /><span className="sr-only">Search projects</span><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search projects..." /></label>
          <div className="view-switch"><button type="button" aria-label="Grid view" className={view === 'grid' ? 'is-pressed' : ''} onClick={() => setView('grid')}><Grid3x3 /></button><button type="button" aria-label="List view" className={view === 'list' ? 'is-pressed' : ''} onClick={() => setView('list')}><List /></button></div>
        </div>

        {error && <div className="win95-error" role="alert">{error}</div>}
        {loading && <div className="win95-panel empty-state">Loading projects...</div>}

        {!loading && view === 'grid' && (
          <div className="project-grid">
            {filtered.map((project) => (
              <Link key={project.id} href={`/projects/${project.id}`} className="win95-panel project-card">
                <div className="project-card-preview">{project.preview_image ? <img src={project.preview_image} alt="" /> : <span>QR</span>}</div>
                <h3>{project.name}</h3><p>{project.target_url}</p>
                <div><span>{project.best_score >= 80 ? <CheckCircle2 /> : <AlertTriangle />}{project.best_score || 'Pending'}</span><time>{formatDate(project.updated_at)}</time></div>
              </Link>
            ))}
          </div>
        )}

        {!loading && view === 'list' && (
          <div className="win95-panel table-scroll"><table><thead><tr><th>Project</th><th>URL</th><th>Type</th><th>Score</th><th>Updated</th></tr></thead><tbody>{filtered.map((project) => <tr key={project.id}><td><Link href={`/projects/${project.id}`}>{project.name}</Link></td><td>{project.target_url}</td><td>{project.type}</td><td>{project.best_score || 'Pending'}</td><td>{formatDate(project.updated_at)}</td></tr>)}</tbody></table></div>
        )}

        {!loading && filtered.length === 0 && <div className="win95-panel empty-state"><Search /><h3>No projects found</h3><p>Create a project or adjust your search.</p><Link className="win95-button-link" href="/create">Open QR Designer</Link></div>}
      </div>
    </AppShell>
  )
}
