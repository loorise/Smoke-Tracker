import { saveUserPreferences } from '../../auth/services/usersService.js'

export async function completeOnboarding(userId, preferences) {
  return saveUserPreferences(userId, preferences)
}
