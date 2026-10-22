import { useEffect, useRef } from "react";
import { authClient } from "../lib/auth-client";

interface OneTapProps {
  onError?: (message: string) => void;
}

export function OneTap({ onError }: OneTapProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const startedRef = useRef(false);

  useEffect(() => {
    if (startedRef.current || !containerRef.current) {
      return;
    }
    startedRef.current = true;
    authClient.oneTap(
      {
        // No `callbackURL`: the OAuth provider answers the callback with
        // `{redirect, url}` and better-auth's redirect plugin follows it.
        // Passing one would make the plugin navigate there instead and
        // drop the authorization request.
        button: {
          container: "[data-one-tap-button]",
          config: {
            type: "standard",
            theme: "outline",
            size: "large",
            text: "continue_with",
            shape: "pill",
          },
        },
      },
      {
        // Passing fetch options also stops the plugin's own `"/"` hop.
        // The OAuth provider answers with `{redirect, url}` (already
        // followed by better-auth's redirect plugin); a plain sign-in has
        // no redirect, so land on the app instead of staying on /login.
        onSuccess: (ctx) => {
          const data = ctx.data as
            | { redirect?: boolean, url?: string }
            | undefined;
          if (data?.redirect === true && typeof data.url === "string") {
            return;
          }
          window.location.assign("/");
        },
        onError: (ctx) => {
          onError?.(ctx.error.message ?? "Sign-in failed");
        },
      },
    );
  }, [onError]);

  return (
    <div className="flex flex-col items-center gap-4">
      <div ref={containerRef} data-one-tap-button className="min-h-11" />
    </div>
  );
}
