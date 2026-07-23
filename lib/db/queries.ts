import { getSupabaseClient } from './supabaseClient'
import type { QrProject, QrVariant } from '@/types/qr'
import type { BrandKit, BrandKitFormData } from '@/types/brand'
import type { ScanEvent } from '@/types/analytics'
import type { ExportRecord } from '@/types/export'
import { generateId, generateShortId } from '@/lib/utils'

function db() {
  const client = getSupabaseClient()
  if (!client) throw new Error('Supabase is not configured.')
  return client
}

function fail(operation: string, error: { message: string } | null) {
  if (error) throw new Error(`${operation}: ${error.message}`)
}

export async function fetchProjects(): Promise<QrProject[]> {
  const { data, error } = await db().from('qr_projects').select('*').order('updated_at', { ascending: false })
  fail('Could not load projects', error)
  return (data ?? []) as QrProject[]
}

export async function fetchProject(id: string): Promise<QrProject | null> {
  const { data, error } = await db().from('qr_projects').select('*').eq('id', id).maybeSingle()
  fail('Could not load project', error)
  return data as QrProject | null
}

export async function createProject(
  project: Omit<QrProject, 'id' | 'short_id' | 'created_at' | 'updated_at'>
): Promise<QrProject> {
  const { data, error } = await db().from('qr_projects').insert({
    ...project,
    short_id: generateShortId(),
  }).select().single()
  fail('Could not create project', error)
  return data as QrProject
}

export async function updateProject(id: string, updates: Partial<QrProject>): Promise<QrProject | null> {
  const { data, error } = await db().from('qr_projects').update(updates).eq('id', id).select().maybeSingle()
  fail('Could not update project', error)
  return data as QrProject | null
}

export async function deleteProject(id: string): Promise<boolean> {
  const { error } = await db().from('qr_projects').delete().eq('id', id)
  fail('Could not delete project', error)
  return true
}

export async function fetchVariants(projectId: string): Promise<QrVariant[]> {
  const { data, error } = await db().from('qr_variants').select('*').eq('project_id', projectId).order('created_at', { ascending: false })
  fail('Could not load variants', error)
  return (data ?? []) as QrVariant[]
}

export async function createVariant(variant: Omit<QrVariant, 'id' | 'created_at'>): Promise<QrVariant> {
  const { data, error } = await db().from('qr_variants').insert(variant).select().single()
  fail('Could not save variant', error)
  return data as QrVariant
}

export async function fetchBrandKits(): Promise<BrandKit[]> {
  const { data, error } = await db().from('brand_kits').select('*').order('created_at', { ascending: false })
  fail('Could not load brand kits', error)
  return (data ?? []) as BrandKit[]
}

export async function fetchBrandKit(id: string): Promise<BrandKit | null> {
  const { data, error } = await db().from('brand_kits').select('*').eq('id', id).maybeSingle()
  fail('Could not load brand kit', error)
  return data as BrandKit | null
}

export async function createBrandKit(kit: BrandKitFormData & { user_id: string }): Promise<BrandKit> {
  const { data, error } = await db().from('brand_kits').insert(kit).select().single()
  fail('Could not create brand kit', error)
  return data as BrandKit
}

export async function updateBrandKit(id: string, updates: Partial<BrandKit>): Promise<BrandKit | null> {
  const { data, error } = await db().from('brand_kits').update(updates).eq('id', id).select().maybeSingle()
  fail('Could not update brand kit', error)
  return data as BrandKit | null
}

export async function deleteBrandKit(id: string): Promise<boolean> {
  const { error } = await db().from('brand_kits').delete().eq('id', id)
  fail('Could not delete brand kit', error)
  return true
}

export async function fetchScanEvents(projectId?: string): Promise<ScanEvent[]> {
  let query = db().from('scan_events').select('*').order('timestamp', { ascending: false })
  if (projectId) query = query.eq('project_id', projectId)
  const { data, error } = await query
  fail('Could not load analytics', error)
  return (data ?? []) as ScanEvent[]
}

export async function insertScanEvent(event: Omit<ScanEvent, 'id'>): Promise<void> {
  const { error } = await db().from('scan_events').insert({ ...event, id: generateId() })
  fail('Could not record scan', error)
}

export async function fetchExportHistory(variantId?: string): Promise<ExportRecord[]> {
  let query = db().from('export_history').select('*').order('created_at', { ascending: false })
  if (variantId) query = query.eq('variant_id', variantId)
  const { data, error } = await query
  fail('Could not load exports', error)
  return (data ?? []) as ExportRecord[]
}
