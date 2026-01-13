import mixpanel from "mixpanel-browser";
import { createContext, useContext, useMemo } from "react";
import type { Config, Mixpanel } from "mixpanel-browser";

export interface MixpanelContextValue {
  instance?: Mixpanel;
}

export const MixpanelContext = createContext<MixpanelContextValue | null>(null);

export function useMixpanel() {
  const context = useContext(MixpanelContext);
  if (!context?.instance) {
    return mixpanel;
  }
  return context.instance;
}

export function useMixpanelInstance(
  token: string,
  config?: Partial<Config>,
  name?: string,
) {
  return useMemo(() => {
    if (!name) {
      mixpanel.init(token, config ?? {});
      return {};
    }
    return { instance: mixpanel.init(token, config ?? {}, name) };
  }, [token, config, name]);
}
