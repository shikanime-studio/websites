export type Profile = {
  biography: string;
  profile_pic_url_hd: string;
  username: string;
  full_name: string;
};

export async function getProfile(
  username: string,
): Promise<Profile | undefined> {
  const url = new URL(username, "https://www.instagram.com/");
  url.searchParams.append("__a", "1");
  url.searchParams.append("__d", "1");
  const user = await fetch(url);
  if (!user.ok) {
    return undefined;
  }
  const res = await user.json();
  return res.graphql.user;
}
