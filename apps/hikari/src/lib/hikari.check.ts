import assert from "node:assert/strict";
import process from "node:process";
import { CATALOGS } from "../i18n/messages";
import {
  calendarEventUrl,
  calendarRange,
  canTransition,
  isAllowedImageType,
  isCommissionStatus,
  mapEmbedUrl,
  mapLinkUrl,
  nextStatuses,
  photoObjectKey,
} from "./hikari";

const enKeys = Object.keys(CATALOGS.en).sort();
for (const [code, table] of Object.entries(CATALOGS)) {
  const entries: Array<[string, { defaultMessage: string }]> = Object.entries(table);
  const keys = entries.map(([key]) => key).sort();
  assert.deepEqual(
    keys,
    enKeys,
    `language ${code} must define exactly the English key set`,
  );
  for (const [, entry] of entries) {
    assert.ok(
      entry.defaultMessage.length > 0,
      `language ${code} key must be non-empty`,
    );
  }
}

assert.equal(canTransition("requested", "accepted"), true);
assert.equal(canTransition("requested", "delivered"), false);
assert.equal(canTransition("accepted", "scheduled"), true);
assert.equal(canTransition("accepted", "completed"), true);
assert.equal(canTransition("scheduled", "completed"), true);
assert.equal(canTransition("completed", "delivered"), true);
assert.equal(canTransition("delivered", "requested"), false);
assert.deepEqual(nextStatuses("delivered"), []);

assert.equal(isCommissionStatus("requested"), true);
assert.equal(isCommissionStatus("cancelled"), false);

assert.equal(
  mapEmbedUrl("Tokyo Big Sight, East Hall 8"),
  "https://www.google.com/maps?q=Tokyo%20Big%20Sight%2C%20East%20Hall%208&output=embed",
);
assert.equal(
  mapLinkUrl("Tokyo Big Sight"),
  "https://www.google.com/maps/search/?api=1&query=Tokyo%20Big%20Sight",
);

assert.deepEqual(calendarRange("2026-11-15"), {
  start: "20261115",
  end: "20261116",
});
const oneHour = calendarRange("2026-11-15T10:30");
assert.match(oneHour.start, /^\d{8}T\d{4}00Z$/);
assert.match(oneHour.end, /^\d{8}T\d{4}00Z$/);
assert.equal(
  Number(oneHour.end.slice(9, 11)) * 60 +
    Number(oneHour.end.slice(11, 13)) -
    (Number(oneHour.start.slice(9, 11)) * 60 +
      Number(oneHour.start.slice(11, 13))),
  60,
);
assert.deepEqual(calendarRange("not a date"), {
  start: "not a date",
  end: "not a date",
});

const calendarUrl = new URL(
  calendarEventUrl({
    title: "C108 Shoot",
    shootingDate: "2026-11-15",
    locationName: "Tokyo Big Sight",
    details: "Kaguya cosplay",
  }),
);
assert.equal(calendarUrl.searchParams.get("action"), "TEMPLATE");
assert.equal(calendarUrl.searchParams.get("text"), "C108 Shoot");
assert.equal(calendarUrl.searchParams.get("dates"), "20261115/20261116");

assert.equal(isAllowedImageType("image/jpeg"), true);
assert.equal(isAllowedImageType("image/gif"), false);

assert.equal(photoObjectKey(7, 3, "image/webp"), "commissions/7/3.webp");

process.stdout.write("hikari lib self-check passed\n");
