import { createFileRoute, Link } from "@tanstack/react-router";
import { createServerFn } from "@tanstack/react-start";
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
    const rows = await db.select().from(categoriesTable);
    return rows.slice(0, 8);
  },
);

export const Route = createFileRoute("/")({
  loader: () => getCategories(),
  component: HomePage,
});

function HomePage() {
  const featuredCategories = Route.useLoaderData();

  return (
    <div className="mx-auto w-full max-w-6xl px-4 sm:px-6">
      <div className="flex flex-col gap-12 py-10 sm:gap-14 sm:py-14">
        <section>
          <div className="mx-auto flex max-w-2xl flex-col gap-7">
            <div className="flex flex-wrap items-center gap-2">
              <span className="bg-accent text-on-accent inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold">
                Beta
              </span>
              <span className="border-border text-secondary inline-flex items-center rounded-full border px-3 py-1 text-xs font-medium">
                Artist Alley
              </span>
              <span className="border-border text-secondary inline-flex items-center rounded-full border px-3 py-1 text-xs font-medium">
                Conventions
              </span>
              <span className="border-border text-secondary inline-flex items-center rounded-full border px-3 py-1 text-xs font-medium">
                Merch
              </span>
            </div>

            <div className="flex flex-col gap-5">
              <h1 className="font-display text-secondary text-4xl leading-[1.05] font-semibold tracking-tight sm:text-5xl">
                Find merch and artists—without the algorithm.
              </h1>

              <p className="text-secondary/70 max-w-xl text-lg leading-relaxed sm:text-xl">
                Explore what creators are making, follow your favorites, and
                plan your next con haul.
              </p>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <Link
                to="/explore"
                className="bg-accent text-on-accent inline-flex h-11 items-center rounded-full px-6 text-sm font-semibold transition-opacity hover:opacity-90"
              >
                Explore
              </Link>
              <a
                href="#for-artists"
                className="border-border hover:bg-surface inline-flex h-11 items-center rounded-full border px-6 text-sm font-semibold transition-colors"
              >
                For artists
              </a>
            </div>
          </div>
        </section>

        <section>
          <div className="border-border bg-background-card flex flex-col gap-4 rounded-2xl border p-6">
            <div className="flex items-center justify-between gap-4">
              <h2 className="text-secondary text-sm font-semibold">
                Browse by category
              </h2>
              <Link to="/explore" className="text-accent text-sm font-semibold hover:underline">
                {" "}
                Explore all →{" "}
              </Link>
            </div>
            <div className="flex flex-wrap gap-2">
              {featuredCategories.length > 0 ? (
                featuredCategories.map((cat) => (
                  <Link
                    key={cat.id}
                    to="/explore"
                    className="border-border bg-body text-secondary hover:border-border-strong hover:bg-surface inline-flex items-center gap-2 rounded-full border px-3.5 py-2 text-sm font-medium transition-colors"
                  >
                    <span className="text-base leading-none">{cat.icon}</span>
                    {cat.name}
                  </Link>
                ))
              ) : (
                <>
                  <Link
                    to="/explore"
                    className="border-border bg-body text-secondary hover:border-border-strong hover:bg-surface inline-flex items-center gap-2 rounded-full border px-3.5 py-2 text-sm font-medium transition-colors"
                  >
                    <span className="text-base leading-none">🏷️</span>
                    Stickers
                  </Link>
                  <Link
                    to="/explore"
                    className="border-border bg-body text-secondary hover:border-border-strong hover:bg-surface inline-flex items-center gap-2 rounded-full border px-3.5 py-2 text-sm font-medium transition-colors"
                  >
                    <span className="text-base leading-none">🎨</span>
                    Prints
                  </Link>
                  <Link
                    to="/explore"
                    className="border-border bg-body text-secondary hover:border-border-strong hover:bg-surface inline-flex items-center gap-2 rounded-full border px-3.5 py-2 text-sm font-medium transition-colors"
                  >
                    <span className="text-base leading-none">☕</span>
                    Mugs
                  </Link>
                </>
              )}
            </div>
          </div>
        </section>

        <section>
          <div className="grid items-start gap-6 lg:grid-cols-2 lg:gap-10">
            <div className="border-border bg-background-card flex flex-col gap-6 rounded-2xl border p-6 sm:p-8">
              <div className="flex flex-col gap-3">
                <div className="text-secondary/60 text-xs font-semibold tracking-wide uppercase">
                  How it works
                </div>
                <h2 className="font-display text-secondary text-2xl font-semibold tracking-tight sm:text-3xl">
                  Explore → Follow → Plan
                </h2>
                <p className="text-secondary/70 max-w-xl text-base">
                  Lightweight browsing for fans, and a clean home for artists.
                </p>
              </div>

              <div className="grid gap-3 sm:grid-cols-3">
                <div className="border-border bg-body flex flex-col gap-1 rounded-xl border p-4">
                  <div className="text-accent text-xl font-semibold">①</div>
                  <div className="text-secondary text-sm font-semibold">
                    Explore
                  </div>
                  <div className="text-secondary/70 text-sm">
                    Merch, artists, and events in one place.
                  </div>
                </div>
                <div className="border-border bg-body flex flex-col gap-1 rounded-xl border p-4">
                  <div className="text-secondary text-xl font-semibold">②</div>
                  <div className="text-secondary text-sm font-semibold">
                    Follow
                  </div>
                  <div className="text-secondary/70 text-sm">
                    Save creators and characters you want to revisit.
                  </div>
                </div>
                <div className="border-border bg-body flex flex-col gap-1 rounded-xl border p-4">
                  <div className="text-accent text-xl font-semibold">③</div>
                  <div className="text-secondary text-sm font-semibold">
                    Plan
                  </div>
                  <div className="text-secondary/70 text-sm">
                    Find what's available and where to get it.
                  </div>
                </div>
              </div>
            </div>

            <section
              id="for-artists"
              className="border-border bg-background-card flex scroll-mt-24 flex-col gap-6 rounded-2xl border p-6 sm:p-8"
            >
              <div className="flex flex-col gap-3">
                <div className="text-secondary/60 text-xs font-semibold tracking-wide uppercase">
                  For artists & circles
                </div>
                <h2 className="font-display text-secondary text-2xl font-semibold tracking-tight sm:text-3xl">
                  Be discoverable without feeding an algorithm.
                </h2>
                <p className="text-secondary/70 max-w-xl text-base">
                  Make it easy for fans to find you, your merch, and your con
                  schedule.
                </p>
              </div>

              <div className="grid gap-3">
                <div className="border-border bg-body flex flex-col gap-1 rounded-xl border p-5">
                  <div className="text-secondary text-sm font-semibold">
                    Artist-friendly
                  </div>
                  <div className="text-secondary/70 text-sm">
                    Simple pages that load fast and read well.
                  </div>
                </div>
                <div className="border-border bg-body flex flex-col gap-1 rounded-xl border p-5">
                  <div className="text-secondary text-sm font-semibold">
                    Convention-first
                  </div>
                  <div className="text-secondary/70 text-sm">
                    Built for real booths, weekends, and small drops.
                  </div>
                </div>
                <div className="border-border bg-body flex flex-col gap-1 rounded-xl border p-5">
                  <div className="text-secondary text-sm font-semibold">
                    Built in public
                  </div>
                  <div className="text-secondary/70 text-sm">
                    Tell us what would actually make this useful for you.
                  </div>
                </div>
              </div>
            </section>
          </div>
        </section>

        <section>
          <div className="border-border bg-background-card flex flex-col gap-6 rounded-2xl border border-dashed p-6 sm:p-8">
            <div className="flex flex-col gap-3">
              <h2 className="font-display text-secondary text-2xl font-semibold tracking-tight sm:text-3xl">
                Ready to browse?
              </h2>
              <p className="text-secondary/70 max-w-2xl text-base">
                Start in Explore, then come back when you need something new to
                draw, buy, or find for your next con.
              </p>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row">
              <Link
                to="/explore"
                className="bg-accent text-on-accent inline-flex h-11 items-center rounded-full px-6 text-sm font-semibold transition-opacity hover:opacity-90"
              >
                Go to Explore
              </Link>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
