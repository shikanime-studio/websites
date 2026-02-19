import type { ReactNode } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Image } from '@unpic/react'
import { ArrowRight } from 'lucide-react'
import { Activity } from 'react'
import {
  fetchArtists,
  fetchCharacters,
  fetchEvents,
  fetchShowcases,
} from '../lib/api-client'
import { EmptyState } from './EmptyState'
import { Featured } from './Featured'
import { FilterBar, FilterButton } from './FilterBar'
import { Gallery, ShowcaseGalleryContent } from './Gallery'
import { QueryProvider } from './QueryProvider'
import { Tab, TabContent, TabList } from './TabList'

interface ExploreSectionProps {
  className?: string
  children?: ReactNode
}

interface ExploreSectionHeadProps {
  className?: string
  children?: ReactNode
}

export function ExploreSectionTitle({
  children,
}: {
  children: ReactNode
}) {
  return (
    <h2 className="flex items-center gap-2 text-xl font-bold text-gray-900">
      {children}
    </h2>
  )
}

export function ExploreSectionExpend({
  href,
  children,
}: {
  href: string
  children: ReactNode
}) {
  return (
    <a
      href={href}
      className="flex items-center gap-1 text-sm font-bold text-gray-500 transition-colors hover:text-gray-900"
    >
      {children}
      <ArrowRight className="h-3 w-3" />
    </a>
  )
}

export function ExploreSectionHead({
  className = '',
  children,
}: ExploreSectionHeadProps) {
  return (
    <div className={`flex items-center justify-between px-1 ${className}`}>
      {children}
    </div>
  )
}

export function ExploreSection({
  className = '',
  children,
}: ExploreSectionProps) {
  return (
    <section className={`flex flex-col gap-6 ${className}`}>{children}</section>
  )
}

function ExploreFeaturedContent() {
  const { data: items = [], isLoading } = useQuery({
    queryKey: ['showcases'],
    queryFn: fetchShowcases,
    staleTime: 1000 * 60 * 5,
  })

  return (
    <>
      <Activity mode={isLoading ? 'visible' : 'hidden'}>
        <div className="flex justify-center py-12">
          <span className="loading loading-spinner loading-lg text-primary"></span>
        </div>
      </Activity>
      <Activity mode={isLoading ? 'hidden' : 'visible'}>
        <Featured items={items} />
      </Activity>
    </>
  )
}

export function ExploreFeatured({
  className,
  children,
}: ExploreSectionProps) {
  return (
    <QueryProvider>
      <ExploreSection className={className}>
        {children}
        <ExploreFeaturedContent />
      </ExploreSection>
    </QueryProvider>
  )
}

function ExploreArtistsContent() {
  const { data: items = [], isLoading } = useQuery({
    queryKey: ['artists'],
    queryFn: fetchArtists,
    staleTime: 1000 * 60 * 5,
  })

  return (
    <>
      <Activity mode={isLoading ? 'visible' : 'hidden'}>
        <div className="flex justify-center py-12">
          <span className="loading loading-spinner loading-lg text-primary"></span>
        </div>
      </Activity>
      <Activity mode={isLoading ? 'hidden' : 'visible'}>
        <Featured items={items} />
      </Activity>
    </>
  )
}

export function ExploreArtists({
  className,
  children,
}: ExploreSectionProps) {
  return (
    <QueryProvider>
      <ExploreSection className={className}>
        {children}
        <ExploreArtistsContent />
      </ExploreSection>
    </QueryProvider>
  )
}

function ExploreCharactersContent() {
  const { data: items = [], isLoading } = useQuery({
    queryKey: ['characters'],
    queryFn: fetchCharacters,
    staleTime: 1000 * 60 * 5,
  })

  return (
    <>
      <Activity mode={isLoading ? 'visible' : 'hidden'}>
        <div className="flex justify-center py-12">
          <span className="loading loading-spinner loading-lg text-primary"></span>
        </div>
      </Activity>
      <Activity mode={isLoading ? 'hidden' : 'visible'}>
        <Featured items={items} />
      </Activity>
    </>
  )
}

