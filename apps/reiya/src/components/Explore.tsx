import type { ReactNode } from "react";
import { Carousel } from "@astryxdesign/core/Carousel";
import { Spinner } from "@astryxdesign/core/Spinner";
import { useQuery } from "@tanstack/react-query";
import { Image } from "@unpic/react";
import { ArrowRight } from "lucide-react";
import { Activity } from "react";
import {
  fetchArtists,
  fetchCharacters,
  fetchEvents,
  fetchShowcases,
} from "../lib/api-client";
import { EmptyState } from "./EmptyState";
import { Featured } from "./Featured";
import { FilterBar, FilterButton } from "./FilterBar";
import { Gallery, ShowcaseGalleryContent } from "./Gallery";
import { QueryProvider } from "./QueryProvider";
import { Tab, TabContent, TabList } from "./TabList";

interface ExploreSectionProps {
  className?: string;
  children?: ReactNode;
}

interface ExploreSectionHeadProps {
  className?: string;
  children?: ReactNode;
}

export function ExploreSectionTitle({ children }: { children: ReactNode }) {
  return (
    <h2 className="flex items-center gap-2 text-xl font-bold text-secondary">
      {children}
    </h2>
  );
}

export function ExploreSectionExpend({
  href,
  children,
}: {
  href: string;
  children: ReactNode;
}) {
  return (
    <a
      href={href}
      className="flex items-center gap-1 text-sm font-bold text-secondary/70 transition-colors hover:text-secondary"
    >
      {children}
      <ArrowRight className="h-3 w-3" />
    </a>
  );
}

export function ExploreSectionHead({
  className = "",
  children,
}: ExploreSectionHeadProps) {
  return (
    <div className={`flex items-center justify-between px-1 ${className}`}>
      {children}
    </div>
  );
}

export function ExploreSection({
  className = "",
  children,
}: ExploreSectionProps) {
  return (
    <section className={`flex flex-col gap-6 ${className}`}>{children}</section>
  );
}

function ExploreFeaturedContent() {
  const { data: items = [], isLoading } = useQuery({
    queryKey: ["showcases"],
    queryFn: fetchShowcases,
    staleTime: 1000 * 60 * 5,
  });

  return (
    <>
      <Activity mode={isLoading ? "visible" : "hidden"}>
        <div className="flex justify-center py-12">
          <span
            className="h-8 w-8 animate-spin rounded-full border-2 border-border border-t-accent"
            role="status"
            aria-label="Loading"
          />
        </div>
      </Activity>
      <Activity mode={isLoading ? "hidden" : "visible"}>
        <Featured items={items} />
      </Activity>
    </>
  );
}

export function ExploreFeatured({ className, children }: ExploreSectionProps) {
  return (
    <QueryProvider>
      <ExploreSection className={className ?? ""}>
        {children}
        <ExploreFeaturedContent />
      </ExploreSection>
    </QueryProvider>
  );
}

function ExploreArtistsContent() {
  const { data: items = [], isLoading } = useQuery({
    queryKey: ["artists"],
    queryFn: fetchArtists,
    staleTime: 1000 * 60 * 5,
  });

  return (
    <>
      <Activity mode={isLoading ? "visible" : "hidden"}>
        <div className="flex justify-center py-12">
          <span
            className="h-8 w-8 animate-spin rounded-full border-2 border-border border-t-accent"
            role="status"
            aria-label="Loading"
          />
        </div>
      </Activity>
      <Activity mode={isLoading ? "hidden" : "visible"}>
        <Featured items={items} />
      </Activity>
    </>
  );
}

export function ExploreArtists({ className, children }: ExploreSectionProps) {
  return (
    <QueryProvider>
      <ExploreSection className={className ?? ""}>
        {children}
        <ExploreArtistsContent />
      </ExploreSection>
    </QueryProvider>
  );
}

