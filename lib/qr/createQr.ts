import QRCode from 'qrcode'

export interface QrOptions {
  width?: number
  margin?: number
  errorCorrectionLevel?: 'L' | 'M' | 'Q' | 'H'
  color?: {
    dark?: string
    light?: string
  }
}

const DEFAULT_OPTIONS: QrOptions = {
  width: 1024,
  margin: 4,
  errorCorrectionLevel: 'H',
  color: {
    dark: '#000000',
    light: '#FFFFFF',
  },
}

export async function createQrDataUrl(
  url: string,
  options: QrOptions = {}
): Promise<string> {
  const merged = {
    ...DEFAULT_OPTIONS,
    ...options,
    color: { ...DEFAULT_OPTIONS.color, ...options.color },
  }
  return QRCode.toDataURL(url, {
    width: merged.width,
    margin: merged.margin,
    errorCorrectionLevel: merged.errorCorrectionLevel,
    color: merged.color,
  })
}

export async function createQrSvgString(
  url: string,
  options: QrOptions = {}
): Promise<string> {
  const merged = {
    ...DEFAULT_OPTIONS,
    ...options,
    color: { ...DEFAULT_OPTIONS.color, ...options.color },
  }
  return QRCode.toString(url, {
    type: 'svg',
    width: merged.width,
    margin: merged.margin,
    errorCorrectionLevel: merged.errorCorrectionLevel,
    color: merged.color,
  })
}

export async function getQrMatrix(url: string, errorCorrectionLevel: 'L' | 'M' | 'Q' | 'H' = 'H') {
  const qr = QRCode.create(url, { errorCorrectionLevel })
  const size = qr.modules.size
  const data = qr.modules.data
  const matrix: boolean[][] = []
  for (let row = 0; row < size; row++) {
    const rowData: boolean[] = []
    for (let col = 0; col < size; col++) {
      rowData.push(data[row * size + col] === 1)
    }
    matrix.push(rowData)
  }
  return { matrix, size, version: qr.version }
}
