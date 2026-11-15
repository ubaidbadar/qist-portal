// @vitest-environment jsdom
import { StrictMode } from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, useNavigate } from 'react-router-dom';
import { QueryClientProvider } from '@tanstack/react-query';
import type { Session } from '@shop/shared';
import App from '../src/app';
import api from '../src/config/api';
import { queryClient } from '../src/app/query_client';
import { signIn, signOut } from '../src/auth/session';

const customerId = '000000000000000000000001';
const customer = { _id: customerId, fullName: 'Test Customer', guarantors: [], homeBranch: null, createdAt: '2026-11-09', cnic: '3310012345671', phone: '03001234567', altPhone: '', address: 'Test address' };
const collections = { date: '2026-11-09', total: 0, count: 0, byMethod: [], byStaff: [] };
const responses: Record<string, unknown> = {
  '/dashboard': { collections, overdue: [], payments: [], contracts: [] },
  '/customers': { items: [], nextCursor: null },
  '/inventory': { items: [], nextCursor: null },
  '/devices': { items: [], nextCursor: null },
  [`/customers/${customerId}`]: customer,
  '/contracts': { items: [], nextCursor: null },
  '/payments/overview': { items: [], nextCursor: null, collections },
  [`/customers/${customerId}/overview`]: { customer, contracts: { items: [], nextCursor: null } },
  '/users/overview': { members: [], branches: [] },
};
let requests: string[];
let pending: (() => void)[];
let fail = false;
function Navigation() {
  const navigate = useNavigate();
  return <button onClick={() => navigate('/customers')}>Test navigation</button>;
}
function mount(path: string) {
  return render(<StrictMode><QueryClientProvider client={queryClient}><MemoryRouter initialEntries={[path]}><Navigation /><App /></MemoryRouter></QueryClientProvider></StrictMode>);
}
async function release() {
  await waitFor(() => expect(pending.length).toBeGreaterThan(0));
  pending.splice(0).forEach((resolve) => resolve());
}
beforeEach(() => {
  requests = []; pending = []; fail = false;
  window.matchMedia = vi.fn().mockReturnValue({ matches: false, addEventListener() {}, removeEventListener() {} });
  signIn({ accessToken: 'test', user: { _id: 'owner', role: 'owner', fullName: 'Owner', email: 'owner@example.com', emailVerifiedAt: '2026-11-09', mustChangePassword: false }, org: { name: 'Test shop' }, branches: [] } as unknown as Session);
  api.defaults.adapter = async (config) => {
    requests.push(config.url!);
    await new Promise<void>((resolve) => pending.push(resolve));
    if (fail) throw new Error('Connection failed');
    if (!(config.url! in responses)) throw new Error(`Unexpected request: ${config.url}`);
    return { data: { data: responses[config.url!] }, status: 200, statusText: 'OK', headers: {}, config };
  };
});
afterEach(() => { cleanup(); signOut(); });

describe('portal navigation request budget', () => {
  it.each(['/', '/customers', '/inventory', '/contracts', '/payments', `/customers/${customerId}`, '/settings?tab=team', '/contracts/new', `/contracts/new?customerId=${customerId}`])('loads %s with one data request under StrictMode', async (path) => {
    mount(path);
    await waitFor(() => expect(requests).toHaveLength(1));
    expect(screen.queryByLabelText('Loading page')).toBeNull();
    expect(screen.queryByRole('status', { name: 'Loading', exact: true })).toBeNull();
    await release();
    await waitFor(() => expect(queryClient.isFetching()).toBe(0));
    expect(requests).toHaveLength(1);
    expect(screen.queryByRole('alert')).toBeNull();
  });
  it('keeps the shell mounted and uses zero requests on a fresh cached revisit', async () => {
    const app = mount('/'); await release();
    await waitFor(() => expect(queryClient.isFetching()).toBe(0));
    fireEvent.click(screen.getByText('Test navigation'));
    await release(); await waitFor(() => expect(queryClient.isFetching()).toBe(0));
    expect(requests).toEqual(['/dashboard', '/customers']);
    app.unmount(); mount('/customers');
    expect(screen.queryByLabelText('Loading page')).toBeNull();
    expect(requests).toHaveLength(2);
  });
  it('shows an error after one failed read and makes one explicit retry', async () => {
    fail = true; mount('/payments'); await release();
    await screen.findByText('Connection failed');
    expect(requests).toHaveLength(1);
    fail = false; fireEvent.click(screen.getByRole('button', { name: /try again|retry/i }));
    await release(); await waitFor(() => expect(queryClient.isFetching()).toBe(0));
    expect(requests).toHaveLength(2);
    expect(screen.queryByText('Connection failed')).toBeNull();
  });
});
