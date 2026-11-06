import { useWatch, type Control, type FieldValues } from 'react-hook-form';
import { buildSchedule, priceContract } from '@shop/shared';
import { Card } from '../../ui';
import DetailList from '../../shared/detail_list';
import { markupBasisLabel } from './markup_basis';
import MoneyText from '../../shared/money_text';
import ScheduleTable from './schedule_table';
import { termsFormSchema, toContractTerms } from './terms_form_schema';

/**
 * The deal as the customer will sign it, recalculated on every keystroke. `useWatch` (not `watch()`) so the
 * React Compiler re-renders it when a field changes.
 */
export default function TermsPreview({ control }: { control: Control<FieldValues> }) {
  const parsed = termsFormSchema.safeParse(useWatch({ control }));

  if (!parsed.success) {
    return (
      <Card className="flex items-center justify-center text-center text-sm text-muted">
        Enter the price and terms to see the schedule.
      </Card>
    );
  }

  const terms = toContractTerms(parsed.data);
  const pricing = priceContract(terms);

  return (
    <Card className="space-y-5">
      <DetailList
        items={[
          { label: 'Cash price', value: <MoneyText amount={terms.cashPrice} /> },
          { label: 'Down payment', value: <MoneyText amount={terms.downPayment} /> },
          { label: 'Financed', value: <MoneyText amount={pricing.financedAmount} /> },
          { label: `Markup base (${markupBasisLabel(terms.markupBasis)})`, value: <MoneyText amount={terms.markupBasis === 'cash_price' ? terms.cashPrice : pricing.financedAmount} /> },
          { label: `Markup (${terms.markupPercent}%)`, value: <MoneyText amount={pricing.markupAmount} /> },
          { label: 'Total including down payment', value: <MoneyText amount={terms.downPayment + pricing.totalPayable} /> },
          { label: 'Paid in installments', value: <MoneyText amount={pricing.totalPayable} className="font-semibold" /> },
        ]}
      />
      <ScheduleTable installments={buildSchedule(pricing.totalPayable, terms.count, terms.frequency, terms.firstDueDate)} />
    </Card>
  );
}
