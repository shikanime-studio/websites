import type { BooleanFlags } from "@shikanime-studio/flags";
import type { CommissionStatus } from "../schema";
import type { CastEntry, CharacterEntry } from "./cast";
import { createServerFn } from "@tanstack/react-start";
import { getRequest } from "@tanstack/react-start/server";
import { and, asc, desc, eq, inArray, isNull, ne, or, sql } from "drizzle-orm";
import { z } from "zod";
import * as schema from "../schema";
import {
  createInviteToken,
  isInviteToken,
  isInviteUsable,
  normalizeCast,
  normalizeCharacters,
} from "./cast";
import { createD1Database } from "./db";
import { canTransition, isCommissionStatus } from "./hikari";
import { getSessionUser } from "./session";
import { createShareToken, parseInvitees, serializeInvitees } from "./sharing";

/** Free text is fine only while Intl can actually format with it. */
function isIanaTimezone(value: string): boolean {
  try {
    return Boolean(Intl.DateTimeFormat("en-US", { timeZone: value }));
  } catch {
    return false;
  }
}

const createSchema = z.object({
  title: z.string().trim().min(1).max(120),
  description: z.string().trim().max(2000).default(""),
  photographerEmail: z.string().trim().toLowerCase().email().optional(),
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
  locationLat: z.number().finite().min(-90).max(90).optional(),
  locationLng: z.number().finite().min(-180).max(180).optional(),
  timezone: z
    .string()
    .trim()
    .min(1)
    .max(64)
    .default("Europe/Paris")
    .refine(isIanaTimezone, "Unknown timezone"),
  cast: z
    .array(
      z.object({
        role: z.enum(["photographer", "cosplayer", "assistant"]),
        name: z.string().trim().max(80),
      }),
    )
    .max(12)
    .default([]),
  characters: z
    .array(
      z.object({
        name: z.string().trim().max(80),
        series: z.string().trim().max(80).default(""),
      }),
    )
    .max(8)
    .default([]),
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
  const seats = await db
    .select({ commissionId: schema.commissionCast.commissionId })
    .from(schema.commissionCast)
    .where(eq(schema.commissionCast.userId, user.id));
  const seatIds = seats.map((seat) => seat.commissionId);
  return db
    .select()
    .from(schema.commissions)
    .where(
      or(
        eq(schema.commissions.photographerId, user.id),
        eq(schema.commissions.clientId, user.id),
        ...(seatIds.length > 0
          ? [inArray(schema.commissions.id, seatIds)]
          : []),
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
    if (!commission) {
      throw new Error("Not found");
    }
    const owner =
      commission.photographerId === user.id || commission.clientId === user.id;
    if (!owner) {
      const seat = await db
        .select({ id: schema.commissionCast.id })
        .from(schema.commissionCast)
        .where(
          and(
            eq(schema.commissionCast.commissionId, commission.id),
            eq(schema.commissionCast.userId, user.id),
          ),
        )
        .limit(1);
      if (seat.length === 0) {
        throw new Error("Not found");
      }
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
    const attendees = await db
      .select({
        id: schema.commissionAttendees.id,
        name: schema.users.name,
        email: schema.users.email,
      })
      .from(schema.commissionAttendees)
      .innerJoin(
        schema.users,
        eq(schema.users.id, schema.commissionAttendees.userId),
      )
      .where(eq(schema.commissionAttendees.commissionId, id))
      .orderBy(asc(schema.commissionAttendees.id));
    const characters = await listCharacters(db, id);
    const cast = await listCast(db, id);
    // Invite tokens are capabilities: crew can read the shoot, not hand out
    // more seats. Only the two owners see the links.
    const invites = owner
      ? await db
        .select()
        .from(schema.commissionInvites)
        .where(eq(schema.commissionInvites.commissionId, id))
        .orderBy(desc(schema.commissionInvites.id))
      : [];
    return { ...commission, photos, attendees, characters, cast, invites };
  });

/** Upserts the series and characters a shoot is photographing. */
async function resolveCharacters(
  db: ReturnType<typeof createD1Database>,
  entries: CharacterEntry[],
): Promise<number[]> {
  const ids: number[] = [];
  const now = new Date();
  for (const entry of normalizeCharacters(entries)) {
    let seriesId: number | null = null;
    if (entry.series.length > 0) {
      const existing = await db
        .select({ id: schema.series.id })
        .from(schema.series)
        .where(eq(schema.series.name, entry.series))
        .limit(1);
      if (existing[0]) {
        seriesId = existing[0].id;
      } else {
        const created = await db
          .insert(schema.series)
          .values({ name: entry.series, createdAt: now })
          .onConflictDoNothing()
          .returning({ id: schema.series.id });
        if (created[0]) {
          seriesId = created[0].id;
        } else {
          const raced = await db
            .select({ id: schema.series.id })
            .from(schema.series)
            .where(eq(schema.series.name, entry.series))
            .limit(1);
          seriesId = raced[0]?.id ?? null;
        }
      }
    }
    const match = await db
      .select({ id: schema.characters.id })
      .from(schema.characters)
      .where(
        and(
          eq(schema.characters.name, entry.name),
          seriesId === null
            ? isNull(schema.characters.seriesId)
            : eq(schema.characters.seriesId, seriesId),
        ),
      )
      .limit(1);
    if (match[0]) {
      ids.push(match[0].id);
    } else {
      const created = await db
        .insert(schema.characters)
        .values({ name: entry.name, seriesId, createdAt: now })
        .onConflictDoNothing()
        .returning({ id: schema.characters.id });
      if (created[0]) {
        ids.push(created[0].id);
        continue;
      }
      const raced = await db
        .select({ id: schema.characters.id })
        .from(schema.characters)
        .where(
          and(
            eq(schema.characters.name, entry.name),
            seriesId === null
              ? isNull(schema.characters.seriesId)
              : eq(schema.characters.seriesId, seriesId),
          ),
        )
        .limit(1);
      if (raced[0]) ids.push(raced[0].id);
    }
  }
  return ids;
}

async function insertCast(
  db: ReturnType<typeof createD1Database>,
  commissionId: number,
  entries: CastEntry[],
  now: Date,
): Promise<void> {
  const rows = normalizeCast(entries);
  if (rows.length === 0) return;
  await db.insert(schema.commissionCast).values(
    rows.map((entry) => ({
      commissionId,
      role: entry.role,
      displayName: entry.name,
      createdAt: now,
    })),
  );
}

/** Characters on a shoot, with their series, in the order they were added. */
async function listCharacters(
  db: ReturnType<typeof createD1Database>,
  commissionId: number,
): Promise<Array<{ id: number; name: string; series: string | null }>> {
  return db
    .select({
      id: schema.characters.id,
      name: schema.characters.name,
      series: schema.series.name,
    })
    .from(schema.commissionCharacters)
    .innerJoin(
      schema.characters,
      eq(schema.characters.id, schema.commissionCharacters.characterId),
    )
    .leftJoin(schema.series, eq(schema.series.id, schema.characters.seriesId))
    .where(eq(schema.commissionCharacters.commissionId, commissionId))
    .orderBy(asc(schema.commissionCharacters.position));
}

/** The cast, grouped later by role on the client. */
async function listCast(
  db: ReturnType<typeof createD1Database>,
  commissionId: number,
): Promise<Array<{ id: number; role: schema.CommissionRole; name: string }>> {
  const rows = await db
    .select({
      id: schema.commissionCast.id,
      role: schema.commissionCast.role,
      displayName: schema.commissionCast.displayName,
      userName: schema.users.name,
    })
    .from(schema.commissionCast)
    .leftJoin(schema.users, eq(schema.users.id, schema.commissionCast.userId))
    .where(eq(schema.commissionCast.commissionId, commissionId))
    .orderBy(asc(schema.commissionCast.id));
  return rows.map((row) => ({
    id: row.id,
    role: row.role,
    name: row.userName ?? row.displayName,
  }));
}

export const createCommissionFn = createServerFn({ method: "POST" })
  .validator(createSchema)
  .handler(async ({ data: input }) => {
    const user = await requireUser();
    const db = createD1Database();
    // A request may name a photographer, but the plan can also start as a
    // self-managed shoot: the creator holds the lead role until someone
    // accepts an invite.
    const photographerRow = input.photographerEmail
      ? (
        await db
          .select({ id: schema.users.id, name: schema.users.name })
          .from(schema.users)
          .where(eq(schema.users.email, input.photographerEmail))
          .limit(1)
      )[0]
      : { id: user.id, name: user.name };
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
        locationLat: input.locationLat ?? null,
        locationLng: input.locationLng ?? null,
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
    const characterIds = await resolveCharacters(db, input.characters);
    if (characterIds.length > 0) {
      await db.insert(schema.commissionCharacters).values(
        characterIds.map((characterId, position) => ({
          commissionId: commission.id,
          characterId,
          position,
        })),
      );
    }
    const castEntries: CastEntry[] = [...input.cast];
    if (!castEntries.some((entry) => entry.role === "photographer")) {
      castEntries.unshift({
        role: "photographer",
        name: photographerRow.name ?? "",
      });
    }
    if (
      photographerRow.id !== user.id
      && !castEntries.some((entry) => entry.name === user.name)
    ) {
      // The person who filed the request is on set too.
      castEntries.push({ role: "cosplayer", name: user.name });
    }
    await insertCast(db, commission.id, castEntries, now);
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
    const attendees = await db
      .select({
        id: schema.commissionAttendees.id,
        name: schema.users.name,
        email: schema.users.email,
      })
      .from(schema.commissionAttendees)
      .innerJoin(
        schema.users,
        eq(schema.users.id, schema.commissionAttendees.userId),
      )
      .where(eq(schema.commissionAttendees.commissionId, commission.id))
      .orderBy(asc(schema.commissionAttendees.id));
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
      locationLat: commission.locationLat,
      locationLng: commission.locationLng,
      shareToken: commission.shareToken,
      invitees: parseInvitees(commission.invitees),
      attendees,
      characters: await listCharacters(db, commission.id),
      cast: await listCast(db, commission.id),
      photographerName: photographer[0]?.name ?? "Shikanime Studio",
      clientName: client[0]?.name ?? "Client",
      photos,
    };
  });

/** Public linktree-style profile for a photographer slug. */
export const getPublicProfile = createServerFn()
  .validator((slug: string) => z.string().trim().min(2).max(48).parse(slug))
  .handler(async ({ data: slug }) => {
    const db = createD1Database();
    const rows = await db
      .select({
        userId: schema.photographerProfiles.userId,
        headline: schema.photographerProfiles.headline,
        bio: schema.photographerProfiles.bio,
        location: schema.photographerProfiles.location,
        instagram: schema.photographerProfiles.instagram,
        links: schema.photographerProfiles.links,
        acceptRequests: schema.photographerProfiles.acceptRequests,
        name: schema.users.name,
        image: schema.users.image,
      })
      .from(schema.photographerProfiles)
      .innerJoin(schema.users, eq(schema.users.id, schema.photographerProfiles.userId))
      .where(eq(schema.photographerProfiles.slug, slug))
      .limit(1);
    const profile = rows[0];
    if (!profile) {
      return null;
    }
    const base = db
      .select({
        id: schema.commissions.id,
        title: schema.commissions.title,
        characterName: schema.commissions.characterName,
        shootingDate: schema.commissions.shootingDate,
        timezone: schema.commissions.timezone,
        locationName: schema.commissions.locationName,
        status: schema.commissions.status,
      })
      .from(schema.commissions)
      .where(
        and(
          eq(schema.commissions.photographerId, profile.userId),
          ne(schema.commissions.status, "refused" as CommissionStatus),
        ),
      )
      .orderBy(desc(schema.commissions.shootingDate));
    const upcoming = await base.limit(8);
    const pastRows = await db
      .select({
        id: schema.commissions.id,
        title: schema.commissions.title,
        characterName: schema.commissions.characterName,
        shootingDate: schema.commissions.shootingDate,
        locationName: schema.commissions.locationName,
        status: schema.commissions.status,
        photoCount: sql<number>`(
          select count(*) from ${schema.commissionPhotos}
          where ${schema.commissionPhotos.commissionId} = ${schema.commissions.id}
        )`.mapWith(Number),
      })
      .from(schema.commissions)
      .where(
        and(
          eq(schema.commissions.photographerId, profile.userId),
          inArray(schema.commissions.status, ["completed", "delivered"] as CommissionStatus[]),
        ),
      )
      .orderBy(desc(schema.commissions.shootingDate))
      .limit(12);
    return {
      name: profile.name,
      image: profile.image,
      slug,
      headline: profile.headline,
      bio: profile.bio,
      location: profile.location,
      instagram: profile.instagram,
      links: JSON.parse(profile.links || "[]"),
      acceptRequests: profile.acceptRequests,
      plans: upcoming.filter((item) => !["completed", "delivered"].includes(item.status)),
      past: pastRows.map((row) => ({ ...row, photoCount: row.photoCount ?? 0 })),
    };
  });

export const saveMyProfile = createServerFn({ method: "POST" })
  .validator(
    z.object({
      slug: z
        .string()
        .trim()
        .toLowerCase()
        .regex(/^[a-z0-9-]{2,48}$/),
      headline: z.string().trim().max(120).default(""),
      bio: z.string().trim().max(400).default(""),
      location: z.string().trim().max(120).default(""),
      instagram: z.string().trim().max(64).default(""),
      links: z
        .array(z.object({ label: z.string().trim().max(60), url: z.string().trim().url().max(300) }))
        .max(8)
        .default([]),
      acceptRequests: z.boolean().default(true),
    }),
  )
  .handler(async ({ data }) => {
    const user = await getSessionUser(getRequest());
    if (!user) {
      throw new Error("Unauthorized");
    }
    const db = createD1Database();
    await db
      .insert(schema.photographerProfiles)
      .values({
        userId: user.id,
        slug: data.slug,
        headline: data.headline,
        bio: data.bio,
        location: data.location,
        instagram: data.instagram,
        links: JSON.stringify(data.links),
        acceptRequests: data.acceptRequests,
        updatedAt: new Date(),
      })
      .onConflictDoUpdate({
        target: schema.photographerProfiles.slug,
        set: {
          slug: data.slug,
          headline: data.headline,
          bio: data.bio,
          location: data.location,
          instagram: data.instagram,
          links: JSON.stringify(data.links),
          acceptRequests: data.acceptRequests,
          updatedAt: new Date(),
        },
      });
    return { slug: data.slug };
  });

export const getMyProfile = createServerFn().handler(async () => {
  const user = await getSessionUser(getRequest());
  if (!user) {
    throw new Error("Unauthorized");
  }
  const db = createD1Database();
  const rows = await db
    .select()
    .from(schema.photographerProfiles)
    .where(eq(schema.photographerProfiles.userId, user.id))
    .limit(1);
  const row = rows[0];
  return {
    slug: row?.slug ?? "",
    headline: row?.headline ?? "",
    bio: row?.bio ?? "",
    location: row?.location ?? "",
    instagram: row?.instagram ?? "",
    links: JSON.parse(row?.links || "[]") as Array<{ label: string; url: string }>,
    acceptRequests: row?.acceptRequests ?? true,
    name: user.name,
  };
});

/** A signed-in visitor claims their seat on a shoot via the share link. */
export const joinSharedCommission = createServerFn({ method: "POST" })
  .validator((token: string) => z.string().regex(SHARE_TOKEN_PATTERN).parse(token))
  .handler(async ({ data: token }) => {
    const user = await getSessionUser(getRequest());
    if (!user) {
      throw new Error("Unauthorized");
    }
    const db = createD1Database();
    const rows = await db
      .select({ id: schema.commissions.id })
      .from(schema.commissions)
      .where(eq(schema.commissions.shareToken, token))
      .limit(1);
    const commission = rows[0];
    if (!commission) {
      throw new Error("Not found");
    }
    await db
      .insert(schema.commissionAttendees)
      .values({ commissionId: commission.id, userId: user.id, createdAt: new Date() })
      .onConflictDoNothing();
    return { name: user.name, email: user.email };
  });

/** Character search for the picker: name, series, or both. */
export const searchCharactersFn = createServerFn()
  .validator((q: string) => z.string().trim().max(80).parse(q))
  .handler(async ({ data: q }) => {
    await requireUser();
    if (q.length < 2) {
      return [];
    }
    const db = createD1Database();
    const like = `%${q.toLowerCase()}%`;
    return db
      .select({
        id: schema.characters.id,
        name: schema.characters.name,
        series: schema.series.name,
      })
      .from(schema.characters)
      .leftJoin(schema.series, eq(schema.series.id, schema.characters.seriesId))
      .where(
        or(
          sql`lower(${schema.characters.name}) like ${like}`,
          sql`lower(${schema.series.name}) like ${like}`,
        ),
      )
      .orderBy(asc(schema.characters.name))
      .limit(8);
  });

async function requireCommissionOwner(commissionId: number) {
  const user = await requireUser();
  const db = createD1Database();
  const rows = await db
    .select()
    .from(schema.commissions)
    .where(eq(schema.commissions.id, commissionId))
    .limit(1);
  const commission = rows[0];
  if (
    !commission
    || (commission.photographerId !== user.id
      && commission.clientId !== user.id)
  ) {
    throw new Error("Not found");
  }
  return { user, db, commission };
}

/**
 * Invitations are links, not usernames: the creator picks a role and gets a
 * URL that grants it on this shoot. The link is the capability — no account
 * lookup, no email.
 */
export const createInviteFn = createServerFn({ method: "POST" })
  .validator((input: { commissionId: number; role: string; label?: string; days?: number }) =>
    z
      .object({
        commissionId: z.number().int().positive(),
        role: z.enum(["photographer", "cosplayer", "assistant"]),
        label: z.string().trim().max(80).default(""),
        days: z.number().int().min(0).max(365).default(0),
      })
      .parse(input),
  )
  .handler(async ({ data }) => {
    const { user, db, commission } = await requireCommissionOwner(
      data.commissionId,
    );
    const now = new Date();
    const expiresAt = data.days > 0
      ? new Date(now.getTime() + data.days * 24 * 60 * 60 * 1000)
      : null;
    const inserted = await db
      .insert(schema.commissionInvites)
      .values({
        commissionId: commission.id,
        token: createInviteToken(),
        role: data.role,
        label: data.label,
        expiresAt,
        createdBy: user.id,
        createdAt: now,
      })
      .returning();
    return inserted[0];
  });

export const revokeInviteFn = createServerFn({ method: "POST" })
  .validator((input: { commissionId: number; inviteId: number }) =>
    z
      .object({
        commissionId: z.number().int().positive(),
        inviteId: z.number().int().positive(),
      })
      .parse(input),
  )
  .handler(async ({ data }) => {
    const { db } = await requireCommissionOwner(data.commissionId);
    const revoked = await db
      .update(schema.commissionInvites)
      .set({ revokedAt: new Date() })
      .where(
        and(
          eq(schema.commissionInvites.id, data.inviteId),
          eq(schema.commissionInvites.commissionId, data.commissionId),
        ),
      )
      .returning({ id: schema.commissionInvites.id });
    if (revoked.length === 0) {
      throw new Error("Not found");
    }
    return { ok: true };
  });

/** Accepting a link adds you to the cast with the role it carried. */
export const joinByInviteFn = createServerFn({ method: "POST" })
  .validator((input: { shareToken: string; inviteToken: string }) =>
    z
      .object({
        shareToken: z.string().regex(SHARE_TOKEN_PATTERN),
        inviteToken: z.string().refine(isInviteToken, "Bad token"),
      })
      .parse(input),
  )
  .handler(async ({ data }) => {
    const user = await getSessionUser(getRequest());
    if (!user) {
      throw new Error("Unauthorized");
    }
    const db = createD1Database();
    const shared = await db
      .select({ id: schema.commissions.id })
      .from(schema.commissions)
      .where(eq(schema.commissions.shareToken, data.shareToken))
      .limit(1);
    const commission = shared[0];
    if (!commission) {
      throw new Error("Not found");
    }
    const rows = await db
      .select()
      .from(schema.commissionInvites)
      .where(eq(schema.commissionInvites.token, data.inviteToken))
      .limit(1);
    const invite = rows[0];
    // The URL names one shoot and one invite: they have to agree, otherwise a
    // link minted for another shoot could be redeemed through this recap.
    if (!invite || invite.commissionId !== commission.id) {
      throw new Error("This invitation is no longer valid");
    }
    if (!isInviteUsable(invite)) {
      throw new Error("This invitation is no longer valid");
    }
    const now = new Date();
    await db
      .insert(schema.commissionCast)
      .values({
        commissionId: commission.id,
        role: invite.role,
        userId: user.id,
        displayName: user.name,
        createdAt: now,
      })
      .onConflictDoNothing();
    // The recap page counts attendees; keep the two views consistent.
    await db
      .insert(schema.commissionAttendees)
      .values({ commissionId: commission.id, userId: user.id, createdAt: now })
      .onConflictDoNothing();
    return { role: invite.role, name: user.name };
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

/**
 * Every flag this app reads, with the value used when Flagship cannot answer.
 * The keys belong to the `hikari` app in Cloudflare Flagship; the Worker
 * reaches it through the FLAGS binding declared in wrangler.jsonc.
 *
 * Resolution lives in @shikanime-studio/flags and is imported dynamically:
 * OpenFeature and the Flagship SDK pull Node built-ins and `cloudflare:workers`,
 * neither of which may appear in the client graph.
 */
const FLAGS = {
  placePin: { key: "place-pin", fallback: true },
} satisfies BooleanFlags;

/** The flags one page needs, resolved once on the server. */
export const getFlagsFn = createServerFn().handler(async () => {
  const [{ resolveFlags }, { env }] = await Promise.all([
    import("@shikanime-studio/flags/server"),
    import("cloudflare:workers"),
  ]);
  return resolveFlags({ binding: env.FLAGS, flags: FLAGS });
});
