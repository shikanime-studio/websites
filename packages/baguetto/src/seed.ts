import Database from "better-sqlite3";
import { drizzle } from "drizzle-orm/better-sqlite3";
import { seed, reset } from "drizzle-seed";
import { faker } from "@faker-js/faker";
import fs from "node:fs";
import path from "node:path";
import process from "node:process";
import * as schema from "./schema";

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

const dbPath = getLocalDbPath();
console.log(`Using database at: ${dbPath}`);

const sqlite = new Database(dbPath);
const db = drizzle(sqlite, { schema });

async function main() {
  console.log("🌱 Resetting database...");
  await reset(db as any, schema);

  console.log("🌱 Seeding database...");

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

  const userNames = faker.helpers.multiple(() => faker.person.fullName(), {
    count: COUNT,
  });
  const userEmails = faker.helpers.multiple(() => faker.internet.email(), {
    count: COUNT,
  });
  const userAvatars = faker.helpers.multiple(() => faker.image.avatar(), {
    count: COUNT,
  });

  const makerNames = faker.helpers.multiple(() => faker.company.name(), {
    count: COUNT,
  });
  const makerDescriptions = faker.helpers.multiple(
    () => faker.company.catchPhrase(),
    { count: COUNT },
  );
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
  const licenseDescriptions = faker.helpers.multiple(
    () => faker.commerce.productDescription(),
    { count: COUNT },
  );
  const licenseImages = faker.helpers.multiple(
    () => faker.image.urlPicsumPhotos({ width: 400, height: 400 }),
    { count: COUNT },
  );

  const characterNames = faker.helpers.multiple(() => faker.person.fullName(), {
    count: COUNT,
  });
  const characterBios = faker.helpers.multiple(() => faker.person.bio(), {
    count: COUNT,
  });
  const characterImages = faker.helpers.multiple(
    () => faker.image.urlPicsumPhotos({ width: 300, height: 400 }),
    { count: COUNT },
  );

  const eventNames = faker.helpers.multiple(() => faker.company.buzzPhrase(), {
    count: COUNT,
  });
  const eventDescriptions = faker.helpers.multiple(
    () => faker.lorem.paragraph(),
    { count: COUNT },
  );
  const eventImages = faker.helpers.multiple(
    () => faker.image.urlPicsumPhotos({ width: 800, height: 400 }),
    { count: COUNT },
  );
  const eventLocs = faker.helpers.multiple(() => faker.location.city(), {
    count: COUNT,
  });
  const eventUrls = faker.helpers.multiple(() => faker.internet.url(), {
    count: COUNT,
  });

  const itemNames = faker.helpers.multiple(() => faker.commerce.productName(), {
    count: COUNT,
  });
  const itemDescriptions = faker.helpers.multiple(
    () => faker.commerce.productDescription(),
    { count: COUNT },
  );
  const itemImages = faker.helpers.multiple(
    () => [faker.image.urlPicsumPhotos({ width: 400, height: 400 })],
    { count: COUNT },
  );
  const itemPrices = faker.helpers.multiple(() => faker.commerce.price(), {
    count: COUNT,
  });

  await seed(db as any, seedSchema, { count: 10, seed: 12345 }).refine((f) => ({
    users: {
      columns: {
        name: f.valuesFromArray({ values: userNames }),
        email: f.valuesFromArray({ values: userEmails, isUnique: true }),
        image: f.valuesFromArray({ values: userAvatars }),
      },
    },
    makers: {
      columns: {
        name: f.valuesFromArray({ values: makerNames }),
        description: f.valuesFromArray({ values: makerDescriptions }),
        avatarImageUrl: f.valuesFromArray({ values: makerAvatars }),
        coverImageUrl: f.valuesFromArray({ values: makerCovers }),
        links: f.valuesFromArray({ values: makerLinks as any[] }),
      },
    },
    licenses: {
      columns: {
        name: f.valuesFromArray({ values: licenseNames }),
        description: f.valuesFromArray({ values: licenseDescriptions }),
        imageUrl: f.valuesFromArray({ values: licenseImages }),
      },
    },
    characters: {
      columns: {
        name: f.valuesFromArray({ values: characterNames }),
        description: f.valuesFromArray({ values: characterBios }),
        imageUrl: f.valuesFromArray({ values: characterImages }),
      },
    },
    events: {
      columns: {
        name: f.valuesFromArray({ values: eventNames }),
        description: f.valuesFromArray({ values: eventDescriptions }),
        imageUrl: f.valuesFromArray({ values: eventImages }),
        location: f.valuesFromArray({ values: eventLocs }),
        websiteUrl: f.valuesFromArray({ values: eventUrls }),
      },
    },
    items: {
      columns: {
        name: f.valuesFromArray({ values: itemNames }),
        description: f.valuesFromArray({ values: itemDescriptions }),
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
