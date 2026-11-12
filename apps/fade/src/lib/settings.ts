import { make, writable } from "effect/reactivity/Atom";
import { z } from "zod";

/** What fade remembers between sessions. */
export const themeSchema = z.enum(["dark", "light"]);
export type Theme = z.infer<typeof themeSchema>;

export const commandSchema = z.enum([
  "navigateNext",
  "navigatePrevious",
  "selectFirst",
  "selectLast",
]);
export type Command = z.infer<typeof commandSchema>;

/** Bindings before the user changes anything. */
export const DEFAULT_KEYMAP: Readonly<Record<Command, string>> = {
  navigateNext: "ArrowRight",
  navigatePrevious: "ArrowLeft",
  selectFirst: "Home",
  selectLast: "End",
};

export const settingsSchema = z.object({
  theme: themeSchema.optional(),
  sidebarCollapsed: z.boolean().optional(),
  filmstripCollapsed: z.boolean().optional(),
  sidebarSectionCollapsedInfo: z.boolean().optional(),
  sidebarSectionCollapsedLighting: z.boolean().optional(),
  sidebarSectionCollapsedCamera: z.boolean().optional(),
  sidebarSectionCollapsedGroupedFiles: z.boolean().optional(),
});

export type Settings = z.output<typeof settingsSchema>;
export type SettingId = keyof Settings;

/** The subset of settings holding booleans (panel collapse flags). */
export type BooleanSettingId = {
  [K in SettingId]: Settings[K] extends boolean | undefined ? K : never;
}[SettingId];

const keymapSchema = z.record(commandSchema, z.string());

const SETTINGS_KEY = "fade-settings";
const KEYMAPS_KEY = "fade-keymaps";

const storage = (): Storage | null =>
  typeof window === "undefined" ? null : window.localStorage;

/**
 * Earlier builds persisted through a collection library that wrapped every
 * entry as `{ versionKey, data }`. Read that shape once so existing choices
 * survive, and write the flat shape from now on.
 */
function legacyEntries(raw: unknown): Array<unknown> | null {
  if (typeof raw !== "object" || raw === null) return null;
  const values = Object.values(raw as Record<string, unknown>);
  if (values.length === 0) return null;
  const wrapped = values.every(
    (entry) =>
      typeof entry === "object"
      && entry !== null
      && "versionKey" in entry
      && "data" in entry,
  );
  return wrapped ? values.map((entry) => (entry as { data: unknown }).data) : null;
}

function readSettings(): Settings {
  const store = storage();
  if (!store) return {};
  try {
    const raw: unknown = JSON.parse(store.getItem(SETTINGS_KEY) ?? "null");
    const entries = legacyEntries(raw);
    if (!entries) {
      const parsed = settingsSchema.safeParse(raw ?? {});
      return parsed.success ? parsed.data : {};
    }
    // Legacy entries carry the id inside the payload: { id, value }.
    const merged: Record<string, unknown> = {};
    for (const entry of entries) {
      if (typeof entry === "object" && entry !== null && "id" in entry) {
        const { id, value } = entry as { id: string; value: unknown };
        merged[id] = value;
      }
    }
    const parsed = settingsSchema.safeParse(merged);
    return parsed.success ? parsed.data : {};
  } catch {
    return {};
  }
}

function readKeymaps(): Record<Command, string> {
  const store = storage();
  const fallback = { ...DEFAULT_KEYMAP };
  if (!store) return fallback;
  try {
    const raw: unknown = JSON.parse(store.getItem(KEYMAPS_KEY) ?? "null");
    const entries = legacyEntries(raw);
    let merged: Record<string, unknown> = {};
    if (entries) {
      for (const entry of entries) {
        if (typeof entry === "object" && entry !== null && "command" in entry) {
          const { command, key } = entry as { command: string; key: unknown };
          merged[command] = key;
        }
      }
    } else if (typeof raw === "object" && raw !== null) {
      merged = raw as Record<string, unknown>;
    }
    const parsed = keymapSchema.safeParse(merged);
    return parsed.success ? { ...fallback, ...parsed.data } : fallback;
  } catch {
    return fallback;
  }
}

function persist(key: string, value: unknown): void {
  const store = storage();
  if (!store) return;
  try {
    store.setItem(key, JSON.stringify(value));
  } catch {
    // Storage can be full or blocked; losing a preference is not worth a crash.
  }
}

export const settingsAtom = make<Settings>(readSettings());

export type SettingAction = {
  readonly [K in SettingId]: {
    readonly _tag: "set";
    readonly id: K;
    readonly value: Settings[K];
  };
}[SettingId];

/** Every setting write goes through here, so persistence cannot be skipped. */
export const settingActionAtom = writable(
  (get) => get(settingsAtom),
  (ctx, action: SettingAction) => {
    const next: Settings = { ...ctx.get(settingsAtom), [action.id]: action.value };
    persist(SETTINGS_KEY, next);
    ctx.set(settingsAtom, next);
  },
);

export const keymapsAtom = make<Record<Command, string>>(readKeymaps());

/** The binding for a command, falling back to the shipped default. */
export const keyFor = (
  keymaps: Record<Command, string>,
  command: Command,
): string => keymaps[command] ?? DEFAULT_KEYMAP[command];
