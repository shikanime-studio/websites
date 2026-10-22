import { useQuery } from "@tanstack/react-query";
import { authClient } from "../lib/auth-client";

export interface SessionUser {
  name: string;
  email: string;
  emailVerified: boolean;
  image?: string | null | undefined;
}

export interface SessionData {
  user?: SessionUser;
  session?: {
    id?: string;
  };
}

export function useSession() {
  return useQuery({
    queryKey: ["auth", "session"],
    queryFn: async (): Promise<SessionData | null> => {
      const { data, error } = await authClient.getSession();
      if (error) {
        return null;
      }
      return data ?? null;
    },
    staleTime: 1000 * 60,
    retry: false,
  });
}
