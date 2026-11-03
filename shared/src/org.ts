import { z } from 'zod';
import type { OrgStatus } from './constants';
import { nameSchema } from './fields';

export const orgUpdateSchema = z.object({ name: nameSchema });

export type OrgUpdateInput = z.infer<typeof orgUpdateSchema>;

/** A retailer, as the API sends it. */
export interface Org {
  _id: string;
  name: string;
  status: OrgStatus;
  createdAt: string;
  updatedAt: string;
}
