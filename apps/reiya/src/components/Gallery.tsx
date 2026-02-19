import type { ReactNode } from 'react'
import type { CardData } from '../lib/api-client'
import { useQuery } from '@tanstack/react-query'
import { Image } from '@unpic/react'
import { Activity, useState } from 'react'
import {
  Card,
  CardBookmark,
  CardCarousel,
  CardInfo,
  CardShowcaseCarousel,
  CardStatus,
} from './Card'
import { CardModal } from './CardModal'
import { EmptyState } from './EmptyState'
import { SkeletonCard } from './SkeletonCard'

interface GalleryProps {
  children?: ReactNode
}

export function Gallery({ children }: GalleryProps) {
  return (
    <div className="columns-1 gap-3 sm:columns-2 lg:columns-4">{children}</div>
  )
}

interface GalleryItemProps {
  children: ReactNode
}

export function GalleryItem({ children }: GalleryItemProps) {
  return <div className="mb-4 break-inside-avoid">{children}</div>
}

interface GalleryContentProps {
  queryKey: Array<string>
  queryFn: () => Promise<Array<CardData>>
  staleTime?: number
  variant?: 'default' | 'showcase'
}

export function GalleryContent({
  queryKey,
  queryFn,
  staleTime = 1000 * 60 * 5,
  variant = 'default',
}: GalleryContentProps) {
  const { data: items = [], isLoading } = useQuery({
    queryKey,
    queryFn,
    staleTime,
  })
  const [selectedCard, setSelectedCard] = useState<CardData | null>(null)

  const CardComponent
    = variant === 'showcase' ? CardShowcaseCarousel : CardCarousel

  return (
    <>
      <Activity mode={isLoading ? 'visible' : 'hidden'}>
        {Array.from({ length: 8 }).map(() => (
          <GalleryItem key={crypto.randomUUID()}>
            <SkeletonCard />
          </GalleryItem>
        ))}
      </Activity>
      <Activity mode={isLoading ? 'hidden' : 'visible'}>
        {items.length > 0
          ? (
              items.map(item => (
                <GalleryItem key={item.id}>
                  <Card>
                    <CardComponent
                      title={item.title}
                      href={item.href}
                      onClick={() => {
                        setSelectedCard(item)
                      }}
                      images={item.images.map((img, i) => (
                        <Image
                          key={img.src}
                          src={img.src}
                          alt={`${item.title} - image ${String(i + 1)}`}
                          width={img.width}
                          height={img.height}
                          layout="constrained"
                          className="h-full w-full object-contain"
                        />
                      ))}
                    >
                      <CardStatus status={item.status} />
                      <CardBookmark />
                    </CardComponent>
                    <CardInfo
                      {...item}
                      onClick={() => {
                        setSelectedCard(item)
                      }}
                    />
                  </Card>
                </GalleryItem>
              ))
            )
          : (
              <div className="w-full [column-span:all]">
                <EmptyState
                  title="No results found"
                  description="Try adjusting your filters or search terms to find what you're looking for."
                />
              </div>
            )}
      </Activity>
      {selectedCard && (
        <CardModal
          card={selectedCard}
          onClose={() => {
            setSelectedCard(null)
          }}
        />
      )}
    </>
  )
}

export function ShowcaseGalleryContent({
  queryKey,
  queryFn,
  staleTime = 1000 * 60 * 5,
}: Omit<GalleryContentProps, 'variant'>) {
  const { data: items = [], isLoading } = useQuery({
    queryKey,
    queryFn,
    staleTime,
  })
  const [selectedCard, setSelectedCard] = useState<CardData | null>(null)

  return (
    <>
      <Activity mode={isLoading ? 'visible' : 'hidden'}>
        {Array.from({ length: 8 }).map(() => (
          <GalleryItem key={crypto.randomUUID()}>
            <SkeletonCard />
          </GalleryItem>
        ))}
      </Activity>
      <Activity mode={isLoading ? 'hidden' : 'visible'}>
        {items.length > 0
          ? (
              items.map(item => (
                <GalleryItem key={item.id}>
                  <Card>
                    <CardShowcaseCarousel
                      title={item.title}
                      href={item.href}
                      onClick={() => {
                        setSelectedCard(item)
                      }}
                      images={item.images.map((img, i) => (
                        <Image
                          key={img.src}
                          src={img.src}
                          alt={`${item.title} - image ${String(i + 1)}`}
                          width={img.width}
                          height={img.height}
                          layout="constrained"
                          className="h-full w-full object-contain"
                        />
                      ))}
                    />
                    <CardInfo
                      {...item}
                      onClick={() => {
                        setSelectedCard(item)
                      }}
                    />
                  </Card>
                </GalleryItem>
              ))
            )
          : (
              <div className="w-full [column-span:all]">
                <EmptyState
                  title="No showcases found"
                  description="Check back later for new findings."
                />
              </div>
            )}
      </Activity>
      {selectedCard && (
        <CardModal
          card={selectedCard}
          onClose={() => {
            setSelectedCard(null)
          }}
        />
      )}
    </>
  )
}
