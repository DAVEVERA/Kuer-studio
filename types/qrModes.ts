import type { AiModelId, StylePresetId } from './qr'

export type QrModeId =
  | 'brand'
  | 'character'
  | 'product'
  | 'architecture'
  | 'cyberpunk'
  | 'abstract'
  | 'isometric'
  | 'storytelling'

export interface StyleVariation {
  id: string
  name: string
  presetId?: StylePresetId
  prompt: string
  previewColors: string[]
}

export interface ModelParameterPreset {
  controlWeight?: number
  guidanceScale?: number
  strength?: number
  conditioningScale?: number
  numInferenceSteps?: number
}

export interface QrMode {
  id: QrModeId
  name: string
  description: string
  icon: string
  defaultModel: AiModelId
  promptStrategy: 'template' | 'vision-guided' | 'llm-generated'
  parameterPresets: ModelParameterPreset
  styleVariations: StyleVariation[]
  requiredInputs: ('image' | 'logo' | 'text' | 'brand-kit')[]
  optionalInputs: ('image' | 'logo' | 'text' | 'brand-kit')[]
  scanStrictness: 'strict' | 'moderate' | 'relaxed'
}
