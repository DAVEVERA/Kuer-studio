export function checkFinderPatterns(
  imageData: Uint8ClampedArray,
  width: number,
  height: number
): 'pass' | 'warning' | 'fail' {
  const moduleSize = estimateModuleSize(imageData, width, height)
  if (moduleSize <= 0) return 'fail'

  const margin = estimateMargin(imageData, width)
  const positions = [
    { x: margin, y: margin },
    { x: width - margin - moduleSize * 7, y: margin },
    { x: margin, y: height - margin - moduleSize * 7 },
  ]

  let validPatterns = 0

  for (const pos of positions) {
    if (verifyFinderAtPosition(imageData, width, pos.x, pos.y, moduleSize)) {
      validPatterns++
    }
  }

  if (validPatterns === 3) return 'pass'
  if (validPatterns >= 2) return 'warning'
  return 'fail'
}

function estimateModuleSize(
  imageData: Uint8ClampedArray,
  width: number,
  _height: number
): number {
  const y = Math.floor(width * 0.1)
  let darkStart = -1
  let darkEnd = -1

  for (let x = 0; x < width; x++) {
    const idx = (y * width + x) * 4
    const bright = imageData[idx] > 128
    if (!bright && darkStart === -1) {
      darkStart = x
    }
    if (bright && darkStart !== -1 && darkEnd === -1) {
      darkEnd = x
      break
    }
  }

  if (darkStart === -1 || darkEnd === -1) return 0
  return Math.max(1, Math.floor((darkEnd - darkStart) / 7))
}

function estimateMargin(imageData: Uint8ClampedArray, width: number): number {
  const y = Math.floor(width / 2)
  let margin = 0
  for (let x = 0; x < width / 4; x++) {
    const idx = (y * width + x) * 4
    if (imageData[idx] > 200 && imageData[idx + 1] > 200 && imageData[idx + 2] > 200) {
      margin++
    } else {
      break
    }
  }
  return margin
}

function verifyFinderAtPosition(
  imageData: Uint8ClampedArray,
  width: number,
  startX: number,
  startY: number,
  moduleSize: number
): boolean {
  const centerX = startX + moduleSize * 3
  const centerY = startY + moduleSize * 3

  if (centerX >= width || centerY >= width) return false

  const centerIdx = (Math.floor(centerY) * width + Math.floor(centerX)) * 4
  const centerDark = imageData[centerIdx] < 128

  const cornerX = startX + moduleSize * 0.5
  const cornerY = startY + moduleSize * 0.5
  const cornerIdx = (Math.floor(cornerY) * width + Math.floor(cornerX)) * 4
  const cornerDark = imageData[cornerIdx] < 128

  return centerDark && cornerDark
}
