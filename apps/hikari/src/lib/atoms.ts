import { family, make } from "effect/reactivity/Atom";
import {
  fetchCommission,
  fetchCommissions,
  fetchFlags,
  fetchNotifications,
  fetchSession,
} from "./api";

export const sessionAtom = make(fetchSession);

export const flagsAtom = make(fetchFlags);

export const commissionsAtom = make(fetchCommissions);

export const notificationsAtom = make(fetchNotifications);

export const commissionAtom = family((id: string) =>
  make(fetchCommission(id)),
);
