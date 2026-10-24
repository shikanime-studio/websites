import type { Config, Mixpanel } from "mixpanel-browser";
import { useAtomValue } from "@effect/atom-react";
import mixpanel from "mixpanel-browser";
import { mixpanelInstanceAtom } from "../lib/ui-atoms";

export function useMixpanel(): Mixpanel {
  const instance = useAtomValue(mixpanelInstanceAtom);
  return instance ?? mixpanel;
}

export function initMixpanel(
  token: string,
  config?: Partial<Config>,
  name?: string,
): Mixpanel {
  if (!name) {
    mixpanel.init(token, config ?? {});
    return mixpanel;
  }
  return mixpanel.init(token, config ?? {}, name) as Mixpanel;
}
