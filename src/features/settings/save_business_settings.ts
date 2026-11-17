import axios from 'axios';
import type { Org, OrgLogoInput } from '@shop/shared';
import { apiPatch } from '../../config/api';

/** New servers commit atomically. Only a missing route falls back to the existing profile/logo endpoints. */
export async function saveBusinessSettings(
  input: { name: string; logo?: OrgLogoInput | null; expectedUpdatedAt?: string },
  baseline: Org,
  onPartialSave: (org: Org) => void,
): Promise<Org> {
  try {
    return await apiPatch<Org>('/org/settings', input);
  } catch (error) {
    if (!axios.isAxiosError(error) || error.response?.status !== 404) throw error;
  }
  let result = baseline;
  let nameSaved = false;
  if (input.name !== baseline.name) {
    result = await apiPatch<Org>('/org', { name: input.name });
    nameSaved = true;
    onPartialSave(result);
  }
  if (input.logo !== undefined) {
    try {
      result = await apiPatch<Org>('/org/logo', { logo: input.logo });
    } catch (error) {
      if (nameSaved) throw new Error('Business name saved. The logo could not be saved; please retry the logo change.', { cause: error });
      throw error;
    }
  }
  return result;
}
