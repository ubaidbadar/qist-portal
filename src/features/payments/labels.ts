import type { PaymentKind, PaymentMethod } from '@shop/shared';
import { PAYMENT_METHODS } from '@shop/shared';

export const METHOD_LABELS: Record<PaymentMethod, string> = { cash: 'Cash', jazzcash: 'JazzCash', easypaisa: 'Easypaisa', bank: 'Bank transfer' };
export const KIND_LABELS: Record<PaymentKind, string> = { down_payment: 'Down payment', installment: 'Installment' };
export const METHOD_OPTIONS = PAYMENT_METHODS.map((method) => ({ value: method, label: METHOD_LABELS[method] }));
