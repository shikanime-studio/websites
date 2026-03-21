import type { ExifTagEntry } from '@shikanime-studio/medialab/exif'
import type { ExifTagRecord } from '../lib/db'
import type { FileItem } from '../lib/fs'
import { createImageDataView } from '@shikanime-studio/medialab/img'
import { createRafDataView } from '@shikanime-studio/medialab/raf'
import { eq, useLiveQuery } from '@tanstack/react-db'
import { use } from 'react'
import { projectExifCollection, projectsCollection } from '../lib/db'

const exifInFlight = new Set<string>()
const exifPromises = new Map<string, Promise<void>>()

function normalizeExifTags(tags: Array<ExifTagEntry>) {
  return tags
    .filter((t) => {
      const v = t.value
      return typeof v === 'string' || typeof v === 'number'
    })
    .map(t => ({
      tagId: t.tagId,
      value: t.value as string | number,
    }))
}

async function extractExifTags(fileItem: FileItem): Promise<Array<ExifTagRecord> | null> {
  const mimeType = fileItem.mimeType
  if (!mimeType || mimeType === 'video/mp4')
    return null

  if (mimeType === 'image/x-fujifilm-raf') {
    const raf = await createRafDataView(fileItem)
    const jpeg = raf?.getJpegImage()
    const exifView = jpeg?.getExif()
    if (!exifView)
      return []
    return normalizeExifTags(exifView.getTagEntries())
  }

  if (!mimeType.startsWith('image/'))
    return null

  const image = await createImageDataView(fileItem)
  const exifView = image?.getExif()
  if (!exifView)
    return []
  return normalizeExifTags(exifView.getTagEntries())
}

export function ensureExifInDb(fileItem: FileItem | null): Promise<void> {
  if (!fileItem)
    return Promise.resolve()
  if (typeof window === 'undefined')
    return Promise.resolve()

  const fileName = fileItem.handle.name
  if (!fileName)
    return Promise.resolve()

  const mimeType = fileItem.mimeType
  if (!mimeType || mimeType === 'video/mp4')
    return Promise.resolve()

  if (mimeType !== 'image/x-fujifilm-raf' && !mimeType.startsWith('image/'))
    return Promise.resolve()

  const existing = exifPromises.get(fileName)
  if (existing)
    return existing

  const p = (async () => {
    if (exifInFlight.has(fileName))
      return

    try {
      try {
        projectExifCollection.update(fileName, (draft) => {
          void draft.exifTags
        })
        return
      }
      catch {
      }

      exifInFlight.add(fileName)
      const exifTags = await extractExifTags(fileItem)
      if (!exifTags)
        return

      try {
        projectsCollection.update(fileName, (draft) => {
          draft.path = draft.path ?? fileName
        })
      }
      catch {
        projectsCollection.insert({
          id: fileName,
          path: fileName,
        })
      }
      try {
        projectExifCollection.update(fileName, (draft) => {
          draft.exifTags = exifTags
        })
      }
      catch {
        projectExifCollection.insert({
          id: fileName,
          exifTags,
        })
      }
    }
    finally {
      exifInFlight.delete(fileName)
      exifPromises.delete(fileName)
    }
  })()

  exifPromises.set(fileName, p)
  return p
}

export function useExif(fileItem: FileItem | null, enabled = true) {
  const fileName = fileItem?.handle.name ?? ''

  const { data: exifRow } = useLiveQuery(
    q =>
      q
        .from({ exif: projectExifCollection })
        .where(({ exif }) => eq(exif.id, fileName))
        .findOne(),
    [fileName],
  )

  const hasExif = Boolean(exifRow?.exifTags)
  const shouldParse = Boolean(enabled && fileItem && fileName && !hasExif)

  if (shouldParse)
    use(ensureExifInDb(fileItem))

  return { exifTags: exifRow?.exifTags ?? null }
}
