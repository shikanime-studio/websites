import type { StudioUser } from "./studio-session";
import { Effect, Schema } from "effect";
import { make } from "effect/reactivity/Atom";

const SessionResponseSchema = Schema.Struct({
  user: Schema.NullOr(
    Schema.Struct({
      id: Schema.String,
      name: Schema.String,
      email: Schema.String,
      image: Schema.NullOr(Schema.String),
    }),
  ),
});

const fetchStudioSession = Effect.tryPromise({
  try: (signal) =>
    fetch("/api/studio/session", { signal }).then(async (response) => {
      if (!response.ok) return null;
      const body: unknown = await response.json();
      return Schema.decodeUnknownSync(SessionResponseSchema)(body).user;
    }),
  catch: () => null,
});

/** The signed-in studio identity, or null when Fade is used anonymously. */
export const studioSessionAtom = make(fetchStudioSession);

export async function signOutOfStudio(): Promise<void> {
  await fetch("/api/studio/logout", { method: "POST" });
  window.location.reload();
}

export function signInWithStudio(): void {
  window.location.href = "/api/studio/login";
}

/** Splits a display name into the two letters shown when there is no avatar. */
const NAME_SEPARATORS = /[\s@.]+/;

export function studioInitials(user: StudioUser): string {
  const source = user.name.trim().length > 0 ? user.name : user.email;
  return source
    .split(NAME_SEPARATORS)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}
