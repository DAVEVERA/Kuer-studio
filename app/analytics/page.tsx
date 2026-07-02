'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { BarChart3, TrendingUp, Smartphone, Globe, Monitor, ArrowUpRight, ArrowDownRight } from 'lucide-react'
import { AppShell } from '@/components/AppShell'
import { formatNumber } from '@/lib/utils'

const mockScansByDay = [
  { date: 'Jun 17', count: 42 }, { date: 'Jun 18', count: 68 },
  { date: 'Jun 19', count: 54 }, { date: 'Jun 20', count: 89 },
  { date: 'Jun 21', count: 72 }, { date: 'Jun 22', count: 96 },
  { date: 'Jun 23', count: 83 },
]

const mockDevices = [
  { device: 'Mobile', count: 412, pct: 68 },
  { device: 'Desktop', count: 145, pct: 24 },
  { device: 'Tablet', count: 48, pct: 8 },
]

const mockBrowsers = [
  { browser: 'Safari', count: 245, pct: 40 },
  { browser: 'Chrome', count: 198, pct: 33 },
  { browser: 'Firefox', count: 87, pct: 14 },
  { browser: 'Edge', count: 52, pct: 9 },
  { browser: 'Other', count: 23, pct: 4 },
]

const mockCountries = [
  { country: 'Netherlands', code: 'NL', count: 198, pct: 33 },
  { country: 'United States', code: 'US', count: 156, pct: 26 },
  { country: 'Germany', code: 'DE', count: 89, pct: 15 },
  { country: 'United Kingdom', code: 'GB', count: 72, pct: 12 },
  { country: 'France', code: 'FR', count: 45, pct: 7 },
  { country: 'Other', code: '??', count: 45, pct: 7 },
]

const mockTopProjects = [
  { name: 'Spotify Podcast Launch', scans: 198, change: 12.5 },
  { name: 'Restaurant Menu QR', scans: 156, change: 8.3 },
  { name: 'Tech Conference 2026', scans: 134, change: -2.1 },
  { name: 'Product Packaging - Serum', scans: 89, change: 22.4 },
  { name: 'AR Campaign - Summer', scans: 28, change: 45.0 },
]

const maxCount = Math.max(...mockScansByDay.map(d => d.count))

export default function AnalyticsPage() {
  const [period, setPeriod] = useState('7d')

  return (
    <AppShell>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold">Analytics</h1>
            <p className="text-muted text-sm mt-1">Scan performance across all projects</p>
          </div>
          <div className="flex items-center gap-1 glass rounded-lg p-1">
            {['24h', '7d', '30d', '90d'].map((p) => (
              <button
                key={p}
                onClick={() => setPeriod(p)}
                className={`px-3 py-1.5 rounded text-xs font-medium transition-colors ${
                  period === p ? 'bg-accent/20 text-accent' : 'text-muted hover:text-foreground'
                }`}
              >
                {p}
              </button>
            ))}
          </div>
        </div>

        {/* Stats Row */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: 'Total Scans', value: '605', change: '+14.2%', up: true, icon: BarChart3 },
            { label: 'Scans Today', value: '83', change: '+6.8%', up: true, icon: TrendingUp },
            { label: 'Top Country', value: 'NL', change: '33%', up: true, icon: Globe },
            { label: 'Top Device', value: 'Mobile', change: '68%', up: true, icon: Smartphone },
          ].map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: i * 0.05 }}
              className="glass rounded-xl p-5"
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs text-muted">{stat.label}</span>
                <stat.icon className="w-4 h-4 text-muted/50" />
              </div>
              <div className="text-2xl font-bold">{stat.value}</div>
              <div className={`flex items-center gap-1 mt-1 text-xs ${stat.up ? 'text-green-400' : 'text-red-400'}`}>
                {stat.up ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                {stat.change}
              </div>
            </motion.div>
          ))}
        </div>

        {/* Scans Chart */}
        <div className="glass rounded-xl p-6">
          <h3 className="font-semibold text-sm mb-6">Scans Over Time</h3>
          <div className="flex items-end gap-2 h-48">
            {mockScansByDay.map((day, i) => (
              <div key={day.date} className="flex-1 flex flex-col items-center gap-2">
                <span className="text-xs text-muted">{day.count}</span>
                <motion.div
                  initial={{ height: 0 }}
                  animate={{ height: `${(day.count / maxCount) * 100}%` }}
                  transition={{ duration: 0.5, delay: i * 0.05 }}
                  className="w-full rounded-t-md gradient-accent min-h-[4px]"
                />
                <span className="text-[10px] text-muted">{day.date}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* Device Breakdown */}
          <div className="glass rounded-xl p-5">
            <h3 className="font-semibold text-sm mb-4 flex items-center gap-2">
              <Monitor className="w-4 h-4 text-muted" />
              Device Breakdown
            </h3>
            <div className="space-y-3">
              {mockDevices.map((d) => (
                <div key={d.device}>
                  <div className="flex items-center justify-between text-sm mb-1">
                    <span>{d.device}</span>
                    <span className="text-muted">{d.pct}%</span>
                  </div>
                  <div className="h-2 bg-panel rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${d.pct}%` }}
                      transition={{ duration: 0.6 }}
                      className="h-full gradient-accent rounded-full"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Browser Breakdown */}
          <div className="glass rounded-xl p-5">
            <h3 className="font-semibold text-sm mb-4 flex items-center gap-2">
              <Globe className="w-4 h-4 text-muted" />
              Browser Breakdown
            </h3>
            <div className="space-y-2.5">
              {mockBrowsers.map((b) => (
                <div key={b.browser} className="flex items-center justify-between py-1">
                  <span className="text-sm">{b.browser}</span>
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-muted">{formatNumber(b.count)}</span>
                    <span className="text-xs font-medium w-10 text-right">{b.pct}%</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Country Breakdown */}
          <div className="glass rounded-xl p-5">
            <h3 className="font-semibold text-sm mb-4 flex items-center gap-2">
              <Globe className="w-4 h-4 text-muted" />
              Countries
            </h3>
            <div className="space-y-2.5">
              {mockCountries.map((c) => (
                <div key={c.code} className="flex items-center justify-between py-1">
                  <span className="text-sm">{c.country}</span>
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-muted">{formatNumber(c.count)}</span>
                    <span className="text-xs font-medium w-10 text-right">{c.pct}%</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Top Performing Projects */}
        <div className="glass rounded-xl p-5">
          <h3 className="font-semibold text-sm mb-4">Top Performing Projects</h3>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/5">
                  <th className="text-left text-xs font-medium text-muted pb-3">Project</th>
                  <th className="text-right text-xs font-medium text-muted pb-3">Scans</th>
                  <th className="text-right text-xs font-medium text-muted pb-3">Change</th>
                </tr>
              </thead>
              <tbody>
                {mockTopProjects.map((p, i) => (
                  <tr key={p.name} className="border-b border-white/5 last:border-0">
                    <td className="py-3 text-sm">
                      <span className="text-muted mr-2 text-xs">#{i + 1}</span>
                      {p.name}
                    </td>
                    <td className="py-3 text-sm text-right font-medium">{formatNumber(p.scans)}</td>
                    <td className="py-3 text-right">
                      <span className={`inline-flex items-center gap-0.5 text-xs ${p.change > 0 ? 'text-green-400' : 'text-red-400'}`}>
                        {p.change > 0 ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                        {Math.abs(p.change)}%
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AppShell>
  )
}
