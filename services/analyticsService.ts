import { fetchScanEvents } from '@/lib/db/queries'
import { generateMockAnalytics } from '@/lib/analytics/mockAnalytics'
import type { AnalyticsSummary } from '@/types/analytics'

export async function getAnalyticsSummary(projectId?: string): Promise<AnalyticsSummary> {
  const events = await fetchScanEvents(projectId)

  if (events.length === 0) {
    return generateMockAnalytics()
  }

  const now = new Date()
  const today = now.toISOString().split('T')[0]

  const scansByDay = new Map<string, number>()
  const deviceCounts = new Map<string, number>()
  const browserCounts = new Map<string, number>()
  const countryCounts = new Map<string, number>()

  for (const event of events) {
    const day = event.timestamp.split('T')[0]
    scansByDay.set(day, (scansByDay.get(day) ?? 0) + 1)
    deviceCounts.set(event.device_type, (deviceCounts.get(event.device_type) ?? 0) + 1)
    browserCounts.set(event.browser, (browserCounts.get(event.browser) ?? 0) + 1)
    countryCounts.set(event.country, (countryCounts.get(event.country) ?? 0) + 1)
  }

  const sortedCountries = [...countryCounts.entries()].sort((a, b) => b[1] - a[1])
  const sortedDevices = [...deviceCounts.entries()].sort((a, b) => b[1] - a[1])

  return {
    totalScans: events.length,
    scansToday: scansByDay.get(today) ?? 0,
    topCountry: sortedCountries[0]?.[0] ?? 'Unknown',
    topDevice: sortedDevices[0]?.[0] ?? 'Unknown',
    scansByDay: [...scansByDay.entries()]
      .map(([date, count]) => ({ date, count }))
      .sort((a, b) => a.date.localeCompare(b.date)),
    deviceBreakdown: sortedDevices.map(([device, count]) => ({ device, count })),
    browserBreakdown: [...browserCounts.entries()]
      .sort((a, b) => b[1] - a[1])
      .map(([browser, count]) => ({ browser, count })),
    countryBreakdown: sortedCountries.map(([country, count]) => ({ country, count })),
  }
}
