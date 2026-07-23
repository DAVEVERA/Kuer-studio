import { randomUUID } from 'node:crypto'
import { NextResponse } from 'next/server'
import sharp from 'sharp'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { enforceUserRateLimit, userRateLimitResponse } from '@/lib/auth/userRateLimit'

export const runtime = 'nodejs'

const MAX_ASSET_BYTES = 10 * 1024 * 1024
const MAX_ASSET_DIMENSION = 4096

export class QrAssetValidationError extends Error {}

export async function validateQrAssetUpload(file: File) {
  if (file.type !== 'image/png' || file.size < 8 || file.size > MAX_ASSET_BYTES) {
    throw new QrAssetValidationError('QR assets must be valid PNG files up to 10 MB.')
  }

  const buffer = Buffer.from(await file.arrayBuffer())
  const metadata = await sharp(buffer, { failOn: 'error' }).metadata().catch(() => null)
  if (
    metadata?.format !== 'png' ||
    !metadata.width ||
    !metadata.height ||
    metadata.width > MAX_ASSET_DIMENSION ||
    metadata.height > MAX_ASSET_DIMENSION
  ) {
    throw new QrAssetValidationError('QR assets must contain a valid PNG image up to 4096 x 4096 pixels.')
  }

  return { buffer, width: metadata.width, height: metadata.height }
}

export async function POST(request: Request) {
  try {
    await enforceUserRateLimit('qr-assets-upload', 20)
  } catch (error) {
    return userRateLimitResponse(error)
  }

  const supabase = await createClient()
  const { data } = await supabase.auth.getClaims()
  const userId = data?.claims?.sub
  if (!userId) return NextResponse.json({ error: 'Authentication required.' }, { status: 401 })

  const formData = await request.formData()
  const file = formData.get('file')
  const projectId = String(formData.get('projectId') ?? '')
  if (!(file instanceof File) || !/^[0-9a-f-]{36}$/i.test(projectId)) {
    return NextResponse.json({ error: 'A valid PNG and project ID are required.' }, { status: 400 })
  }
  const { data: ownedProject, error: projectError } = await supabase
    .from('qr_projects')
    .select('id')
    .eq('id', projectId)
    .maybeSingle()
  if (projectError || !ownedProject) {
    return NextResponse.json({ error: 'Project not found.' }, { status: 404 })
  }

  let asset: Awaited<ReturnType<typeof validateQrAssetUpload>>
  try {
    asset = await validateQrAssetUpload(file)
  } catch (error) {
    const message = error instanceof QrAssetValidationError ? error.message : 'Could not inspect QR asset.'
    return NextResponse.json({ error: message }, { status: 415 })
  }

  const path = `${userId}/${projectId}/${randomUUID()}.png`
  const admin = createAdminClient()
  const { error } = await admin.storage.from('qr-assets').upload(path, asset.buffer, {
    contentType: 'image/png',
    upsert: false,
  })
  if (error) return NextResponse.json({ error: 'Could not store QR asset.' }, { status: 502 })

  const { data: publicAsset } = admin.storage.from('qr-assets').getPublicUrl(path)
  return NextResponse.json({ path, publicUrl: publicAsset.publicUrl })
}
