import mixpanel from "mixpanel-browser";
import { createContext, useContext } from "react";
import type { Mixpanel } from "mixpanel-browser";

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
