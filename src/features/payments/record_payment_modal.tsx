import { Banknote } from 'lucide-react';
import type { ContractWithSchedule } from '@shop/shared';
import { Button, Modal } from '../../ui';
import RecordPaymentForm from './record_payment_form';

/** Use the same payment form from contract detail and the Payments page. */
export default function RecordPaymentModal({ contract }: { contract: ContractWithSchedule }) {
  return (
    <Modal title="Record payment" component={({ open }) => <Button icon={Banknote} onClick={open}>Record payment</Button>}>
      {(close) => <RecordPaymentForm contract={contract} onDone={close} />}
    </Modal>
  );
}