function ExploreCharactersContent() {
  const { data: items = [], isLoading } = useQuery({
    queryKey: ["characters"],
    queryFn: fetchCharacters,
    staleTime: 1000 * 60 * 5,
  });

  return (
    <>
      <Activity mode={isLoading ? "visible" : "hidden"}>
        <div className="flex justify-center py-12">
          <span
            className="h-8 w-8 animate-spin rounded-full border-2 border-border border-t-accent"
            role="status"
            aria-label="Loading"
          />
        </div>
      </Activity>
      <Activity mode={isLoading ? "hidden" : "visible"}>
        <Featured items={items} />
      </Activity>
    </>
  );
}

export function ExploreCharacters({
  className,
  children,
}: ExploreSectionProps) {
  return (
    <QueryProvider>
      <ExploreSection className={className ?? ""}>
        {children}
        <ExploreCharactersContent />
      </ExploreSection>
    </QueryProvider>
  );
}

function ExploreConventionsContent() {
  const { data: events = [], isLoading } = useQuery({
    queryKey: ["events"],
    queryFn: fetchEvents,
  });

  return (
    <ExploreSection>
      <ExploreSectionHead>
        <ExploreSectionTitle>
          <span className="text-accent font-bold">NEXT</span> Upcoming
          Conventions
        </ExploreSectionTitle>
        <ExploreSectionExpend href="/explore?type=events">
          View all events
        </ExploreSectionExpend>
      </ExploreSectionHead>
      <Carousel
        hasButtons={false}
        hasEdgeFade={false}
        aria-label="Upcoming conventions"
        className="w-full"
      >
        {["USA", "Europe", "Japan", "Asia", "Online", "Popup Shops"].map(
          (cat) => (
            <button
              type="button"
              key={cat}
              className="border-border bg-surface text-secondary hover:bg-body rounded-full border px-3 py-1.5 text-xs font-bold whitespace-nowrap transition-colors"
            >
              {cat}
            </button>
          ),
        )}
      </Carousel>

      <Activity mode={isLoading ? "visible" : "hidden"}>
        <div className="flex h-64 w-full items-center justify-center">
          <Spinner aria-label="Loading" size="lg" />
        </div>
      </Activity>

      <Activity mode={isLoading ? "hidden" : "visible"}>
        {events.length > 0 ? (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
            {events.map((event) => {
              const image = event.images[0];

              return (
                <a
                  href={event.href}
                  className="group flex cursor-pointer flex-col gap-1"
                  key={event.id}
                >
                  {image ? (
                    <div className="relative aspect-square overflow-hidden rounded-xl bg-surface">
                      <Image
                        src={image.src}
                        width={image.width}
                        height={image.height}
                        layout="constrained"
                        className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
                        alt={event.title}
                      />
                      <div className="absolute top-2 left-2 rounded-full bg-body/90 p-1 shadow-sm">
                        <div className="h-4 w-4 rounded-full bg-error"></div>
                      </div>
                    </div>
                  ) : null}
                  <div className="flex items-center gap-1">
                    <span className="text-xs text-secondary/70">{event.price}</span>
                  </div>
                  <h4 className="truncate text-sm font-bold text-secondary">
                    {event.title}
                  </h4>
                  <div className="text-xs font-bold text-secondary">
                    {event.artist.name}
                  </div>
                </a>
              );
            })}
          </div>
        ) : (
          <EmptyState
            title="No conventions found"
            description="Check back later for upcoming events."
          />
        )}
      </Activity>
    </ExploreSection>
  );
}

export function ExploreConventions() {
  return (
    <QueryProvider>
      <ExploreConventionsContent />
    </QueryProvider>
  );
}

function ExploreShowcaseContent() {
  const filters = [
    "Random",
    "Latest",
    "AI",
    "Gamemakers",
    "Verified",
    "Base price",
    "Availability",
  ];

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
            {filters.map((label) => (
              <FilterButton key={label} label={label} />
            ))}
          </FilterBar>

          <Gallery>
            <ShowcaseGalleryContent
              queryKey={["showcases"]}
              queryFn={fetchShowcases}
            />
          </Gallery>
        </div>
      </TabContent>
    </TabList>
  );
}

export function ExploreShowcase() {
  return (
    <QueryProvider>
      <ExploreShowcaseContent />
    </QueryProvider>
  );
}
