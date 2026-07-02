'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { Plus, Search, Grid3x3, List, ExternalLink, CheckCircle2, AlertTriangle } from 'lucide-react'
import { AppShell } from '@/components/AppShell'
import { formatDate } from '@/lib/utils'

const mockProjects = [
  { id: 'proj-1', name: 'Spotify Podcast Launch', url: 'https://open.spotify.com/show/example', type: 'dynamic' as const, category: 'podcast', score: 94, variants: 4, updated: '2026-06-20T10:30:00Z', colors: ['#1DB954', '#191414', '#FFFFFF'] },
  { id: 'proj-2', name: 'Restaurant Menu QR', url: 'https://restaurant.example.com/menu', type: 'static' as const, category: 'menu', score: 91, variants: 4, updated: '2026-06-19T14:00:00Z', colors: ['#2c1810', '#d4a574', '#f5f0eb'] },
  { id: 'proj-3', name: 'Tech Conference 2026', url: 'https://techconf.example.com', type: 'dynamic' as const, category: 'event', score: 88, variants: 4, updated: '2026-06-18T09:00:00Z', colors: ['#0a192f', '#64ffda', '#e63946'] },
  { id: 'proj-4', name: 'Product Packaging - Serum', url: 'https://brand.example.com/serum', type: 'static' as const, category: 'product-packaging', score: 96, variants: 4, updated: '2026-06-17T16:00:00Z', colors: ['#f8f4ef', '#2d3436', '#e17055'] },
  { id: 'proj-5', name: 'AR Campaign - Summer', url: 'https://ar.example.com/summer', type: 'dynamic' as const, category: 'campaign', score: 82, variants: 4, updated: '2026-06-15T12:00:00Z', colors: ['#1a0533', '#ff6b35', '#ffd700'] },
]

export default function ProjectsPage() {
  const [search, setSearch] = useState('')
  const [view, setView] = useState<'grid' | 'list'>('grid')

  const filtered = mockProjects.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.url.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <AppShell>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold">Projects</h1>
            <p className="text-muted text-sm mt-1">{mockProjects.length} QR projects</p>
          </div>
          <Link
            href="/create"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg gradient-accent text-white text-sm font-medium hover:opacity-90 transition-opacity"
          >
            <Plus className="w-4 h-4" />
            New Project
          </Link>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search projects..."
              className="w-full pl-9 pr-4 py-2.5 rounded-lg bg-panel border border-white/5 text-sm text-foreground placeholder:text-muted/50 focus:outline-none focus:border-accent/30"
            />
          </div>
          <div className="flex items-center gap-1 glass rounded-lg p-1">
            <button
              onClick={() => setView('grid')}
              className={`p-2 rounded ${view === 'grid' ? 'bg-accent/20 text-accent' : 'text-muted hover:text-foreground'}`}
            >
              <Grid3x3 className="w-4 h-4" />
            </button>
            <button
              onClick={() => setView('list')}
              className={`p-2 rounded ${view === 'list' ? 'bg-accent/20 text-accent' : 'text-muted hover:text-foreground'}`}
            >
              <List className="w-4 h-4" />
            </button>
          </div>
        </div>

        {view === 'grid' ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map((project, i) => (
              <motion.div
                key={project.id}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: i * 0.05 }}
              >
                <Link
                  href={`/projects/${project.id}`}
                  className="glass rounded-xl overflow-hidden hover:bg-white/[0.04] transition-colors block group"
                >
                  <div
                    className="h-40 relative"
                    style={{ background: `linear-gradient(135deg, ${project.colors.join(', ')})` }}
                  >
                    <svg viewBox="0 0 80 80" className="absolute inset-0 w-full h-full p-6 opacity-50">
                      <rect x="5" y="5" width="18" height="18" rx="2" fill="white" fillOpacity="0.6" />
                      <rect x="57" y="5" width="18" height="18" rx="2" fill="white" fillOpacity="0.6" />
                      <rect x="5" y="57" width="18" height="18" rx="2" fill="white" fillOpacity="0.6" />
                      {Array.from({ length: 5 }, (_, r) =>
                        Array.from({ length: 5 }, (_, c) => (
                          (r + c) % 2 === 0 ? (
                            <rect key={`${r}-${c}`} x={26 + c * 6} y={26 + r * 6} width="4" height="4" rx="0.5" fill="white" fillOpacity="0.4" />
                          ) : null
                        ))
                      )}
                    </svg>
                    <div className="absolute top-3 right-3 flex items-center gap-1.5">
                      <span className="text-xs px-2 py-0.5 rounded-full bg-black/40 text-white/80 capitalize">{project.type}</span>
                    </div>
                  </div>
                  <div className="p-4 space-y-2">
                    <h3 className="font-semibold text-sm group-hover:text-accent transition-colors">{project.name}</h3>
                    <p className="text-xs text-muted truncate">{project.url}</p>
                    <div className="flex items-center justify-between pt-1">
                      <div className="flex items-center gap-1.5">
                        {project.score >= 80 ? (
                          <CheckCircle2 className="w-3.5 h-3.5 text-green-400" />
                        ) : (
                          <AlertTriangle className="w-3.5 h-3.5 text-yellow-400" />
                        )}
                        <span className={`text-xs font-medium ${project.score >= 90 ? 'text-green-400' : project.score >= 80 ? 'text-yellow-400' : 'text-red-400'}`}>
                          {project.score}/100
                        </span>
                      </div>
                      <span className="text-xs text-muted">{formatDate(project.updated)}</span>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="glass rounded-xl overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/5">
                  <th className="text-left text-xs font-medium text-muted px-4 py-3">Project</th>
                  <th className="text-left text-xs font-medium text-muted px-4 py-3 hidden md:table-cell">URL</th>
                  <th className="text-left text-xs font-medium text-muted px-4 py-3">Type</th>
                  <th className="text-left text-xs font-medium text-muted px-4 py-3">Score</th>
                  <th className="text-left text-xs font-medium text-muted px-4 py-3 hidden sm:table-cell">Updated</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((project) => (
                  <tr key={project.id} className="border-b border-white/5 last:border-0 hover:bg-white/[0.02]">
                    <td className="px-4 py-3">
                      <Link href={`/projects/${project.id}`} className="font-medium text-sm hover:text-accent transition-colors">
                        {project.name}
                      </Link>
                    </td>
                    <td className="px-4 py-3 hidden md:table-cell">
                      <span className="text-xs text-muted truncate max-w-[200px] inline-block">{project.url}</span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-xs px-2 py-0.5 rounded-full bg-panel capitalize">{project.type}</span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`text-sm font-medium ${project.score >= 90 ? 'text-green-400' : project.score >= 80 ? 'text-yellow-400' : 'text-red-400'}`}>
                        {project.score}
                      </span>
                    </td>
                    <td className="px-4 py-3 hidden sm:table-cell">
                      <span className="text-xs text-muted">{formatDate(project.updated)}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {filtered.length === 0 && (
          <div className="glass rounded-xl p-12 text-center">
            <Search className="w-10 h-10 text-muted/30 mx-auto mb-4" />
            <h3 className="font-semibold mb-1">No projects found</h3>
            <p className="text-sm text-muted">Try adjusting your search or create a new project</p>
          </div>
        )}
      </div>
    </AppShell>
  )
}
