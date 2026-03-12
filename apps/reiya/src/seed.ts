import type { Schema } from './schema'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { faker } from '@faker-js/faker'
import Database from 'better-sqlite3'
import { drizzle } from 'drizzle-orm/better-sqlite3'
import { seed } from 'drizzle-seed'
import * as schema from './schema'

async function main() {
  console.error('🌱 Generating seed data...')

  // Create in-memory DB
  const sqlite = new Database(':memory:')
  const db = drizzle<Schema>(sqlite, { schema })

  // We look for migrations to create tables in the in-memory DB
  const migrationsFolder = './migrations'
  if (fs.existsSync(migrationsFolder)) {
    const files = fs
      .readdirSync(migrationsFolder)
      .filter(f => f.endsWith('.sql'))
      .sort()
    for (const file of files) {
      const content = fs.readFileSync(`${migrationsFolder}/${file}`, 'utf-8')
      // Split by statement breakpoint if present, or just execute
      // drizzle-kit generated migrations often use `--> statement-breakpoint`
      const statements = content.split('--> statement-breakpoint')
      for (const statement of statements) {
        if (statement.trim()) {
          try {
            sqlite.exec(statement)
          }
          catch (e) {
            console.error(
              `Warning executing migration statement from ${file}:`,
              e,
            )
          }
        }
      }
    }
  }
  else {
    console.error(
      '⚠️ No migrations folder found. drizzle-seed might fail if tables don\'t exist.',
    )
  }

  // Insert static data from seeds folder
  console.error('Inserting static data from seeds folder...')
  const seedsFolder = './seeds'
  if (fs.existsSync(seedsFolder)) {
    const files = fs
      .readdirSync(seedsFolder)
      .filter(f => f.endsWith('.sql'))
      .sort()
    for (const file of files) {
      console.error(`  - Executing ${file}`)
      const content = fs.readFileSync(`${seedsFolder}/${file}`, 'utf-8')
      const statements = content.split(';') // Simple split by semicolon
      for (const statement of statements) {
        if (statement.trim()) {
          try {
            sqlite.exec(statement)
          }
          catch (e) {
            console.error(`Warning executing statement from ${file}:`, e)
          }
        }
      }
    }
  }

  // Static categories data
  const categoriesData = [
    { name: 'Stickers', icon: '🏷️' },
    { name: 'Prints', icon: '🎨' },
    { name: 'Mugs', icon: '☕' },
    { name: 'Keychains', icon: '🔑' },
    { name: 'Apparel', icon: '👕' },
    { name: 'Plushies', icon: '🧸' },
    { name: 'Pins', icon: '📍' },
    { name: 'Doujinshi', icon: '📚' },
  ]

  try {
    await db.insert(schema.categories).values(categoriesData)
  }
  catch (e) {
    console.error(
      'Error inserting static data (tables might not exist or constraint violation):',
      e,
    )
  }

  // Generate dummy data (using drizzle-seed)
  console.error('Generating dummy data...')
  const seedSchema = {
    users: schema.users,
    sessions: schema.sessions,
    accounts: schema.accounts,
    verifications: schema.verifications,
    // events: schema.events, // Exclude events to avoid conflict with static data
    licenses: schema.licenses,
    characters: schema.characters,
    makers: schema.makers,
    items: schema.items,
    votes: schema.votes,
    notifications: schema.notifications,
    rateLimits: schema.rateLimits,
  }

  faker.seed(12345)
  const COUNT = 20

  const userAvatars = faker.helpers.multiple(() => faker.image.avatar(), {
    count: COUNT,
  })
  const makerAvatars = faker.helpers.multiple(() => faker.image.avatar(), {
    count: COUNT,
  })
  const makerCovers = faker.helpers.multiple(
    () => faker.image.urlPicsumPhotos({ width: 800, height: 400 }),
    { count: COUNT },
  )
  const makerLinks = faker.helpers.multiple(
    () => [faker.internet.url(), faker.internet.url()],
    { count: COUNT },
  )
  const licenseNames = faker.helpers.multiple(
    () => faker.commerce.productName(),
    { count: COUNT },
  )
  const licenseImages = faker.helpers.multiple(
    () => faker.image.urlPicsumPhotos({ width: 400, height: 400 }),
    { count: COUNT },
  )
  const characterImages = faker.helpers.multiple(
    () => faker.image.urlPicsumPhotos({ width: 300, height: 400 }),
    { count: COUNT },
  )
  const itemNames = faker.helpers.multiple(() => faker.commerce.productName(), {
    count: COUNT,
  })
  const itemImages = faker.helpers.multiple(
    () => {
      const numImages = faker.number.int({ min: 1, max: 4 })
      return faker.helpers.multiple(
        () => ({
          src: faker.image.urlPicsumPhotos({
            width: 400,
            height: faker.number.int({ min: 300, max: 800 }),
          }),
          width: 400,
          height: faker.number.int({ min: 300, max: 800 }),
        }),
        { count: numImages },
      )
    },
    { count: COUNT },
  )
  const itemPrices = faker.helpers.multiple(() => faker.commerce.price(), {
    count: COUNT,
  })

  await seed(db as any, seedSchema, { count: COUNT, seed: 12345 }).refine(
    f => ({
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
          links: f.valuesFromArray({ values: makerLinks as Array<any> }),
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
      // events: ... // Excluded
      items: {
        columns: {
          name: f.valuesFromArray({ values: itemNames }),
          description: f.loremIpsum({ sentencesCount: 2 }),
          imageUrls: f.valuesFromArray({ values: itemImages as Array<any> }),
          priceRange: f.valuesFromArray({ values: itemPrices }),
        },
      },
    }),
  )

  // Manual relations
  console.error('Seeding relations...')
  const seededUsers = await db.select().from(schema.users)
  const seededMakers = await db.select().from(schema.makers)
  const seededEvents = await db.select().from(schema.events)
  const seededLicenses = await db.select().from(schema.licenses)
  const seededCharacters = await db.select().from(schema.characters)

  const insertSafe = async (table: any, values: any) => {
    try {
      await db.insert(table).values(values).onConflictDoNothing()
    }
    catch {
      // ignore
    }
  }

  if (seededUsers.length > 0 && seededMakers.length > 0) {
    for (const user of seededUsers) {
      const maker
        = seededMakers[Math.floor(Math.random() * seededMakers.length)]
      await insertSafe(schema.usersToMakers, {
        userId: user.id,
        makerId: maker.id,
      })
    }
  }

  if (seededEvents.length > 0 && seededMakers.length > 0) {
    for (const event of seededEvents) {
      const maker
        = seededMakers[Math.floor(Math.random() * seededMakers.length)]
      await insertSafe(schema.eventsToMakers, {
        eventId: event.id,
        makerId: maker.id,
      })
    }
  }

  if (seededUsers.length > 0 && seededLicenses.length > 0) {
    for (const user of seededUsers) {
      const license
        = seededLicenses[Math.floor(Math.random() * seededLicenses.length)]
      await insertSafe(schema.usersToLicenses, {
        userId: user.id,
        licenseId: license.id,
      })
    }
  }

  if (seededUsers.length > 0 && seededCharacters.length > 0) {
    for (const user of seededUsers) {
      const character
        = seededCharacters[Math.floor(Math.random() * seededCharacters.length)]
      await insertSafe(schema.usersToCharacters, {
        userId: user.id,
        characterId: character.id,
      })
    }
  }

  // Dump to SQL
  const tables = [
    'categories',
    'events',
    'user',
    'makers',
    'licenses',
    'characters',
    'items',
    'users_to_makers',
    'events_to_makers',
    'users_to_licenses',
    'users_to_characters',
    'items_to_licenses',
  ]

  let outputSql = '-- Generated seed data\n'

  for (const table of tables) {
    try {
      const rows = sqlite.prepare(`SELECT * FROM ${table}`).all() as Array<
        Record<string, any>
      >
      if (rows.length === 0)
        continue

      outputSql += `\n-- Data for ${table}\n`

      for (const row of rows) {
        const columns = Object.keys(row)
        const values = Object.values(row).map((v) => {
          if (v === null)
            return 'NULL'
          if (typeof v === 'string')
            return `'${v.replace(/'/g, '\'\'')}'`
          if (typeof v === 'number')
            return v
          if (typeof v === 'boolean')
            return v ? 1 : 0
          if (v instanceof Date)
            return `'${v.toISOString()}'`
          if (typeof v === 'object')
            return `'${JSON.stringify(v).replace(/'/g, '\'\'')}'`
          return v
        })

        outputSql += `INSERT OR IGNORE INTO ${table} (${columns.join(', ')}) VALUES (${values.join(', ')});\n`
      }
    }
    catch (e) {
      console.error(`Skipping table ${table} (maybe not created?):`, e)
    }
  }

  // Write to Temp File
  const tempDir = os.tmpdir()
  const seedFile = path.join(tempDir, `seed-${Date.now()}.sql`)
  fs.writeFileSync(seedFile, outputSql)
}

main().catch(console.error)
