import { Button } from "@astryxdesign/core/Button";
import { Heading } from "@astryxdesign/core/Heading";
import { Text } from "@astryxdesign/core/Text";
import { useRef, useState } from "react";
import { client } from "../lib/api-client";
import { Phase, reduce } from "../lib/phase";

const FilePicker = ({
  onPick,
  message,
}: {
  onPick: (file: File) => void;
  message: string | undefined;
}) => {
  const inputRef = useRef<HTMLInputElement>(null);
  return (
    <>
      <input
        className="hidden"
        type="file"
        ref={inputRef}
        onChange={(event) => {
          const file = event.target.files?.[0];
          if (file) {
            onPick(file);
          }
        }}
      />
      <Button
        label="Choose file"
        variant="primary"
        clickAction={() => inputRef.current?.click()}
        className="w-full"
      />
      {message ? <Text color="secondary">{message}</Text> : null}
    </>
  );
};

const LinkReady = ({ url, onReset }: { url: string; onReset: () => void }) => (
  <div className="flex flex-col items-center gap-3 text-center">
    <Heading level={2} type="display-3">
      Link ready
    </Heading>
    <code className="bg-surface w-full truncate rounded-lg px-3 py-2 text-sm">
      {url}
    </code>
    <Button
      label="Copy link"
      variant="primary"
      clickAction={() => {
        navigator.clipboard.writeText(url);
      }}
      className="w-full"
    />
    <Button
      label="Send another"
      variant="secondary"
      clickAction={onReset}
      className="w-full"
    />
    <Text color="secondary" size="sm">
      Anyone with this link can download until it expires.
    </Text>
  </div>
);

export function TransfertForm({ maxBytes }: { maxBytes: number }) {
  const [phase, setPhase] = useState<Phase>(Phase.Idle());

  async function upload(file: File) {
    setPhase((current) =>
      reduce(current, { _tag: "pick", size: file.size, maxBytes }),
    );
    if (file.size > maxBytes) {
      return;
    }
    try {
      const { url } = await client.createTransfer({
        filename: file.name,
        size: file.size,
      });
      const id = url.split("/").pop() ?? "";
      // The file body cannot ride the JSON API envelope; it goes as a plain
      // POST to the bytes route, cookie-authenticated like everything else.
      const store = new FormData();
      store.set("file", file);
      const res = await fetch(`/api/t/${id}`, { method: "POST", body: store });
      if (!res.ok) {
        throw new Error(await res.text());
      }
      setPhase((current) => reduce(current, { _tag: "linkReady", url }));
    } catch (error) {
      setPhase((current) =>
        reduce(current, {
          _tag: "fail",
          message: error instanceof Error ? error.message : "Upload failed.",
        }),
      );
    }
  }

  if (phase._tag === "Done") {
    return (
      <div className="flex w-full flex-col gap-3">
        <LinkReady url={phase.url} onReset={() => setPhase(Phase.Idle())} />
      </div>
    );
  }
  if (phase._tag === "Uploading") {
    return (
      <div className="flex w-full flex-col gap-3">
        <Button
          isLoading
          label="Uploading"
          variant="primary"
          className="w-full"
        />
      </div>
    );
  }
  const message = phase._tag === "Error" ? phase.message : undefined;
  return (
    <div className="flex w-full flex-col gap-3">
      <FilePicker onPick={upload} message={message} />
    </div>
  );
}
