// @vitest-environment jsdom
import { act, cleanup, render, screen } from '@testing-library/react';
import { afterEach, expect, test, vi } from 'vitest';
import DeviceLinkStatus from '../src/features/locks/device_link_status';

afterEach(() => { cleanup(); vi.useRealTimers(); });
test('ages connection status even when the server returns unchanged data', () => {
  vi.useFakeTimers();
  vi.setSystemTime(new Date('2026-11-17T12:00:00Z'));
  render(<DeviceLinkStatus loading={false} enrollment={{ enrolledAt: '2026-11-16T12:00:00Z', lastCheckInAt: '2026-11-17T11:31:00Z', appVersion: '0.2.0' }} />);
  expect(screen.getByText('Seen recently')).toBeTruthy();
  act(() => { vi.advanceTimersByTime(2 * 60_000); });
  expect(screen.getByText('No recent check-in')).toBeTruthy();
});
