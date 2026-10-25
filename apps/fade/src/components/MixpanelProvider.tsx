import type { Config, Mixpanel } from "mixpanel-browser";
import type { ReactNode } from "react";
import { useAtomSet } from "@effect/atom-react";
import mixpanel from "mixpanel-browser";
import { useEffect } from "react";
import { mixpanelInstanceAtom } from "../lib/ui-atoms";

interface MixpanelProviderProps {
  children: ReactNode;
  token: string;
  config?: Partial<Config>;
  name?: string;
}

function initMixpanel(
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

export function MixpanelProvider({
  children,
  token,
  config,
  name,
}: MixpanelProviderProps) {
  const setInstance = useAtomSet(mixpanelInstanceAtom);
  const configKey = JSON.stringify(config ?? {});

  useEffect(() => {
    setInstance(initMixpanel(token, config, name));
    // The config object is a literal at the call site; its shape is the key.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token, name, configKey, setInstance]);

  return <>{children}</>;
}
