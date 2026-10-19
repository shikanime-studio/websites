import { useEffect, useRef, useState } from "react";
import { COLS, createSampler, renderFrame, ROWS } from "../lib/luma";

const KEYS = "D palette · R crt · P pause";

export default function Machine() {
  const [screen, setScreen] = useState("");
  const [crt, setCrt] = useState(false);
  const pausedRef = useRef(false);

  useEffect(() => {
    const sample = createSampler();
    let frame = 0;
    let raf = 0;
    const tick = () => {
      raf = requestAnimationFrame(tick);
      if (pausedRef.current) return;
      frame += 1;
      setScreen(renderFrame(sample(frame)).text);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement) return;
      const key = e.key.toLowerCase();
      if (key === "r") setCrt((v) => !v);
      else if (key === "p") pausedRef.current = !pausedRef.current;
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <div className="relative w-full overflow-hidden rounded-box border border-base-300 bg-base-200 p-2">
      <pre
        className={`overflow-hidden font-mono text-[6px] leading-[6px] sm:text-[8px] sm:leading-[8px] md:text-[10px] md:leading-[10px]${crt ? " opacity-80" : ""}`}
        aria-label={`ASCII rendering, ${COLS} by ${ROWS}`}
      >
        {screen}
      </pre>
      {crt && (
        <div className="scanlines pointer-events-none absolute inset-0" />
      )}
      <p className="mt-2 text-center text-xs opacity-60">{KEYS}</p>
    </div>
  );
}
