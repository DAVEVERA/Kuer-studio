import { AppShell } from '@/components/AppShell'

export default function ProjectsLoading() {
  return (
    <AppShell>
      <div className="space-y-6 animate-pulse">
        <div className="flex justify-between items-center">
          <div>
            <div className="h-7 w-28 bg-panel rounded-lg" />
            <div className="h-4 w-24 bg-panel rounded mt-2" />
          </div>
          <div className="h-10 w-32 bg-panel rounded-lg" />
        </div>
        <div className="h-10 w-72 bg-panel rounded-lg" />
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="glass rounded-xl h-64" />
          ))}
        </div>
      </div>
    </AppShell>
  )
}
