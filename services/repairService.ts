import {
  repairContrast,
  repairQuietZone,
  repairFinderPatterns,
  type RepairResult,
  type RepairType,
} from '@/lib/ai/repairPipeline'

export interface RepairServiceRequest {
  imageDataUrl: string
  repairType: RepairType
  targetUrl: string
  qrSize?: number
  moduleSize?: number
  margin?: number
}

export async function executeRepair(request: RepairServiceRequest): Promise<RepairResult> {
  switch (request.repairType) {
    case 'enhance-contrast':
      return repairContrast(request.imageDataUrl)

    case 'fix-quiet-zone':
      return repairQuietZone(request.imageDataUrl, request.margin ?? 40)

    case 'restore-finder-patterns':
      if (request.qrSize && request.moduleSize) {
        return repairFinderPatterns(
          request.imageDataUrl,
          request.qrSize,
          request.moduleSize,
          request.margin ?? 40
        )
      }
      return { imageDataUrl: request.imageDataUrl, repairType: request.repairType, applied: false }

    case 'regenerate': {
      const response = await fetch('/api/ai/repair', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageDataUrl: request.imageDataUrl,
          repairType: request.repairType,
          targetUrl: request.targetUrl,
        }),
      })

      if (!response.ok) {
        return { imageDataUrl: request.imageDataUrl, repairType: request.repairType, applied: false }
      }

      return response.json()
    }

    default:
      return { imageDataUrl: request.imageDataUrl, repairType: request.repairType, applied: false }
  }
}
