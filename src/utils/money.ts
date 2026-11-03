import { PAISA_PER_RUPEE, type Paisa } from '@shop/shared';

export type { Paisa };

const pkr = new Intl.NumberFormat('en-PK', {
  style: 'currency',
  currency: 'PKR',
  minimumFractionDigits: 0,
  maximumFractionDigits: 2,
});

/** Display formatting only: amounts stay integer paisa everywhere else. */
export const formatMoney = (amount: Paisa) => pkr.format(amount / PAISA_PER_RUPEE);
