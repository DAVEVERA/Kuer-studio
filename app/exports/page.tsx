'use client'

import { motion } from 'framer-motion'
import { Download, Image, FileText, FileCode, Printer, Smartphone, Monitor, Square } from 'lucide-react'
import { AppShell } from '@/components/AppShell'
import { formatDate } from '@/lib/utils'

const mockExports = [
  { id: '1', project: 'Spotify Podcast Launch', variant: 'Variant A', format: 'PNG 2048px', size: '2.4 MB', date: '2026-06-22T14:30:00Z', icon: Image, colors: ['#6c63ff', '#ff6584', '#2d2d2d'] },
  { id: '2', project: 'Spotify Podcast Launch', variant: 'Variant A', format: 'SVG', size: '128 KB', date: '2026-06-22T14:30:00Z', icon: FileCode, colors: ['#6c63ff', '#ff6584', '#2d2d2d'] },
  { id: '3', project: 'Restaurant Menu QR', variant: 'Variant B', format: 'Print-ready PDF', size: '5.1 MB', date: '2026-06-21T09:15:00Z', icon: Printer, colors: ['#2c1810', '#d4a574', '#f5f0eb'] },
  { id: '4', project: 'Tech Conference 2026', variant: 'Variant A', format: 'Social Square', size: '1.8 MB', date: '2026-06-20T16:45:00Z', icon: Square, colors: ['#0a192f', '#64ffda', '#e63946'] },
  { id: '5', project: 'Tech Conference 2026', variant: 'Variant C', format: 'Story (9:16)', size: '2.1 MB', date: '2026-06-20T16:45:00Z', icon: Smartphone, colors: ['#0a192f', '#64ffda', '#e63946'] },
  { id: '6', project: 'Product Packaging - Serum', variant: 'Variant A', format: 'PNG 1024px', size: '890 KB', date: '2026-06-19T11:00:00Z', icon: Image, colors: ['#f8f4ef', '#2d3436', '#e17055'] },
  { id: '7', project: 'Product Packaging - Serum', variant: 'Variant A', format: 'A4 Poster', size: '8.3 MB', date: '2026-06-19T11:00:00Z', icon: FileText, colors: ['#f8f4ef', '#2d3436', '#e17055'] },
  { id: '8', project: 'AR Campaign - Summer', variant: 'Variant B', format: 'Landscape (16:9)', size: '2.7 MB', date: '2026-06-18T13:20:00Z', icon: Monitor, colors: ['#1a0533', '#ff6b35', '#ffd700'] },
]

export default function ExportsPage() {
  return (
    <AppShell>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Export History</h1>
          <p className="text-muted text-sm mt-1">{mockExports.length} exports</p>
        </div>

        <div className="glass rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/5">
                  <th className="text-left text-xs font-medium text-muted px-4 py-3">Preview</th>
                  <th className="text-left text-xs font-medium text-muted px-4 py-3">Project</th>
                  <th className="text-left text-xs font-medium text-muted px-4 py-3 hidden sm:table-cell">Format</th>
                  <th className="text-left text-xs font-medium text-muted px-4 py-3 hidden md:table-cell">Size</th>
                  <th className="text-left text-xs font-medium text-muted px-4 py-3 hidden lg:table-cell">Date</th>
                  <th className="text-right text-xs font-medium text-muted px-4 py-3">Action</th>
                </tr>
              </thead>
              <tbody>
                {mockExports.map((exp, i) => {
                  const Icon = exp.icon
                  return (
                    <motion.tr
                      key={exp.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.3, delay: i * 0.03 }}
                      className="border-b border-white/5 last:border-0 hover:bg-white/[0.02]"
                    >
                      <td className="px-4 py-3">
                        <div
                          className="w-10 h-10 rounded-lg"
                          style={{ background: `linear-gradient(135deg, ${exp.colors.join(', ')})` }}
                        />
                      </td>
                      <td className="px-4 py-3">
                        <div className="text-sm font-medium">{exp.project}</div>
                        <div className="text-xs text-muted">{exp.variant}</div>
                      </td>
                      <td className="px-4 py-3 hidden sm:table-cell">
                        <div className="flex items-center gap-2">
                          <Icon className="w-3.5 h-3.5 text-muted" />
                          <span className="text-sm">{exp.format}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 hidden md:table-cell">
                        <span className="text-sm text-muted">{exp.size}</span>
                      </td>
                      <td className="px-4 py-3 hidden lg:table-cell">
                        <span className="text-sm text-muted">{formatDate(exp.date)}</span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <button className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg glass hover:bg-white/[0.04] transition-colors text-xs">
                          <Download className="w-3 h-3" />
                          Download
                        </button>
                      </td>
                    </motion.tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AppShell>
  )
}
