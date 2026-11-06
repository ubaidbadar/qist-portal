import { z } from 'zod';
import type { OrgStatus } from './constants';
import { mobileSchema } from './identifiers';
import { nameSchema } from './fields';

export const orgUpdateSchema = z.object({ name: nameSchema });

export type OrgUpdateInput = z.infer<typeof orgUpdateSchema>;

/** A retailer, as the API sends it. */
export interface Org {
  _id: string;
  name: string;
  status: OrgStatus;
  paymentMethods?: RetailerPaymentMethod[];
  createdAt: string;
  updatedAt: string;
}

const paymentMethodFields = { id: z.uuid(), enabled: z.boolean() };
const accountTitle = nameSchema;
const ibanSchema = z.string().trim().transform((value) => value.replace(/\s/g, '').toUpperCase()).pipe(
  z.string().regex(/^PK\d{2}[A-Z]{4}[A-Z0-9]{16}$/, 'Enter a 24-character Pakistani IBAN').refine((value) => {
    const rearranged = value.slice(4) + value.slice(0, 4);
    let remainder = 0;
    for (const character of rearranged) {
      const digits = /[A-Z]/.test(character) ? String(character.charCodeAt(0) - 55) : character;
      for (const digit of digits) remainder = (remainder * 10 + Number(digit)) % 97;
    }
    return remainder === 1;
  }, 'Check the IBAN checksum'),
);
export const retailerPaymentMethodSchema = z.discriminatedUnion('kind', [
  z.object({ ...paymentMethodFields, kind: z.literal('cash') }),
  z.object({ ...paymentMethodFields, kind: z.literal('easypaisa'), accountTitle, accountNumber: mobileSchema }),
  z.object({ ...paymentMethodFields, kind: z.literal('jazzcash'), accountTitle, accountNumber: mobileSchema }),
  z.object({ ...paymentMethodFields, kind: z.literal('bank'), accountTitle, accountNumber: ibanSchema, bankName: nameSchema }),
]);
export const paymentSettingsSchema = z.object({
  paymentMethods: z.array(retailerPaymentMethodSchema).max(10, 'At most 10 payment methods').refine(
    (methods) => new Set(methods.map((method) => method.id)).size === methods.length, 'Payment methods must have unique IDs',
  ),
});
export type RetailerPaymentMethod = z.infer<typeof retailerPaymentMethodSchema>;
