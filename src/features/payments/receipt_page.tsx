import { useState, type ReactNode } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { ArrowLeft, Printer } from 'lucide-react';
import { format } from 'date-fns';
import type { Payment } from '@shop/shared';
import { Button, SegmentedControl, Skeleton } from '../../ui';
import { useMe } from '../../auth';
import MoneyText from '../../shared/money_text';
import QueryView from '../../shared/query_view';
import { KIND_LABELS, METHOD_LABELS } from './labels';
import { paymentQuery } from './queries';

const WIDTHS: Record<string, string> = { A4: 'max-w-2xl', '80 mm': 'max-w-[80mm] text-xs' };

/** A payment receipt, for an A4 printer or an 80 mm thermal receipt printer. */
export default function ReceiptPage() {
  const { paymentId = '' } = useParams();
  const query = useQuery(paymentQuery(paymentId));
  const [paper, setPaper] = useState('A4');

  return (
    <main className="mx-auto max-w-2xl px-4 py-8 print:p-0">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3 print:hidden">
        <Button as={Link} to={query.data ? `/contracts/${query.data.contractId}` : '/payments'} variant="ghost" icon={ArrowLeft}>Back</Button>
        <div className="flex items-center gap-3">
          <SegmentedControl aria-label="Paper" options={Object.keys(WIDTHS)} value={paper} onChange={setPaper} />
          <Button icon={Printer} onClick={() => window.print()}>Print</Button>
        </div>
      </div>
      <QueryView query={query} skeleton={<Skeleton className="h-96 w-full" />}>
        {(payment) => <Receipt payment={payment} widthClass={WIDTHS[paper]} />}
      </QueryView>
    </main>
  );
}

function Receipt({ payment, widthClass }: { payment: Payment; widthClass: string }) {
  const { org } = useMe();
  const voided = Boolean(payment.voidedAt);

  return (
    <article className={`relative mx-auto space-y-4 rounded-card bg-surface p-6 text-body shadow-card print:shadow-none ${widthClass}`}>
      {voided && (
        <p className="absolute top-1/3 left-1/2 -translate-x-1/2 -rotate-12 rounded-control border-4 border-danger-500 px-4 py-1 text-3xl font-bold text-danger-500 opacity-70">VOID</p>
      )}
      <header className="border-b border-dashed border-border pb-3 text-center">
        <h1 className="text-lg font-semibold text-ink">{org.name}</h1>
        <p className="text-muted">{payment.branch?.name}</p>
        <p className="mt-2 font-medium text-ink">Receipt {payment.receiptNumber}</p>
        <p className="text-muted">{format(new Date(payment.createdAt), 'd MMM yyyy, h:mm a')}</p>
      </header>
      <dl className="space-y-1.5">
        <Line label="Customer" value={payment.customerName} />
        <Line label="Phone" value={payment.deviceLabel} />
        <Line label="For" value={KIND_LABELS[payment.kind]} />
        <Line label="Paid by" value={`${METHOD_LABELS[payment.method]}${payment.reference ? ` · ${payment.reference}` : ''}`} />
        {payment.allocations.map((allocation) => (
          <Line key={allocation.number} label={`Installment ${allocation.number}`} value={<MoneyText amount={allocation.amount} />} />
        ))}
      </dl>
      <p className="flex items-baseline justify-between border-t border-dashed border-border pt-3 text-ink">
        <span className="font-medium">Amount received</span>
        <MoneyText amount={payment.amount} className="text-xl font-semibold" />
      </p>
      <footer className="text-center text-muted">
        Received by {payment.receivedByName}. Keep this receipt.
        {voided && <span className="mt-1 block text-danger-600">Voided: {payment.voidReason}</span>}
      </footer>
    </article>
  );
}

function Line({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div className="flex justify-between gap-4">
      <dt className="text-muted">{label}</dt>
      <dd className="text-right text-ink">{value}</dd>
    </div>
  );
}
