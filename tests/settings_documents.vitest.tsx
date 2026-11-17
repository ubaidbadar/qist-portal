// @vitest-environment jsdom
import { afterEach, beforeEach, expect, test, vi } from 'vitest';
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MemoryRouter } from 'react-router-dom';
import { DEFAULT_DOCUMENT_POLICY, type DocumentItem } from '@shop/shared';
import SettingsPage from '../src/features/settings/settings_page';
import OrganizationTab from '../src/features/settings/organization_tab';
import DocumentRow from '../src/features/documents/document_row';

const mock = vi.hoisted(() => ({
  get: vi.fn(),
  patch: vi.fn(),
  post: vi.fn(),
  delete: vi.fn(),
  prepare: vi.fn(),
}));
vi.mock('../src/config/api', () => ({
  apiGet: mock.get,
  apiPatch: mock.patch,
  apiPost: mock.post,
  default: { get: mock.get, post: mock.post, patch: mock.patch, delete: mock.delete },
}));
vi.mock('../src/utils/prepare_org_logo', () => ({ prepareOrgLogo: mock.prepare }));
const org = {
  _id: '0123456789abcdef01234567',
  name: 'Fixture Shop',
  status: 'active',
  logoUpdatedAt: null,
  updatedAt: '2026-11-17T09:00:00.000Z',
  createdAt: '2026-11-17T09:00:00.000Z',
};
function mount(node: React.ReactNode) {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  return render(
    <QueryClientProvider client={client}>
      <MemoryRouter>{node}</MemoryRouter>
    </QueryClientProvider>,
  );
}
beforeEach(() => {
  vi.clearAllMocks();
  mock.get.mockImplementation((path: string) =>
    Promise.resolve(path === '/org/documents' ? { policy: DEFAULT_DOCUMENT_POLICY, available: false } : org),
  );
  mock.patch.mockImplementation((_path: string, body: object) =>
    Promise.resolve({ ...org, ...body, updatedAt: '2026-11-17T09:01:00.000Z' }),
  );
});
afterEach(cleanup);

test('settings uses grouped navigation and a mobile section picker, preserving existing sections', async () => {
  mount(<SettingsPage />);
  expect(await screen.findByRole('heading', { name: 'Business details' })).toBeTruthy();
  expect(screen.getByRole('navigation', { name: 'Settings' })).toBeTruthy();
  const select = screen.getByLabelText('Settings section');
  fireEvent.change(select, { target: { value: 'documents' } });
  expect(
    await screen.findByText(
      'Private document storage and file checks are not ready. Uploads cannot be enabled yet.',
    ),
  ).toBeTruthy();
  expect((screen.getByLabelText('Enable document uploads') as HTMLInputElement).disabled).toBe(true);
  expect(screen.getByRole('button', { name: 'Organization' })).toBeTruthy();
  expect(screen.getByRole('button', { name: 'Staff' })).toBeTruthy();
});

test('business name and staged logo are submitted together once, only on Save changes', async () => {
  mock.prepare.mockResolvedValue({
    contentType: 'image/png',
    data: 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAAB',
    previewUrl: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAAB',
  });
  mount(<OrganizationTab />);
  const name = await screen.findByLabelText(/Business name/);
  fireEvent.change(name, { target: { value: 'Updated Shop' } });
  fireEvent.change(screen.getByLabelText('Choose shop logo'), {
    target: { files: [new File(['fixture'], 'logo.png', { type: 'image/png' })] },
  });
  await waitFor(() => expect(screen.getByAltText('Shop logo preview')).toBeTruthy());
  expect(mock.patch).not.toHaveBeenCalled();
  fireEvent.click(screen.getByRole('button', { name: 'Save changes' }));
  await waitFor(() => expect(mock.patch).toHaveBeenCalledTimes(1));
  expect(mock.patch).toHaveBeenCalledWith('/org/settings', {
    name: 'Updated Shop',
    logo: { contentType: 'image/png', data: 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAAB' },
    expectedUpdatedAt: org.updatedAt,
  });
  await waitFor(() =>
    expect((screen.getByRole('button', { name: 'Save changes' }) as HTMLButtonElement).disabled).toBe(true),
  );
});

test('review requires actionable rejection feedback and uses the version returned by the server', async () => {
  const item: DocumentItem = {
    _id: '0123456789abcdef01234567',
    category: 'warranty',
    subject: 'Customer / contract',
    processing: 'ready',
    review: 'pending',
    feedback: '',
    createdAt: org.createdAt,
    updatedAt: org.updatedAt,
    uploadedBy: 'customer',
    version: 4,
    canView: false,
    canDelete: false,
    canReview: true,
    legalHold: false,
    canHold: false,
  };
  const updated = { ...item, review: 'rejected', feedback: 'Please include all four corners.' };
  const onUpdate = vi.fn();
  mock.post.mockResolvedValue(updated);
  mount(
    <ul>
      <DocumentRow item={item} onUpdate={onUpdate} canUpload={false} onReplace={() => {}} />
    </ul>,
  );
  fireEvent.click(screen.getByRole('button', { name: 'Request replacement' }));
  expect((screen.getByRole('button', { name: 'Send feedback' }) as HTMLButtonElement).disabled).toBe(true);
  fireEvent.change(screen.getByLabelText('Tell the customer what needs to change'), {
    target: { value: updated.feedback },
  });
  fireEvent.click(screen.getByRole('button', { name: 'Send feedback' }));
  await waitFor(() => expect(onUpdate).toHaveBeenCalledWith(updated));
  expect(mock.post).toHaveBeenCalledWith(`/documents/${item._id}/review`, {
    version: 4,
    decision: 'rejected',
    feedback: updated.feedback,
  });
});
