import type { CharacterEntry } from "../lib/cast";
import { TextInput } from "@astryxdesign/core/TextInput";
import { Effect } from "effect";
import { useEffect, useRef, useState } from "react";
import { searchCharacters } from "../lib/api";
import { parseCharacterInput } from "../lib/cast";

export interface CharacterRef {
  id?: number;
  name: string;
  series: string | null;
}

const LOOKUP_DEBOUNCE_MS = 280;

/** Character/series picker: type, pick a known character, or add a new pair. */
export function CharacterPicker({
  value,
  onChange,
}: {
  value: CharacterEntry[];
  onChange: (next: CharacterEntry[]) => void;
}) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Array<CharacterRef>>([]);
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function close(event: MouseEvent) {
      if (!containerRef.current?.contains(event.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", close);
    return () => {
      document.removeEventListener("mousedown", close);
    };
  }, []);

  useEffect(() => {
    const trimmed = query.trim();
    const controller = new AbortController();
    // Settling inside the timer keeps the effect free of synchronous state
    // writes while still clearing stale suggestions as soon as the query goes.
    const timer = setTimeout(
      () => {
        if (trimmed.length < 2) {
          setResults([]);
          setOpen(false);
          return;
        }
        void Effect.runPromise(
          Effect.orElseSucceed(searchCharacters(trimmed), () => []),
        ).then((rows) => {
          if (controller.signal.aborted) return;
          setResults(rows);
          setOpen(true);
        });
      },
      trimmed.length < 2 ? 0 : LOOKUP_DEBOUNCE_MS,
    );
    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [query]);

  function add(entry: CharacterEntry) {
    if (value.some((item) => item.name.toLowerCase() === entry.name.toLowerCase()
      && item.series.toLowerCase() === entry.series.toLowerCase())) {
      setQuery("");
      setOpen(false);
      return;
    }
    onChange([...value, entry]);
    setQuery("");
    setOpen(false);
  }

  const typed = parseCharacterInput(query);

  return (
    <div className="flex flex-col gap-2" ref={containerRef}>
      <div className="relative">
        <TextInput
          description="One per shoot, or several for a group. Add “Name — Series”."
          label="Characters"
          onChange={setQuery}
          placeholder="Hu Tao — Genshin Impact"
          size="lg"
          value={query}
        />
        {open && query.trim().length >= 2 ? (
          <div
            className="border-border bg-body absolute z-40 mt-1 w-full overflow-hidden rounded-xl border shadow-lg"
            role="listbox"
          >
            {results.map((row) => (
              <button
                className="hover:bg-surface text-primary block w-full px-3 py-2.5 text-left text-[12.5px]"
                key={String(row.id)}
                onClick={() => {
                  add({ name: row.name, series: row.series ?? "" });
                }}
                role="option"
                aria-selected={false}
                type="button"
              >
                {row.name}
                {row.series ? (
                  <span className="text-secondary/70"> · {row.series}</span>
                ) : null}
              </button>
            ))}
            {results.length === 0 && typed ? (
              <p className="text-secondary/70 px-3 py-2 text-[11.5px]" role="status">
                Nothing in the studio list yet — it is added when you send the
                request.
              </p>
            ) : null}
            {typed ? (
              <button
                className="border-border text-primary hover:bg-surface block w-full border-t px-3 py-2.5 text-left text-[12.5px]"
                onClick={() => {
                  add({ name: typed.name, series: typed.series });
                }}
                type="button"
              >
                Add “{typed.name}”
                {typed.series ? (
                  <span className="text-secondary/70"> · {typed.series}</span>
                ) : null}
              </button>
            ) : null}
          </div>
        ) : null}
      </div>

      {value.length > 0 ? (
        <ul className="flex flex-wrap gap-1.5">
          {value.map((entry) => (
            <li key={`${entry.series}-${entry.name}`}>
              <button
                className="border-border text-secondary hover:border-border hover:text-primary inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11.5px] transition-colors"
                onClick={() => {
                  onChange(value.filter((item) => item !== entry));
                }}
                type="button"
              >
                {entry.name}
                {entry.series ? (
                  <span className="text-secondary/70">{entry.series}</span>
                ) : null}
                <span aria-hidden className="text-secondary/70">×</span>
              </button>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
