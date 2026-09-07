import { useQuery } from "@tanstack/react-query";

interface SessionUser {
  name: string;
  image?: string | null | undefined;
  email?: string;
}

interface SessionResponse {
  user?: SessionUser;
  session?: unknown;
}

async function fetchSession(): Promise<SessionResponse | null> {
  const res = await fetch("/api/auth/get-session");
  if (!res.ok) {
    return null;
  }
  return (await res.json()) as SessionResponse | null;
}

export function useSession() {
  return useQuery({
    queryKey: ["auth", "session"],
    queryFn: fetchSession,
    staleTime: 1000 * 60,
    retry: false,
  });
}
