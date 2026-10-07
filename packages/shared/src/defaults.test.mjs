import assert from "node:assert/strict";
import test from "node:test";
import { baseXpForLevel, coinsPerActiveMinute, DEFAULT_SETTINGS, earnForMinute } from "./defaults.mjs";

test("coin rate follows 0.1 + (xp - 1) x 0.1", () => {
  assert.equal(coinsPerActiveMinute(1), 0.1);
  assert.equal(coinsPerActiveMinute(1.5), 0.15);
  assert.equal(coinsPerActiveMinute(2), 0.2);
});

test("base belt XP matches the brief table", () => {
  assert.equal(baseXpForLevel(1), 30);
  assert.equal(baseXpForLevel(5), 38);
  assert.equal(baseXpForLevel(20), 68);
  const total = Array.from({ length: 20 }, (_, i) => baseXpForLevel(i + 1)).reduce((a, b) => a + b, 0);
  assert.equal(total, 980);
});

test("an active minute earns the streak rate and a power-up doubles it", () => {
  assert.deepEqual(earnForMinute({ activeBuckets: 2, activeMinutesBefore: 0, powerUp: false }), { xp: 0, coins: 0, counted: false });
  assert.deepEqual(earnForMinute({ activeBuckets: 3, activeMinutesBefore: 0, powerUp: false }), { xp: 1, coins: 0.1, counted: true });
  assert.deepEqual(earnForMinute({ activeBuckets: 3, activeMinutesBefore: 2, powerUp: false }), { xp: 1.5, coins: 0.15, counted: true });
  assert.deepEqual(earnForMinute({ activeBuckets: 3, activeMinutesBefore: 5, powerUp: true }), { xp: 4, coins: 0.4, counted: true });
  assert.equal(earnForMinute({ activeBuckets: 6, activeMinutesBefore: 120, powerUp: false }).counted, false);
});

test("feature switches stay off and seat limit stays inside the brief", () => {
  assert.equal(DEFAULT_SETTINGS.featureMyStudio, false);
  assert.equal(DEFAULT_SETTINGS.featureAttendanceImport, false);
  assert.equal(DEFAULT_SETTINGS.seatLimitDefault, 15);
  assert.equal(DEFAULT_SETTINGS.seatLimitMax, 30);
  assert.equal(DEFAULT_SETTINGS.powerUpMinutes, 5);
  assert.equal(DEFAULT_SETTINGS.powerUpMultiplier, 2);
});
