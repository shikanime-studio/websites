import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/")({
  component: Home,
});

function Home() {
  return (
    <main className="flex min-h-dvh flex-col items-center justify-center gap-4 p-4">
      <h1 className="text-2xl font-bold">Shikanime Studio Accounts</h1>
      <p className="max-w-md text-center text-sm opacity-80">
        This is the Shikanime Studio identity provider. Use your account to sign
        in across shikanime.studio apps.
      </p>
      <a className="link" href="/sign-in">
        Sign in
      </a>
    </main>
  );
}
