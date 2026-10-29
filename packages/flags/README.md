# @shikanime-studio/flags

Feature flags for the studio apps: [OpenFeature](https://openfeature.dev) on
Cloudflare Flagship. Non-React, no build step — the workspace consumes the
TypeScript source directly.

## Usage

Declare the flags an app reads next to their fallbacks, then resolve them in
one server call:

```ts
import type { BooleanFlags } from "@shikanime-studio/flags";
import { createServerFn } from "@tanstack/react-start";

const FLAGS = {
  placePin: { key: "place-pin", fallback: true },
} satisfies BooleanFlags;

export const getFlagsFn = createServerFn().handler(async () => {
  const [{ resolveFlags }, { env }] = await Promise.all([
    import("@shikanime-studio/flags/server"),
    import("cloudflare:workers"),
  ]);
  return resolveFlags({ binding: env.FLAGS, flags: FLAGS });
});
```

Both imports are dynamic on purpose: `@cloudflare/flagship/server` and
`@openfeature/server-sdk` pull Node built-ins and `cloudflare:workers`, none of
which belong in a client bundle. Inside a server-function handler they never
are.

## Wiring an app

1. `wrangler.jsonc`: declare the binding with the app's Flagship id.

   ```json
   {
     "flagship": [
       { "binding": "FLAGS", "app_id": "<APP_ID>", "remote": true }
     ]
   }
   ```

   `remote: true` is required: Flagship's local simulator cannot evaluate and
   answers `Binding FLAGS needs to be run remotely`. Local dev therefore reads
   the real app and needs a Cloudflare login.
2. Create the flag in that app (`wrangler flagship flags create`), keeping the
   key in sync with the registry.
3. Add the fallback that the app should serve when Flagship cannot answer.

## Rules

- The fallback is the outage behaviour: pick the safe value, not the new one.
- One provider per isolate is assumed; a Worker binding to one Flagship app is
  the supported shape.
- Do not evaluate flags in the browser. Resolve them server-side and pass the
  result down, as `hikari` does with its `flagsAtom`.
