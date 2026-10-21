const SCOPE_LABELS: Record<string, string> = {
  openid: "Confirm your identity",
  profile: "Your name and profile picture",
  email: "Your email address",
  offline_access: "Stay connected while you're away",
};

/** Human wording for an OAuth scope, falling back to the raw scope. */
export function describeScope(scope: string): string {
  return SCOPE_LABELS[scope] ?? scope;
}
