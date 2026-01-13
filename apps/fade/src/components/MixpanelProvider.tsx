import mixpanel from "mixpanel-browser";
import { useMemo } from "react";
import { MixpanelContext } from "../hooks/useMixpanel";
import type { Config } from "mixpanel-browser";
import type { ReactNode } from "react";

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
  const value = useMemo(() => {
    if (!name) {
      mixpanel.init(token, config ?? {});
      return {};
    }
    return { instance: mixpanel.init(token, config ?? {}, name) };
  }, [token, config, name]);

  return (
    <MixpanelContext.Provider value={value}>
      {children}
    </MixpanelContext.Provider>
  );
}
