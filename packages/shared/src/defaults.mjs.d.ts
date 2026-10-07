export declare const DEFAULT_SETTINGS: {
  xpPerActiveMinuteByTier: number[];
  minutesToReachTier2: number;
  minutesToReachTier3: number;
  activeBucketsRequired: number;
  bucketsPerMinute: number;
  bucketSeconds: number;
  dailyActiveMinuteCap: number;
  levelsPerBelt: number;
  baseXpStart: number;
  baseXpStep: number;
  beltMultiplierBase: number;
  beltMultiplierJavascript: number;
  beltMultiplierBonus: number;
  powerUpMinutes: number;
  powerUpMultiplier: number;
  seatLimitDefault: number;
  seatLimitMax: number;
  screenshotRetentionDays: number;
  activityMinuteRetentionDays: number;
  physicalRewardLevels: number[];
  coinsPerTenDollars: number;
  featureMyStudio: boolean;
  featureAttendanceImport: boolean;
};

export declare function coinsPerActiveMinute(xpRate: number): number;
export declare function baseXpForLevel(level: number): number;
