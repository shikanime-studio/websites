import {
  createCollection,
  localStorageCollectionOptions,
} from '@tanstack/react-db'
import { z } from 'zod'

export const settingsSchema = z.object({
  id: z.literal('ui'),
  theme: z.enum(['dark', 'light']).optional(),
  sidebarCollapsed: z.boolean().optional(),
  filmstripCollapsed: z.boolean().optional(),
  sidebarSectionCollapsedInfo: z.boolean().optional(),
  sidebarSectionCollapsedLighting: z.boolean().optional(),
  sidebarSectionCollapsedCamera: z.boolean().optional(),
  sidebarSectionCollapsedGroupedFiles: z.boolean().optional(),
})

export type Settings = z.infer<typeof settingsSchema>
export type Theme = NonNullable<Settings['theme']>

export const keymapSchema = z.discriminatedUnion('command', [
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

export type Keymap = z.infer<typeof keymapSchema>
export type Command = Keymap['command']

export const lightingEditsSchema = z.object({
  exposure: z.number().default(0),
  contrast: z.number().default(1),
  saturation: z.number().default(1),
  highlights: z.number().default(0),
  shadows: z.number().default(0),
  whites: z.number().default(0),
  blacks: z.number().default(0),
  tint: z.number().default(0),
  temperature: z.number().default(0),
  vibrance: z.number().default(0),
  hue: z.number().default(0),
})

export const lightingDefaults = lightingEditsSchema.parse({})

export type LightingEdits = z.infer<typeof lightingEditsSchema>

export const exifTagRecordSchema = z.object({
  tagId: z.number(),
  value: z.union([z.string(), z.number()]),
})

export type ExifTagRecord = z.infer<typeof exifTagRecordSchema>

export const histogramBinsSchema = z.object({
  r: z.array(z.number()),
  g: z.array(z.number()),
  b: z.array(z.number()),
})

export type HistogramBins = z.infer<typeof histogramBinsSchema>

export const imageInfoSchema = z.object({
  width: z.number(),
  height: z.number(),
  histogram: histogramBinsSchema.optional(),
})

export type ImageInfo = z.infer<typeof imageInfoSchema>

export const projectBaseSchema = z
  .object({
    id: z.string().min(1),
    path: z.string().optional(),
    createdAt: z.iso.datetime().default(() => new Date().toISOString()),
    updatedAt: z.iso.datetime().default(() => new Date().toISOString()),
    autoSavedAt: z.iso.datetime().optional(),
    autoSavedSignature: z.string().optional(),
    autoSavedSidecarName: z.string().optional(),
  })
  .transform(v => ({ ...v, path: v.path ?? v.id }))

export type ProjectBase = z.infer<typeof projectBaseSchema>

export const projectLightingSchema = z
  .object({ id: z.string().min(1) })
  .extend(lightingEditsSchema.shape)

export type ProjectLighting = z.infer<typeof projectLightingSchema>

export const projectExifSchema = z.object({
  id: z.string().min(1),
  exifTags: z.array(exifTagRecordSchema).default([]),
})

export type ProjectExif = z.infer<typeof projectExifSchema>

export const projectImageInfoSchema = z
  .object({ id: z.string().min(1) })
  .extend(imageInfoSchema.shape)

export type ProjectImageInfo = z.infer<typeof projectImageInfoSchema>

export interface ProjectSnapshot {
  id: string
  lighting?: LightingEdits
  exifTags?: Array<ExifTagRecord>
  imageInfo?: ImageInfo
}

export const keymapsCollection = createCollection(
  localStorageCollectionOptions({
    getKey: item => item.command,
    id: 'fade-keymaps',
    schema: keymapSchema,
    storageKey: 'fade-keymaps',
  }),
)

export const settingsCollection = createCollection(
  localStorageCollectionOptions({
    getKey: item => item.id,
    id: 'fade-settings',
    schema: settingsSchema,
    storageKey: 'fade-settings',
  }),
)

export const projectsCollection = createCollection(
  localStorageCollectionOptions({
    getKey: item => item.id,
    id: 'fade-projects',
    schema: projectBaseSchema,
    storageKey: 'fade-projects-v2',
  }),
)

export const projectLightingCollection = createCollection(
  localStorageCollectionOptions({
    getKey: item => item.id,
    id: 'fade-project-lighting',
    schema: projectLightingSchema,
    storageKey: 'fade-project-lighting-v1',
  }),
)

export const projectExifCollection = createCollection(
  localStorageCollectionOptions({
    getKey: item => item.id,
    id: 'fade-project-exif',
    schema: projectExifSchema,
    storageKey: 'fade-project-exif-v1',
  }),
)

export const projectImageInfoCollection = createCollection(
  localStorageCollectionOptions({
    getKey: item => item.id,
    id: 'fade-project-image-info',
    schema: projectImageInfoSchema,
    storageKey: 'fade-project-image-info-v1',
  }),
)
