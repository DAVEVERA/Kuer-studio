import type { StylePresetId } from '@/types/qr'

const BASE_SAFETY = 'Preserve QR scanability, finder patterns, timing patterns and quiet zone. Maintain high contrast on QR data modules.'

const templates: Record<StylePresetId, string> = {
  'premium-luxury': `Create a dark premium luxury QR campaign asset with gold linework, deep navy or black backgrounds, elegant borders, editorial layouts, high contrast QR structures, refined typography areas and validated scanability. ${BASE_SAFETY}`,

  'organic-nature': `Create a soft organic branded QR code design with botanical textures, natural green accents, warm light and premium calm composition. ${BASE_SAFETY}`,

  'tech-circuitboard': `Create a premium futuristic circuit-board inspired branded QR code design. Use subtle metallic traces, microchip textures, blue-grey tones, red accent nodes, high contrast QR modules, sharp details, and a clean professional composition. ${BASE_SAFETY}`,

  'podcast-artwork': `Create a branded QR code design with audio waveform elements, microphone motifs, rich purple and warm orange gradients, podcast artwork styling. ${BASE_SAFETY}`,

  'minimal-editorial': `Create a minimal editorial QR code design with clean lines, generous whitespace, subtle grid structure, monochrome palette with one accent color, and premium typographic sensibility. ${BASE_SAFETY}`,

  'cyberpunk-neon': `Create a cyberpunk-styled QR code with neon glow effects, electric blue and hot pink accents, dark urban backgrounds, glitch aesthetics, and high-tech atmosphere. ${BASE_SAFETY}`,

  'soft-community': `Create a warm community-focused QR code design with soft pastel gradients, friendly rounded shapes, inclusive warm tones, and approachable composition. ${BASE_SAFETY}`,

  'restaurant-menu': `Create an elegant restaurant-themed QR code design with warm culinary tones, subtle food textures, cream and dark wood color palette, menu-card aesthetics. ${BASE_SAFETY}`,

  'event-poster': `Create a bold event poster-style QR code design with dynamic gradients, energetic colors, festival-inspired graphics, bold type areas. ${BASE_SAFETY}`,

  'product-packaging': `Create a product packaging-ready QR code design with clean edges, print-safe colors, subtle texture, professional branding areas, and high contrast for reliable scanning. ${BASE_SAFETY}`,

  'corporate-clean': `Create a professional corporate QR code design with clean lines, trustworthy blue tones, subtle gradient backgrounds, business-appropriate styling, and enterprise-grade scanability. ${BASE_SAFETY}`,

  'dark-futuristic': `Create a sleek dark futuristic QR code design with holographic accents, deep black backgrounds, iridescent highlights, sci-fi grid patterns, and cutting-edge aesthetics. ${BASE_SAFETY}`,
}

export function getPromptTemplate(presetId: StylePresetId): string {
  return templates[presetId] ?? templates['corporate-clean']
}

export function buildFullPrompt(
  presetId: StylePresetId,
  customPrompt?: string,
  brandColors?: string[]
): string {
  const base = customPrompt ?? getPromptTemplate(presetId)
  const colorNote = brandColors?.length
    ? ` Incorporate brand colors: ${brandColors.join(', ')}.`
    : ''
  return base + colorNote
}
