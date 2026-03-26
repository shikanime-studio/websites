import type { UseSuspenseQueryResult } from '@tanstack/react-query'
import type { Config, Mixpanel } from 'mixpanel-browser'
import { useSuspenseQuery } from '@tanstack/react-query'
import mixpanel from 'mixpanel-browser'
import { createContext, use } from 'react'

export const MixpanelContext = createContext<UseSuspenseQueryResult<Mixpanel> | undefined>(undefined)

export function useMixpanel() {
  const context = use(MixpanelContext)
  if (!context)
    throw new Error('useMixpanel must be used within a MixpanelProvider')
  return context
}

export function useMixpanelInstance(
  token: string,
  config?: Partial<Config>,
  name?: string,
) {
  return useSuspenseQuery({
    queryKey: ['mixpanel', token, name, config],
    queryFn: () => {
      if (!name) {
        mixpanel.init(token, config ?? {})
        return mixpanel
      }
      return mixpanel.init(token, config ?? {}, name)
    },
  })
}
