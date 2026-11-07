import { Button } from "@astryxdesign/core/Button";
import { Card } from "@astryxdesign/core/Card";
import { Text } from "@astryxdesign/core/Text";
import { createFileRoute } from "@tanstack/react-router";
import { TRANSFER_TTL_DAYS } from "../lib/transfert";

export const Route = createFileRoute("/t/$id")({
  component: DownloadPage,
});

function DownloadPage() {
  const { id } = Route.useParams();
  return (
    <div className="mx-auto flex w-full max-w-md flex-col px-4 py-24">
      <div className="flex flex-col items-center gap-4 text-center">
        <Text color="secondary">
          This link expires {String(TRANSFER_TTL_DAYS)} days after upload.
        </Text>
        <Card className="mt-6 w-full">
          <Button
            label="Download"
            variant="primary"
            href={`/api/t/${id}`}
            className="w-full"
          />
        </Card>
      </div>
    </div>
  );
}
