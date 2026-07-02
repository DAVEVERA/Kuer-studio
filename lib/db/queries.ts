import { getSupabaseClient } from './supabaseClient'
import {
  mockProjects,
  mockVariants,
  mockBrandKits,
  mockScanEvents,
  mockExportHistory,
  getProjectVariants,
  getProjectById,
  getBrandKitById,
} from './mockData'
import type { QrProject, QrVariant } from '@/types/qr'
import type { BrandKit, BrandKitFormData } from '@/types/brand'
import type { ScanEvent } from '@/types/analytics'
import type { ExportRecord } from '@/types/export'
import { generateId, generateShortId } from '@/lib/utils'

const supabase = getSupabaseClient()

// Projects
export async function fetchProjects(): Promise<QrProject[]> {
  if (supabase) {
    const { data } = await supabase.from('qr_projects').select('*').order('updated_at', { ascending: false })
    if (data) return data
  }
  return [...mockProjects]
}

export async function fetchProject(id: string): Promise<QrProject | null> {
  if (supabase) {
    const { data } = await supabase.from('qr_projects').select('*').eq('id', id).single()
    if (data) return data
  }
  return getProjectById(id) ?? null
}

export async function createProject(
  project: Omit<QrProject, 'id' | 'short_id' | 'created_at' | 'updated_at'>
): Promise<QrProject> {
  const now = new Date().toISOString()
  const newProject: QrProject = {
    ...project,
    id: generateId(),
    short_id: generateShortId(),
    created_at: now,
    updated_at: now,
  }

  if (supabase) {
    const { data } = await supabase.from('qr_projects').insert(newProject).select().single()
    if (data) return data
  }

  mockProjects.unshift(newProject)
  return newProject
}

export async function updateProject(id: string, updates: Partial<QrProject>): Promise<QrProject | null> {
  if (supabase) {
    const { data } = await supabase
      .from('qr_projects')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single()
    if (data) return data
  }
  const idx = mockProjects.findIndex((p) => p.id === id)
  if (idx !== -1) {
    mockProjects[idx] = { ...mockProjects[idx], ...updates, updated_at: new Date().toISOString() }
    return mockProjects[idx]
  }
  return null
}

export async function deleteProject(id: string): Promise<boolean> {
  if (supabase) {
    const { error } = await supabase.from('qr_projects').delete().eq('id', id)
    return !error
  }
  const idx = mockProjects.findIndex((p) => p.id === id)
  if (idx !== -1) {
    mockProjects.splice(idx, 1)
    return true
  }
  return false
}

// Variants
export async function fetchVariants(projectId: string): Promise<QrVariant[]> {
  if (supabase) {
    const { data } = await supabase
      .from('qr_variants')
      .select('*')
      .eq('project_id', projectId)
      .order('created_at', { ascending: false })
    if (data) return data
  }
  return getProjectVariants(projectId)
}

export async function createVariant(variant: Omit<QrVariant, 'id' | 'created_at'>): Promise<QrVariant> {
  const newVariant: QrVariant = {
    ...variant,
    id: generateId(),
    created_at: new Date().toISOString(),
  }

  if (supabase) {
    const { data } = await supabase.from('qr_variants').insert({
      ...newVariant,
      validation_report_json: newVariant.validation_report,
      export_urls_json: newVariant.export_urls,
    }).select().single()
    if (data) return data
  }

  mockVariants.push(newVariant)
  return newVariant
}

// Brand Kits
export async function fetchBrandKits(): Promise<BrandKit[]> {
  if (supabase) {
    const { data } = await supabase.from('brand_kits').select('*').order('created_at', { ascending: false })
    if (data) return data
  }
  return [...mockBrandKits]
}

export async function fetchBrandKit(id: string): Promise<BrandKit | null> {
  if (supabase) {
    const { data } = await supabase.from('brand_kits').select('*').eq('id', id).single()
    if (data) return data
  }
  return getBrandKitById(id) ?? null
}

export async function createBrandKit(kit: BrandKitFormData & { user_id: string }): Promise<BrandKit> {
  const newKit: BrandKit = {
    ...kit,
    id: generateId(),
    created_at: new Date().toISOString(),
  }

  if (supabase) {
    const { data } = await supabase.from('brand_kits').insert(newKit).select().single()
    if (data) return data
  }

  mockBrandKits.push(newKit)
  return newKit
}

export async function updateBrandKit(id: string, updates: Partial<BrandKit>): Promise<BrandKit | null> {
  if (supabase) {
    const { data } = await supabase.from('brand_kits').update(updates).eq('id', id).select().single()
    if (data) return data
  }
  const idx = mockBrandKits.findIndex((bk) => bk.id === id)
  if (idx !== -1) {
    mockBrandKits[idx] = { ...mockBrandKits[idx], ...updates }
    return mockBrandKits[idx]
  }
  return null
}

export async function deleteBrandKit(id: string): Promise<boolean> {
  if (supabase) {
    const { error } = await supabase.from('brand_kits').delete().eq('id', id)
    return !error
  }
  const idx = mockBrandKits.findIndex((bk) => bk.id === id)
  if (idx !== -1) {
    mockBrandKits.splice(idx, 1)
    return true
  }
  return false
}

// Scan Events
export async function fetchScanEvents(projectId?: string): Promise<ScanEvent[]> {
  if (supabase) {
    let query = supabase.from('scan_events').select('*').order('timestamp', { ascending: false })
    if (projectId) query = query.eq('project_id', projectId)
    const { data } = await query
    if (data) return data
  }
  return projectId ? mockScanEvents.filter((e) => e.project_id === projectId) : [...mockScanEvents]
}

export async function insertScanEvent(event: Omit<ScanEvent, 'id'>): Promise<void> {
  if (supabase) {
    await supabase.from('scan_events').insert({ ...event, id: generateId() })
    return
  }
  mockScanEvents.push({ ...event, id: generateId() })
}

// Export History
export async function fetchExportHistory(variantId?: string): Promise<ExportRecord[]> {
  if (supabase) {
    let query = supabase.from('export_history').select('*').order('created_at', { ascending: false })
    if (variantId) query = query.eq('variant_id', variantId)
    const { data } = await query
    if (data) return data
  }
  return variantId ? mockExportHistory.filter((e) => e.variant_id === variantId) : [...mockExportHistory]
}

// Redirect lookup
export async function findProjectByShortId(shortId: string): Promise<QrProject | null> {
  if (supabase) {
    const { data } = await supabase.from('qr_projects').select('*').eq('short_id', shortId).single()
    if (data) return data
  }
  return mockProjects.find((p) => p.short_id === shortId) ?? null
}
