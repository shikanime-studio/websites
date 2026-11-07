import { createFileRoute } from "@tanstack/react-router";
import { json } from "@tanstack/react-start";
import { getRequest } from "@tanstack/react-start/server";
import { createD1Database } from "../../../lib/db";
import {
  expiryDate,
  MAX_UPLOAD_SIZE,
  newTransferId,
  uploadIntentSchema,
} from "../../../lib/transfert";
import { transfers } from "../../../schema";

export const Route = createFileRoute("/api/t/")({
  server: {
    handlers: {
      POST: async () => {
        const request = getRequest();
        const db = createD1Database();
        const parsed = uploadIntentSchema.safeParse(await request.json());
        if (!parsed.success) {
          return json({ error: "invalid intent" }, { status: 400 });
        }
        if (parsed.data.size > MAX_UPLOAD_SIZE) {
          return json({ error: "too large" }, { status: 413 });
        }
        const id = newTransferId(() =>
          crypto.getRandomValues(new Uint8Array(10)),
        );
        const now = new Date();
        await db.insert(transfers).values({
          id,
          filename: parsed.data.filename,
          size: parsed.data.size,
          createdAt: now,
          expiresAt: expiryDate(now),
        });
        const origin = new URL(request.url).origin;
        return json({ id, url: `${origin}/t/${id}` });
      },
    },
  },
});
