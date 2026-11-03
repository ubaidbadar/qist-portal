import { SHOP_TIME_ZONE } from './constants';

/** Calendar dates are "YYYY-MM-DD" strings in the shops' time zone; arithmetic is done in UTC so it never shifts. */
export type CalendarDate = string;

const ymd = new Intl.DateTimeFormat('en-CA', { timeZone: SHOP_TIME_ZONE, year: 'numeric', month: '2-digit', day: '2-digit' });

/** Today in Pakistan, whatever the server's or browser's clock zone. */
export const todayInShops = (now = new Date()): CalendarDate => ymd.format(now);

const toUtc = (date: CalendarDate) => {
  const [year, month, day] = date.split('-').map(Number);
  return new Date(Date.UTC(year, month - 1, day));
};
const fromUtc = (date: Date): CalendarDate => date.toISOString().slice(0, 10);

export const addDays = (date: CalendarDate, days: number): CalendarDate => {
  const result = toUtc(date);
  result.setUTCDate(result.getUTCDate() + days);
  return fromUtc(result);
};

/** `months` after `date`, on the same day of the month, or the month's last day when it is shorter (31 Jan → 28/29 Feb). */
export function addMonths(date: CalendarDate, months: number): CalendarDate {
  const start = toUtc(date);
  const target = new Date(Date.UTC(start.getUTCFullYear(), start.getUTCMonth() + months, 1));
  const lastDay = new Date(Date.UTC(target.getUTCFullYear(), target.getUTCMonth() + 1, 0)).getUTCDate();
  target.setUTCDate(Math.min(start.getUTCDate(), lastDay));
  return fromUtc(target);
}

export const isCalendarDate = (value: string) => /^\d{4}-\d{2}-\d{2}$/.test(value) && fromUtc(toUtc(value)) === value;
