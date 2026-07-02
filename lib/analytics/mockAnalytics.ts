import type { AnalyticsSummary } from '@/types/analytics'

export function generateMockAnalytics(): AnalyticsSummary {
  const now = new Date()
  const scansByDay: { date: string; count: number }[] = []

  for (let i = 29; i >= 0; i--) {
    const d = new Date(now)
    d.setDate(d.getDate() - i)
    const isWeekend = d.getDay() === 0 || d.getDay() === 6
    const base = isWeekend ? 20 : 45
    const variance = Math.floor(Math.random() * 40)
    scansByDay.push({
      date: d.toISOString().split('T')[0],
      count: base + variance,
    })
  }

  const totalScans = scansByDay.reduce((sum, d) => sum + d.count, 0)

  return {
    totalScans,
    scansToday: scansByDay[scansByDay.length - 1].count,
    topCountry: 'United States',
    topDevice: 'Mobile',
    scansByDay,
    deviceBreakdown: [
      { device: 'Mobile', count: Math.floor(totalScans * 0.62) },
      { device: 'Desktop', count: Math.floor(totalScans * 0.28) },
      { device: 'Tablet', count: Math.floor(totalScans * 0.10) },
    ],
    browserBreakdown: [
      { browser: 'Chrome', count: Math.floor(totalScans * 0.45) },
      { browser: 'Safari', count: Math.floor(totalScans * 0.30) },
      { browser: 'Firefox', count: Math.floor(totalScans * 0.12) },
      { browser: 'Edge', count: Math.floor(totalScans * 0.08) },
      { browser: 'Other', count: Math.floor(totalScans * 0.05) },
    ],
    countryBreakdown: [
      { country: 'United States', count: Math.floor(totalScans * 0.35) },
      { country: 'Netherlands', count: Math.floor(totalScans * 0.18) },
      { country: 'United Kingdom', count: Math.floor(totalScans * 0.12) },
      { country: 'Germany', count: Math.floor(totalScans * 0.10) },
      { country: 'France', count: Math.floor(totalScans * 0.08) },
      { country: 'Japan', count: Math.floor(totalScans * 0.07) },
      { country: 'Canada', count: Math.floor(totalScans * 0.05) },
      { country: 'Australia', count: Math.floor(totalScans * 0.05) },
    ],
  }
}
