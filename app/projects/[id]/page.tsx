'use client'

import { use, useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Copy, Download, ExternalLink, RefreshCw, Save, Trash2 } from 'lucide-react'
import { AppShell } from '@/components/AppShell'
import { QrCodeRenderer } from '@/components/qr/QrCodeRenderer'
import { fetchProject, fetchVariants, updateProject, deleteProject } from '@/lib/db/queries'
import { generateQr } from '@/services/qrGenerator'
import { exportQr } from '@/services/exportService'
import type { QrProject, QrVariant } from '@/types/qr'

export default function ProjectDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const router = useRouter()
  const [project, setProject] = useState<QrProject | null>(null)
  const [variants, setVariants] = useState<QrVariant[]>([])
  const [targetUrl, setTargetUrl] = useState('')
  const [fgColor, setFgColor] = useState('#000000')
  const [bgColor, setBgColor] = useState('#FFFFFF')
  const [loading, setLoading] = useState(true)
  const [busy, setBusy] = useState(false)
  const [message, setMessage] = useState('')

  useEffect(() => {
    Promise.all([fetchProject(id), fetchVariants(id)])
      .then(([record, variantRecords]) => {
        setProject(record)
        setVariants(variantRecords)
        setTargetUrl(record?.target_url ?? '')
      })
      .catch((reason) => setMessage(reason instanceof Error ? reason.message : 'Could not load project.'))
      .finally(() => setLoading(false))
  }, [id])

  async function saveDestination() {
    if (!project) return
    setBusy(true)
    setMessage('')
    try {
      const normalized = new URL(targetUrl).toString()
      const updated = await updateProject(project.id, { target_url: normalized })
      if (updated) setProject(updated)
      setTargetUrl(normalized)
      setMessage('Destination saved. The dynamic QR redirect is updated.')
    } catch (reason) {
      setMessage(reason instanceof Error ? reason.message : 'Could not save destination.')
    } finally {
      setBusy(false)
    }
  }

  async function downloadPng() {
    if (!project) return
    setBusy(true)
    try {
      const generated = await generateQr(project.type === 'dynamic' ? `${window.location.origin}/q/${project.short_id}` : project.target_url, {
        targetUrl: project.target_url,
        fgColor,
        bgColor,
        brandColors: [],
        logoSize: 18,
        quietZone: 4,
        ctaText: 'Scan Me',
        frameStyle: 'none',
        cornerStyle: 'square',
        moduleStyle: 'square',
        errorCorrection: 'H',
      })
      await exportQr({ format: 'png-1024', qrDataUrl: generated.dataUrl, targetUrl: project.target_url, projectName: project.name, fgColor, bgColor })
      setMessage('PNG export downloaded.')
    } catch (reason) {
      setMessage(reason instanceof Error ? reason.message : 'Export failed.')
    } finally {
      setBusy(false)
    }
  }

  async function remove() {
    if (!project || !window.confirm(`Delete project "${project.name}" and all variants?`)) return
    setBusy(true)
    try {
      await deleteProject(project.id)
      router.replace('/projects')
      router.refresh()
    } catch (reason) {
      setMessage(reason instanceof Error ? reason.message : 'Could not delete project.')
      setBusy(false)
    }
  }

  return (
    <AppShell>
      <div className="space-y-6">
        <div className="project-detail-header">
          <Link href="/projects" aria-label="Back to projects"><ArrowLeft /></Link>
          <div><h1>{loading ? 'Loading project...' : project?.name ?? 'Project not found'}</h1>{project && <p>{project.target_url}</p>}</div>
          {project && <div><Link href={`/create?project=${project.id}`}><RefreshCw />Regenerate</Link><button type="button" onClick={downloadPng} disabled={busy}><Download />Export PNG</button></div>}
        </div>

        {message && <div className="win95-status-message" role="status">{message}</div>}
        {!loading && !project && <div className="win95-error">This project does not exist or you do not have access.</div>}

        {project && (
          <div className="project-detail-grid">
            <section className="win95-panel qr-live-preview">
              <div className="win95-panel-title">Live QR Preview</div>
              <QrCodeRenderer
                url={project.type === 'dynamic' ? `${typeof window === 'undefined' ? '' : window.location.origin}/q/${project.short_id}` : project.target_url}
                size={360}
                fgColor={fgColor}
                bgColor={bgColor}
                errorCorrection="H"
              />
              <div className="color-controls"><label>Foreground<input type="color" value={fgColor} onChange={(event) => setFgColor(event.target.value)} /></label><label>Background<input type="color" value={bgColor} onChange={(event) => setBgColor(event.target.value)} /></label></div>
            </section>

            <div className="project-detail-sidebar">
              <section className="win95-panel"><div className="win95-panel-title">Destination</div><label>Target URL<input type="url" value={targetUrl} onChange={(event) => setTargetUrl(event.target.value)} /></label><div className="button-row"><button type="button" onClick={() => navigator.clipboard.writeText(targetUrl)}><Copy />Copy</button><a href={targetUrl} target="_blank" rel="noreferrer"><ExternalLink />Open</a><button type="button" onClick={saveDestination} disabled={busy}><Save />Save</button></div></section>
              <section className="win95-panel"><div className="win95-panel-title">Project Details</div><dl className="account-details"><div><dt>Type</dt><dd>{project.type}</dd></div><div><dt>Category</dt><dd>{project.category}</dd></div><div><dt>Short link</dt><dd>/q/{project.short_id}</dd></div><div><dt>Variants</dt><dd>{variants.length}</dd></div></dl></section>
              <section className="win95-panel"><div className="win95-panel-title">Saved Variants</div>{variants.length === 0 ? <p className="empty-hint">No saved variants yet.</p> : <ul className="variant-list">{variants.map((variant) => <li key={variant.id}><span>{variant.style_preset}</span><strong>{variant.scanability_score}/100</strong></li>)}</ul>}</section>
              <section className="win95-panel danger-panel"><div className="win95-panel-title">Danger Zone</div><button type="button" onClick={remove} disabled={busy}><Trash2 />Delete Project</button></section>
            </div>
          </div>
        )}
      </div>
    </AppShell>
  )
}
