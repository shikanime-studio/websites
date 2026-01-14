import {
  createCollection,
  localStorageCollectionOptions,
} from "@tanstack/react-db";
import { z } from "zod";

export const setting = z.discriminatedUnion("id", [
  z.object({
    id: z.literal("theme"),
    value: z.enum(["dark", "light"]),
  }),
  z.object({
    id: z.literal("sidebarCollapsed"),
    value: z.boolean(),
  }),
  z.object({
    id: z.literal("filmstripCollapsed"),
    value: z.boolean(),
  }),
  z.object({
    id: z.literal("sidebarSectionCollapsedInfo"),
    value: z.boolean(),
  }),
  z.object({
    id: z.literal("sidebarSectionCollapsedLighting"),
    value: z.boolean(),
  }),
  z.object({
    id: z.literal("sidebarSectionCollapsedCamera"),
    value: z.boolean(),
  }),
  z.object({
    id: z.literal("sidebarSectionCollapsedGroupedFiles"),
    value: z.boolean(),
  }),
]);

export type Setting = z.infer<typeof setting>;
export type Theme = Extract<Setting, { id: "theme" }>["value"];

export const keymap = z.discriminatedUnion("command", [
  z.object({
    command: z.literal("navigateNext"),
    key: z.string().default("ArrowRight"),
  }),
  z.object({
    command: z.literal("navigatePrevious"),
    key: z.string().default("ArrowLeft"),
  }),
  z.object({
    command: z.literal("selectFirst"),
    key: z.string().default("Home"),
  }),
  z.object({
    command: z.literal("selectLast"),
    key: z.string().default("End"),
  }),
]);

export type Keymap = z.infer<typeof keymap>;
export type Command = Keymap["command"];

export const keymapsCollection = createCollection(
  localStorageCollectionOptions({
    getKey: (item) => item.command,
    id: "fade-keymaps",
    schema: keymap,
    storageKey: "fade-keymaps",
  }),
);

export const settingsCollection = createCollection(
  localStorageCollectionOptions({
    getKey: (item) => item.id,
    id: "fade-settings",
    schema: setting,
    storageKey: "fade-settings",
  }),
);
