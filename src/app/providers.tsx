import React from 'react'

export interface ProvidersProps {
  children: React.ReactNode
}

/**
 * Root Application Providers
 * Wraps the app in necessary context and configuration providers.
 */
export function Providers({ children }: ProvidersProps) {
  return <>{children}</>
}
