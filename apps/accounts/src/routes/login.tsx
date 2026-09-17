import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { OneTap } from "../components/OneTap";
import { useSession } from "../hooks/useSession";

export const Route = createFileRoute("/login")({
  component: LoginPage,
});

function LoginPage() {
  const { data: session } = useSession();
  const [error, setError] = useState<string | null>(null);

  if (session?.user) {
    return <RedirectedNotice />;
  }

  return (
    <div className="mx-auto flex w-full max-w-md flex-col items-center gap-6 px-4 py-24">
      <h1 className="text-secondary text-3xl font-black tracking-tight">
        Sign in
      </h1>
      <p className="text-secondary/80 text-center text-base font-semibold">
        One account for all of Shikanime Studio. Sign in to continue to the
        application that sent you here.
      </p>
      {error
        ? (
          <p className="text-accent text-sm font-bold" role="alert">
            {error}
          </p>
        )
        : null}
      <OneTap onError={setError} />
    </div>
  );
}

function RedirectedNotice() {
  return (
    <div className="mx-auto flex w-full max-w-md flex-col items-center gap-4 px-4 py-24">
      <h1 className="text-secondary text-2xl font-black tracking-tight">
        You are signed in
      </h1>
      <p className="text-secondary/80 text-center text-base font-semibold">
        Return to the application that sent you here to finish connecting.
      </p>
    </div>
  );
}
