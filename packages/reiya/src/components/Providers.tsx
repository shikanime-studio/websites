import { ReactNode } from "react";

function SessionProvider({ children }: { children: ReactNode }) {
  return <>{children}</>;
}

export default function Providers({ children }: { children: ReactNode }) {
  return <SessionProvider>{children}</SessionProvider>;
}
