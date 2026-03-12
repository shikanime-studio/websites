import type { ExifTagEntry } from '../lib/exif'
import type { FileItem } from '../lib/fs'
import { eq, useLiveQuery } from '@tanstack/react-db'
import { useQuery } from '@tanstack/react-query'
import { useEffect } from 'react'
import { projectsCollection } from '../lib/db'
import { createImageDataView } from '../lib/image'
import { createRafDataView } from '../lib/raf'

function persistExif(
  fileName: string,
  tags: Array<ExifTagEntry>,
) {
  const exifTags = tags
    .filter((t) => {
      const v = t.value
      return typeof v === 'string' || typeof v === 'number'
    })
    .map(t => ({
      tagId: t.tagId,
      value: t.value as string | number,
    }))

  try {
    projectsCollection.update(fileName, (draft) => {
      draft.exifTags = exifTags
    })
  }
  catch {
    projectsCollection.insert({
      id: fileName,
      exifTags,
    })
  }
}

export function useExif(fileItem: FileItem | null) {
  const fileName = fileItem?.handle.name ?? null
  const mimeType = fileItem?.mimeType ?? null
  const projectId = fileName ?? ''

  const { data: project } = useLiveQuery(q =>
    q
      .from({ projects: projectsCollection })
      .where(({ projects }) => eq(projects.id, projectId))
      .findOne(),
  )

  const stored = project?.exifTags ?? null

  const needsParse = Boolean(fileItem && fileName && !stored)

  const { data } = useQuery<Array<ExifTagEntry> | null>({
    queryKey: ['exif', mimeType, fileName, fileItem],
    enabled: needsParse,
    queryFn: async () => {
      if (!fileItem || !mimeType || mimeType === 'video/mp4')
        return null

      if (mimeType === 'image/x-fujifilm-raf') {
        const raf = await createRafDataView(fileItem)
        const jpeg = raf?.getJpegImage()
        const exifView = jpeg?.getExif()
        if (!exifView)
          return null
        return exifView.getTagEntries()
      }

      const image = await createImageDataView(fileItem)
      const exifView = image?.getExif()
      if (!exifView)
        return null
      return exifView.getTagEntries()
    },
    staleTime: Infinity,
  })

  useEffect(() => {
    if (!fileName || !data)
      return
    persistExif(fileName, data)
  }, [data, fileName])

  return stored
}
