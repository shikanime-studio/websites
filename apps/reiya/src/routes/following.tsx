import { createFileRoute } from "@tanstack/react-router";
import { Following as FollowingComponent } from "../components/Following";

export const Route = createFileRoute("/following")({
  component: FollowingPage,
});

function FollowingPage() {
  return <FollowingComponent />;
}
