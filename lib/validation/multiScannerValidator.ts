import jsQR from 'jsqr'
import { decodeWithZxing, type ZxingDecodeResult } from './zxingValidator'

export interface ScannerResult {
  scanner: 'jsqr' | 'zxing'
  decoded: boolean
  text: string | null
  urlMatches: boolean
}

export interface MultiScanResult {
  isScannable: boolean
  decodedUrl: string | null
  urlMatches: boolean
  scannerResults: ScannerResult[]
  confidence: number
}

export async function multiScanValidation(
  imageData: ImageData,
  expectedUrl: string
): Promise<MultiScanResult> {
  const results: ScannerResult[] = []

  // jsQR scan
  const jsqrResult = jsQR(imageData.data, imageData.width, imageData.height)
  const jsqrDecoded = jsqrResult?.data ?? null
  results.push({
    scanner: 'jsqr',
    decoded: Boolean(jsqrDecoded),
    text: jsqrDecoded,
    urlMatches: jsqrDecoded ? urlsMatch(jsqrDecoded, expectedUrl) : false,
  })

  // ZXing scan
  const zxingResult = await decodeWithZxing(imageData)
  const zxingDecoded = zxingResult?.text ?? null
  results.push({
    scanner: 'zxing',
    decoded: Boolean(zxingDecoded),
    text: zxingDecoded,
    urlMatches: zxingDecoded ? urlsMatch(zxingDecoded, expectedUrl) : false,
  })

  const successCount = results.filter(r => r.decoded).length
  const urlMatchCount = results.filter(r => r.urlMatches).length

  const decodedUrl = results.find(r => r.urlMatches)?.text
    ?? results.find(r => r.decoded)?.text
    ?? null

  let confidence = 0
  if (successCount === 2 && urlMatchCount === 2) confidence = 100
  else if (successCount === 2 && urlMatchCount === 1) confidence = 85
  else if (successCount === 1 && urlMatchCount === 1) confidence = 70
  else if (successCount === 1) confidence = 50
  else confidence = 0

  return {
    isScannable: successCount > 0,
    decodedUrl,
    urlMatches: urlMatchCount > 0,
    scannerResults: results,
    confidence,
  }
}

function urlsMatch(decoded: string, expected: string): boolean {
  const normalize = (u: string) => u.replace(/^https?:\/\//, '').replace(/\/$/, '').toLowerCase()
  return normalize(decoded) === normalize(expected) || decoded === expected
}
