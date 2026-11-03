import { formatMoney, type Paisa } from '../utils/money';

interface MoneyTextProps {
  amount: Paisa;
  className?: string;
}

export default function MoneyText({ amount, className = '' }: MoneyTextProps) {
  return <span className={`whitespace-nowrap tabular-nums ${className}`}>{formatMoney(amount)}</span>;
}
