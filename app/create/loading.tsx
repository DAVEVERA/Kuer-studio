import { AppShell } from '@/components/AppShell'

export default function CreateLoading() {
  return (
    <AppShell>
      <div className="max-w-4xl mx-auto space-y-8 animate-pulse">
        <div className="flex items-center gap-2">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-8 w-20 bg-panel rounded-full" />
          ))}
        </div>
        <div className="glass rounded-2xl p-12 h-96" />
        <div className="flex justify-between">
          <div className="h-10 w-24 bg-panel rounded-lg" />
          <div className="h-10 w-24 bg-panel rounded-lg" />
        </div>
      </div>
    </AppShell>
  )
}
