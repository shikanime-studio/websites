import { createFileRoute, Link } from "@tanstack/react-router";

export const Route = createFileRoute("/404")({
  component: NotFoundPage,
});

function NotFoundPage() {
  return (
    <div className="relative flex min-h-[70vh] items-center justify-center overflow-hidden">
      {/* Decorative Background Elements */}
      <div className="bg-accent/10 absolute top-20 left-10 h-20 w-20 animate-pulse rounded-full blur-xl" />
      <div className="bg-secondary/20 absolute right-10 bottom-20 h-32 w-32 rounded-full blur-xl" />

      <div className="z-10 container mx-auto px-4">
        <div className="mx-auto flex max-w-5xl flex-col items-center justify-center gap-12 lg:flex-row lg:gap-8">
          {/* Text Content */}
          <div className="flex-1 space-y-6 text-center lg:text-left">
            <div className="relative inline-block">
              <h1 className="text-accent -rotate-2 transform text-8xl font-black tracking-tighter md:text-9xl">
                404
              </h1>
              <span className="absolute -top-4 -right-8 rotate-12 transform rounded-full bg-black px-3 py-1 text-sm font-bold text-white shadow-md">
                OOF!
              </span>
            </div>

            <h2 className="text-secondary text-3xl leading-tight font-black tracking-tight md:text-4xl">
              This page is currently
              <br />
              <span className="text-accent underline decoration-wavy decoration-2 underline-offset-4">
                in the oven
              </span>
              .
            </h2>

            <p className="text-secondary/70 mx-auto max-w-md text-lg leading-relaxed font-medium lg:mx-0">
              We couldn't find the page you're looking for. It might have been
              eaten by our mascot or it's still being baked!
            </p>

            <div className="flex flex-col justify-center gap-4 pt-4 sm:flex-row lg:justify-start">
              <Link
                to="/"
                className="bg-accent text-on-accent inline-flex items-center rounded-full px-8 font-bold text-white shadow-lg transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
              >
                Take Me Home
              </Link>
              <Link
                to="/explore"
                className="border-border inline-flex items-center rounded-full border bg-white px-8 font-bold transition-all duration-300 hover:bg-surface"
              >
                Explore Merch
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
