import type { Org } from '@shop/shared';
import { API_BASE_URL } from '../config/urls';

/** A versioned public image URL. Organization/session JSON never contains logo bytes. */
export function orgLogoUrl(org: Pick<Org, '_id' | 'logoUpdatedAt'>): string | null {
  if (!org.logoUpdatedAt) return null;
  return API_BASE_URL.replace(/\/+$/, '') + '/public/orgs/' +
    encodeURIComponent(org._id) + '/logo?v=' + encodeURIComponent(org.logoUpdatedAt);
}
