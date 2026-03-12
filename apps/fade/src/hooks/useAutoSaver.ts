import type { Project } from '../lib/db'
import type { FileItem } from '../lib/fs'
import {
  AsciiExifType,
  LittleEndianness,
  LongExifType,
  ShortExifType,
  TiffDataView,
  TiffMagicNumber,
} from '@shikanime-studio/medialab/tiff'
import { eq, useLiveQuery } from '@tanstack/react-db'
import { useQueryClient } from '@tanstack/react-query'
import { useEffect, useMemo, useRef } from 'react'
import { projectsCollection } from '../lib/db'
import { basenameWithoutExtension, ensureHandlePermission } from '../lib/fs'
import { useDebouncedCallback } from './useDebouncedCallback'
import { useDirectory } from './useDirectory'

export interface AutoSaveRenderOutput {
  width: number
  height: number
  rgba16: Uint16Array
}

function encodeRgba16Tiff({
  width,
  height,
  rgba16,
  project,
  signature,
  sourceFileName,
}: {
  width: number
  height: number
  rgba16: Uint16Array
  project: Project | undefined
  signature: string
  sourceFileName: string
}) {
  const bitsPerSample = [16, 16, 16, 16]

  const make = typeof project?.exifTags?.find(t => t.tagId === 0x010F)?.value === 'string'
    ? (project?.exifTags?.find(t => t.tagId === 0x010F)?.value as string)
    : undefined
  const model = typeof project?.exifTags?.find(t => t.tagId === 0x0110)?.value === 'string'
    ? (project?.exifTags?.find(t => t.tagId === 0x0110)?.value as string)
    : undefined

  const description = JSON.stringify({
    sourceFileName,
    signature,
    lighting: project?.lighting ?? null,
    imageInfo: project?.imageInfo ?? null,
    exifTags: project?.exifTags ?? null,
    savedAt: new Date().toISOString(),
  })

  const software = 'fade'

  const asciiTags: Array<{ tagId: number, value: string }> = [
    { tagId: 270, value: description },
    { tagId: 305, value: software },
  ]

  if (make)
    asciiTags.push({ tagId: 271, value: make })
  if (model)
    asciiTags.push({ tagId: 272, value: model })

  const baseEntryCount = 11
  const entryCount = baseEntryCount + asciiTags.length

  const ifdOffset = 8
  const ifdByteLength = 2 + entryCount * 12 + 4

  const align2 = (n: number) => (n % 2 === 0 ? n : n + 1)

  let dataOffset = align2(ifdOffset + ifdByteLength)
  const bitsPerSampleOffset = dataOffset
  dataOffset += bitsPerSample.length * 2

  const asciiInfo = asciiTags.map((t) => {
    const byteLength = t.value.length + 1
    const offset = dataOffset
    dataOffset = align2(dataOffset + byteLength)
    return { ...t, byteLength, offset }
  })

  const imageDataOffset = align2(dataOffset)
  const imageByteCount = rgba16.byteLength

  const buffer = new ArrayBuffer(imageDataOffset + imageByteCount)
  const view = new TiffDataView(buffer)

  view.setEndianness(LittleEndianness)
  view.setMagicNumber(TiffMagicNumber)
  view.setFirstIfdOffset(ifdOffset)

  view.setIfdEntryCount(ifdOffset, entryCount, true)

  let entryIndex = 0
  view.setIfdEntry(ifdOffset, entryIndex++, 256, LongExifType, 1, width, true)
  view.setIfdEntry(ifdOffset, entryIndex++, 257, LongExifType, 1, height, true)
  view.setIfdEntry(ifdOffset, entryIndex++, 258, ShortExifType, 4, bitsPerSampleOffset, true)
  view.setIfdEntry(ifdOffset, entryIndex++, 259, ShortExifType, 1, 1, true)
  view.setIfdEntry(ifdOffset, entryIndex++, 262, ShortExifType, 1, 2, true)
  view.setIfdEntry(ifdOffset, entryIndex++, 273, LongExifType, 1, imageDataOffset, true)
  view.setIfdEntry(ifdOffset, entryIndex++, 277, ShortExifType, 1, 4, true)
  view.setIfdEntry(ifdOffset, entryIndex++, 278, LongExifType, 1, height, true)
  view.setIfdEntry(ifdOffset, entryIndex++, 279, LongExifType, 1, imageByteCount, true)
  view.setIfdEntry(ifdOffset, entryIndex++, 284, ShortExifType, 1, 1, true)
  view.setIfdEntry(ifdOffset, entryIndex++, 338, ShortExifType, 1, 2, true)

  for (const t of asciiInfo) {
    view.setIfdEntry(ifdOffset, entryIndex++, t.tagId, AsciiExifType, t.byteLength, t.offset, true)
  }

  view.setIfdNextOffset(ifdOffset, entryCount, 0, true)
  view.setShortArray(bitsPerSampleOffset, bitsPerSample, true)
  for (const t of asciiInfo) {
    view.setAscii(t.offset, t.value, t.byteLength)
  }

  const isLE = new Uint8Array(new Uint16Array([1]).buffer)[0] === 1
  if (isLE) {
    new Uint16Array(buffer, imageDataOffset, rgba16.length).set(rgba16)
  }
  else {
    const dv = new DataView(buffer, imageDataOffset, imageByteCount)
    for (let i = 0; i < rgba16.length; i++) {
      dv.setUint16(i * 2, rgba16[i], true)
    }
  }

  return new Uint8Array(buffer)
}

