import { AppShell } from '@/components/AppShell'

export default function DashboardLoading() {
  return (
    <AppShell>
      <div className="space-y-8 animate-pulse">
        <div className="flex justify-between items-center">
          <div>
            <div className="h-7 w-32 bg-panel rounded-lg" />
            <div className="h-4 w-56 bg-panel rounded mt-2" />
          </div>
          <div className="h-10 w-36 bg-panel rounded-lg" />
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="glass rounded-xl p-6 h-28" />
          ))}
        </div>
        <div className="grid lg:grid-cols-3 gap-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="glass rounded-xl p-5 h-20" />
          ))}
        </div>
        <div className="glass rounded-xl p-6 h-64" />
      </div>
    </AppShell>
  )
}
