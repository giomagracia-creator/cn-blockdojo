export const DEFAULT_SETTINGS = {
  xpPerActiveMinuteByTier: [1, 1.5, 2],
  minutesToReachTier2: 2,
  minutesToReachTier3: 5,
  activeBucketsRequired: 3,
  bucketsPerMinute: 6,
  bucketSeconds: 10,
  dailyActiveMinuteCap: 120,
  levelsPerBelt: 20,
  baseXpStart: 30,
  baseXpStep: 2,
  beltMultiplierBase: 1,
  beltMultiplierJavascript: 1.25,
  beltMultiplierBonus: 1.5,
  powerUpMinutes: 5,
  powerUpMultiplier: 2,
  seatLimitDefault: 15,
  seatLimitMax: 30,
  screenshotRetentionDays: 30,
  activityMinuteRetentionDays: 14,
  physicalRewardLevels: [5, 10, 15, 20],
  coinsPerTenDollars: 100,
  featureMyStudio: false,
  featureAttendanceImport: false,
};

export function xpRateForStreak(activeMinutesBefore: number) {
  if (activeMinutesBefore >= DEFAULT_SETTINGS.minutesToReachTier3) return 2;
  if (activeMinutesBefore >= DEFAULT_SETTINGS.minutesToReachTier2) return 1.5;
  return 1;
}

export function earnForMinute(input: { activeBuckets: number; activeMinutesBefore: number; powerUp: boolean }) {
  if (input.activeBuckets < DEFAULT_SETTINGS.activeBucketsRequired) return { xp: 0, coins: 0, counted: false };
  if (input.activeMinutesBefore >= DEFAULT_SETTINGS.dailyActiveMinuteCap) return { xp: 0, coins: 0, counted: false };
  const rate = xpRateForStreak(input.activeMinutesBefore);
  const multiplier = input.powerUp ? DEFAULT_SETTINGS.powerUpMultiplier : 1;
  return {
    xp: Math.round(rate * multiplier * 100) / 100,
    coins: Math.round(coinsPerActiveMinute(rate) * multiplier * 100) / 100,
    counted: true,
  };
}

export function coinsPerActiveMinute(xpRate: number) {
  const raw = 0.1 + (xpRate - 1) * 0.1;
  return Math.round(raw * 100) / 100;
}

export function baseXpForLevel(level: number) {
  if (level < 1 || level > DEFAULT_SETTINGS.levelsPerBelt) {
    throw new Error("Level must be from 1 to 20");
  }
  return DEFAULT_SETTINGS.baseXpStart + DEFAULT_SETTINGS.baseXpStep * (level - 1);
}
