import { createServerFn } from "@tanstack/react-start";
import { getRequest } from "@tanstack/react-start/server";
import { and, asc, desc, eq, or } from "drizzle-orm";
import { z } from "zod";
import * as schema from "../schema";
import { createD1Database } from "./db";
import { canTransition, isCommissionStatus } from "./hikari";
import { getSessionUser } from "./session";
import { createShareToken, parseInvitees, serializeInvitees } from "./sharing";

const createSchema = z.object({
  title: z.string().trim().min(1).max(120),
  description: z.string().trim().max(2000).default(""),
  photographerEmail: z.string().trim().toLowerCase().email(),
  characterName: z.string().trim().max(120).default(""),
  shootingDate: z
    .string()
    .trim()
    .regex(
      /^\d{4}-\d{2}-\d{2}(T\d{2}:\d{2})?$/,
      "Expected YYYY-MM-DD or YYYY-MM-DDTHH:mm",
    )
    .optional(),
  locationName: z.string().trim().max(200).default(""),
  locationQuery: z.string().trim().max(300).default(""),
  timezone: z.string().trim().min(1).max(64).default("Europe/Paris"),
  invitees: z
    .array(
      z.object({
        name: z.string().trim().max(80).default(""),
        email: z.string().trim().toLowerCase().email(),
      }),
    )
    .max(20)
    .default([]),
});

const SHARE_TOKEN_PATTERN = /^[a-f0-9]{24}$/;

const requireUser = async () => {
  const user = await getSessionUser(getRequest());
  if (!user) {
    throw new Error("Unauthorized");
  }
  return user;
};

export const getSessionFn = createServerFn().handler(async () => {
  return getSessionUser(getRequest());
});

export const listCommissions = createServerFn().handler(async () => {
  const user = await requireUser();
  const db = createD1Database();
  return db
    .select()
    .from(schema.commissions)
    .where(
      or(
        eq(schema.commissions.photographerId, user.id),
        eq(schema.commissions.clientId, user.id),
      ),
    )
    .orderBy(desc(schema.commissions.updatedAt));
});

export const getCommission = createServerFn()
  .validator((id: string) => z.coerce.number().int().positive().parse(id))
  .handler(async ({ data: id }) => {
    const user = await requireUser();
    const db = createD1Database();
    const rows = await db
      .select()
      .from(schema.commissions)
      .where(eq(schema.commissions.id, id))
      .limit(1);
    const commission = rows[0];
    if (
      !commission ||
      (commission.photographerId !== user.id &&
        commission.clientId !== user.id)
    ) {
      throw new Error("Not found");
    }
    const photos = await db
      .select({
        id: schema.commissionPhotos.id,
        contentType: schema.commissionPhotos.contentType,
        size: schema.commissionPhotos.size,
        createdAt: schema.commissionPhotos.createdAt,
      })
      .from(schema.commissionPhotos)
      .where(eq(schema.commissionPhotos.commissionId, id))
      .orderBy(asc(schema.commissionPhotos.id));
    return { ...commission, photos };
  });

export const createCommissionFn = createServerFn({ method: "POST" })
  .validator(createSchema)
  .handler(async ({ data: input }) => {
    const user = await requireUser();
    const db = createD1Database();
    const photographer = await db
      .select({ id: schema.users.id })
      .from(schema.users)
      .where(eq(schema.users.email, input.photographerEmail))
      .limit(1);
    const photographerRow = photographer[0];
    if (!photographerRow) {
      throw new Error("No account found for this photographer email");
    }
    const now = new Date();
    const inserted = await db
      .insert(schema.commissions)
      .values({
        title: input.title,
        description: input.description,
        status: "requested",
        photographerId: photographerRow.id,
        clientId: user.id,
        characterName: input.characterName,
        shootingDate: input.shootingDate ?? null,
        timezone: input.timezone,
        locationName: input.locationName,
        locationQuery: input.locationQuery,
        shareToken: createShareToken(),
        invitees: serializeInvitees(input.invitees),
        createdAt: now,
        updatedAt: now,
      })
      .returning();
    const commission = inserted[0];
    if (!commission) {
      throw new Error("Failed to create commission");
    }
    await db.insert(schema.notifications).values({
      userId: photographerRow.id,
      type: "commission_requested",
      title: "New commission request",
      message: `${user.name} requested: ${input.title}`,
      relatedId: commission.id,
      relatedType: "commission",
      createdAt: now,
    });
    return commission;
  });

/**
 * Public recap: anyone holding the token sees the shoot, never the account.
 * The token is the capability; no session is involved.
 */
