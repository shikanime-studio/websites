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
    <div className="mx-auto w-full max-w-6xl">
      <div className="flex flex-col gap-12 py-10 sm:gap-16 sm:py-14">
        <section>
          <div className="mx-auto flex max-w-2xl flex-col gap-7">
            <div className="flex flex-wrap items-center gap-2">
              <span className="bg-accent inline-flex items-center rounded-full px-3 py-1 text-sm font-black">
                Beta
              </span>
              <span className="border-border inline-flex items-center rounded-full border px-3 py-1 text-sm font-bold">
                Artist Alley
              </span>
              <span className="border-border inline-flex items-center rounded-full border px-3 py-1 text-sm font-bold">
                Conventions
              </span>
              <span className="border-border inline-flex items-center rounded-full border px-3 py-1 text-sm font-bold">
                Merch
              </span>
            </div>

            <div className="flex flex-col gap-5">
              <h1 className="text-secondary text-5xl leading-[1.05] font-black tracking-tight sm:text-6xl">
                Find merch and artists—without the algorithm.
              </h1>

              <p className="text-secondary/80 max-w-xl text-lg leading-relaxed font-semibold sm:text-xl">
                Explore what creators are making, follow your favorites, and
                plan your next con haul.
              </p>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <Link
                to="/explore"
                className="bg-accent text-on-accent inline-flex h-12 items-center rounded-full px-10 text-base font-black font-medium"
              >
                Explore
              </Link>
              <a
                href="#for-artists"
                className="hover:bg-surface inline-flex h-12 items-center rounded-full px-10 text-base font-black transition-colors"
              >
                For artists
              </a>
            </div>
          </div>
        </section>

        <section>
          <div className="border-border bg-body flex flex-col gap-4 rounded-3xl border-2 p-6 shadow-sm">
            <div className="flex items-center justify-between gap-4">
              <h2 className="text-secondary text-base font-black">
                Browse by category
              </h2>
              <Link to="/explore" className="text-accent text-sm font-black">
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
                    className="border-border hover:border-border inline-flex items-center gap-2 rounded-full border-2 bg-white px-4 py-2 text-sm font-black text-gray-900 shadow-sm transition hover:-translate-y-0.5"
                  >
                    <span className="text-base leading-none">{cat.icon}</span>
                    {cat.name}
                  </Link>
                ))
              ) : (
                <>
                  <Link
                    to="/explore"
                    className="border-border hover:border-border inline-flex items-center gap-2 rounded-full border-2 bg-white px-4 py-2 text-sm font-black text-gray-900 shadow-sm transition hover:-translate-y-0.5"
                  >
                    <span className="text-base leading-none">🏷️</span>
                    Stickers
                  </Link>
                  <Link
                    to="/explore"
                    className="border-border hover:border-border inline-flex items-center gap-2 rounded-full border-2 bg-white px-4 py-2 text-sm font-black text-gray-900 shadow-sm transition hover:-translate-y-0.5"
                  >
                    <span className="text-base leading-none">🎨</span>
                    Prints
                  </Link>
                  <Link
                    to="/explore"
                    className="border-border hover:border-border inline-flex items-center gap-2 rounded-full border-2 bg-white px-4 py-2 text-sm font-black text-gray-900 shadow-sm transition hover:-translate-y-0.5"
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
            <div className="border-border bg-body flex flex-col gap-6 rounded-3xl border-2 p-8 shadow-sm">
              <div className="flex flex-col gap-3">
                <div className="text-secondary/70 text-sm font-black">
                  How it works
                </div>
                <h2 className="text-secondary text-3xl font-black tracking-tight sm:text-4xl">
                  Explore → Follow → Plan
                </h2>
                <p className="text-secondary/70 max-w-xl text-lg font-semibold">
                  Lightweight browsing for fans, and a clean home for artists.
                </p>
              </div>

              <div className="grid gap-3 sm:grid-cols-3">
                <div className="border-border flex flex-col gap-1 rounded-2xl border-2 bg-white p-4">
                  <div className="text-accent text-2xl font-black">①</div>
                  <div className="text-secondary text-base font-black">
                    Explore
                  </div>
                  <div className="text-secondary/70 text-sm font-semibold">
                    Merch, artists, and events in one place.
                  </div>
                </div>
                <div className="border-border flex flex-col gap-1 rounded-2xl border-2 bg-white p-4">
                  <div className="text-secondary text-2xl font-black">②</div>
                  <div className="text-secondary text-base font-black">
                    Follow
                  </div>
                  <div className="text-secondary/70 text-sm font-semibold">
                    Save creators and characters you want to revisit.
                  </div>
                </div>
                <div className="border-border flex flex-col gap-1 rounded-2xl border-2 bg-white p-4">
                  <div className="text-accent text-2xl font-black">③</div>
                  <div className="text-secondary text-base font-black">
                    Plan
                  </div>
                  <div className="text-secondary/70 text-sm font-semibold">
                    Find what's available and where to get it.
                  </div>
                </div>
              </div>
            </div>

            <section
              id="for-artists"
              className="border-border bg-body flex scroll-mt-24 flex-col gap-6 rounded-3xl border-2 p-8 shadow-sm"
            >
              <div className="flex flex-col gap-3">
                <div className="text-secondary/70 text-sm font-black">
                  For artists & circles
                </div>
                <h2 className="text-secondary text-3xl font-black tracking-tight sm:text-4xl">
                  Be discoverable without feeding an algorithm.
                </h2>
                <p className="text-secondary/70 max-w-xl text-lg font-semibold">
                  Make it easy for fans to find you, your merch, and your con
                  schedule.
                </p>
              </div>

              <div className="grid gap-3">
                <div className="border-border flex flex-col gap-1 rounded-2xl border-2 bg-white p-5">
                  <div className="text-secondary text-sm font-black">
                    Artist-friendly
                  </div>
                  <div className="text-secondary/70 text-sm font-semibold">
                    Simple pages that load fast and read well.
                  </div>
                </div>
                <div className="border-border flex flex-col gap-1 rounded-2xl border-2 bg-white p-5">
                  <div className="text-secondary text-sm font-black">
                    Convention-first
                  </div>
                  <div className="text-secondary/70 text-sm font-semibold">
                    Built for real booths, weekends, and small drops.
                  </div>
                </div>
                <div className="border-border flex flex-col gap-1 rounded-2xl border-2 bg-white p-5">
                  <div className="text-secondary text-sm font-black">
                    Built in public
                  </div>
                  <div className="text-secondary/70 text-sm font-semibold">
                    Tell us what would actually make this useful for you.
                  </div>
                </div>
              </div>
            </section>
          </div>
        </section>

        <section>
          <div className="border-border bg-body flex flex-col gap-6 rounded-3xl border-2 border-dashed p-8">
            <div className="flex flex-col gap-3">
              <h2 className="text-secondary text-2xl font-black tracking-tight sm:text-3xl">
                Ready to browse?
              </h2>
              <p className="text-secondary/70 max-w-2xl text-lg font-semibold">
                Start in Explore, then come back when you need something new to
                draw, buy, or find for your next con.
              </p>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row">
              <Link
                to="/explore"
                className="bg-accent text-on-accent inline-flex h-12 items-center rounded-full px-10 text-base font-black font-medium"
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
