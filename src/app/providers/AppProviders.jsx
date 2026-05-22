import { AuthProvider } from './AuthProvider.jsx'
import { OnboardingGate } from './OnboardingGate.jsx'
import { SmokingEventsProvider } from './SmokingEventsProvider.jsx'

export function AppProviders({ children }) {
  return (
    <AuthProvider>
      <OnboardingGate>
        <SmokingEventsProvider>{children}</SmokingEventsProvider>
      </OnboardingGate>
    </AuthProvider>
  )
}
