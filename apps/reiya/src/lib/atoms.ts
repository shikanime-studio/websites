import type { CardData } from "./api-client";
import { Data, Effect, Schema } from "effect";
import { make } from "effect/reactivity/Atom";
import {
  fetchArtists,
  fetchCharacters,
  fetchEvents,
  fetchMerchs,
  fetchShowcases,
} from "./api-client";

export class CardFetchError extends Data.TaggedError("CardFetchError")<{
  cause: unknown;
}> {}

const cards = (
  fetcher: () => Promise<Array<CardData>>,
): Effect.Effect<Array<CardData>, CardFetchError> =>
  Effect.tryPromise({
    try: () => fetcher(),
    catch: (cause) => new CardFetchError({ cause }),
  });

export const merchsAtom = make(cards(fetchMerchs));
export const artistsAtom = make(cards(fetchArtists));
export const eventsAtom = make(cards(fetchEvents));
export const charactersAtom = make(cards(fetchCharacters));
export const showcasesAtom = make(cards(fetchShowcases));

const SessionResponseSchema = Schema.NullOr(
  Schema.Struct({
    user: Schema.optional(
      Schema.Struct({
        name: Schema.String,
        image: Schema.NullOr(Schema.optional(Schema.String)),
        email: Schema.optional(Schema.String),
      }),
    ),
  }),
);

export type SessionResponse = (typeof SessionResponseSchema)["Type"];

const fetchSession = Effect.tryPromise({
  try: (signal) =>
    fetch("/api/auth/get-session", { signal }).then(async (res) => {
      if (!res.ok) return null;
      const body: unknown = await res.json();
      return Schema.decodeUnknownSync(SessionResponseSchema)(body);
    }),
  catch: () => new CardFetchError({ cause: "session fetch failed" }),
});

export const sessionAtom = make(fetchSession);
