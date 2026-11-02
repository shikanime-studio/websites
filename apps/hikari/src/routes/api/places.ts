import { createFileRoute } from "@tanstack/react-router";
import { env } from "cloudflare:workers";
import { z } from "zod";

interface Place {
  label: string;
  lat: number | null;
  lon: number | null;
  placeId?: string;
}

const NOMINATIM = "https://nominatim.openstreetmap.org/search";
const NOMINATIM_REVERSE = "https://nominatim.openstreetmap.org/reverse";
const COORDINATES = /^-?\d+(\.\d+)?,-?\d+(\.\d+)?$/;
const GOOGLE_AUTOCOMPLETE = "https://places.googleapis.com/v1/places:autocomplete";
const GOOGLE_DETAILS = "https://places.googleapis.com/v1/places";

/** Google Places when a key exists, OpenStreetMap otherwise. */
async function googleAutocomplete(
  query: string,
  key: string,
): Promise<Place[]> {
  const response = await fetch(GOOGLE_AUTOCOMPLETE, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "X-Goog-Api-Key": key,
      "X-Goog-FieldMask":
        "suggestions.placePrediction.placeId,suggestions.placePrediction.text.text",
    },
    body: JSON.stringify({ input: query, languageCode: "en" }),
  });
  if (!response.ok) {
    return [];
  }
  const body = (await response.json()) as {
    suggestions?: Array<{
      placePrediction?: { placeId?: string; text?: { text?: string } };
    }>;
  };
  return (body.suggestions ?? []).flatMap((item) => {
    const text = item.placePrediction?.text?.text;
    const placeId = item.placePrediction?.placeId;
    return text ? [{ label: text, lat: null, lon: null, ...(placeId ? { placeId } : {}) }] : [];
  });
}

async function googleDetails(placeId: string, key: string): Promise<Place | null> {
  const response = await fetch(
    `${GOOGLE_DETAILS}/${encodeURIComponent(placeId)}?fields=formattedAddress,location`,
    { headers: { "X-Goog-Api-Key": key } },
  );
  if (!response.ok) {
    return null;
  }
  const body = (await response.json()) as {
    formattedAddress?: string;
    location?: { latitude?: number; longitude?: number };
  };
  if (!body.formattedAddress) {
    return null;
  }
  return {
    label: body.formattedAddress,
    lat: body.location?.latitude ?? null,
    lon: body.location?.longitude ?? null,
    placeId,
  };
}

async function nominatim(query: string): Promise<Place[]> {
  const url = new URL(NOMINATIM);
  url.searchParams.set("format", "jsonv2");
  url.searchParams.set("q", query);
  url.searchParams.set("limit", "6");
  url.searchParams.set("addressdetails", "0");
  const response = await fetch(url, {
    headers: {
      "User-Agent": "Hikari/1.0 (https://hikari.shikanime.studio)",
      "Accept-Language": "en",
    },
  });
  if (!response.ok) {
    return [];
  }
  const rows = (await response.json()) as Array<{
    display_name?: string;
    lat?: string;
    lon?: string;
    place_id?: number;
  }>;
  return rows.flatMap((row) =>
    row.display_name
      ? [
        {
          label: row.display_name,
          lat: row.lat ? Number(row.lat) : null,
          lon: row.lon ? Number(row.lon) : null,
          ...(row.place_id ? { placeId: String(row.place_id) } : {}),
        },
      ]
      : [],
  );
}

/** "Where am I?" — the browser knows the coordinates, this gives them a name. */
async function reverseNominatim(lat: number, lon: number): Promise<Place | null> {
  const url = new URL(NOMINATIM_REVERSE);
  url.searchParams.set("format", "jsonv2");
  url.searchParams.set("lat", String(lat));
  url.searchParams.set("lon", String(lon));
  url.searchParams.set("zoom", "16");
  const response = await fetch(url, {
    headers: {
      "User-Agent": "Hikari/1.0 (https://hikari.shikanime.studio)",
      "Accept-Language": "en",
    },
  });
  if (!response.ok) return null;
  const body = (await response.json()) as { display_name?: string };
  return body.display_name
    ? { label: body.display_name, lat, lon }
    : null;
}

async function reverseGoogle(
  lat: number,
  lon: number,
  key: string,
): Promise<Place | null> {
  const url = new URL("https://maps.googleapis.com/maps/api/geocode/json");
  url.searchParams.set("latlng", `${String(lat)},${String(lon)}`);
  url.searchParams.set("key", key);
  const response = await fetch(url);
  if (!response.ok) return null;
  const body = (await response.json()) as {
    results?: Array<{ formatted_address?: string }>;
  };
  const label = body.results?.[0]?.formatted_address;
  return label ? { label, lat, lon } : null;
}

export const Route = createFileRoute("/api/places")({
  server: {
    handlers: {
      GET: async ({ request }: { request: Request }) => {
        const url = new URL(request.url);
        const key = (env as { GOOGLE_MAPS_API_KEY?: string }).GOOGLE_MAPS_API_KEY;
        const reverse = url.searchParams.get("reverse");
        if (reverse) {
          const parsed = z
            .string()
            .regex(COORDINATES)
            .safeParse(reverse);
          if (!parsed.success) {
            return Response.json({ place: null }, { status: 400 });
          }
          const [lat, lon] = parsed.data.split(",").map(Number) as [number, number];
          const place = key
            ? await reverseGoogle(lat, lon, key)
            : await reverseNominatim(lat, lon);
          return Response.json({ place });
        }
        const placeId = url.searchParams.get("placeId");
        if (placeId) {
          if (!key) {
            return Response.json({ place: null }, { status: 404 });
          }
          return Response.json({ place: await googleDetails(placeId, key) });
        }
        const parsed = z
          .string()
          .trim()
          .min(3)
          .max(120)
          .safeParse(url.searchParams.get("q") ?? "");
        if (!parsed.success) {
          return Response.json({ places: [] });
        }
        const places = key
          ? await googleAutocomplete(parsed.data, key)
          : await nominatim(parsed.data);
        return Response.json(
          { places },
          { headers: { "cache-control": "public, max-age=60" } },
        );
      },
    },
  },
});
