const ENV_KEYS = ['VITE_SUPABASE_URL', 'VITE_SUPABASE_ANON_KEY']

function readEnv(name) {
  const value = import.meta.env[name]
  return typeof value === 'string' ? value.trim() : ''
}

function assertValidUrl(url) {
  try {
    const parsed = new URL(url)
    if (parsed.protocol !== 'https:' && parsed.protocol !== 'http:') {
      throw new Error('protocol')
    }
  } catch {
    throw new Error(`[env] ${ENV_KEYS[0]} must be a valid http(s) URL`)
  }
}

/**
 * @returns {{ url: string, anonKey: string }}
 */
export function getSupabaseEnv() {
  const url = readEnv('VITE_SUPABASE_URL')
  const anonKey = readEnv('VITE_SUPABASE_ANON_KEY')

  const missing = ENV_KEYS.filter((key) => !readEnv(key))

  if (missing.length > 0) {
    const message = `[env] Missing: ${missing.join(', ')}. Copy .env.example to .env and set values.`
    if (import.meta.env.PROD) {
      throw new Error(message)
    }
    console.warn(message)
    return { url, anonKey }
  }

  assertValidUrl(url)

  if (anonKey.length < 20) {
    throw new Error('[env] VITE_SUPABASE_ANON_KEY looks invalid (too short)')
  }

  return { url, anonKey }
}

export function isSupabaseConfigured() {
  return ENV_KEYS.every((key) => readEnv(key) !== '')
}
