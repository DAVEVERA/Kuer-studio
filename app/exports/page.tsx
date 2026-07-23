'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Download, FileImage, Plus } from 'lucide-react'
import { AppShell } from '@/components/AppShell'
import { fetchExportHistory } from '@/lib/db/queries'
import { formatDate } from '@/lib/utils'
import type { ExportRecord } from '@/types/export'

export default function ExportsPage() {
  const [exports, setExports] = useState<ExportRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    fetchExportHistory().then(setExports).catch((reason) => setError(reason instanceof Error ? reason.message : 'Could not load export history.')).finally(() => setLoading(false))
  }, [])

  return (
    <AppShell>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div><h1 className="text-2xl font-bold">Exports</h1><p className="text-muted text-sm mt-1">{exports.length} real export records</p></div>
          <Link className="win95-button-link" href="/create"><Plus />Create Export</Link>
        </div>
        {error && <div className="win95-error" role="alert">{error}</div>}
        {loading ? <div className="win95-panel empty-state">Loading exports...</div> : exports.length === 0 ? (
          <div className="win95-panel empty-state"><FileImage /><h3>No exports yet</h3><p>Generate a QR project and export a validated variant. No sample records are displayed.</p><Link className="win95-button-link" href="/create">Open QR Designer</Link></div>
        ) : (
          <div className="win95-panel table-scroll"><table><thead><tr><th>Format</th><th>Size</th><th>Created</th><th>File</th></tr></thead><tbody>{exports.map((record) => <tr key={record.id}><td>{record.format}</td><td>{record.size || '--'}</td><td>{formatDate(record.created_at)}</td><td><a href={record.file_url} download><Download />Download</a></td></tr>)}</tbody></table></div>
        )}
      </div>
    </AppShell>
  )
}
