import { useCallback, useMemo } from "react";

export function useObjectUrl(blob: Blob | MediaSource | null) {
  const url = useMemo(() => {
    if (!blob) return undefined;
    return URL.createObjectURL(blob);
  }, [blob]);

  const revoke = useCallback(() => {
    if (url) {
      URL.revokeObjectURL(url);
    }
  }, [url]);

  return { url, revoke };
}
