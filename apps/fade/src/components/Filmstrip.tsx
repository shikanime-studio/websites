import type { FileItem } from '../lib/fs'
import { eq, useLiveQuery } from '@tanstack/react-db'
import { Image } from '@unpic/react'
import { ChevronDown, ChevronUp } from 'lucide-react'
import { Activity, Suspense, useEffect, useRef } from 'react'
import { useGallery } from '../hooks/useGallery'
import { useThumbnail } from '../hooks/useThumbnail'
import { settingsCollection } from '../lib/db'
import { FileIcon } from './FileIcon'

export function Filmstrip() {
  const { files, selectedIndex, selectFile } = useGallery()
  const ref = useRef<HTMLDivElement>(null)

  const { data } = useLiveQuery(q =>
    q
      .from({ settings: settingsCollection })
      .where(({ settings }) => eq(settings.id, 'filmstripCollapsed'))
      .findOne(),
  )

  const isCollapsed = (data?.value as boolean) || false

  // Scroll selected thumbnail into view
  useEffect(() => {
    if (isCollapsed)
      return
    const container = ref.current
    if (!container)
      return
    const selected = container.querySelector<HTMLElement>('button[aria-current="true"]')
    selected?.scrollIntoView({
      behavior: 'smooth',
      block: 'nearest',
      inline: 'center',
    })
  }, [isCollapsed, selectedIndex])

  return (
    <div
      className={`bg-base-200 border-base-300 relative border-t transition-all duration-250 ${
        isCollapsed ? 'h-4' : 'h-30'
      }`}
    >
      <button
        className="btn btn-sm btn-square absolute -top-3 left-1/2 z-5 h-6 min-h-0 w-8 -translate-x-1/2 rounded-none rounded-t-md border-b-0"
        onClick={() => {
          if (data) {
            settingsCollection.update('filmstripCollapsed', (draft) => {
              draft.value = !isCollapsed
            })
          }
          else {
            settingsCollection.insert({
              id: 'filmstripCollapsed',
              value: !isCollapsed,
            })
          }
        }}
        aria-label={isCollapsed ? 'Expand filmstrip' : 'Collapse filmstrip'}
      >
        {isCollapsed
          ? (
              <ChevronUp className="h-4 w-4" />
            )
          : (
              <ChevronDown className="h-4 w-4" />
            )}
      </button>

      <Activity mode={isCollapsed ? 'hidden' : 'visible'}>
        <div
          className="scrollbar-thin h-full overflow-x-auto overflow-y-hidden"
          ref={ref}
        >
          {files.length === 0
            ? (
                <EmptyFilmstrip />
              )
            : (
                <div className="flex h-full items-center gap-2 px-4 py-4">
                  <FilmstripContent
                    files={files}
                    selectedIndex={selectedIndex}
                    onSelect={selectFile}
                  />
                </div>
              )}
        </div>
      </Activity>
    </div>
  )
}

function EmptyFilmstrip() {
  return (
    <div className="flex h-full items-center justify-center">
      <p className="m-0 text-sm opacity-50">Your files will appear here</p>
    </div>
  )
}

interface FilmstripContentProps {
  files: Array<FileItem>
  selectedIndex: number
  onSelect: (index: number) => void
}

function FilmstripContent({
  files,
  selectedIndex,
  onSelect,
}: FilmstripContentProps) {
  return (
    <>
      {files.map((fileItem, index) => {
        if (!fileItem)
          return null

        return (
          <FilmstripItem
            key={fileItem.handle.name}
            fileItem={fileItem}
            isSelected={index === selectedIndex}
            onClick={() => {
              onSelect(index)
            }}
          />
        )
      })}
    </>
  )
}

interface FilmstripItemProps {
  fileItem: FileItem
  isSelected: boolean
  onClick: () => void
}

function FilmstripItem(props: FilmstripItemProps) {
  return (
    <Suspense fallback={<FilmstripItemSkeleton {...props} />}>
      <FilmstripItemContent {...props} />
    </Suspense>
  )
}

function FilmstripItemSkeleton({
  fileItem,
  isSelected,
  onClick,
}: FilmstripItemProps) {
  const { handle } = fileItem
  return (
    <button
      className={`bg-base-300 hover:border-base-content/50 h-20 w-20 shrink-0 cursor-pointer overflow-hidden rounded-lg border-2 p-0 transition-all duration-150 hover:-translate-y-0.5 ${
        isSelected
          ? 'border-warning -translate-y-1 shadow-[0_0_15px_rgba(250,189,0,0.4)]'
          : 'border-transparent'
      }`}
      onClick={onClick}
      aria-label={`Select ${handle.name}`}
      aria-current={isSelected ? 'true' : 'false'}
    >
      <div className="flex h-full w-full items-center justify-center">
        <span className="loading loading-spinner loading-md opacity-50"></span>
      </div>
    </button>
  )
}

function FilmstripItemContent({
  fileItem,
  isSelected,
  onClick,
}: FilmstripItemProps) {
  const { handle } = fileItem
  const { data: url } = useThumbnail(fileItem, 80, 80)

  return (
    <button
      className={`bg-base-300 hover:border-base-content/50 h-20 w-20 shrink-0 cursor-pointer overflow-hidden rounded-lg border-2 p-0 transition-all duration-150 hover:-translate-y-0.5 ${
        isSelected
          ? 'border-warning -translate-y-1 shadow-[0_0_15px_rgba(250,189,0,0.4)]'
          : 'border-transparent'
      }`}
      onClick={onClick}
      aria-label={`Select ${handle.name}`}
      aria-current={isSelected ? 'true' : 'false'}
    >
      {url && fileItem?.mimeType?.startsWith('image/')
        ? (
            <Image
              src={url}
              alt={handle.name}
              className="h-full w-full object-cover"
              layout="constrained"
              width={80}
              height={80}
              background="auto"
            />
          )
        : (
            <div className="flex h-full w-full items-center justify-center">
              <FileIcon type={fileItem?.mimeType} className="h-8 w-8 opacity-50" />
            </div>
          )}
      <div
        className={`pointer-events-none absolute inset-0 ${
          isSelected
            ? 'from-warning/20 bg-linear-to-t to-transparent'
            : 'bg-linear-to-t from-black/30 to-transparent'
        }`}
      />
    </button>
  )
}
