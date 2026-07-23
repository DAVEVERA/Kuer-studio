export const env = {
  supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL ?? '',
  supabasePublishableKey:
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ??
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ??
    '',
  supabaseSecretKey:
    process.env.SUPABASE_SECRET_KEY ??
    process.env.SUPABASE_SERVICE_ROLE_SECRET ??
    '',
  aiProviderKey: process.env.AI_PROVIDER_KEY ?? process.env.REPLICATE_API_TOKEN ?? '',
  aiProviderUrl: process.env.AI_PROVIDER_URL ?? 'https://api.replicate.com',
  replicateQrModelVersion: process.env.REPLICATE_QR_MODEL_VERSION ?? '',
  replicateFluxModel: process.env.REPLICATE_FLUX_MODEL ?? '',
  replicateQrMonsterModel: process.env.REPLICATE_QR_MONSTER_MODEL ?? '',
  openaiApiKey: process.env.OPENAI_API_KEY ?? '',
  openAiFeaturesEnabled: process.env.OPENAI_FEATURES_ENABLED === 'true',
  openaiVisionModel: process.env.OPENAI_VISION_MODEL ?? 'gpt-4o',
  aiPromptModel: process.env.AI_PROMPT_MODEL ?? 'gpt-4o',
  baseUrl: process.env.NEXT_PUBLIC_BASE_URL ?? 'http://localhost:3000',
}

export function hasAiProvider(): boolean {
  return Boolean(env.aiProviderKey)
}

export function hasSupabase(): boolean {
  return Boolean(env.supabaseUrl && env.supabasePublishableKey)
}

export function hasSupabaseAdmin(): boolean {
  return Boolean(env.supabaseUrl && env.supabaseSecretKey)
}

export function hasVisionProvider(): boolean {
  return env.openAiFeaturesEnabled && Boolean(env.openaiApiKey)
}

export function hasPromptProvider(): boolean {
  return env.openAiFeaturesEnabled && Boolean(env.openaiApiKey)
}

export function getFluxModelId(): string {
  return env.replicateFluxModel
}

export function getQrMonsterModelId(): string {
  return env.replicateQrMonsterModel
}
