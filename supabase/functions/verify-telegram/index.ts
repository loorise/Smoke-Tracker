import { SignJWT } from 'npm:jose@5'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

type VerifyRequest = {
  initData?: string
  devTelegramId?: number
}

type TelegramUser = {
  id: number
  username?: string
  first_name?: string
  last_name?: string
}

function jsonResponse(body: Record<string, unknown>, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  })
}

async function hmacSha256(key: ArrayBuffer | Uint8Array, data: string) {
  const cryptoKey = await crypto.subtle.importKey(
    'raw',
    key,
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign'],
  )

  const signature = await crypto.subtle.sign('HMAC', cryptoKey, new TextEncoder().encode(data))
  return new Uint8Array(signature)
}

function bytesToHex(bytes: Uint8Array) {
  return Array.from(bytes)
    .map((byte) => byte.toString(16).padStart(2, '0'))
    .join('')
}

async function validateInitData(initData: string, botToken: string) {
  const params = new URLSearchParams(initData)
  const hash = params.get('hash')

  if (!hash) {
    return { valid: false as const, reason: 'Missing hash' }
  }

  params.delete('hash')

  const dataCheckString = [...params.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([key, value]) => `${key}=${value}`)
    .join('\n')

  const secretKey = await hmacSha256(
    new TextEncoder().encode('WebAppData'),
    botToken,
  )

  const calculatedHash = bytesToHex(await hmacSha256(secretKey, dataCheckString))

  if (calculatedHash !== hash) {
    return { valid: false as const, reason: 'Invalid initData signature' }
  }

  const authDate = Number(params.get('auth_date') ?? 0)
  const maxAgeSeconds = 60 * 60 * 24

  if (!authDate || Date.now() / 1000 - authDate > maxAgeSeconds) {
    return { valid: false as const, reason: 'initData expired' }
  }

  const userRaw = params.get('user')

  if (!userRaw) {
    return { valid: false as const, reason: 'Missing user' }
  }

  const user = JSON.parse(userRaw) as TelegramUser

  if (!user?.id) {
    return { valid: false as const, reason: 'Invalid user' }
  }

  return { valid: true as const, user }
}

async function createTelegramAccessToken(telegramId: number) {
  const jwtSecret = Deno.env.get('JWT_SECRET')
  const projectUrl = Deno.env.get('PROJECT_URL')

  if (!jwtSecret || !projectUrl) {
    throw new Error('Edge function secrets are not configured (JWT_SECRET, PROJECT_URL)')
  }

  const now = Math.floor(Date.now() / 1000)
  const expiresIn = 60 * 60 * 24 * 7

  const accessToken = await new SignJWT({
    role: 'authenticated',
    telegram_id: telegramId,
  })
    .setProtectedHeader({ alg: 'HS256', typ: 'JWT' })
    .setSubject(String(telegramId))
    .setIssuer('supabase')
    .setAudience('authenticated')
    .setIssuedAt(now)
    .setExpirationTime(now + expiresIn)
    .sign(new TextEncoder().encode(jwtSecret))

  return {
    access_token: accessToken,
    refresh_token: accessToken,
    expires_in: expiresIn,
    token_type: 'bearer',
    telegram_id: telegramId,
  }
}

Deno.serve(async (request) => {
  if (request.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  if (request.method !== 'POST') {
    return jsonResponse({ error: 'Method not allowed' }, 405)
  }

  try {
    const body = (await request.json()) as VerifyRequest
    let telegramId: number | null = null

    const allowDevAuth = Deno.env.get('ALLOW_DEV_TELEGRAM_AUTH') === 'true'

    if (body.devTelegramId != null) {
      if (!allowDevAuth) {
        return jsonResponse({ error: 'Dev auth is disabled' }, 403)
      }

      telegramId = Number(body.devTelegramId)

      if (!Number.isFinite(telegramId) || telegramId <= 0) {
        return jsonResponse({ error: 'Invalid devTelegramId' }, 400)
      }
    } else if (body.initData) {
      const botToken = Deno.env.get('TELEGRAM_BOT_TOKEN')

      if (!botToken) {
        return jsonResponse({ error: 'TELEGRAM_BOT_TOKEN is not configured' }, 500)
      }

      const validation = await validateInitData(body.initData, botToken)

      if (!validation.valid) {
        return jsonResponse({ error: validation.reason }, 401)
      }

      telegramId = Number(validation.user.id)
    } else {
      return jsonResponse({ error: 'initData or devTelegramId required' }, 400)
    }

    const session = await createTelegramAccessToken(telegramId)

    return jsonResponse(session)
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Verification failed'
    return jsonResponse({ error: message }, 500)
  }
})
