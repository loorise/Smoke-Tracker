import { useAuth } from '../../features/auth/hooks/useAuth.js'
import { OnboardingModal } from '../../features/onboarding/components/OnboardingModal.jsx'
import { isProfileComplete } from '../../features/onboarding/utils/profile.js'

export function OnboardingGate({ children }) {
  const { user, refreshUser } = useAuth()
  const needsOnboarding = user && !isProfileComplete(user)

  return (
    <>
      {needsOnboarding ? null : children}
      {needsOnboarding ? <OnboardingModal user={user} onComplete={refreshUser} /> : null}
    </>
  )
}
