import type { AstroCookies } from "astro";
import { drizzle } from "drizzle-orm/d1";

export function getRedirectTo(url: URL) {
  const redirectTo = url.searchParams.get("redirectTo");
  if (!redirectTo) {
    return "/";
  }
  return redirectTo;
}

export function setRedirectToCookies(cookies: AstroCookies, url: string) {
  cookies.set("redirect_to", url, {
    httpOnly: true,
    path: "/",
    secure: import.meta.env.PROD,
    sameSite: "lax",
  });
}

export function getRedirectToCookies(cookies: AstroCookies) {
  const redirectTo = cookies.get("redirect_to");
  if (!redirectTo) {
    return "/";
  }
  return redirectTo.value;
}

export function deleteRedirectToCookies(cookies: AstroCookies) {
  cookies.delete("redirect_to");
}

export function getD1Database(locals: App.Locals) {
  return drizzle(locals.runtime.env.DB, {
    logger: import.meta.env.DEV,
  });
}
