import { describe, expect, test } from 'bun:test';
import { renderToStaticMarkup } from 'react-dom/server';
import DeviceLinkStatus, { deviceContact } from './device_link_status';

const now = Date.parse('2026-11-17T12:00:00Z');
const enrollment = { enrolledAt: '2026-11-16T10:00:00Z', lastCheckInAt: '2026-11-17T11:55:00Z', appVersion: '0.2.0' };
describe('contract phone connection', () => {
  test('distinguishes missing data from an unlinked phone', () => {
    expect(deviceContact(undefined, now).label).toBe('Status unavailable');
    expect(deviceContact(null, now).label).toBe('Not linked');
  });
  test('does not call the enrollment timestamp a successful check-in', () => {
    expect(deviceContact({ ...enrollment, lastCheckInAt: enrollment.enrolledAt }, now).lastSeen).toBeNull();
    expect(deviceContact({ ...enrollment, lastCheckInAt: null }, now).label).toBe('Awaiting first check-in');
  });
  test('shows fresh and stale contact without promising online status', () => {
    expect(deviceContact(enrollment, now).label).toBe('Seen recently');
    expect(deviceContact(enrollment, now + 31 * 60_000).label).toBe('No recent check-in');
    const html = renderToStaticMarkup(<DeviceLinkStatus enrollment={enrollment} loading={false} now={now} />);
    expect(html).toContain('Last seen');
    expect(html).toContain('Linked');
    expect(html).toContain('does not guarantee');
  });
});
