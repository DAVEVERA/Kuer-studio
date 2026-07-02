'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import { Plus, FolderOpen, BarChart3, Download } from 'lucide-react'
import { AppShell } from '@/components/AppShell'
import { DashboardStats } from '@/components/dashboard/DashboardStats'
import { RecentProjects } from '@/components/dashboard/RecentProjects'
import { mockProjects, getProjectVariants } from '@/lib/db/mockData'
import type { ProjectSummary } from '@/types/project'

const recentProjects: ProjectSummary[] = mockProjects.slice(0, 4).map((p) => {
  const variants = getProjectVariants(p.id)
  const bestScore = variants.length > 0 ? Math.max(...variants.map((v) => v.scanability_score)) : 0
  return {
    id: p.id,
    name: p.name,
    target_url: p.target_url,
    type: p.type,
    category: p.category,
    variant_count: variants.length,
    best_score: bestScore,
    created_at: p.created_at,
    updated_at: p.updated_at,
  }
})

export default function DashboardPage() {
  return (
    <AppShell>
      <div className="space-y-8">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="flex flex-col sm:flex-row sm:items-center justify-between gap-4"
        >
          <div>
            <h1 className="text-2xl font-bold">Dashboard</h1>
            <p className="text-muted text-sm mt-1">Overview of your QR projects and performance</p>
          </div>
          <Link
            href="/create"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg gradient-accent text-white text-sm font-medium hover:opacity-90 transition-opacity"
          >
            <Plus className="w-4 h-4" />
            Create New QR
          </Link>
        </motion.div>

        <DashboardStats totalQrCodes={12} validatedDesigns={9} totalScans={3247} bestScore={96} />

        <div className="grid lg:grid-cols-3 gap-4">
          <Link
            href="/create"
            className="glass rounded-xl p-5 hover:bg-white/[0.04] transition-colors group flex items-center gap-4"
          >
            <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center group-hover:bg-accent/20 transition-colors">
              <Plus className="w-5 h-5 text-accent" />
            </div>
            <div>
              <h3 className="font-medium text-sm">Create QR Code</h3>
              <p className="text-xs text-muted">Start a new project</p>
            </div>
          </Link>
          <Link
            href="/projects"
            className="glass rounded-xl p-5 hover:bg-white/[0.04] transition-colors group flex items-center gap-4"
          >
            <div className="w-10 h-10 rounded-lg bg-deep-blue/20 flex items-center justify-center group-hover:bg-deep-blue/30 transition-colors">
              <FolderOpen className="w-5 h-5 text-blue-400" />
            </div>
            <div>
              <h3 className="font-medium text-sm">View All Projects</h3>
              <p className="text-xs text-muted">Manage your QR codes</p>
            </div>
          </Link>
          <Link
            href="/analytics"
            className="glass rounded-xl p-5 hover:bg-white/[0.04] transition-colors group flex items-center gap-4"
          >
            <div className="w-10 h-10 rounded-lg bg-green-500/10 flex items-center justify-center group-hover:bg-green-500/20 transition-colors">
              <BarChart3 className="w-5 h-5 text-green-400" />
            </div>
            <div>
              <h3 className="font-medium text-sm">View Analytics</h3>
              <p className="text-xs text-muted">Scan performance data</p>
            </div>
          </Link>
        </div>

        <RecentProjects projects={recentProjects} />
      </div>
    </AppShell>
  )
}
