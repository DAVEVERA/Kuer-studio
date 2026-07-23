'use client'

import { FormEvent, useEffect, useState } from 'react'
import { Plus, Palette, Pencil, Trash2, X } from 'lucide-react'
import { AppShell } from '@/components/AppShell'
import { createClient } from '@/lib/supabase/client'
import { createNewBrandKit, getBrandKits, removeBrandKit, updateExistingBrandKit } from '@/services/brandKitService'
import type { BrandKit } from '@/types/brand'

const emptyForm = {
  name: '',
  primary_color: '#000080',
  secondary_color: '#c0c0c0',
  accent_color: '#008081',
  font_preference: 'MS Sans Serif',
}

export default function BrandKitsPage() {
  const [brandKits, setBrandKits] = useState<BrandKit[]>([])
  const [editing, setEditing] = useState<BrandKit | null>(null)
  const [form, setForm] = useState(emptyForm)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    getBrandKits().then(setBrandKits).catch((reason) => setError(reason instanceof Error ? reason.message : 'Could not load brand kits.')).finally(() => setLoading(false))
  }, [])

  function openCreate() {
    setEditing(null)
    setForm(emptyForm)
    setDialogOpen(true)
  }

  function openEdit(kit: BrandKit) {
    setEditing(kit)
    setForm({
      name: kit.name,
      primary_color: kit.primary_color,
      secondary_color: kit.secondary_color,
      accent_color: kit.accent_color,
      font_preference: kit.font_preference ?? 'MS Sans Serif',
    })
    setDialogOpen(true)
  }

  async function save(event: FormEvent) {
    event.preventDefault()
    setSaving(true)
    setError('')
    try {
      if (editing) {
        const updated = await updateExistingBrandKit(editing.id, form)
        if (updated) setBrandKits((items) => items.map((item) => item.id === updated.id ? updated : item))
      } else {
        const { data } = await createClient().auth.getUser()
        if (!data.user) throw new Error('Your session has expired.')
        const created = await createNewBrandKit(form, data.user.id)
        setBrandKits((items) => [created, ...items])
      }
      setDialogOpen(false)
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'Could not save brand kit.')
    } finally {
      setSaving(false)
    }
  }

  async function remove(kit: BrandKit) {
    if (!window.confirm(`Delete brand kit "${kit.name}"?`)) return
    try {
      await removeBrandKit(kit.id)
      setBrandKits((items) => items.filter((item) => item.id !== kit.id))
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'Could not delete brand kit.')
    }
  }

  return (
    <AppShell>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div><h1 className="text-2xl font-bold">Brand Kits</h1><p className="text-muted text-sm mt-1">Database-backed brand colors, logos and fonts.</p></div>
          <button type="button" onClick={openCreate}><Plus />New Brand Kit</button>
        </div>

        {error && <div className="win95-error" role="alert">{error}</div>}
        {loading && <div className="win95-panel empty-state">Loading brand kits...</div>}

        <div className="brand-kit-grid">
          {brandKits.map((kit) => (
            <article className="win95-panel brand-kit-card" key={kit.id}>
              <div className="brand-kit-swatch" style={{ background: `linear-gradient(135deg, ${kit.primary_color}, ${kit.secondary_color}, ${kit.accent_color})` }} />
              <h3>{kit.name}</h3>
              <div className="brand-color-list">{[kit.primary_color, kit.secondary_color, kit.accent_color].map((color) => <span key={color}><i style={{ background: color }} />{color}</span>)}</div>
              <p><Palette />{kit.font_preference || 'System default'}</p>
              <div className="brand-kit-actions"><button type="button" onClick={() => openEdit(kit)}><Pencil />Edit</button><button type="button" onClick={() => remove(kit)}><Trash2 />Delete</button></div>
            </article>
          ))}
          {!loading && <button type="button" className="win95-panel brand-kit-add" onClick={openCreate}><Plus /><span>Add Brand Kit</span></button>}
        </div>

        {!loading && brandKits.length === 0 && <p className="empty-hint">No saved brand kits yet. Create your first real brand kit.</p>}
      </div>

      {dialogOpen && (
        <div className="win95-dialog-backdrop" onMouseDown={() => setDialogOpen(false)}>
          <section className="win95-window brand-dialog" role="dialog" aria-modal="true" aria-labelledby="brand-dialog-title" onMouseDown={(event) => event.stopPropagation()}>
            <div className="win95-titlebar"><div className="win95-titlebar-label" id="brand-dialog-title">{editing ? 'Edit Brand Kit' : 'New Brand Kit'}</div><div className="win95-window-controls"><button type="button" aria-label="Close" onClick={() => setDialogOpen(false)}><X /></button></div></div>
            <form onSubmit={save} className="brand-dialog-form">
              <label>Name<input required maxLength={120} value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} /></label>
              <label>Primary color<input type="color" value={form.primary_color} onChange={(event) => setForm({ ...form, primary_color: event.target.value })} /></label>
              <label>Secondary color<input type="color" value={form.secondary_color} onChange={(event) => setForm({ ...form, secondary_color: event.target.value })} /></label>
              <label>Accent color<input type="color" value={form.accent_color} onChange={(event) => setForm({ ...form, accent_color: event.target.value })} /></label>
              <label>Font preference<input maxLength={100} value={form.font_preference} onChange={(event) => setForm({ ...form, font_preference: event.target.value })} /></label>
              <div className="dialog-actions"><button type="button" onClick={() => setDialogOpen(false)}>Cancel</button><button type="submit" disabled={saving}>{saving ? 'Saving...' : 'Save'}</button></div>
            </form>
          </section>
        </div>
      )}
    </AppShell>
  )
}
