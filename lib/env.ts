export const env = {
  supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL ?? '',
  supabaseAnonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? '',
  aiProviderKey: process.env.AI_PROVIDER_KEY ?? process.env.REPLICATE_API_TOKEN ?? '',
  aiProviderUrl: process.env.AI_PROVIDER_URL ?? 'https://api.replicate.com',
  replicateQrModelVersion: process.env.REPLICATE_QR_MODEL_VERSION ?? '',
  replicateFluxModel: process.env.REPLICATE_FLUX_MODEL ?? '',
  replicateQrMonsterModel: process.env.REPLICATE_QR_MONSTER_MODEL ?? '',
  openaiApiKey: process.env.OPENAI_API_KEY ?? '',
  openaiVisionModel: process.env.OPENAI_VISION_MODEL ?? 'gpt-4o',
  aiPromptModel: process.env.AI_PROMPT_MODEL ?? 'gpt-4o',
  baseUrl: process.env.NEXT_PUBLIC_BASE_URL ?? 'http://localhost:3000',
}

export function hasAiProvider(): boolean {
  return Boolean(env.aiProviderKey)
}

export function hasSupabase(): boolean {
  return Boolean(env.supabaseUrl && env.supabaseAnonKey)
}

export function hasVisionProvider(): boolean {
  return Boolean(env.openaiApiKey)
}

export function hasPromptProvider(): boolean {
  return Boolean(env.openaiApiKey)
}

export function getFluxModelId(): string {
  return env.replicateFluxModel
}

export function getQrMonsterModelId(): string {
  return env.replicateQrMonsterModel
}
