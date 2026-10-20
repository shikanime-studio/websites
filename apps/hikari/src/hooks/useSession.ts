import { useQuery } from "@tanstack/react-query";

interface SessionUser {
  name: string;
  image: string | null;
  email: string;
}

interface SessionResponse {
  user: SessionUser;
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

export interface NotificationItem {
  id: number;
  type: string;
  title: string;
  message: string;
  isRead: boolean;
  createdAt: number;
}

async function fetchNotifications(): Promise<NotificationItem[]> {
  const res = await fetch("/api/notifications");
  if (!res.ok) {
    return [];
  }
  return (await res.json()) as NotificationItem[];
}

export function useNotifications() {
  const session = useSession();
  return useQuery({
    queryKey: ["notifications"],
    queryFn: fetchNotifications,
    enabled: Boolean(session.data),
    refetchInterval: 30_000,
  });
}

export async function markRead(id: number) {
  await fetch(`/api/notifications/${String(id)}/read`, { method: "POST" });
}
