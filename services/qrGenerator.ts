import { createQrDataUrl, getQrMatrix } from '@/lib/qr/createQr'
import { createProtectionMaskMatrix } from '@/lib/qr/qrProtectionMask'
import type { QrEditorState } from '@/types/qr'

export interface GeneratedQr {
  dataUrl: string
  matrix: boolean[][]
  moduleCount: number
  version: number
  protectionMask: boolean[][]
}

export async function generateQr(
  url: string,
  editorState: QrEditorState
): Promise<GeneratedQr> {
  const dataUrl = await createQrDataUrl(url, {
    width: 1024,
    margin: editorState.quietZone,
    errorCorrectionLevel: editorState.errorCorrection,
    color: {
      dark: editorState.fgColor,
      light: editorState.bgColor,
    },
  })

  const { matrix, size, version } = await getQrMatrix(url, editorState.errorCorrection)
  const protectionMask = createProtectionMaskMatrix(version, size, editorState.quietZone)

  return {
    dataUrl,
    matrix,
    moduleCount: size,
    version,
    protectionMask,
  }
}
