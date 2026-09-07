import { createFileRoute, Link } from "@tanstack/react-router";

export const Route = createFileRoute("/404")({
  component: NotFound,
});

function NotFound() {
  return (
    <div className="mx-auto flex w-full max-w-md flex-col items-center gap-4 px-4 py-24">
      <h1 className="text-secondary text-5xl font-black tracking-tight">404</h1>
      <p className="text-secondary/80 text-center text-base font-semibold">
        This page does not exist.
      </p>
      <Link
        to="/"
        className="bg-accent text-on-accent inline-flex h-12 items-center rounded-full px-10 text-base font-black"
      >
        Go home
      </Link>
    </div>
  );
}
