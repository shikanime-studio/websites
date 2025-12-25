import {
  fetchArtists,
  fetchCharacters,
  fetchShowcases,
} from "../lib/api-client";
import { Featured } from "./Featured";
import { Gallery, ShowcaseGalleryContent } from "./Gallery";
import { QueryProvider } from "./QueryProvider";
import { Tab, TabContent, TabList } from "./TabList";
import { useQuery } from "@tanstack/react-query";
import type { FC, ReactNode } from "react";
import { Activity } from "react";
import { FaArrowRight } from "react-icons/fa6";
import { FilterBar, FilterButton } from "./FilterBar";

interface ExploreSectionProps {
  className?: string;
  children?: ReactNode;
}

interface ExploreSectionHeadProps {
  className?: string;
  children?: ReactNode;
}

export const ExploreSectionTitle: FC<{ children: ReactNode }> = ({
  children,
}) => {
  return (
    <h2 className="flex items-center gap-2 text-xl font-bold text-gray-900">
      {children}
    </h2>
  );
};

export const ExploreSectionExpend: FC<{ href: string; children: ReactNode }> = ({
  href,
  children,
}) => {
  return (
    <a
      href={href}
      className="flex items-center gap-1 text-sm font-bold text-gray-500 transition-colors hover:text-gray-900"
    >
      {children}
      <FaArrowRight className="h-3 w-3" />
    </a>
  );
};

export const ExploreSectionHead: FC<ExploreSectionHeadProps> = ({
  className = "",
  children,
}) => {
  return (
    <div className={`flex items-center justify-between px-1 ${className}`}>
      {children}
    </div>
  );
};

export const ExploreSection: FC<ExploreSectionProps> = ({
  className = "",
  children,
}) => {
  return (
    <section className={`flex flex-col gap-6 ${className}`}>{children}</section>
  );
};

export const ExploreFeatured: FC<ExploreSectionProps> = ({
  className,
  children,
}) => {
  return (
    <QueryProvider>
      <ExploreSection className={className}>
        {children}
        <ExploreFeaturedContent />
      </ExploreSection>
    </QueryProvider>
  );
};

const ExploreFeaturedContent: FC = () => {
  const { data: items = [], isLoading } = useQuery({
    queryKey: ["showcases"],
    queryFn: fetchShowcases,
    staleTime: 1000 * 60 * 5,
  });

  return (
    <>
      <Activity mode={isLoading ? "visible" : "hidden"}>
        <div className="flex justify-center py-12">
          <span className="loading loading-spinner loading-lg text-primary"></span>
        </div>
      </Activity>
      <Activity mode={isLoading ? "hidden" : "visible"}>
        <Featured items={items} />
      </Activity>
    </>
  );
};

export const ExploreArtists: FC<ExploreSectionProps> = ({
  className,
  children,
}) => {
  return (
    <QueryProvider>
      <ExploreSection className={className}>
        {children}
        <ExploreArtistsContent />
      </ExploreSection>
    </QueryProvider>
  );
};

const ExploreArtistsContent: FC = () => {
  const { data: items = [], isLoading } = useQuery({
    queryKey: ["artists"],
    queryFn: fetchArtists,
    staleTime: 1000 * 60 * 5,
  });

  return (
    <>
      <Activity mode={isLoading ? "visible" : "hidden"}>
        <div className="flex justify-center py-12">
          <span className="loading loading-spinner loading-lg text-primary"></span>
        </div>
      </Activity>
      <Activity mode={isLoading ? "hidden" : "visible"}>
        <Featured items={items} />
      </Activity>
    </>
  );
};

export const ExploreCharacters: FC<ExploreSectionProps> = ({
  className,
  children,
}) => {
  return (
    <QueryProvider>
      <ExploreSection className={className}>
        {children}
        <ExploreCharactersContent />
      </ExploreSection>
    </QueryProvider>
  );
};

const ExploreCharactersContent: FC = () => {
  const { data: items = [], isLoading } = useQuery({
    queryKey: ["characters"],
    queryFn: fetchCharacters,
    staleTime: 1000 * 60 * 5,
  });

  return (
    <>
      <Activity mode={isLoading ? "visible" : "hidden"}>
        <div className="flex justify-center py-12">
          <span className="loading loading-spinner loading-lg text-primary"></span>
        </div>
      </Activity>
      <Activity mode={isLoading ? "hidden" : "visible"}>
        <Featured items={items} />
      </Activity>
    </>
  );
};

export const ExploreConventions: FC = () => {
  return (
    <ExploreSection>
      <ExploreSectionHead>
        <ExploreSectionTitle>
          <span className="text-primary font-bold">NEXT</span> Upcoming
          Conventions
        </ExploreSectionTitle>
        <ExploreSectionExpend href="/explore?type=events">
          View all events
        </ExploreSectionExpend>
      </ExploreSectionHead>
      <div className="carousel carousel-center scrollbar-hide w-full gap-3">
        {["USA", "Europe", "Japan", "Asia", "Online", "Popup Shops"].map(
          (cat) => (
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

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
        {[
          "Comiket 103",
          "Anime Expo",
          "Japan Expo",
          "DoKomi",
          "TwitchCon",
          "Vket",
        ].map((name) => (
          <div className="group flex cursor-pointer flex-col gap-1" key={name}>
            <div className="relative aspect-square overflow-hidden rounded-xl bg-gray-100">
              <img
                src={`https://placehold.co/400x400/eee/999?text=${name.replace(" ", "+")}`}
                className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
                alt={name}
              />
              <div className="absolute top-2 left-2 rounded-full bg-white/90 p-1 shadow-sm">
                <div className="h-4 w-4 rounded-full bg-red-500"></div>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <span className="text-xs text-gray-500">Dec 2025</span>
            </div>
            <h4 className="truncate text-sm font-bold text-gray-900">{name}</h4>
            <div className="text-xs font-bold text-gray-900">Tokyo, Japan</div>
          </div>
        ))}
      </div>
    </ExploreSection>
  );
};

export const ExploreShowcase: FC = () => {
  return (
    <QueryProvider>
      <ExploreShowcaseContent />
    </QueryProvider>
  );
};

const ExploreShowcaseContent: FC = () => {
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
};

