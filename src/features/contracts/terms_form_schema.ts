import { z } from 'zod';
import { addMonths, calendarDateSchema, FREQUENCIES, PAYMENT_METHODS, installmentCountSchema, markupBasisSchema, markupPercentSchema, todayInShops, toPaisa } from '@shop/shared';

/** The terms step as typed: prices in rupees. `toContractTerms` turns them into the API's paisa. */
export const termsFormSchema = z
  .object({
    planId: z.string(),
    cashRupees: z.number({ error: 'Enter the price' }).positive('Enter the price'),
    downRupees: z.number({ error: 'Enter the down payment (0 for none)' }).min(0, "It can't be negative"),
    downPaymentMethod: z.enum(PAYMENT_METHODS),
    markupPercent: z.number({ error: 'Enter the markup (0 for none)' }).pipe(markupPercentSchema),
    markupBasis: markupBasisSchema.default('financed'),
    count: z.number({ error: 'Enter the number of installments' }).pipe(installmentCountSchema),
    frequency: z.enum(FREQUENCIES),
    firstDueDate: calendarDateSchema,
  })
  .refine((terms) => terms.downRupees < terms.cashRupees, { message: 'The down payment must be less than the price', path: ['downRupees'] });

export type TermsForm = z.infer<typeof termsFormSchema>;

export const defaultTerms = (): Record<keyof TermsForm, string | number> => ({
  planId: '',
  cashRupees: Number.NaN,
  downRupees: 0,
  downPaymentMethod: 'cash',
  markupPercent: 0,
  markupBasis: 'financed',
  count: 6,
  frequency: 'monthly',
  firstDueDate: addMonths(todayInShops(), 1),
});

export const toContractTerms = ({ planId, cashRupees, downRupees, ...terms }: TermsForm) => ({
  ...terms,
  planId: planId || null,
  cashPrice: toPaisa(cashRupees),
  downPayment: toPaisa(downRupees),
});
