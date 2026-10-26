import type { CommissionRole } from "../schema";

export const COMMISSION_ROLES: CommissionRole[] = [
  "photographer",
  "cosplayer",
  "assistant",
];

export const ROLE_LABELS: Record<CommissionRole, string> = {
  photographer: "Photographer",
  cosplayer: "Cosplayer",
  assistant: "Assistant",
};

const NAME_MAX = 80;

export interface CastEntry {
  role: CommissionRole;
  name: string;
}

/** Trim, drop blanks and duplicates, cap the list — the same rules the server
 *  applies, so the form can show exactly what will be stored. */
export function normalizeCast(entries: CastEntry[]): CastEntry[] {
  const seen = new Set<string>();
  const out: CastEntry[] = [];
  for (const entry of entries) {
    const name = entry.name.trim().slice(0, NAME_MAX);
    if (name.length === 0) continue;
    const key = `${entry.role}:${name.toLowerCase()}`;
    if (seen.has(key)) continue;
    seen.add(key);
    out.push({ role: entry.role, name });
    if (out.length >= 12) break;
  }
  return out;
}

export interface CharacterEntry {
  name: string;
  series: string;
}

/** "Hu Tao — Genshin Impact" typed by hand still becomes a usable pair. */
export function normalizeCharacters(entries: CharacterEntry[]): CharacterEntry[] {
  const seen = new Set<string>();
  const out: CharacterEntry[] = [];
  for (const entry of entries) {
    const name = entry.name.trim().slice(0, NAME_MAX);
    if (name.length === 0) continue;
    const series = entry.series.trim().slice(0, NAME_MAX);
    const key = `${series.toLowerCase()}:${name.toLowerCase()}`;
    if (seen.has(key)) continue;
    seen.add(key);
    out.push({ name, series });
    if (out.length >= 8) break;
  }
  return out;
}

/** Splits "Character — Series" or "Character (Series)" into its two parts. */
export function parseCharacterInput(raw: string): CharacterEntry | null {
  const value = raw.trim();
  if (value.length === 0) return null;
  const emDash = value.indexOf(" — ");
  if (emDash > 0) {
    return {
      name: value.slice(0, emDash).trim(),
      series: value.slice(emDash + 3).trim(),
    };
  }
  const open = value.lastIndexOf("(");
  if (open > 0 && value.endsWith(")")) {
    const name = value.slice(0, open).trim();
    const series = value.slice(open + 1, -1).trim();
    if (name.length > 0 && series.length > 0) {
      return { name, series };
    }
  }
  return { name: value, series: "" };
}

const INVITE_TOKEN_PATTERN = /^[a-f0-9]{32}$/;

export function createInviteToken(): string {
  const bytes = crypto.getRandomValues(new Uint8Array(16));
  return Array.from(bytes, (byte) => byte.toString(16).padStart(2, "0")).join(
    "",
  );
}

export function isInviteToken(value: string): boolean {
  return INVITE_TOKEN_PATTERN.test(value);
}

/** The recap page doubles as the acceptance page: one link, one role. */
export function inviteUrl(shareToken: string, inviteToken: string): string {
  return `/s/${shareToken}?invite=${inviteToken}`;
}

export interface InviteState {
  revokedAt: Date | null;
  expiresAt: Date | null;
}

/** A link is usable when it was not revoked and has not expired. */
export function isInviteUsable(invite: InviteState, now = new Date()): boolean {
  if (invite.revokedAt) return false;
  if (invite.expiresAt && invite.expiresAt.getTime() <= now.getTime()) {
    return false;
  }
  return true;
}
