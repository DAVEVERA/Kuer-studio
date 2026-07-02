import type { StylePreset } from '@/types/qr'

export const stylePresets: StylePreset[] = [
  {
    id: 'premium-luxury',
    name: 'Premium Luxury',
    description: 'Dark elegance with gold linework and editorial refinement',
    prompt: 'Create a dark premium luxury QR campaign asset with gold linework, deep navy or black backgrounds, elegant borders, editorial layouts, high contrast QR structures, refined typography areas and validated scanability.',
    previewColors: ['#0a0a0f', '#c9a84c', '#1a1a2e', '#d4af37'],
    icon: 'Crown',
  },
  {
    id: 'organic-nature',
    name: 'Organic Nature',
    description: 'Botanical textures with warm, natural green accents',
    prompt: 'Create a soft organic branded QR code design with botanical textures, natural green accents, warm light and premium calm composition. Preserve all QR scan-critical zones, maintain strong contrast, keep finder patterns readable and protect the quiet zone.',
    previewColors: ['#1a2e1a', '#4a7c59', '#8fbc8f', '#f0e68c'],
    icon: 'Leaf',
  },
  {
    id: 'tech-circuitboard',
    name: 'Tech Circuitboard',
    description: 'Futuristic circuit-board traces with metallic accents',
    prompt: 'Create a premium futuristic circuit-board inspired branded QR code design. Preserve QR scanability, finder patterns, timing patterns and quiet zone. Use subtle metallic traces, microchip textures, blue-grey tones, red accent nodes, high contrast QR modules, sharp details, and a clean professional composition.',
    previewColors: ['#0d1b2a', '#1b3a5c', '#415a77', '#e63946'],
    icon: 'Cpu',
  },
  {
    id: 'podcast-artwork',
    name: 'Podcast Artwork',
    description: 'Audio-inspired design with waveform elements',
    prompt: 'Create a branded QR code design with audio waveform elements, microphone motifs, rich purple and warm orange gradients, podcast artwork styling. Preserve scanability, maintain finder patterns and quiet zone integrity.',
    previewColors: ['#1a0a2e', '#6b21a8', '#f97316', '#fbbf24'],
    icon: 'Headphones',
  },
  {
    id: 'minimal-editorial',
    name: 'Minimal Editorial',
    description: 'Clean, typographic design with ample whitespace',
    prompt: 'Create a minimal editorial QR code design with clean lines, generous whitespace, subtle grid structure, monochrome palette with one accent color, and premium typographic sensibility. Preserve all scan-critical zones.',
    previewColors: ['#fafafa', '#1a1a1a', '#e5e5e5', '#dc2626'],
    icon: 'Type',
  },
  {
    id: 'cyberpunk-neon',
    name: 'Cyberpunk Neon',
    description: 'Neon glow effects on dark cyberpunk backgrounds',
    prompt: 'Create a cyberpunk-styled QR code with neon glow effects, electric blue and hot pink accents, dark urban backgrounds, glitch aesthetics, and high-tech atmosphere. Preserve QR scanability and all critical structures.',
    previewColors: ['#0a0a1a', '#00f0ff', '#ff006e', '#8b00ff'],
    icon: 'Zap',
  },
  {
    id: 'soft-community',
    name: 'Soft Community',
    description: 'Warm, approachable design with soft gradients',
    prompt: 'Create a warm community-focused QR code design with soft pastel gradients, friendly rounded shapes, inclusive warm tones, and approachable composition. Maintain scanability and protect critical QR zones.',
    previewColors: ['#fff5f5', '#fed7aa', '#fecaca', '#fb923c'],
    icon: 'Heart',
  },
  {
    id: 'restaurant-menu',
    name: 'Restaurant Menu',
    description: 'Culinary-inspired with warm, appetizing tones',
    prompt: 'Create an elegant restaurant-themed QR code design with warm culinary tones, subtle food textures, cream and dark wood color palette, menu-card aesthetics. Preserve all QR scan-critical structures.',
    previewColors: ['#2c1810', '#8b4513', '#f5deb3', '#daa520'],
    icon: 'UtensilsCrossed',
  },
  {
    id: 'event-poster',
    name: 'Event Poster',
    description: 'Bold, dynamic design for events and festivals',
    prompt: 'Create a bold event poster-style QR code design with dynamic gradients, energetic colors, festival-inspired graphics, bold type areas. Ensure QR remains fully scannable with protected finder patterns and quiet zone.',
    previewColors: ['#1a0533', '#7c3aed', '#ec4899', '#fbbf24'],
    icon: 'Calendar',
  },
  {
    id: 'product-packaging',
    name: 'Product Packaging',
    description: 'Clean packaging design ready for print',
    prompt: 'Create a product packaging-ready QR code design with clean edges, print-safe colors, subtle texture, professional branding areas, and high contrast for reliable scanning. Optimize for CMYK reproduction.',
    previewColors: ['#1a1a1a', '#ffffff', '#e5e5e5', '#059669'],
    icon: 'Package',
  },
  {
    id: 'corporate-clean',
    name: 'Corporate Clean',
    description: 'Professional, trustworthy corporate styling',
    prompt: 'Create a professional corporate QR code design with clean lines, trustworthy blue tones, subtle gradient backgrounds, business-appropriate styling, and enterprise-grade scanability.',
    previewColors: ['#0f172a', '#1e40af', '#3b82f6', '#e2e8f0'],
    icon: 'Building2',
  },
  {
    id: 'dark-futuristic',
    name: 'Dark Futuristic',
    description: 'Sleek dark design with holographic accents',
    prompt: 'Create a sleek dark futuristic QR code design with holographic accents, deep black backgrounds, iridescent highlights, sci-fi grid patterns, and cutting-edge aesthetics. Maintain full QR scanability.',
    previewColors: ['#050510', '#1a1a3e', '#4f46e5', '#06b6d4'],
    icon: 'Rocket',
  },
]

export function getStylePreset(id: string): StylePreset | undefined {
  return stylePresets.find((p) => p.id === id)
}
