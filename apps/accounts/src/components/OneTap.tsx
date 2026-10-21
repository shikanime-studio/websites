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
        button: {
          container: "[data-one-tap-button]",
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
