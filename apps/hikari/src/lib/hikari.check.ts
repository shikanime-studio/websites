import assert from "node:assert/strict";
import process from "node:process";
import { CATALOGS } from "../i18n/messages";
import {
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

assert.equal(isAllowedImageType("image/jpeg"), true);
assert.equal(isAllowedImageType("image/gif"), false);

assert.equal(photoObjectKey(7, 3, "image/webp"), "commissions/7/3.webp");

process.stdout.write("hikari lib self-check passed\n");