export const getSharedCommission = createServerFn()
  .validator((token: string) => z.string().regex(SHARE_TOKEN_PATTERN).parse(token))
  .handler(async ({ data: token }) => {
    const db = createD1Database();
    const rows = await db
      .select()
      .from(schema.commissions)
      .where(eq(schema.commissions.shareToken, token))
      .limit(1);
    const commission = rows[0];
    if (!commission) {
      return null;
    }
    const photos = await db
      .select({
        id: schema.commissionPhotos.id,
        contentType: schema.commissionPhotos.contentType,
        size: schema.commissionPhotos.size,
      })
      .from(schema.commissionPhotos)
      .where(eq(schema.commissionPhotos.commissionId, commission.id))
      .orderBy(asc(schema.commissionPhotos.id));
    const photographer = await db
      .select({ name: schema.users.name })
      .from(schema.users)
      .where(eq(schema.users.id, commission.photographerId))
      .limit(1);
    const client = await db
      .select({ name: schema.users.name })
      .from(schema.users)
      .where(eq(schema.users.id, commission.clientId))
      .limit(1);
    return {
      id: commission.id,
      title: commission.title,
      description: commission.description,
      status: commission.status,
      characterName: commission.characterName,
      shootingDate: commission.shootingDate,
      timezone: commission.timezone,
      locationName: commission.locationName,
      locationQuery: commission.locationQuery,
      shareToken: commission.shareToken,
      invitees: parseInvitees(commission.invitees),
      photographerName: photographer[0]?.name ?? "Shikanime Studio",
      clientName: client[0]?.name ?? "Client",
      photos,
    };
  });

export const changeCommissionStatusFn = createServerFn({ method: "POST" })
  .validator((input: { id: number; status: string }) =>
    z
      .object({
        id: z.number().int().positive(),
        status: z.string().refine(isCommissionStatus, "Unknown commission status"),
      })
      .parse(input),
  )
  .handler(async ({ data }) => {
    const user = await requireUser();
    const db = createD1Database();
    const rows = await db
      .select()
      .from(schema.commissions)
      .where(eq(schema.commissions.id, data.id))
      .limit(1);
    const commission = rows[0];
    if (
      !commission ||
      (commission.photographerId !== user.id &&
        commission.clientId !== user.id)
    ) {
      throw new Error("Not found");
    }
    const next = data.status;
    if (!canTransition(commission.status, next)) {
      throw new Error(`Invalid transition ${commission.status} → ${next}`);
    }
    const now = new Date();
    const updated = await db
      .update(schema.commissions)
      .set({ status: next, updatedAt: now })
      .where(eq(schema.commissions.id, data.id))
      .returning();
    const counterpartId =
      user.id === commission.photographerId
        ? commission.clientId
        : commission.photographerId;
    await db.insert(schema.notifications).values({
      userId: counterpartId,
      type: `commission_${next}`,
      title: "Commission update",
      message: `${commission.title} is now ${next}`,
      relatedId: commission.id,
      relatedType: "commission",
      createdAt: now,
    });
    return updated[0];
  });

export const getUserPreferences = createServerFn().handler(async () => {
  const user = await requireUser();
  const db = createD1Database();
  const rows = await db
    .select()
    .from(schema.userPreferences)
    .where(eq(schema.userPreferences.userId, user.id))
    .limit(1);
  return rows[0] ?? null;
});

export const setUserPreferences = createServerFn({ method: "POST" })
  .validator(
    z.object({
      locale: z.enum(["en", "fr", "ja"]),
    }),
  )
  .handler(async ({ data }) => {
    const user = await requireUser();
    const db = createD1Database();
    const now = new Date();
    await db
      .insert(schema.userPreferences)
      .values({ userId: user.id, locale: data.locale, updatedAt: now })
      .onConflictDoUpdate({
        target: schema.userPreferences.userId,
        set: { locale: data.locale, updatedAt: now },
      });
    return { locale: data.locale };
  });

export const listNotifications = createServerFn().handler(async () => {
  const user = await requireUser();
  const db = createD1Database();
  return db
    .select()
    .from(schema.notifications)
    .where(eq(schema.notifications.userId, user.id))
    .orderBy(desc(schema.notifications.id))
    .limit(20);
});

export const markNotificationReadFn = createServerFn({ method: "POST" })
  .validator((id: number) => z.number().int().positive().parse(id))
  .handler(async ({ data: id }) => {
    const user = await requireUser();
    const db = createD1Database();
    await db
      .update(schema.notifications)
      .set({ isRead: true })
      .where(
        and(
          eq(schema.notifications.id, id),
          eq(schema.notifications.userId, user.id),
        ),
      );
    return { ok: true };
  });
