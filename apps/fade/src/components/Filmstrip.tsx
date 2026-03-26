import type { FileItem } from '../lib/fs'
import { eq, useLiveQuery } from '@tanstack/react-db'
import { useVirtualizer } from '@tanstack/react-virtual'
import { Image } from '@unpic/react'
import { ChevronDown, ChevronUp } from 'lucide-react'
import { Activity, Suspense, useEffect, useRef } from 'react'
import { useElementSize } from '../hooks/useElementSize'
import { useGallery } from '../hooks/useGallery'
import { useThumbnail } from '../hooks/useThumbnail'
import { settingsCollection } from '../lib/db'
import { FileIcon } from './FileIcon'

export function Filmstrip() {
  const {
    files,
    selectedIndex,
    selectFile,
    fetchMore,
    hasMore,
    isFetchingMore,
  } = useGallery()
  const ref = useRef<HTMLDivElement>(null)
  const { width } = useElementSize(ref)

  const { data } = useLiveQuery(q =>
    q
      .from({ settings: settingsCollection })
      .where(({ settings }) => eq(settings.id, 'filmstripCollapsed'))
      .findOne(),
  )

  const isCollapsed = (data?.value as boolean) || false

  // eslint-disable-next-line react-hooks/incompatible-library
  const virtualizer = useVirtualizer({
    horizontal: true,
    count: files.length,
    getScrollElement: () => ref.current,
    estimateSize: () => 88,
    overscan: width > 0 ? Math.ceil(width / 88) : 5,
  })

  useEffect(() => {
    const items = virtualizer.getVirtualItems()
    const last = items.at(-1)
    if (!last)
      return

    if (hasMore && !isFetchingMore && last.index >= files.length - 10) {
      fetchMore()
    }
  }, [fetchMore, files.length, hasMore, isFetchingMore, virtualizer])

  useEffect(() => {
    if (isCollapsed)
      return
    virtualizer.scrollToIndex(selectedIndex, {
      align: 'center',
      behavior: 'smooth',
    })
  }, [isCollapsed, selectedIndex, virtualizer])

  const virtualItems = virtualizer.getVirtualItems()

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
                <div
                  className="relative h-full w-full px-4 py-4"
                  style={{
                    width: `${virtualizer.getTotalSize().toString()}px`,
                  }}
                >
                  <FilmstripContent
                    files={files}
                    virtualItems={virtualItems}
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
  virtualItems: ReturnType<ReturnType<typeof useVirtualizer>['getVirtualItems']>
  selectedIndex: number
  onSelect: (index: number) => void
}

function FilmstripContent({
  files,
  virtualItems,
  selectedIndex,
  onSelect,
}: FilmstripContentProps) {
  return (
    <>
      {virtualItems.map((virtualItem) => {
        const index = virtualItem.index
        const fileItem = files[index]
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
            style={{
              transform: `translateX(${virtualItem.start.toString()}px)`,
              width: '80px',
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
  style: React.CSSProperties
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
  style,
}: FilmstripItemProps) {
  const { handle } = fileItem
  return (
    <button
      className={`bg-base-300 hover:border-base-content/50 absolute top-4 left-0 h-20 w-20 cursor-pointer overflow-hidden rounded-lg border-2 p-0 transition-all duration-150 hover:-translate-y-0.5 ${
        isSelected
          ? 'border-warning -translate-y-1 shadow-[0_0_15px_rgba(250,189,0,0.4)]'
          : 'border-transparent'
      }`}
      style={style}
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
  style,
}: FilmstripItemProps) {
  const { handle } = fileItem
  const { data: url } = useThumbnail(fileItem, 80, 80)

  return (
    <button
      className={`bg-base-300 hover:border-base-content/50 absolute top-4 left-0 h-20 w-20 cursor-pointer overflow-hidden rounded-lg border-2 p-0 transition-all duration-150 hover:-translate-y-0.5 ${
        isSelected
          ? 'border-warning -translate-y-1 shadow-[0_0_15px_rgba(250,189,0,0.4)]'
          : 'border-transparent'
      }`}
      style={style}
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
              <FileIcon mimeType={fileItem?.mimeType} className="h-8 w-8 opacity-50" />
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