export function ExploreCharacters({
  className,
  children,
}: ExploreSectionProps) {
  return (
    <QueryProvider>
      <ExploreSection className={className}>
        {children}
        <ExploreCharactersContent />
      </ExploreSection>
    </QueryProvider>
  )
}

function ExploreConventionsContent() {
  const { data: events = [], isLoading } = useQuery({
    queryKey: ['events'],
    queryFn: fetchEvents,
  })

  return (
    <ExploreSection>
      <ExploreSectionHead>
        <ExploreSectionTitle>
          <span className="text-primary font-bold">NEXT</span>
          {' '}
          Upcoming
          Conventions
        </ExploreSectionTitle>
        <ExploreSectionExpend href="/explore?type=events">
          View all events
        </ExploreSectionExpend>
      </ExploreSectionHead>
      <div className="carousel carousel-center scrollbar-hide w-full gap-3">
        {['USA', 'Europe', 'Japan', 'Asia', 'Online', 'Popup Shops'].map(
          cat => (
            <div className="carousel-item" key={cat}>
              <button
                type="button"
                className="rounded-full bg-white px-3 py-1.5 text-xs font-bold whitespace-nowrap text-gray-600 hover:bg-gray-50"
              >
                {cat}
              </button>
            </div>
          ),
        )}
      </div>

      <Activity mode={isLoading ? 'visible' : 'hidden'}>
        <div className="flex h-64 w-full items-center justify-center">
          <span className="loading loading-spinner loading-lg text-primary"></span>
        </div>
      </Activity>

      <Activity mode={isLoading ? 'hidden' : 'visible'}>
        {events.length > 0
          ? (
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
                {events.map(event => (
                  <a
                    href={event.href}
                    className="group flex cursor-pointer flex-col gap-1"
                    key={event.id}
                  >
                    <div className="relative aspect-square overflow-hidden rounded-xl bg-gray-100">
                      <Image
                        src={event.images[0]?.src}
                        width={event.images[0]?.width}
                        height={event.images[0]?.height}
                        layout="constrained"
                        className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
                        alt={event.title}
                      />
                      <div className="absolute top-2 left-2 rounded-full bg-white/90 p-1 shadow-sm">
                        <div className="h-4 w-4 rounded-full bg-red-500"></div>
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      <span className="text-xs text-gray-500">{event.price}</span>
                    </div>
                    <h4 className="truncate text-sm font-bold text-gray-900">
                      {event.title}
                    </h4>
                    <div className="text-xs font-bold text-gray-900">
                      {event.artist.name}
                    </div>
                  </a>
                ))}
              </div>
            )
          : (
              <EmptyState
                title="No conventions found"
                description="Check back later for upcoming events."
              />
            )}
      </Activity>
    </ExploreSection>
  )
}

export function ExploreConventions() {
  return (
    <QueryProvider>
      <ExploreConventionsContent />
    </QueryProvider>
  )
}

function ExploreShowcaseContent() {
  const filters = [
    'Random',
    'Latest',
    'AI',
    'Gamemakers',
    'Verified',
    'Base price',
    'Availability',
  ]

  return (
    <TabList defaultTab="Merch Findings">
      <Tab value="Featured Artists & Circles" name="showcase_tabs">
        Featured Artists & Circles
      </Tab>
      <Tab value="Merch Findings" name="showcase_tabs">
        Merch Findings
      </Tab>
      <TabContent value="Merch Findings">
        <div className="flex flex-col gap-6">
          <FilterBar>
            <FilterButton label="Category" hasDropdown />
            <FilterButton label="Licenses" hasDropdown />
            <FilterButton label="Service options" hasDropdown />
            <FilterButton label="Price" hasDropdown />
            <FilterButton label="On sale" />
            {filters.map(label => (
              <FilterButton key={label} label={label} />
            ))}
          </FilterBar>

          <Gallery>
            <ShowcaseGalleryContent
              queryKey={['showcases']}
              queryFn={fetchShowcases}
            />
          </Gallery>
        </div>
      </TabContent>
    </TabList>
  )
}

export function ExploreShowcase() {
  return (
    <QueryProvider>
      <ExploreShowcaseContent />
    </QueryProvider>
  )
}
