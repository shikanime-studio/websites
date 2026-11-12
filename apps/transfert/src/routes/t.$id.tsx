import { Button } from "@astryxdesign/core/Button";
import { Card } from "@astryxdesign/core/Card";
import { Heading } from "@astryxdesign/core/Heading";
import { Text } from "@astryxdesign/core/Text";
import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { client } from "../lib/api-client";
import { TRANSFER_TTL_DAYS } from "../lib/transfert";

export const Route = createFileRoute("/t/$id")({
  component: DownloadPage,
});

function DownloadPage() {
  const { id } = Route.useParams();
  const [meta, setMeta] = useState<{
    image: boolean;
    live: boolean;
  } | null>(null);

  useEffect(() => {
    client
      .getTransferMeta({ id })
      .then(setMeta)
      .catch(() => setMeta({ image: false, live: false }));
  }, [id]);

  return (
    <div className="mx-auto flex w-full max-w-md flex-col px-4 py-24">
      <div className="flex flex-col items-center gap-4 text-center">
        <Heading level={1} type="display-2" className="font-display">
          {meta === null ? "…" : meta.live ? "Download ready" : "Link expired"}
        </Heading>
        {meta?.live ? (
          <>
            <Text color="secondary">
              This link expires {String(TRANSFER_TTL_DAYS)} days after upload.
            </Text>
            {meta.image ? (
              <Card className="w-full">
                <img
                  alt="Transfer preview"
                  className="max-h-80 w-full rounded-lg object-contain"
                  src={`/api/t/${id}`}
                />
              </Card>
            ) : null}
            <Card className="w-full">
              <Button
                label="Download"
                variant="primary"
                href={`/api/t/${id}`}
                className="w-full"
              />
            </Card>
          </>
        ) : meta !== null ? (
          <Text color="secondary">
            The file was deleted or the link has expired.
          </Text>
        ) : null}
      </div>
    </div>
  );
}
