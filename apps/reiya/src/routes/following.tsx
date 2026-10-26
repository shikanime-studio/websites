import { createFileRoute } from "@tanstack/react-router";
import { Following as FollowingComponent } from "../components/Following";
import { PageShell } from "../components/PageShell";

export const Route = createFileRoute("/following")({
  component: FollowingPage,
});

function FollowingPage() {
  return (
    <PageShell>
      <div className="flex flex-col gap-1">
        <h1 className="font-display text-secondary text-2xl font-semibold tracking-tight">
          Following
        </h1>
        <p className="text-secondary/70 text-sm">
          The artists, characters and events you keep coming back to.
        </p>
      </div>
      <FollowingComponent />
    </PageShell>
  );
}
