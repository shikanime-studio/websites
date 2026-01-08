import {
  createCollection,
  localStorageCollectionOptions,
} from "@tanstack/react-db";
import { z } from "zod";

export type Theme = "dark" | "light" | "system";

export const setting = z.object({
  id: z.string(),
  value: z.unknown(),
});

export const settingsCollection = createCollection(
  localStorageCollectionOptions({
    getKey: (item) => item.id,
    id: "fade-settings",
    schema: setting,
    storageKey: "fade-settings",
  }),
);
