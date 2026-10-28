import { Button } from "@astryxdesign/core/Button";
import { Spinner } from "@astryxdesign/core/Spinner";
import { TextInput } from "@astryxdesign/core/TextInput";
import { useToast } from "@astryxdesign/core/Toast";
import { Effect } from "effect";
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
  // A finished search that found nothing still owes the user a sentence.
  const [missed, setMissed] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const selectingRef = useRef(false);
  const toast = useToast();
  const [locating, setLocating] = useState(false);

  /** Fills the field from the device position — a shoot usually happens near
   *  the person booking it, and the map makes the guess easy to correct. */
  function locateMe() {
    if (!("geolocation" in navigator)) {
      toast({ body: "This browser has no location access.", type: "error" });
      return;
    }
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        fetch(`/api/places?reverse=${latitude},${longitude}`)
          .then(async (response) =>
            response.ok ? (await response.json()) as { place?: SelectedPlace } : {},
          )
          .then((body) => {
            const place = body.place
              ?? { label: `${latitude.toFixed(5)}, ${longitude.toFixed(5)}`, lat: latitude, lon: longitude };
            onChange({ text: place.label, place });
          })
          .catch(() => {
            onChange({
              text: `${latitude.toFixed(5)}, ${longitude.toFixed(5)}`,
              place: { label: "Current location", lat: latitude, lon: longitude },
            });
          })
          .finally(() => {
            setLocating(false);
          });
      },
      () => {
        setLocating(false);
        toast({ body: "Location permission was declined.", type: "error" });
      },
      { enableHighAccuracy: true, timeout: 8000 },
    );
  }

  useEffect(() => {
    function close(event: MouseEvent) {
      if (!containerRef.current?.contains(event.target as Node)) {
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
    if (selectingRef.current || query.length < 3 || query === value.place?.label) {
      setResults([]);
      return;
    }
    const controller = new AbortController();
    const timer = setTimeout(() => {
      setLoading(true);
      setMissed(false);
      fetch(`/api/places?q=${encodeURIComponent(query)}`, {
        signal: controller.signal,
      })
        .then(async (response): Promise<{ places?: SelectedPlace[] }> =>
          response.ok ? response.json() : { places: [] },
        )
        .then((body) => {
          const places = body.places ?? [];
          setResults(places);
          setMissed(places.length === 0);
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
    selectingRef.current = true;
    setOpen(false);
    setResults([]);
    let resolved = place;
    if (place.lat === null && place.placeId) {
      const details = await Effect.runPromise(
        Effect.tryPromise({
          try: async () => {
            const response = await fetch(
              `/api/places?placeId=${encodeURIComponent(place.placeId ?? "")}`,
            );
            return (await response.json()) as { place?: SelectedPlace };
          },
          catch: () => ({}) as { place?: SelectedPlace },
        }),
      );
      if (details.place) {
        resolved = details.place;
      }
    }
    onChange({ text: resolved.label, place: resolved });
    selectingRef.current = false;
  }

  return (
    <div className="relative" ref={containerRef}>
      <TextInput
        description="Type an address or place, then pick a suggestion."
        isRequired
        label="Location"
        size="lg"
        onChange={(text) => {
          selectingRef.current = false;
          onChange({ text, place: null });
        }}
        placeholder="Parc de Bercy, Paris"
        value={value.text}
      />
      <div className="mt-2 flex flex-wrap items-center gap-2">
        <Button
          isLoading={locating}
          label={locating ? "Locating…" : "Use my location"}
          onClick={locateMe}
          size="sm"
          variant="ghost"
        />
        {value.place ? (
          <Button
            href={`https://www.google.com/maps/search/?api=1&query=${String(value.place.lat ?? "")},${String(value.place.lon ?? "")}`}
            label="Open in Maps"
            rel="noopener noreferrer"
            size="sm"
            target="_blank"
            variant="ghost"
          />
        ) : null}
      </div>
      {value.place?.lat !== null && value.place?.lat !== undefined ? (
        <div className="border-border mt-2 overflow-hidden rounded-xl border">
          {/* Google's embed keeps pan and zoom without shipping a map SDK. */}
          <iframe
            className="h-48 w-full"
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            src={`https://www.google.com/maps?q=${String(value.place.lat)},${String(value.place.lon)}&z=15&output=embed`}
            title="Selected location"
          />
        </div>
      ) : null}
      {open && (results.length > 0 || loading || missed) ? (
        <div
          className="border-border bg-body absolute z-40 mt-1 w-full overflow-hidden rounded-xl border shadow-lg"
          role="listbox"
        >
          {loading ? (
            <div className="text-secondary flex items-center gap-2 px-3 py-2.5 text-[12px]">
              <Spinner aria-label="Searching places" size="sm" /> Searching…
            </div>
          ) : null}
          {!loading && results.length === 0 && missed ? (
            <p className="text-secondary px-3 py-2.5 text-[12px]" role="status">
              No place matched yet — keep typing, or tap “Use my location”.
            </p>
          ) : null}
          {results.map((place) => (
            <button
              className="hover:bg-surface text-primary block w-full px-3 py-2.5 text-left text-[12.5px]"
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
