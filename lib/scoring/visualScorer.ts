export function calculateVisualScore(_imageDataUrl?: string): number {
  // Canvas-based visual quality scoring
  // In a production implementation, this would:
  // 1. Analyze color harmony (palette cohesion via deltaE between dominant colors)
  // 2. Measure composition balance (visual weight distribution via quadrant luminance)
  // 3. Detect artifacts (banding, noise, color bleeding near QR modules)
  // 4. Check style adherence (how well colors match the selected preset)
  //
  // For now, return a baseline score. The real implementation requires
  // canvas pixel analysis which only works client-side.
  return 75
}

export function analyzeColorHarmony(colors: string[]): number {
  if (colors.length < 2) return 50

  let totalDistance = 0
  let comparisons = 0

  for (let i = 0; i < colors.length; i++) {
    for (let j = i + 1; j < colors.length; j++) {
      totalDistance += colorDistance(colors[i], colors[j])
      comparisons++
    }
  }

  const avgDistance = comparisons > 0 ? totalDistance / comparisons : 0

  // Good harmony: not too similar (>30) and not too different (<200)
  if (avgDistance >= 30 && avgDistance <= 200) return 90
  if (avgDistance >= 15 && avgDistance <= 250) return 70
  return 50
}

function colorDistance(hex1: string, hex2: string): number {
  const r1 = parseInt(hex1.slice(1, 3), 16)
  const g1 = parseInt(hex1.slice(3, 5), 16)
  const b1 = parseInt(hex1.slice(5, 7), 16)
  const r2 = parseInt(hex2.slice(1, 3), 16)
  const g2 = parseInt(hex2.slice(3, 5), 16)
  const b2 = parseInt(hex2.slice(5, 7), 16)

  return Math.sqrt(
    Math.pow(r1 - r2, 2) +
    Math.pow(g1 - g2, 2) +
    Math.pow(b1 - b2, 2)
  )
}
