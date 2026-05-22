import { supabase } from '../../../lib/supabase.js'

const USER_COLUMNS =
  'id, telegram_id, username, first_name, last_name, daily_target, pack_price, cigs_per_pack, created_at, updated_at'

function toInsertRow(profile) {
  return {
    telegram_id: profile.telegramId,
    username: profile.username,
    first_name: profile.firstName,
    last_name: profile.lastName,
  }
}

export async function findUserByTelegramId(telegramId) {
  const { data, error } = await supabase
    .from('users')
    .select(USER_COLUMNS)
    .eq('telegram_id', telegramId)
    .maybeSingle()

  if (error) {
    throw new Error(error.message)
  }

  return data
}

export async function createUser(profile) {
  const { data, error } = await supabase
    .from('users')
    .insert(toInsertRow(profile))
    .select(USER_COLUMNS)
    .single()

  if (error) {
    throw new Error(error.message)
  }

  return data
}

export async function updateUserProfile(userId, profile) {
  const { data, error } = await supabase
    .from('users')
    .update({
      username: profile.username,
      first_name: profile.firstName,
      last_name: profile.lastName,
      updated_at: new Date().toISOString(),
    })
    .eq('id', userId)
    .select(USER_COLUMNS)
    .single()

  if (error) {
    throw new Error(error.message)
  }

  return data
}

export async function saveUserPreferences(userId, preferences) {
  const { data, error } = await supabase
    .from('users')
    .update({
      daily_target: preferences.dailyTarget,
      pack_price: preferences.packPrice,
      cigs_per_pack: preferences.cigsPerPack,
      updated_at: new Date().toISOString(),
    })
    .eq('id', userId)
    .select(USER_COLUMNS)
    .single()

  if (error) {
    throw new Error(error.message)
  }

  return data
}
