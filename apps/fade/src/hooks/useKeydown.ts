import { useEffect, useRef } from "react";

export function useKeydown(handler: (event: KeyboardEvent) => void) {
  const savedHandler = useRef(handler);

  useEffect(() => {
    savedHandler.current = handler;
  }, [handler]);

  useEffect(() => {
    const listener = (event: KeyboardEvent) => {
      savedHandler.current(event);
    };

    window.addEventListener("keydown", listener);
    return () => {
      window.removeEventListener("keydown", listener);
    };
  }, []);
}
