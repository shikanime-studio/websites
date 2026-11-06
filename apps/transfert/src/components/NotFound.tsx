import { Button } from "@astryxdesign/core/Button";
import { Heading } from "@astryxdesign/core/Heading";
import { Text } from "@astryxdesign/core/Text";

export function NotFound() {
  return (
    <div className="mx-auto flex w-full max-w-md flex-col px-4 py-24">
      <div className="flex flex-col items-center gap-4 text-center">
        <span className="bg-accent/10 text-accent flex size-12 items-center justify-center rounded-full text-sm font-black">
          ?
        </span>
        <Text color="secondary" size="sm" weight="bold">
          404
        </Text>
        <Heading level={1} type="display-3" className="font-display">
          This page doesn't exist
        </Heading>
        <Text color="secondary">
          The page you're looking for may have moved or never existed.
        </Text>
        <Button href="/" label="Go home" variant="primary" className="mt-2" />
      </div>
    </div>
  );
}
