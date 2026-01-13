import { useEffect, useState } from "react";
import type { RefObject } from "react";

export function useElementSize<T extends HTMLElement>(
  ref: RefObject<T | null>,
) {
  const [entries, setEntries] = useState<Array<ResizeObserverEntry>>([]);

  useEffect(() => {
    if (!ref.current) return;

    const observer = new ResizeObserver((observedEntries) => {
      setEntries(observedEntries);
    });

    observer.observe(ref.current);
    return () => {
      observer.disconnect();
    };
  }, [ref]);

  return entries[0]?.contentRect ?? { width: 0, height: 0 };
}
