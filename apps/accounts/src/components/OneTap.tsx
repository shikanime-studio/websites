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
        // The plugin navigates to `callbackURL` (default `/`) after the
        // sign-in, discarding the server's OAuth redirect. Returning here
        // lets the page resume the authorization request with the new
        // session instead of dropping the user on the landing page.
        callbackURL: window.location.href,
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
