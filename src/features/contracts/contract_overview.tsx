import { Banknote, CalendarCheck2, Wallet } from 'lucide-react';
import type { ContractWithSchedule } from '@shop/shared';
import { StatCard } from '../../ui';
import MoneyText from '../../shared/money_text';

/** Financial figures already returned by the contract API; late fees stay separate. */
export default function ContractOverview({ contract }: { contract: ContractWithSchedule }) {
  const outstanding = Math.max(0, contract.totalPayable - contract.paidTotal);

  return (
    <section aria-label="Installment overview" className="grid gap-3 sm:grid-cols-3">
      <StatCard
        label="Total installments"
        value={<MoneyText amount={contract.totalPayable} />}
        hint="Excludes down payment"
        icon={Wallet}
        tone="neutral"
      />
      <StatCard
        label="Paid so far"
        value={<MoneyText amount={contract.paidTotal} />}
        hint="Toward installments"
        icon={CalendarCheck2}
        tone="success"
      />
      <StatCard
        label="Installment balance"
        value={<MoneyText amount={outstanding} />}
        hint={contract.lateFees ? 'Excludes late fees' : 'Remaining installments'}
        icon={Banknote}
        tone={outstanding ? 'warning' : 'success'}
      />
    </section>
  );
}
