import { AppShell } from '@/components/AppShell'

export default function ProjectDetailLoading() {
  return (
    <AppShell>
      <div className="space-y-6 animate-pulse">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 bg-panel rounded-lg" />
          <div>
            <div className="h-6 w-48 bg-panel rounded" />
            <div className="h-3 w-36 bg-panel rounded mt-2" />
          </div>
        </div>
        <div className="grid lg:grid-cols-[1fr,380px] gap-6">
          <div className="space-y-4">
            <div className="glass rounded-2xl aspect-square max-h-[500px]" />
            <div className="grid grid-cols-4 gap-3">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="glass rounded-xl aspect-square" />
              ))}
            </div>
          </div>
          <div className="space-y-4">
            <div className="glass rounded-xl h-96" />
            <div className="glass rounded-xl h-40" />
          </div>
        </div>
      </div>
    </AppShell>
  )
}
