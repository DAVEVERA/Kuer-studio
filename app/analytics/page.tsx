'use client'

import { useEffect, useMemo, useState } from 'react'
import { BarChart3, Globe2, Monitor, Smartphone } from 'lucide-react'
import { AppShell } from '@/components/AppShell'
import { getAnalyticsSummary } from '@/services/analyticsService'
import type { AnalyticsSummary } from '@/types/analytics'

const empty: AnalyticsSummary = {
  totalScans: 0,
  scansToday: 0,
  topCountry: 'No data',
  topDevice: 'No data',
  scansByDay: [],
  deviceBreakdown: [],
  browserBreakdown: [],
  countryBreakdown: [],
}

export default function AnalyticsPage() {
  const [analytics, setAnalytics] = useState(empty)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    getAnalyticsSummary().then(setAnalytics).catch((reason) => setError(reason instanceof Error ? reason.message : 'Could not load analytics.')).finally(() => setLoading(false))
  }, [])

  const maxDay = useMemo(() => Math.max(1, ...analytics.scansByDay.map((day) => day.count)), [analytics.scansByDay])

  return (
    <AppShell>
      <div className="space-y-6">
        <div><h1 className="text-2xl font-bold">Analytics</h1><p className="text-muted text-sm mt-1">Real scan events from published dynamic QR links.</p></div>
        {error && <div className="win95-error" role="alert">{error}</div>}
        <div className="analytics-stats">
          <div className="win95-panel"><BarChart3 /><span><strong>{analytics.totalScans}</strong><small>Total scans</small></span></div>
          <div className="win95-panel"><Smartphone /><span><strong>{analytics.scansToday}</strong><small>Scans today</small></span></div>
          <div className="win95-panel"><Globe2 /><span><strong>{analytics.topCountry}</strong><small>Top country</small></span></div>
          <div className="win95-panel"><Monitor /><span><strong>{analytics.topDevice}</strong><small>Top device</small></span></div>
        </div>

        <section className="win95-panel analytics-chart-real">
          <div className="win95-panel-title">Scans by Day</div>
          {loading ? <p>Loading analytics...</p> : analytics.scansByDay.length === 0 ? <p className="empty-hint">No scan events yet. This chart will populate after a published dynamic QR is scanned.</p> : (
            <div className="bar-chart" aria-label="Scans by day">{analytics.scansByDay.map((day) => <div key={day.date} className="bar-column"><span>{day.count}</span><i style={{ height: `${Math.max(4, (day.count / maxDay) * 100)}%` }} /><small>{new Date(day.date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })}</small></div>)}</div>
          )}
        </section>

        <div className="analytics-breakdowns">
          {[
            ['Devices', analytics.deviceBreakdown.map((item) => [item.device, item.count] as const)],
            ['Browsers', analytics.browserBreakdown.map((item) => [item.browser, item.count] as const)],
            ['Countries', analytics.countryBreakdown.map((item) => [item.country, item.count] as const)],
          ].map(([title, rows]) => (
            <section key={title as string} className="win95-panel"><div className="win95-panel-title">{title as string}</div>{(rows as ReadonlyArray<readonly [string, number]>).length === 0 ? <p className="empty-hint">No data</p> : <ul className="metric-list">{(rows as ReadonlyArray<readonly [string, number]>).map(([label, count]) => <li key={label}><span>{label}</span><strong>{count}</strong></li>)}</ul>}</section>
          ))}
        </div>
      </div>
    </AppShell>
  )
}
