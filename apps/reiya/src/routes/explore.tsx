import { createFileRoute, Link } from "@tanstack/react-router";
import { createServerFn } from "@tanstack/react-start";
import { getOrElse } from "effect/reactivity/AsyncResult";
import {
  ExploreArtists,
  ExploreCharacters,
  ExploreConventions,
  ExploreFeatured,
  ExploreSectionExpend,
  ExploreSectionHead,
  ExploreSectionTitle,
  ExploreShowcase,
} from "../components/Explore";
import { Gallery, GalleryItems } from "../components/Gallery";
import { Hero } from "../components/Hero";
import { PageShell } from "../components/PageShell";
import { useCardResult } from "../hooks/useCardResult";
import {
  artistsAtom,
  charactersAtom,
  eventsAtom,
  merchsAtom,
  showcasesAtom,
} from "../lib/atoms";
import { createD1Database } from "../lib/db";
import { categories as categoriesTable } from "../schema";

interface Category {
  id: number;
  name: string;
  icon: string | null;
}

const getCategories = createServerFn().handler(
  async (): Promise<Array<Category>> => {
    const db = createD1Database();
    return db.select().from(categoriesTable);
  },
);

export const Route = createFileRoute("/explore")({
  validateSearch: (search: { q?: unknown }): { q?: string } => {
    const q = typeof search.q === "string" ? search.q.trim() : "";
    return q.length > 0 ? { q } : {};
  },
  loader: () => getCategories(),
  component: ExplorePage,
});

const MATCHES = (haystack: Array<string>, needle: string) =>
  haystack.some((value) => value.toLowerCase().includes(needle));

function SearchResults({ query }: { query: string }) {
  const needle = query.toLowerCase();
  const merchs = getOrElse(useCardResult(merchsAtom, "Failed to search"), () => []);
  const artists = getOrElse(useCardResult(artistsAtom, "Failed to search"), () => []);
  const events = getOrElse(useCardResult(eventsAtom, "Failed to search"), () => []);
  const characters = getOrElse(useCardResult(charactersAtom, "Failed to search"), () => []);
  const showcases = getOrElse(useCardResult(showcasesAtom, "Failed to search"), () => []);

  const seen = new Set<string>();
  const results = [...merchs, ...showcases, ...artists, ...characters, ...events]
    .filter((card) => MATCHES([card.title, card.artist.name], needle))
    .filter((card) => {
      const key = String(card.id);
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });

  return (
    <PageShell>
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div className="flex flex-col gap-1">
          <h1 className="font-display text-secondary text-2xl font-semibold tracking-tight sm:text-3xl">
            Results for “{query}”
          </h1>
          <p className="text-secondary/70 text-sm">
            {results.length === 0
              ? "Nothing matched."
              : `${String(results.length)} ${results.length === 1 ? "match" : "matches"} across merch, artists, characters and conventions.`}
          </p>
        </div>
        <Link
          className="text-accent text-sm font-semibold hover:underline"
          search={{}}
          to="/explore"
        >
          Clear search
        </Link>
      </div>

      <Gallery>
        <GalleryItems items={results} onSelect={() => {}} />
      </Gallery>
    </PageShell>
  );
}

function ExplorePage() {
  const categories = Route.useLoaderData();
  const { q } = Route.useSearch();

  if (q) {
    return <SearchResults query={q} />;
  }

  return (
    <PageShell>
      <Hero />

      <div className="scrollbar-hide flex w-full gap-3 overflow-x-auto">
        {categories.map((cat) => (
          <div key={cat.id}>
            <button
              type="button"
              className="flex items-center gap-2 rounded-full bg-body px-4 py-2 text-sm font-semibold whitespace-nowrap text-secondary shadow-sm transition hover:bg-surface"
            >
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-surface text-xs text-secondary/80">
                {cat.icon}
              </span>
              {cat.name}
            </button>
          </div>
        ))}
        <div>
          <button
            type="button"
            className="flex items-center gap-2 rounded-full bg-surface px-4 py-2 text-sm font-semibold whitespace-nowrap text-secondary transition hover:bg-surface"
          >
            All categories &rarr;
          </button>
        </div>
      </div>

      <ExploreFeatured>
        <ExploreSectionHead>
          <ExploreSectionTitle>Discover Trending Merch</ExploreSectionTitle>
          <ExploreSectionExpend href="/explore?type=merchs">
            {" "}
            View all{" "}
          </ExploreSectionExpend>
        </ExploreSectionHead>
      </ExploreFeatured>

      <ExploreArtists>
        <ExploreSectionHead>
          <ExploreSectionTitle>Featured Artists & Circles</ExploreSectionTitle>
          <ExploreSectionExpend href="/explore?type=artists">
            {" "}
            View all{" "}
          </ExploreSectionExpend>
        </ExploreSectionHead>
      </ExploreArtists>

      <ExploreCharacters>
        <ExploreSectionHead>
          <ExploreSectionTitle>Popular Characters</ExploreSectionTitle>
          <ExploreSectionExpend href="/explore?type=characters">
            {" "}
            View all{" "}
          </ExploreSectionExpend>
        </ExploreSectionHead>
      </ExploreCharacters>

      <ExploreConventions />

      <ExploreShowcase />
    </PageShell>
  );
}
