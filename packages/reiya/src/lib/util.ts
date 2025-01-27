import type { AstroCookies } from "astro";

export function getRedirectTo(url: URL) {
  const redirectTo = url.searchParams.get("redirectTo");
  if (!redirectTo) {
    return "/";
  }
  return redirectTo;
}

export function setRedirectToSession(cookies: AstroCookies, url: string) {
  cookies.set("redirect_to", url, {
    httpOnly: true,
    path: "/",
    secure: import.meta.env.PROD,
    sameSite: "lax",
  });
}

export function getRedirectToSession(cookies: AstroCookies) {
  const redirectTo = cookies.get("redirect_to");
  if (!redirectTo) {
    return "/";
  }
  return redirectTo.value;
}
