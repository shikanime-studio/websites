import type { Config } from 'mixpanel-browser'
import type { ReactNode } from 'react'
import { MixpanelContext, useMixpanelInstance } from '../hooks/useMixpanel'

interface MixpanelProviderProps {
  children: ReactNode
  token: string
  config?: Partial<Config>
  name?: string
}

export function MixpanelProvider({
  children,
  token,
  config,
  name,
}: MixpanelProviderProps) {
  const value = useMixpanelInstance(token, config, name)

  return <MixpanelContext value={value}>{children}</MixpanelContext>
}
