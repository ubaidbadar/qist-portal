import { z } from 'zod';
import { objectIdSchema } from './fields';

export const DOCUMENT_CATEGORIES = [
  'customer_cnic_front',
  'customer_cnic_back',
  'guarantor_cnic_front',
  'guarantor_cnic_back',
  'phone_box',
  'warranty',
  'invoice',
  'agreement',
  'guarantee',
] as const;
export type DocumentCategory = (typeof DOCUMENT_CATEGORIES)[number];
export const DOCUMENT_LABELS: Record<DocumentCategory, string> = {
  customer_cnic_front: 'Customer CNIC · front',
  customer_cnic_back: 'Customer CNIC · back',
  guarantor_cnic_front: 'Guarantor CNIC · front',
  guarantor_cnic_back: 'Guarantor CNIC · back',
  phone_box: 'Phone box / IMEI',
  warranty: 'Warranty card',
  invoice: 'Invoice',
  agreement: 'Signed agreement',
  guarantee: 'Signed guarantee',
};
export const MAX_DOCUMENT_BYTES = 10 * 1024 * 1024;
export const documentPolicySchema = z.object({
  enabled: z.boolean(),
  customerUploads: z.boolean(),
  maxFileBytes: z.number().int().min(1024).max(MAX_DOCUMENT_BYTES),
  maxFiles: z.number().int().min(1).max(20),
  retentionDays: z.number().int().min(30).max(3650),
  retentionNotice: z.string().trim().min(20).max(1000),
});
export type DocumentPolicy = z.infer<typeof documentPolicySchema>;
export const DEFAULT_DOCUMENT_POLICY: DocumentPolicy = {
  enabled: false,
  customerUploads: true,
  maxFileBytes: MAX_DOCUMENT_BYTES,
  maxFiles: 20,
  retentionDays: 365,
  retentionNotice:
    'Documents are retained for the contract and the stated retention period. Contact your retailer about correction, deletion or a dispute hold.',
};
export const documentTargetSchema = z
  .object({ customerId: objectIdSchema.optional(), contractId: objectIdSchema.optional() })
  .refine((v) => Boolean(v.customerId || v.contractId), 'Choose a customer or contract');
export const documentCreateSchema = z
  .object({
    customerId: objectIdSchema.optional(),
    contractId: objectIdSchema.optional(),
    category: z.enum(DOCUMENT_CATEGORIES),
    guarantorId: z.uuid().optional(),
    requestId: objectIdSchema.optional(),
    replacesId: objectIdSchema.optional(),
    idempotencyKey: z.uuid(),
    consent: z.literal(true),
  })
  .refine((v) => Boolean(v.customerId || v.contractId), 'Choose a customer or contract');
export const documentRequestSchema = z.object({
  contractId: objectIdSchema,
  category: z.enum(DOCUMENT_CATEGORIES),
  guarantorId: z.uuid().optional(),
  message: z.string().trim().min(1).max(300),
});
export const documentReviewSchema = z.object({
  version: z.number().int().nonnegative(),
  decision: z.enum(['accepted', 'rejected']),
  feedback: z.string().trim().max(300).default(''),
});
export interface DocumentItem {
  _id: string;
  category: DocumentCategory;
  subject: string;
  guarantorId?: string;
  replacesId?: string;
  requestId?: string;
  processing: 'uploading' | 'processing' | 'ready' | 'failed' | 'rejected' | 'deleted';
  review: 'pending' | 'accepted' | 'rejected' | 'superseded';
  feedback: string;
  createdAt: string;
  updatedAt: string;
  uploadedBy: 'staff' | 'customer';
  version: number;
  bytes?: number;
  contentType?: string;
  legalHold: boolean;
  canHold: boolean;
  canView: boolean;
  canDelete: boolean;
  canReview: boolean;
}
export interface DocumentRequestItem {
  _id: string;
  category: DocumentCategory;
  subject: string;
  guarantorId?: string;
  replacesId?: string;
  requestId?: string;
  message: string;
}
export interface DocumentList {
  items: DocumentItem[];
  nextCursor: string | null;
  requests: DocumentRequestItem[];
  subjects: { id: string; label: string }[];
  policy: DocumentPolicy;
  available: boolean;
  canUpload: boolean;
  canReview: boolean;
}
