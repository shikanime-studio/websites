import { Button } from "@astryxdesign/core/Button";
import { Card } from "@astryxdesign/core/Card";
import { Heading } from "@astryxdesign/core/Heading";
import { Text } from "@astryxdesign/core/Text";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/404")({
  component: NotFound,
});

function NotFound() {
  return (
    <div className="mx-auto flex w-full max-w-md flex-col px-4 py-24">
      <Card padding={5}>
        <div className="flex flex-col items-center gap-4 text-center">
          <Text color="secondary" size="sm" weight="bold">
            404
          </Text>
          <Heading level={1}>Page not found</Heading>
          <Text color="secondary">
            The page you are looking for does not exist or has moved.
          </Text>
          <Button href="/" label="Go home" variant="primary" className="mt-2" />
        </div>
      </Card>
    </div>
  );
}
