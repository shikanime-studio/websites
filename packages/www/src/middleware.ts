import type { MiddlewareHandler } from "astro";

export const onRequest: MiddlewareHandler = async (context, next) => {
  const host = context.request.headers.get("host") || "";
  const url = new URL(context.request.url);
  if (host.startsWith("www.") && url.pathname === "/") {
    return Response.redirect("https://shikanime.studio/", 301);
  }
  return next();
};
