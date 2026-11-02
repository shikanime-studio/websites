/**
 * Fade has no database: the editor works on local files, so the studio
 * identity is a signed cookie rather than a server session row.
 *
 * The cookie is `<base64url(claims)>.<hmac>`; the HMAC key is a Worker secret,
 * so a forged cookie cannot be minted by the browser.
 */
export interface StudioUser {
  id: string;
  name: string;
  email: string;
  image: string | null;
}

const encoder = new TextEncoder();

function base64url(bytes: Uint8Array): string {
  let binary = "";
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary).replaceAll("+", "-").replaceAll("/", "_").replaceAll("=", "");
}

function fromBase64url(value: string): Uint8Array | null {
  try {
    const padded = value.replaceAll("-", "+").replaceAll("_", "/");
    const binary = atob(padded.padEnd(Math.ceil(padded.length / 4) * 4, "="));
    return Uint8Array.from(binary, (char) => char.charCodeAt(0));
  } catch {
    return null;
  }
}

async function hmac(secret: string, payload: string): Promise<string> {
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const signature = await crypto.subtle.sign("HMAC", key, encoder.encode(payload));
  return base64url(new Uint8Array(signature));
}

export async function signSession(
  secret: string,
  user: StudioUser,
): Promise<string> {
  const payload = base64url(encoder.encode(JSON.stringify(user)));
  return `${payload}.${await hmac(secret, payload)}`;
}

export async function readSession(
  secret: string,
  cookie: string | undefined,
): Promise<StudioUser | null> {
  if (!cookie) return null;
  const [payload, signature] = cookie.split(".");
  if (!payload || !signature) return null;
  const expected = await hmac(secret, payload);
  // Constant-time-ish: compare lengths first, then every byte.
  if (expected.length !== signature.length) return null;
  let mismatch = 0;
  for (let index = 0; index < expected.length; index += 1) {
    mismatch |= expected.charCodeAt(index) ^ signature.charCodeAt(index);
  }
  if (mismatch !== 0) return null;
  const bytes = fromBase64url(payload);
  if (!bytes) return null;
  try {
    const parsed: unknown = JSON.parse(new TextDecoder().decode(bytes));
    if (typeof parsed !== "object" || parsed === null) return null;
    const record = parsed as Partial<StudioUser>;
    if (typeof record.id !== "string" || typeof record.email !== "string") {
      return null;
    }
    return {
      id: record.id,
      email: record.email,
      name: typeof record.name === "string" ? record.name : record.email,
      image: typeof record.image === "string" ? record.image : null,
    };
  } catch {
    return null;
  }
}
