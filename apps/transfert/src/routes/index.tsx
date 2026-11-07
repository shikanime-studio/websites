import { Heading } from "@astryxdesign/core/Heading";
import { createFileRoute } from "@tanstack/react-router";
import { TransfertForm } from "../components/TransfertForm";
import { MAX_UPLOAD_SIZE } from "../lib/transfert";

export const Route = createFileRoute("/")({
  component: HomePage,
});

function HomePage() {
  return (
    <div className="mx-auto flex w-full max-w-md flex-col px-4 py-24">
      <div className="flex flex-col items-center gap-4 text-center">
        <Heading level={1} type="display-2" className="font-display">
          Transfert
        </Heading>
        <TransfertForm maxBytes={MAX_UPLOAD_SIZE} />
      </div>
    </div>
  );
}
