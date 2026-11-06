export const MARKUP_BASIS_OPTIONS = [
  { value: 'financed', label: 'Balance after down payment' },
  { value: 'cash_price', label: 'Full cash price (includes down payment)' },
];
export const markupBasisLabel = (basis?: string) => basis === 'cash_price' ? 'Full cash price' : 'Balance after down payment';
