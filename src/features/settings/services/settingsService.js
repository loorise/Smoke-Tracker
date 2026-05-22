import { saveUserPreferences } from '../../auth/services/usersService.js'

export async function saveSettings(userId, preferences) {
  return saveUserPreferences(userId, preferences)
}
