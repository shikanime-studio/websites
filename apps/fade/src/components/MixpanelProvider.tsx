import type { Config } from "mixpanel-browser";
import type { ReactNode } from "react";
import { useAtomSet } from "@effect/atom-react";
import { useEffect } from "react";
import { initMixpanel } from "../hooks/useMixpanel";
import { mixpanelInstanceAtom } from "../lib/ui-atoms";

interface MixpanelProviderProps {
  children: ReactNode;
  token: string;
  config?: Partial<Config>;
  name?: string;
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
