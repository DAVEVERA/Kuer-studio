import { z } from 'zod'

const MAX_HTTP_URL_LENGTH = 2048
const MAX_PROMPT_LENGTH = 2000
const MAX_IMAGE_DATA_URL_LENGTH = 14 * 1024 * 1024

export const httpUrlSchema = z
  .string()
  .trim()
  .min(1)
  .max(MAX_HTTP_URL_LENGTH)
  .url()
  .refine((value) => {
    try {
      const protocol = new URL(value).protocol
      return protocol === 'http:' || protocol === 'https:'
    } catch {
      return false
    }
  }, 'URL must use http or https')

export const promptSchema = z.string().trim().max(MAX_PROMPT_LENGTH)
export const brandColorSchema = z.string().regex(/^#[0-9a-f]{6}$/i, 'Use a six-digit hex color')
export const brandColorsSchema = z.array(brandColorSchema).max(8)
export const imageDataUrlSchema = z
  .string()
  .min(1)
  .max(MAX_IMAGE_DATA_URL_LENGTH)
  .refine((value) => /^data:image\/(png|jpeg|webp);base64,/i.test(value), 'Unsupported image data URL')

export const visionAnalysisSchema = z.object({
  colors: z.array(z.object({
    hex: brandColorSchema,
    name: z.string().trim().max(80),
    prominence: z.number().min(0).max(1),
  })).max(24),
  objects: z.array(z.object({
    name: z.string().trim().max(120),
    confidence: z.number().min(0).max(1),
    position: z.string().trim().max(120),
  })).max(100),
  composition: z.string().trim().max(2000),
  style: z.array(z.string().trim().max(120)).max(24),
  brandElements: z.array(z.string().trim().max(200)).max(50),
  hasFaces: z.boolean(),
  suggestedKeywords: z.array(z.string().trim().max(120)).max(50),
  rawDescription: z.string().trim().max(10_000),
}).strict()
