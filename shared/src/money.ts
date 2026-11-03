/** Money is always an integer number of paisa; it becomes rupees only when formatted for display. */
export type Paisa = number;

export const PAISA_PER_RUPEE = 100;

export const toPaisa = (rupees: number): Paisa => Math.round(rupees * PAISA_PER_RUPEE);

/** "Rs 10,000": amounts in messages and audit summaries written by the server. */
export const formatRupees = (amount: Paisa) => `Rs ${(amount / PAISA_PER_RUPEE).toLocaleString('en-PK', { maximumFractionDigits: 2 })}`;
