export interface VisionColor {
  hex: string
  name: string
  prominence: number
}

export interface VisionObject {
  name: string
  confidence: number
  position: string
}

export interface VisionAnalysisResult {
  colors: VisionColor[]
  objects: VisionObject[]
  composition: string
  style: string[]
  brandElements: string[]
  hasFaces: boolean
  suggestedKeywords: string[]
  rawDescription: string
}
