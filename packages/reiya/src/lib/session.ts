import { drizzle } from "drizzle-orm/d1";
import { sessionTable} from "../schema";
import type { APIContext } from "astro";
import { z } from "astro:content";

const db = drizzle(import.meta.env.DB);
export async function createSession(context: APIContext, userId: number){
    const session = await db.insert(sessionTable).values({
        userId,
    }).returning({
        id: sessionTable.id,
        expiresAt: sessionTable.expiresAt
    }).get();
    context.cookies.set("session", session.id, {
        httpOnly: true,
        path: "/",
        secure: import.meta.env.PROD,
        sameSite: "lax",
        expires: session.expiresAt
    });
}

const redirectToSchema = z.object({
   url: z.string().optional(),
});

export function maybeCreateRedirectTo(context: APIContext) {
  const redirectTo = redirectToSchema.parse({
    url: context.url.searchParams.get("redirect_to"),
  });
    if (redirectTo.url) {
        context.cookies.set("redirect_to", redirectTo.url, {
            httpOnly: true,
            path: "/",
            secure: import.meta.env.PROD,
            sameSite: "lax",
        });
    }
}

export function getRedirectTo(context: APIContext) {
    const redirectTo = redirectToSchema.parse({
        url: context.cookies.get("redirect_to"),
    });
    context.cookies.delete("redirect_to");
    return redirectTo.url;
}