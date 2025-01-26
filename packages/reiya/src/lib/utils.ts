import { getProfile } from "./instagram";

export async function predictStatus(
  text: string,
): Promise<"COMMISSIONS_OPEN" | "COMMISSIONS_CLOSED" | undefined> {
  const isCommissionClosed = /closed/i.test(text);
  const isCommissionOpen = /open/i.test(text);
  if (isCommissionClosed && !isCommissionOpen) {
    return "COMMISSIONS_CLOSED";
  }
  if (!isCommissionClosed && isCommissionOpen) {
    return "COMMISSIONS_OPEN";
  }
}

export async function refreshMaker(username: string) {
  const profile = await getProfile(username);
  if (!profile) {
    return undefined;
  }
  return {
    username: profile.username,
    displayName: profile.full_name,
    biography: profile.biography,
    avatarUrl: profile.profile_pic_url_hd,
    status: await predictStatus(profile.biography),
  };
}
