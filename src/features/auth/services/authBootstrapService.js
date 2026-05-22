import { isSupabaseConfigured } from '../../../lib/env.js'
import {
  createUser,
  findUserByTelegramId,
  updateUserProfile,
} from './usersService.js'

function assertSupabaseReady() {
  if (!isSupabaseConfigured()) {
    throw new Error(
      'Supabase is not configured. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in .env',
    )
  }
}

function profileChanged(dbUser, profile) {
  return (
    dbUser.username !== profile.username ||
    dbUser.first_name !== profile.firstName ||
    dbUser.last_name !== profile.lastName
  )
}

/**
 * Bootstrap current user: find by telegram_id or create.
 */
export async function bootstrapCurrentUser(profile) {
  assertSupabaseReady()

  const existing = await findUserByTelegramId(profile.telegramId)

  if (!existing) {
    return createUser(profile)
  }

  if (profileChanged(existing, profile)) {
    return updateUserProfile(existing.id, profile)
  }

  return existing
}
