import { Button } from "@astryxdesign/core/Button";
import { Heading } from "@astryxdesign/core/Heading";
import { Text } from "@astryxdesign/core/Text";
import { useRef, useState } from "react";

type Phase =
  | { kind: "idle" }
  | { kind: "uploading"; sent: number; total: number }
  | { kind: "done"; url: string }
  | { kind: "error"; message: string };

export function TransfertForm({ maxBytes }: { maxBytes: number }) {
  const [phase, setPhase] = useState<Phase>({ kind: "idle" });
  const inputRef = useRef<HTMLInputElement>(null);

  async function upload(file: File) {
    if (file.size > maxBytes) {
      setPhase({ kind: "error", message: "File too large." });
      return;
    }
    const intentRes = await fetch("/api/t", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ filename: file.name, size: file.size }),
    });
    if (!intentRes.ok) {
      setPhase({ kind: "error", message: "Server refused the transfer." });
      return;
    }
    const intent = (await intentRes.json()) as { id: string; url: string };
    await new Promise<void>((resolve) => {
      const xhr = new XMLHttpRequest();
      xhr.open("PUT", `/api/t/${intent.id}`);
      xhr.upload.onprogress = (event) => {
        setPhase({
          kind: "uploading",
          sent: event.loaded,
          total: event.total,
        });
      };
      xhr.onloadend = () => resolve();
      xhr.send(file);
    });
    setPhase({ kind: "done", url: intent.url });
  }

  return (
    <div className="flex w-full flex-col gap-3">
      {phase.kind === "done" ? (
        <div className="flex flex-col items-center gap-3 text-center">
          <Heading level={2} type="display-3">
            Link ready
          </Heading>
          <code className="bg-surface w-full truncate rounded-lg px-3 py-2 text-sm">
            {phase.url}
          </code>
          <Button
            label="Copy link"
            variant="primary"
            clickAction={() => {
              navigator.clipboard.writeText(phase.url);
            }}
            className="w-full"
          />
          <Text color="secondary" size="sm">
            Anyone with this link can download until it expires.
          </Text>
        </div>
      ) : (
        <>
          <input
            className="hidden"
            type="file"
            onChange={(event) => {
              const file = event.target.files?.[0];
              if (file) {
                upload(file);
              }
            }}
          />
          <Button
            label="Choose file"
            variant="primary"
            clickAction={() => inputRef.current?.click()}
          />
          {phase.kind === "uploading" ? (
            <div className="flex flex-col gap-1">
              <div className="bg-surface h-2 w-full overflow-hidden rounded-full">
                <div
                  className="bg-accent h-full transition-all"
                  style={{
                    width: `${String(
                      Math.min(
                        100,
                        (phase.sent / Math.max(1, phase.total)) * 100,
                      ),
                    )}%`,
                  }}
                />
              </div>
              <Text color="secondary" size="sm">
                {String(
                  Math.round((phase.sent / Math.max(1, phase.total)) * 100),
                )}
                %
              </Text>
            </div>
          ) : null}
          {phase.kind === "error" ? (
            <Text color="secondary">{phase.message}</Text>
          ) : null}
        </>
      )}
    </div>
  );
}