export function useAutoSaver({
  fileItem,
  signature,
  shouldSave,
  getOutput,
  delayMs = 1000,
  maxWaitMs = 5000,
}: {
  fileItem: FileItem | null | undefined
  signature: string
  shouldSave: boolean
  getOutput: () => Promise<AutoSaveRenderOutput | null>
  delayMs?: number
  maxWaitMs?: number
}) {
  const { handle: directoryHandle } = useDirectory()
  const queryClient = useQueryClient()

  const lastSavedSignatureRef = useRef<string | null>(null)
  const lastFileNameRef = useRef<string | null>(null)
  const saveInFlightRef = useRef(false)
  const saveQueuedRef = useRef(false)
  const outputNullRetryCountRef = useRef(0)

  const fileName = fileItem?.handle.name ?? null

  const { data: project } = useLiveQuery(q =>
    q
      .from({ projects: projectsCollection })
      .where(({ projects }) => eq(projects.id, fileName ?? ''))
      .findOne(),
  )

  const sidecarName = useMemo(() => {
    if (!fileName)
      return null
    const lower = fileName.toLowerCase()
    if (lower.endsWith('.tif') || lower.endsWith('.tiff'))
      return null
    return `${basenameWithoutExtension(fileName)}.tif`
  }, [fileName])

  const saveNow = useDebouncedCallback(
    async () => {
      if (!directoryHandle || !fileItem || !sidecarName || !shouldSave)
        return
      if (saveInFlightRef.current) {
        saveQueuedRef.current = true
        return
      }

      if (!(await ensureHandlePermission(directoryHandle, 'readwrite')))
        return

      saveInFlightRef.current = true
      try {
        const output = await getOutput()
        if (!output) {
          if (outputNullRetryCountRef.current < 5) {
            outputNullRetryCountRef.current += 1
            saveQueuedRef.current = true
          }
          return
        }

        const tiffBytes = encodeRgba16Tiff({
          width: output.width,
          height: output.height,
          rgba16: output.rgba16,
          project,
          signature,
          sourceFileName: fileName ?? fileItem.handle.name,
        })
        const blob = new Blob([tiffBytes], { type: 'image/tiff' })

        const outHandle = await directoryHandle.getFileHandle(sidecarName, {
          create: true,
        })
        const writable = await outHandle.createWritable()
        await writable.write(blob)
        await writable.close()

        lastSavedSignatureRef.current = signature
        lastFileNameRef.current = fileName
        outputNullRetryCountRef.current = 0

        void queryClient.invalidateQueries({
          queryKey: ['gallery', directoryHandle.name],
        })
      }
      finally {
        saveInFlightRef.current = false
        if (saveQueuedRef.current) {
          saveQueuedRef.current = false
          saveNow.debounced()
        }
      }
    },
    { delayMs, maxWaitMs },
  )

  useEffect(() => {
    if (fileName !== lastFileNameRef.current) {
      lastSavedSignatureRef.current = null
      lastFileNameRef.current = fileName
      outputNullRetryCountRef.current = 0
      saveNow.cancel()
    }
  }, [fileName, saveNow])

  useEffect(() => {
    if (!shouldSave || !sidecarName || !fileItem)
      return
    if (signature === lastSavedSignatureRef.current)
      return
    outputNullRetryCountRef.current = 0
    saveNow.debounced()
  }, [fileItem, saveNow, shouldSave, signature, sidecarName])

  return {
    flush: saveNow.flush,
    cancel: saveNow.cancel,
  }
}
