import {
  fetchBrandKits,
  fetchBrandKit,
  createBrandKit,
  updateBrandKit,
  deleteBrandKit,
} from '@/lib/db/queries'
import type { BrandKit, BrandKitFormData } from '@/types/brand'

export async function getBrandKits(): Promise<BrandKit[]> {
  return fetchBrandKits()
}

export async function getBrandKit(id: string): Promise<BrandKit | null> {
  return fetchBrandKit(id)
}

export async function createNewBrandKit(
  data: BrandKitFormData,
  userId: string
): Promise<BrandKit> {
  return createBrandKit({ ...data, user_id: userId })
}

export async function updateExistingBrandKit(
  id: string,
  updates: Partial<BrandKit>
): Promise<BrandKit | null> {
  return updateBrandKit(id, updates)
}

export async function removeBrandKit(id: string): Promise<boolean> {
  return deleteBrandKit(id)
}
