import {
  fetchProjects,
  fetchProject,
  createProject,
  updateProject,
  deleteProject,
  fetchVariants,
  createVariant,
} from '@/lib/db/queries'
import type { QrProject, QrVariant, QrType, DestinationType } from '@/types/qr'
import type { ProjectWithVariants, ProjectSummary } from '@/types/project'

export async function getProjects(): Promise<ProjectSummary[]> {
  const projects = await fetchProjects()
  const summaries: ProjectSummary[] = []

  for (const project of projects) {
    const variants = await fetchVariants(project.id)
    const bestScore = variants.reduce((max, v) => Math.max(max, v.scanability_score), 0)

    summaries.push({
      id: project.id,
      name: project.name,
      target_url: project.target_url,
      type: project.type,
      category: project.category,
      variant_count: variants.length,
      best_score: bestScore,
      created_at: project.created_at,
      updated_at: project.updated_at,
      preview_image: variants[0]?.image_url,
    })
  }

  return summaries
}

export async function getProjectWithVariants(id: string): Promise<ProjectWithVariants | null> {
  const project = await fetchProject(id)
  if (!project) return null

  const variants = await fetchVariants(id)

  return { ...project, variants }
}

export async function createNewProject(data: {
  name: string
  targetUrl: string
  type: QrType
  category: DestinationType
  userId: string
  brandKitId?: string
}): Promise<QrProject> {
  return createProject({
    user_id: data.userId,
    brand_kit_id: data.brandKitId,
    name: data.name,
    target_url: data.targetUrl,
    type: data.type,
    category: data.category,
  })
}

export async function addVariantToProject(
  projectId: string,
  variant: Omit<QrVariant, 'id' | 'created_at'>
): Promise<QrVariant> {
  return createVariant(variant)
}

export { updateProject, deleteProject }
