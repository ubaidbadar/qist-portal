import { Link, useNavigate } from 'react-router-dom';
import { Ban, MoreHorizontal, Printer, QrCode } from 'lucide-react';
import type { ContractWithSchedule } from '@shop/shared';
import { Button, DropdownMenu, Modal, type DropdownMenuItem } from '../../ui';
import { useCan } from '../../auth';
import EnrollmentPanel from '../inventory/enrollment_panel';
import RecordPaymentModal from '../payments/record_payment_modal';
import CancelContractModal from './cancel_contract_modal';

/**
 * Small screens get one prominent payment action plus a compact menu.
 * On desktop, preserve the original direct Agreement / QR / Cancel actions.
 *
 * Both modals use the existing withOverlay trigger pattern and retain all
 * permission checks and confirmations. No extra open-state hooks are needed.
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
            const mobileItems: DropdownMenuItem[] = [
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
              <>
                <div className="flex w-full items-center gap-2 lg:hidden">
                  {canPay && (
                    <div className="min-w-0 flex-1">
                      <RecordPaymentModal contract={contract} className="w-full" />
                    </div>
                  )}
                  {!canPay && !canEnroll && !canCancel ? (
                    <Button
                      as={Link}
                      to={`/contracts/${contract._id}/agreement`}
                      variant="outline"
                      icon={Printer}
                      className="w-full"
                    >
                      View agreement
                    </Button>
                  ) : (
                    <DropdownMenu
                      align="right"
                      className={canPay ? 'shrink-0' : 'w-full'}
                      items={mobileItems}
                      trigger={(expanded) => (
                        <Button
                          variant="outline"
                          icon={MoreHorizontal}
                          aria-haspopup="menu"
                          aria-expanded={expanded}
                          aria-label="More contract actions"
                          className={canPay ? '' : 'w-full'}
                        >
                          More
                        </Button>
                      )}
                    />
                  )}
                </div>

                <div className="hidden flex-wrap items-center gap-2 lg:flex">
                  {canCancel && (
                    <Button variant="danger" icon={Ban} onClick={showCancel}>Cancel contract</Button>
                  )}
                  <Button as={Link} to={`/contracts/${contract._id}/agreement`} variant="outline" icon={Printer}>
                    Agreement
                  </Button>
                  {canEnroll && (
                    <Button variant="outline" icon={QrCode} onClick={showQr}>Phone setup QR</Button>
                  )}
                  {canPay && <RecordPaymentModal contract={contract} />}
                </div>
              </>
            );
          }}
        />
      )}
    >
      <EnrollmentPanel deviceId={contract.deviceId} deviceLabel={contract.deviceLabel} />
    </Modal>
  );
}
