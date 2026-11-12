import { Heading } from "@astryxdesign/core/Heading";
import { Text } from "@astryxdesign/core/Text";
import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { SignInButton } from "../components/SignInButton";
import { TransfertForm } from "../components/TransfertForm";
import { client } from "../lib/api-client";
import { MAX_UPLOAD_SIZE } from "../lib/transfert";

export const Route = createFileRoute("/")({
  component: HomePage,
});

function HomePage() {
  const [user, setUser] = useState<{
    name: string;
    email: string;
    image?: string | null;
  } | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    client
      .getSession()
      .then(setUser)
      .catch(() => setUser(null))
      .finally(() => setReady(true));
  }, []);

  return (
    <div className="mx-auto flex w-full max-w-md flex-col px-4 py-24">
      <div className="flex flex-col items-center gap-4 text-center">
        <Heading level={1} type="display-2" className="font-display">
          Transfert
        </Heading>
        <Text color="secondary">
          Send files that self-destruct after 7 days.
        </Text>
        {user ? (
          <SignedInArea email={user.email} />
        ) : ready ? (
          <div className="mt-6 flex flex-col items-center gap-2">
            <SignInButton size="md" />
            <Text color="secondary" size="sm">
              Sign in with your Shikanime Studio account to send files.
            </Text>
          </div>
        ) : null}
      </div>
    </div>
  );
}

interface TransferRow {
  id: string;
  filename: string;
  size: number;
  downloads: number;
  unseen: number;
  expiresAt: string;
}

function SignedInArea({ email }: { email: string }) {
  const [transfers, setTransfers] = useState<Array<TransferRow>>([]);

  useEffect(() => {
    client
      .listMyTransfers()
      .then(setTransfers)
      .catch(() => setTransfers([]));
  }, []);

  const unseen = transfers.some((row) => row.unseen > 0);
  useEffect(() => {
    if (unseen) {
      client.markSeen().catch(() => {});
    }
  }, [unseen]);

  return (
    <div className="mt-4 flex w-full flex-col items-center gap-3">
      <TransfertForm maxBytes={MAX_UPLOAD_SIZE} />
      {transfers.length > 0 ? (
        <div className="mt-2 flex w-full flex-col gap-2">
          <Text color="secondary" size="sm" weight="bold">
            Your live transfers
          </Text>
          {transfers.map((row) => (
            <div
              key={row.id}
              className="bg-surface flex w-full items-center justify-between gap-2 rounded-lg px-3 py-2"
            >
              <span className="truncate text-sm">{row.filename}</span>
              {row.unseen > 0 ? (
                <span className="bg-success/10 text-success rounded-full px-2 py-0.5 text-xs font-bold">
                  {`+${String(row.unseen)} new`}
                </span>
              ) : (
                <span className="text-secondary text-xs">
                  {`${String(row.downloads)} downloads`}
                </span>
              )}
            </div>
          ))}
        </div>
      ) : null}
      <Text color="secondary" size="sm">
        {email}
      </Text>
    </div>
  );
}
