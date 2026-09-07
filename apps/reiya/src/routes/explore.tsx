import { createFileRoute } from "@tanstack/react-router";
import { createServerFn } from "@tanstack/react-start";
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
import { Hero } from "../components/Hero";
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
  loader: () => getCategories(),
  component: ExplorePage,
});

function ExplorePage() {
  const categories = Route.useLoaderData();

  return (
    <div className="flex flex-col gap-6">
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
    </div>
  );
}
