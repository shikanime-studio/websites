import { Spinner } from "@astryxdesign/core/Spinner";
import { TextInput } from "@astryxdesign/core/TextInput";
import { useEffect, useRef, useState } from "react";

export interface SelectedPlace {
  label: string;
  lat: number | null;
  lon: number | null;
  placeId?: string;
}

export interface LocationValue {
  text: string;
  place: SelectedPlace | null;
}

/** Debounced place lookup: Google Places when configured, OSM otherwise. */
export function LocationField({
  value,
  onChange,
}: {
  value: LocationValue;
  onChange: (next: LocationValue) => void;
}) {
  const [results, setResults] = useState<SelectedPlace[]>([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const container = useRef<HTMLDivElement>(null);
  const selecting = useRef(false);

  useEffect(() => {
    function close(event: MouseEvent) {
      if (!container.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", close);
    return () => {
      document.removeEventListener("mousedown", close);
    };
  }, []);

  useEffect(() => {
    const query = value.text.trim();
    if (selecting.current || query.length < 3 || query === value.place?.label) {
      setResults([]);
      return;
    }
    const controller = new AbortController();
    const timer = setTimeout(() => {
      setLoading(true);
      fetch(`/api/places?q=${encodeURIComponent(query)}`, {
        signal: controller.signal,
      })
        .then(async (response): Promise<{ places?: SelectedPlace[] }> =>
          response.ok ? response.json() : { places: [] },
        )
        .then((body) => {
          setResults(body.places ?? []);
          setOpen(true);
        })
        .catch(() => {
          setResults([]);
        })
        .finally(() => {
          setLoading(false);
        });
    }, 350);
    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [value.text, value.place?.label]);

  async function choose(place: SelectedPlace) {
    selecting.current = true;
    setOpen(false);
    setResults([]);
    let resolved = place;
    if (place.lat === null && place.placeId) {
      try {
        const response = await fetch(
          `/api/places?placeId=${encodeURIComponent(place.placeId)}`,
        );
        const body = (await response.json()) as { place?: SelectedPlace };
        if (body.place) {
          resolved = body.place;
        }
      } catch {
        // keep the label from the suggestion
      }
    }
    onChange({ text: resolved.label, place: resolved });
    selecting.current = false;
  }

  return (
    <div className="relative" ref={container}>
      <TextInput
        description="Type an address or place, then pick a suggestion."
        isRequired
        label="Location"
        size="lg"
        onChange={(text) => {
          selecting.current = false;
          onChange({ text, place: null });
        }}
        placeholder="Parc de Bercy, Paris"
        value={value.text}
      />
      {value.place?.lat !== null && value.place?.lat !== undefined ? (
        <div className="border-hairline mt-2 overflow-hidden rounded-xl border">
          <iframe
            className="h-32 w-full"
            loading="lazy"
            src={`https://www.google.com/maps?q=${String(value.place.lat)},${String(value.place.lon)}&output=embed`}
            title="Selected location"
          />
        </div>
      ) : null}
      {open && (results.length > 0 || loading) ? (
        <div
          className="border-border bg-body absolute z-40 mt-1 w-full overflow-hidden rounded-xl border shadow-lg"
          role="listbox"
        >
          {loading ? (
            <div className="text-ink-soft flex items-center gap-2 px-3 py-2.5 text-[12px]">
              <Spinner aria-label="Searching places" size="sm" /> Searching…
            </div>
          ) : null}
          {results.map((place) => (
            <button
              className="hover:bg-surface text-ink block w-full px-3 py-2.5 text-left text-[12.5px]"
              key={`${place.placeId ?? place.label}-${String(place.lat)}`}
              onClick={() => {
                void choose(place);
              }}
              aria-selected={false}
              role="option"
              type="button"
            >
              {place.label}
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}
