// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import App from '../src/app';
import { signOut } from '../src/auth/session';
import { clearPendingGoogleAuth, savePendingGoogleAuth } from '../src/features/auth/google_auth';

const logoMock = vi.hoisted(() => ({ prepareOrgLogo: vi.fn() }));
vi.mock('../src/utils/prepare_org_logo', () => ({ prepareOrgLogo: logoMock.prepareOrgLogo }));

function mount() {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(
    <QueryClientProvider client={client}>
      <MemoryRouter initialEntries={['/onboarding']}>
        <App />
      </MemoryRouter>
    </QueryClientProvider>,
  );
}

beforeEach(() => {
  signOut();
  clearPendingGoogleAuth();
  savePendingGoogleAuth({
    credential: 'short-lived-google-id-token',
    profile: { fullName: 'Ubaid Badar', email: 'ubaid@example.com' },
  });
  logoMock.prepareOrgLogo.mockReset();
  window.matchMedia = vi.fn().mockReturnValue({
    matches: false,
    addEventListener() {},
    removeEventListener() {},
  });
});

afterEach(() => {
  cleanup();
  clearPendingGoogleAuth();
  signOut();
});

describe('Qist shop onboarding', () => {
  it('starts with a three-step progress list and a square logo upload instead of a verified-account card', () => {
    mount();

    expect(screen.getByRole('heading', { name: 'Tell us about your shop' })).toBeTruthy();
    expect(screen.getByRole('list', { name: 'Setup progress' })).toBeTruthy();
    expect(screen.getByText('Step 1 of 3')).toBeTruthy();
    expect(screen.getByLabelText('Upload shop logo')).toBeTruthy();
    expect(screen.queryByText('Google account verified')).toBeNull();
    expect(screen.getByText('ubaid@example.com')).toBeTruthy();
    expect(screen.getByRole('link', { name: 'Switch account' })).toBeTruthy();
  });

  it('validates each step and preserves shop, phone and address values when navigating back', async () => {
    mount();

    fireEvent.click(screen.getByRole('button', { name: 'Continue' }));
    expect(await screen.findByText('Enter at least 2 characters')).toBeTruthy();

    fireEvent.change(screen.getByLabelText(/Shop name/), { target: { value: 'Al-Madina Mobiles' } });
    fireEvent.click(screen.getByRole('button', { name: 'Continue' }));
    expect(screen.getByRole('heading', { name: 'Where can we reach you?' })).toBeTruthy();

    fireEvent.change(screen.getByLabelText(/Shop contact number/), { target: { value: '03001234567' } });
    fireEvent.change(screen.getByLabelText(/Shop address/), { target: { value: 'Shop 2, Jinnah Road, Faisalabad' } });
    fireEvent.click(screen.getByRole('button', { name: 'Back' }));

    expect(screen.getByDisplayValue('Al-Madina Mobiles')).toBeTruthy();
    fireEvent.click(screen.getByRole('button', { name: 'Continue' }));

    expect(screen.getByDisplayValue('03001234567')).toBeTruthy();
    expect(screen.getByDisplayValue('Shop 2, Jinnah Road, Faisalabad')).toBeTruthy();
    fireEvent.click(screen.getByRole('button', { name: 'Continue' }));

    expect(screen.getByRole('heading', { name: 'Secure your account' })).toBeTruthy();
    expect(screen.getByText('Step 3 of 3')).toBeTruthy();
    expect(screen.getByLabelText(/^Password/)).toBeTruthy();
    expect(screen.getByLabelText(/Confirm password/)).toBeTruthy();
  });

  it('shows the selected logo in the square preview and lets the user remove it', async () => {
    logoMock.prepareOrgLogo.mockResolvedValue({
      contentType: 'image/webp',
      data: 'a'.repeat(32),
      previewUrl: 'data:image/webp;base64,aaaaaaaa',
    });
    mount();

    const file = new File(['logo'], 'shop.webp', { type: 'image/webp' });
    fireEvent.change(screen.getByLabelText('Upload shop logo'), { target: { files: [file] } });

    expect(await screen.findByAltText('Selected shop logo')).toBeTruthy();
    expect(logoMock.prepareOrgLogo).toHaveBeenCalledWith(file);

    fireEvent.click(screen.getByRole('button', { name: 'Remove logo' }));
    await waitFor(() => expect(screen.queryByAltText('Selected shop logo')).toBeNull());
    expect(screen.getByText('Add shop logo')).toBeTruthy();
  });
});
