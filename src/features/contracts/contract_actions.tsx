import { useNavigate } from 'react-router-dom';
import { Ban, MoreHorizontal, Printer, QrCode } from 'lucide-react';
import type { ContractWithSchedule } from '@shop/shared';
import { Button, DropdownMenu, Modal, type DropdownMenuItem } from '../../ui';
import { useCan } from '../../auth';
import EnrollmentPanel from '../inventory/enrollment_panel';
import RecordPaymentModal from '../payments/record_payment_modal';
import CancelContractModal from './cancel_contract_modal';

/**
 * Payment is the only prominent action. Agreement, first-time setup and the destructive
 * cancellation live in one keyboard-accessible menu at every breakpoint.
 *
 * Both modals own their open state via withOverlay; the menu invokes their provided open
 * handlers rather than introducing a second modal state or bypassing permission checks.
 */
export default function ContractActions({ contract }: { contract: ContractWithSchedule }) {
  const navigate = useNavigate();
  const can = useCan();
  const canPay = contract.status === 'active' && can('payments.record');
  const canEnroll = contract.status === 'active' && can('devices.enroll');
  const canCancel = contract.status === 'active' && contract.paidTotal === 0 && can('contracts.cancel');

  return (
    <Modal
      title={`Set up ${contract.deviceLabel}`}
      component={({ open: showQr }) => (
        <CancelContractModal
          contract={contract}
          trigger={(showCancel) => {
            const items: DropdownMenuItem[] = [
              {
                label: 'View agreement',
                icon: Printer,
                onClick: () => navigate(`/contracts/${contract._id}/agreement`),
              },
              ...(canEnroll ? [{
                label: 'Phone setup QR',
                icon: QrCode,
                onClick: showQr,
              }] : []),
              ...(canCancel ? [{
                label: 'Cancel contract',
                icon: Ban,
                danger: true,
                onClick: showCancel,
              }] : []),
            ];

            return (
              <div className="flex w-full items-center gap-2 sm:w-auto">
                {canPay && (
                  <div className="min-w-0 flex-1 sm:flex-none">
                    <RecordPaymentModal contract={contract} className="w-full sm:w-auto" />
                  </div>
                )}
                <DropdownMenu
                  align="right"
                  className={canPay ? 'shrink-0' : 'w-full sm:w-auto'}
                  items={items}
                  trigger={(expanded) => (
                    <Button
                      variant="outline"
                      icon={MoreHorizontal}
                      aria-haspopup="menu"
                      aria-expanded={expanded}
                      aria-label="More contract actions"
                      className={canPay ? '' : 'w-full sm:w-auto'}
                    >
                      More
                    </Button>
                  )}
                />
              </div>
            );
          }}
        />
      )}
    >
      <EnrollmentPanel deviceId={contract.deviceId} deviceLabel={contract.deviceLabel} />
    </Modal>
  );
}
