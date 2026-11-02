interface OneTapResult {
  redirect?: boolean;
  url?: string;
}

/**
 * Where to send the browser after One Tap returns. Signed OAuth requests come
 * back with the provider's continuation URL; a plain sign-in goes to the
 * account center. The one-tap client does not run the redirect plugin, so the
 * component must navigate itself or nothing happens after the popup closes.
 */
export function oneTapDestination(data: OneTapResult | undefined): string {
  if (data?.redirect === true && typeof data.url === "string" && data.url) {
    return data.url;
  }
  return "/settings";
}
