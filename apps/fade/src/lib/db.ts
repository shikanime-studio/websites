import {
  createCollection,
  localStorageCollectionOptions,
} from '@tanstack/react-db'
import { z } from 'zod'

export const settings = z.object({
  id: z.literal('ui'),
  theme: z.enum(['dark', 'light']).optional(),
  sidebarCollapsed: z.boolean().optional(),
  filmstripCollapsed: z.boolean().optional(),
  sidebarSectionCollapsedInfo: z.boolean().optional(),
  sidebarSectionCollapsedLighting: z.boolean().optional(),
  sidebarSectionCollapsedCamera: z.boolean().optional(),
  sidebarSectionCollapsedGroupedFiles: z.boolean().optional(),
})

export type Settings = z.infer<typeof settings>
export type Theme = NonNullable<Settings['theme']>

export const keymap = z.discriminatedUnion('command', [
  z.object({
    command: z.literal('navigateNext'),
    key: z.string().default('ArrowRight'),
  }),
  z.object({
    command: z.literal('navigatePrevious'),
    key: z.string().default('ArrowLeft'),
  }),
  z.object({
    command: z.literal('selectFirst'),
    key: z.string().default('Home'),
  }),
  z.object({
    command: z.literal('selectLast'),
    key: z.string().default('End'),
  }),
])

export type Keymap = z.infer<typeof keymap>
export type Command = Keymap['command']

export const lightingDefaults = {
  exposure: 0,
  contrast: 1,
  saturation: 1,
  highlights: 0,
  shadows: 0,
  whites: 0,
  blacks: 0,
  tint: 0,
  temperature: 0,
  vibrance: 0,
  hue: 0,
}

export const lightingEdits = z.object({
  exposure: z.number().default(lightingDefaults.exposure),
  contrast: z.number().default(lightingDefaults.contrast),
  saturation: z.number().default(lightingDefaults.saturation),
  highlights: z.number().default(lightingDefaults.highlights),
  shadows: z.number().default(lightingDefaults.shadows),
  whites: z.number().default(lightingDefaults.whites),
  blacks: z.number().default(lightingDefaults.blacks),
  tint: z.number().default(lightingDefaults.tint),
  temperature: z.number().default(lightingDefaults.temperature),
  vibrance: z.number().default(lightingDefaults.vibrance),
  hue: z.number().default(lightingDefaults.hue),
})

export type LightingEdits = z.infer<typeof lightingEdits>

export const exifTagRecord = z.object({
  tagId: z.number(),
  value: z.union([z.string(), z.number()]),
})

export type ExifTagRecord = z.infer<typeof exifTagRecord>

export const histogramBins = z.object({
  r: z.array(z.number()),
  g: z.array(z.number()),
  b: z.array(z.number()),
})

export type HistogramBins = z.infer<typeof histogramBins>

export const imageInfo = z.object({
  width: z.number(),
  height: z.number(),
  histogram: histogramBins.optional(),
})

export type ImageInfo = z.infer<typeof imageInfo>

export const project = z.object({
  id: z.string(),
  lighting: lightingEdits.default(lightingDefaults),
  exifTags: z.array(exifTagRecord).optional(),
  imageInfo: imageInfo.optional(),
})

export type Project = z.infer<typeof project>

export const keymapsCollection = createCollection(
  localStorageCollectionOptions({
    getKey: item => item.command,
    id: 'fade-keymaps',
    schema: keymap,
    storageKey: 'fade-keymaps',
  }),
)

export const settingsCollection = createCollection(
  localStorageCollectionOptions({
    getKey: item => item.id,
    id: 'fade-settings',
    schema: settings,
    storageKey: 'fade-settings',
  }),
)

export const projectsCollection = createCollection(
  localStorageCollectionOptions({
    getKey: item => item.id,
    id: 'fade-projects',
    schema: project,
    storageKey: 'fade-projects',
  }),
)
