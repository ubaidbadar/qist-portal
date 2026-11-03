import { ConfirmModal, toast } from '../../ui';
import type { DemoOverlayProps } from './types';

export default function BroadcastConfirm({ component }: DemoOverlayProps) {
  return (
    <ConfirmModal
      component={component}
      onConfirm={() => toast.success('Master broadcast initiated')}
      title="Initiate Global Broadcast?"
      description="Are you sure you want to stream this master track live across all public subscriber nodes?"
      confirmText="Start Broadcast"
    />
  );
}
