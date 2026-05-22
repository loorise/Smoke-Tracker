import { supabase } from '../../../lib/supabase.js'

const EVENT_COLUMNS = 'id, telegram_id, smoked_at, created_at'

export async function fetchSmokingEvents(telegramId) {
  const { data, error } = await supabase
    .from('smoking_events')
    .select(EVENT_COLUMNS)
    .eq('telegram_id', telegramId)
    .order('smoked_at', { ascending: false })

  if (error) {
    throw new Error(error.message)
  }

  return data ?? []
}

export async function createSmokingEvent(telegramId, smokedAt = new Date().toISOString()) {
  const { data, error } = await supabase
    .from('smoking_events')
    .insert({
      telegram_id: telegramId,
      smoked_at: smokedAt,
    })
    .select(EVENT_COLUMNS)
    .single()

  if (error) {
    throw new Error(error.message)
  }

  return data
}

export async function deleteSmokingEvent(eventId, telegramId) {
  const { error } = await supabase
    .from('smoking_events')
    .delete()
    .eq('id', eventId)
    .eq('telegram_id', telegramId)

  if (error) {
    throw new Error(error.message)
  }
}

export async function deleteAllSmokingEvents(telegramId) {
  const { error } = await supabase
    .from('smoking_events')
    .delete()
    .eq('telegram_id', telegramId)

  if (error) {
    throw new Error(error.message)
  }
}
