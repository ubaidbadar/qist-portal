import { Banknote, CalendarCheck2, Wallet } from 'lucide-react';
import type { ContractWithSchedule } from '@shop/shared';
import { Card, StatCard } from '../../ui';
import MoneyText from '../../shared/money_text';

/** Financial figures are server-derived; late fees remain separate from installments. */
export default function ContractOverview({ contract }: { contract: ContractWithSchedule }) {
  const outstanding = Math.max(0, contract.totalPayable - contract.paidTotal);

  return (
    <>
      <section aria-label="Installment overview" className="sm:hidden">
        <Card padding="sm">
          <dl className="grid grid-cols-2 gap-4">
            <div className="col-span-2 border-b border-border pb-3">
              <dt className="text-xs font-semibold text-muted">Installment balance</dt>
              <dd className="mt-1 text-xl font-semibold text-ink tabular-nums">
                <MoneyText amount={outstanding} />
              </dd>
              {contract.lateFees > 0 && (
                <p className="mt-1 text-xs text-muted">Late fees are not included</p>
              )}
            </div>
            <div className="min-w-0">
              <dt className="text-xs text-muted">Paid so far</dt>
              <dd className="mt-1 break-words text-base font-semibold text-success-800 tabular-nums">
                <MoneyText amount={contract.paidTotal} />
              </dd>
            </div>
            <div className="min-w-0">
              <dt className="text-xs text-muted">Total installments</dt>
              <dd className="mt-1 break-words text-base font-semibold text-ink tabular-nums">
                <MoneyText amount={contract.totalPayable} />
              </dd>
            </div>
          </dl>
        </Card>
      </section>
      <section aria-label="Installment overview" className="hidden gap-3 sm:grid sm:grid-cols-3">
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
    </>
  );
}
