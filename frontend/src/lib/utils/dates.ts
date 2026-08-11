const RTF = new Intl.RelativeTimeFormat(undefined, { numeric: 'auto' });

const UNITS: [Intl.RelativeTimeFormatUnit, number][] = [
  ['year', 1000 * 60 * 60 * 24 * 365],
  ['month', 1000 * 60 * 60 * 24 * 30],
  ['week', 1000 * 60 * 60 * 24 * 7],
  ['day', 1000 * 60 * 60 * 24],
  ['hour', 1000 * 60 * 60],
  ['minute', 1000 * 60],
];

/** "2 minutes ago", "yesterday", "3 weeks ago" — falls back to "just now". */
export function relativeTime(isoDate: string): string {
  const diff = new Date(isoDate).getTime() - Date.now();
  for (const [unit, ms] of UNITS) {
    if (Math.abs(diff) >= ms || unit === 'minute') {
      return RTF.format(Math.round(diff / ms), unit);
    }
  }
  return 'just now';
}

function isSameDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

export type DateGroup = 'Today' | 'Yesterday' | 'Earlier';

export function dateGroupFor(isoDate: string): DateGroup {
  const date = new Date(isoDate);
  const now = new Date();
  if (isSameDay(date, now)) return 'Today';

  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);
  if (isSameDay(date, yesterday)) return 'Yesterday';

  return 'Earlier';
}

/** Group items already sorted by recency into Today / Yesterday / Earlier buckets. */
export function groupByDate<T>(items: T[], getDate: (item: T) => string): [DateGroup, T[]][] {
  const groups = new Map<DateGroup, T[]>();
  for (const item of items) {
    const group = dateGroupFor(getDate(item));
    const bucket = groups.get(group);
    if (bucket) bucket.push(item);
    else groups.set(group, [item]);
  }

  const order: DateGroup[] = ['Today', 'Yesterday', 'Earlier'];
  return order.filter((g) => groups.has(g)).map((g) => [g, groups.get(g)!]);
}
