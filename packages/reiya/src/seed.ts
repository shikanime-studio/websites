/* eslint-disable @typescript-eslint/no-explicit-any */
import * as schema from "./schema";
import type { Schema } from "./schema";
import { faker } from "@faker-js/faker";
import { reset, seed } from "drizzle-seed";
import fs from "node:fs";
import path from "node:path";
import process from "node:process";
import { z } from "zod";

// Helper to find local D1 database file
function getLocalDbPath() {
  const wranglerDir = path.join(
    process.cwd(),
    ".wrangler/state/v3/d1/miniflare-D1DatabaseObject",
  );

  if (!fs.existsSync(wranglerDir)) {
    throw new Error(`Wrangler directory not found at: ${wranglerDir}`);
  }

  const sqliteFile = fs
    .readdirSync(wranglerDir)
    .find((file) => file.endsWith(".sqlite"));

  if (!sqliteFile) {
    throw new Error(
      "No SQLite file found in .wrangler/state/v3/d1/miniflare-D1DatabaseObject",
    );
  }

  return path.join(wranglerDir, sqliteFile);
}

function isRemoteSeed() {
  return process.argv.includes("--remote") || process.env.REMOTE === "true";
}

interface RemoteEnv {
  accountId: string;
  databaseId: string;
  apiToken: string;
}

const remoteEnvSchema = z.object({
  CLOUDFLARE_ACCOUNT_ID: z.string().min(1),
  CLOUDFLARE_DATABASE_ID: z.string().min(1),
  CLOUDFLARE_API_TOKEN: z.string().min(1),
});

function getRemoteEnv(): RemoteEnv {
  const parsed = remoteEnvSchema.safeParse(process.env);
  if (!parsed.success) {
    throw new Error(
      "Missing remote D1 env. Set CLOUDFLARE_ACCOUNT_ID, CLOUDFLARE_DATABASE_ID, CLOUDFLARE_API_TOKEN.",
    );
  }

  return {
    accountId: parsed.data.CLOUDFLARE_ACCOUNT_ID,
    databaseId: parsed.data.CLOUDFLARE_DATABASE_ID,
    apiToken: parsed.data.CLOUDFLARE_API_TOKEN,
  };
}

async function createLocalDb() {
  const dbPath = getLocalDbPath();
  console.log(`Using local database at: ${dbPath}`);

  const { default: Database } = await import("better-sqlite3");
  const { drizzle } = await import("drizzle-orm/better-sqlite3");

  const sqlite = new Database(dbPath);
  return drizzle<Schema>(sqlite, { schema });
}

async function createRemoteDb() {
  const env = getRemoteEnv();
  console.log(
    `Using remote D1 database at: ${env.accountId}/${env.databaseId} (via Cloudflare API)`,
  );

  const { drizzle } = await import("drizzle-orm/sqlite-proxy");

  const callD1 = async (
    endpoint: "query" | "raw",
    sql: string,
    params: unknown[],
  ) => {
    const url = `https://api.cloudflare.com/client/v4/accounts/${env.accountId}/d1/database/${env.databaseId}/${endpoint}`;
    const res = await fetch(url, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        authorization: `Bearer ${env.apiToken}`,
      },
      body: JSON.stringify({
        sql,
        params: params.map((p) => (p === undefined ? null : p)),
      }),
    });

    const data = (await res.json()) as any;
    if (!res.ok || data?.success !== true) {
      const message =
        data?.errors?.[0]?.message ??
        data?.messages?.[0]?.message ??
        `Request failed with status ${res.status}`;
      throw new Error(message);
    }

    return data.result?.[0];
  };

  const driver = async (
    sql: string,
    params: any[],
    method: "all" | "get" | "values" | "run",
  ): Promise<{ rows: any[] | any[][] }> => {
    if (method === "values") {
      const result = await callD1("raw", sql, params ?? []);
      return { rows: result?.results?.rows ?? [] };
    }

    const result = await callD1("query", sql, params ?? []);
    const rows = (result?.results ?? []) as any[];
    return { rows: method === "get" ? rows.slice(0, 1) : rows };
  };

  const batchDriver = async (
    queries: {
      sql: string;
      params: any[];
      method: "all" | "get" | "values" | "run";
    }[],
  ): Promise<{ rows: any[] | any[][] }[]> => {
    return Promise.all(
      queries.map((q) => driver(q.sql, q.params ?? [], q.method)),
    );
  };

  return drizzle<Schema>(driver, batchDriver, { schema });
}

