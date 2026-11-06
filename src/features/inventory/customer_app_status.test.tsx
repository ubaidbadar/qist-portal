import { describe, expect, test } from 'bun:test';
import { renderToStaticMarkup } from 'react-dom/server';
import type { Device } from '@shop/shared';
import CustomerAppStatus from './customer_app_status';
import EnrollmentPanel from './enrollment_panel';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const enrollment: NonNullable<Device['enrollment']> = { enrolledAt: '2026-11-06T10:00:00Z', lastCheckInAt: null, appVersion: '0.2.0' };

describe('customer installation status', () => {
  test('confirmed enrollment hides QR setup actions while the optional app is pending', () => {
    const client = new QueryClient();
    const html = renderToStaticMarkup(<QueryClientProvider client={client}><EnrollmentPanel deviceId="test" deviceLabel="Phone" enrollment={enrollment} /></QueryClientProvider>);
    expect(html).toContain('Enrolled on');
    expect(html).not.toContain('Show setup QR');
    expect(html).not.toContain('Factory-reset');
    client.clear();
  });
  test('older lockers are shown as not reported rather than an installation failure', () => {
    const html = renderToStaticMarkup(<CustomerAppStatus enrollment={enrollment} />);
    expect(html).toContain('not reported yet');
    expect(html).toContain('Device enrollment is complete');
  });
  test('a failed customer download does not imply failed device enrollment', () => {
    const current = { ...enrollment, customerApp: { status: 'failed' as const, detailCode: 'signature_mismatch' as const, reportedAt: enrollment.enrolledAt } };
    const html = renderToStaticMarkup(<CustomerAppStatus enrollment={current} />);
    expect(html).toContain('different signing certificate');
    expect(html).toContain('Device enrollment is complete');
    expect(renderToStaticMarkup(<CustomerAppStatus enrollment={current} compact />)).toContain('Device enrolled');
  });
});
