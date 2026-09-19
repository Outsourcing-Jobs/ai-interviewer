/**
 * @file scripts/seed/utils/random.ts
 * @description Helper functions for generating deterministic and pseudo-random seed data
 */

export function getRandomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export function getRandomItem<T>(items: T[]): T {
  return items[Math.floor(Math.random() * items.length)];
}

export function getRandomItems<T>(items: T[], count: number): T[] {
  const shuffled = [...items].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, Math.min(count, items.length));
}

/**
 * Returns a date within the last `daysAgo` days.
 */
export function getRandomPastDate(daysAgo: number = 60): Date {
  const now = Date.now();
  const pastTime = now - Math.floor(Math.random() * daysAgo * 24 * 60 * 60 * 1000);
  return new Date(pastTime);
}

/**
 * Returns a date slightly after the given start date.
 */
export function getEndDate(startDate: Date, durationMinutes: number = 30): Date {
  return new Date(startDate.getTime() + durationMinutes * 60 * 1000);
}
