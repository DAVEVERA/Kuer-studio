const ALIGNMENT_PATTERN_POSITIONS: Record<number, number[]> = {
  1: [],
  2: [6, 18],
  3: [6, 22],
  4: [6, 26],
  5: [6, 30],
  6: [6, 34],
  7: [6, 22, 38],
  8: [6, 24, 42],
  9: [6, 26, 46],
  10: [6, 28, 50],
}

export interface ProtectedZone {
  x: number
  y: number
  width: number
  height: number
  type: 'finder' | 'alignment' | 'timing' | 'quiet-zone'
}

export function getFinderPatternZones(moduleCount: number): ProtectedZone[] {
  return [
    { x: 0, y: 0, width: 7, height: 7, type: 'finder' },
    { x: moduleCount - 7, y: 0, width: 7, height: 7, type: 'finder' },
    { x: 0, y: moduleCount - 7, width: 7, height: 7, type: 'finder' },
  ]
}

export function getAlignmentPatternZones(version: number): ProtectedZone[] {
  const positions = ALIGNMENT_PATTERN_POSITIONS[version]
  if (!positions || positions.length === 0) return []

  const zones: ProtectedZone[] = []
  for (const row of positions) {
    for (const col of positions) {
      if (
        (row <= 8 && col <= 8) ||
        (row <= 8 && col >= positions[positions.length - 1] - 4) ||
        (row >= positions[positions.length - 1] - 4 && col <= 8)
      ) {
        continue
      }
      zones.push({ x: col - 2, y: row - 2, width: 5, height: 5, type: 'alignment' })
    }
  }
  return zones
}

export function getTimingPatternZones(moduleCount: number): ProtectedZone[] {
  return [
    { x: 6, y: 8, width: 1, height: moduleCount - 16, type: 'timing' },
    { x: 8, y: 6, width: moduleCount - 16, height: 1, type: 'timing' },
  ]
}

export function getQuietZone(moduleCount: number, quietZoneSize: number): ProtectedZone[] {
  return [
    { x: -quietZoneSize, y: -quietZoneSize, width: moduleCount + quietZoneSize * 2, height: quietZoneSize, type: 'quiet-zone' },
    { x: -quietZoneSize, y: moduleCount, width: moduleCount + quietZoneSize * 2, height: quietZoneSize, type: 'quiet-zone' },
    { x: -quietZoneSize, y: 0, width: quietZoneSize, height: moduleCount, type: 'quiet-zone' },
    { x: moduleCount, y: 0, width: quietZoneSize, height: moduleCount, type: 'quiet-zone' },
  ]
}

export function getAllProtectedZones(version: number, moduleCount: number, quietZoneSize = 4): ProtectedZone[] {
  return [
    ...getFinderPatternZones(moduleCount),
    ...getAlignmentPatternZones(version),
    ...getTimingPatternZones(moduleCount),
    ...getQuietZone(moduleCount, quietZoneSize),
  ]
}

export function isModuleProtected(
  x: number,
  y: number,
  zones: ProtectedZone[]
): boolean {
  return zones.some(
    (z) => x >= z.x && x < z.x + z.width && y >= z.y && y < z.y + z.height
  )
}

export function createProtectionMaskMatrix(
  version: number,
  moduleCount: number,
  quietZoneSize = 4
): boolean[][] {
  const zones = getAllProtectedZones(version, moduleCount, quietZoneSize)
  const mask: boolean[][] = []
  for (let y = 0; y < moduleCount; y++) {
    const row: boolean[] = []
    for (let x = 0; x < moduleCount; x++) {
      row.push(isModuleProtected(x, y, zones))
    }
    mask.push(row)
  }
  return mask
}