async function createDb() {
  return isRemoteSeed() ? createRemoteDb() : createLocalDb();
}

async function main() {
  const db = await createDb();

  console.log("🌱 Resetting database...");
  await reset(db as any, schema);

  console.log("🌱 Seeding database...");

  // Static categories data
  const categoriesData = [
    { name: "Stickers", icon: "🏷️" },
    { name: "Prints", icon: "🎨" },
    { name: "Mugs", icon: "☕" },
    { name: "Keychains", icon: "🔑" },
    { name: "Apparel", icon: "👕" },
    { name: "Plushies", icon: "🧸" },
    { name: "Pins", icon: "📍" },
    { name: "Doujinshi", icon: "📚" },
  ];

  await db.insert(schema.categories).values(categoriesData);

  // Select only the main entity tables for automatic seeding
  // We exclude join tables with composite primary keys to avoid unique constraint violations
  // and handle them manually later
  const seedSchema = {
    users: schema.users,
    sessions: schema.sessions,
    accounts: schema.accounts,
    verifications: schema.verifications,
    events: schema.events,
    licenses: schema.licenses,
    characters: schema.characters,
    makers: schema.makers,
    items: schema.items,
    votes: schema.votes,
    notifications: schema.notifications,
    rateLimits: schema.rateLimits,
  };

  // Generate realistic data pool using faker
  faker.seed(12345);
  const COUNT = 50; // Generate a pool of realistic data

  const userAvatars = faker.helpers.multiple(() => faker.image.avatar(), {
    count: COUNT,
  });

  const makerAvatars = faker.helpers.multiple(() => faker.image.avatar(), {
    count: COUNT,
  });
  const makerCovers = faker.helpers.multiple(
    () => faker.image.urlPicsumPhotos({ width: 800, height: 400 }),
    { count: COUNT },
  );
  const makerLinks = faker.helpers.multiple(
    () => [faker.internet.url(), faker.internet.url()],
    { count: COUNT },
  );

  const licenseNames = faker.helpers.multiple(
    () => faker.commerce.productName(),
    { count: COUNT },
  );
  const licenseImages = faker.helpers.multiple(
    () => faker.image.urlPicsumPhotos({ width: 400, height: 400 }),
    { count: COUNT },
  );

  const characterImages = faker.helpers.multiple(
    () => faker.image.urlPicsumPhotos({ width: 300, height: 400 }),
    { count: COUNT },
  );

  const eventImages = faker.helpers.multiple(
    () => faker.image.urlPicsumPhotos({ width: 800, height: 400 }),
    { count: COUNT },
  );
  const eventUrls = faker.helpers.multiple(() => faker.internet.url(), {
    count: COUNT,
  });

  const itemNames = faker.helpers.multiple(() => faker.commerce.productName(), {
    count: COUNT,
  });
  const itemImages = faker.helpers.multiple(
    () => {
      const numImages = faker.number.int({ min: 1, max: 4 });
      return faker.helpers.multiple(
        () => {
          const width = 400;
          const height = faker.number.int({ min: 300, max: 800 });
          return {
            src: faker.image.urlPicsumPhotos({
              width,
              height,
            }),
            width,
            height,
          };
        },
        { count: numImages },
      );
    },
    { count: COUNT },
  );
  const itemPrices = faker.helpers.multiple(() => faker.commerce.price(), {
    count: COUNT,
  });

  await seed(db as any, seedSchema, { count: 10, seed: 12345 }).refine((f) => ({
    users: {
      columns: {
        name: f.fullName(),
        email: f.email(),
        image: f.valuesFromArray({ values: userAvatars }),
      },
    },
    makers: {
      columns: {
        name: f.companyName(),
        description: f.loremIpsum({ sentencesCount: 2 }),
        avatarImageUrl: f.valuesFromArray({ values: makerAvatars }),
        avatarImageWidth: f.int({ minValue: 128, maxValue: 128 }),
        avatarImageHeight: f.int({ minValue: 128, maxValue: 128 }),
        coverImageUrl: f.valuesFromArray({ values: makerCovers }),
        coverImageWidth: f.int({ minValue: 800, maxValue: 800 }),
        coverImageHeight: f.int({ minValue: 400, maxValue: 400 }),
        links: f.valuesFromArray({ values: makerLinks as any[] }),
      },
    },
    licenses: {
      columns: {
        name: f.valuesFromArray({ values: licenseNames }),
        description: f.loremIpsum({ sentencesCount: 3 }),
        imageUrl: f.valuesFromArray({ values: licenseImages }),
        imageWidth: f.int({ minValue: 400, maxValue: 400 }),
        imageHeight: f.int({ minValue: 400, maxValue: 400 }),
      },
    },
    characters: {
      columns: {
        name: f.fullName(),
        description: f.loremIpsum({ sentencesCount: 2 }),
        imageUrl: f.valuesFromArray({ values: characterImages }),
        imageWidth: f.int({ minValue: 300, maxValue: 300 }),
        imageHeight: f.int({ minValue: 400, maxValue: 400 }),
      },
    },
    events: {
      columns: {
        name: f.companyName(),
        description: f.loremIpsum({ sentencesCount: 4 }),
        imageUrl: f.valuesFromArray({ values: eventImages }),
        imageWidth: f.int({ minValue: 800, maxValue: 800 }),
        imageHeight: f.int({ minValue: 400, maxValue: 400 }),
        location: f.city(),
        websiteUrl: f.valuesFromArray({ values: eventUrls }),
        startsAt: f.date(),
        endsAt: f.date(),
      },
    },
    items: {
      columns: {
        name: f.valuesFromArray({ values: itemNames }),
        description: f.loremIpsum({ sentencesCount: 2 }),
        imageUrls: f.valuesFromArray({ values: itemImages as any[] }),
        priceRange: f.valuesFromArray({ values: itemPrices }),
      },
    },
  }));

  console.log("🌱 Seeding relations manually...");

  // Fetch some seeded entities
  const seededUsers = await db.select().from(schema.users).limit(5);
  const seededMakers = await db.select().from(schema.makers).limit(5);
  const seededEvents = await db.select().from(schema.events).limit(3);
  const seededLicenses = await db.select().from(schema.licenses).limit(3);
  const seededCharacters = await db.select().from(schema.characters).limit(5);

  // Helper to insert safely
  const insertSafe = async (table: any, values: any) => {
    try {
      await db.insert(table).values(values).onConflictDoNothing();
    } catch (e) {
      console.warn("Skipping duplicate or failed insert:", e);
    }
  };

  // Seed Users -> Makers (Follows)
  if (seededUsers.length > 0 && seededMakers.length > 0) {
    for (const user of seededUsers) {
      const maker =
        seededMakers[Math.floor(Math.random() * seededMakers.length)];
      await insertSafe(schema.usersToMakers, {
        userId: user.id,
        makerId: maker.id,
      });
    }
  }

  // Seed Events -> Makers (Attendance)
  if (seededEvents.length > 0 && seededMakers.length > 0) {
    for (const event of seededEvents) {
      const maker =
        seededMakers[Math.floor(Math.random() * seededMakers.length)];
      await insertSafe(schema.eventsToMakers, {
        eventId: event.id,
        makerId: maker.id,
      });
    }
  }

  // Seed Users -> Licenses
  if (seededUsers.length > 0 && seededLicenses.length > 0) {
    for (const user of seededUsers) {
      const license =
        seededLicenses[Math.floor(Math.random() * seededLicenses.length)];
      await insertSafe(schema.usersToLicenses, {
        userId: user.id,
        licenseId: license.id,
      });
    }
  }

  // Seed Users -> Characters
  if (seededUsers.length > 0 && seededCharacters.length > 0) {
    for (const user of seededUsers) {
      const character =
        seededCharacters[Math.floor(Math.random() * seededCharacters.length)];
      await insertSafe(schema.usersToCharacters, {
        userId: user.id,
        characterId: character.id,
      });
    }
  }

  console.log("✅ Seed complete!");
}

main().catch((err) => {
  console.error("❌ Seed failed:");
  console.error(err);
  process.exit(1);
});
