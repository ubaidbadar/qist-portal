import ConfirmPanel, { type ConfirmModalProps, type ConfirmPanelProps } from '../confirm_modal';

export type AlertModalProps = ConfirmModalProps;

/** A ConfirmModal preset for destructive actions. */
export default function AlertPanel({
  confirmText = 'Delete',
  confirmVariant = 'danger',
  confirmingText = 'Confirming...',
  ...props
}: ConfirmPanelProps) {
  return (
    <ConfirmPanel
      {...props}
      confirmText={confirmText}
      confirmVariant={confirmVariant}
      confirmingText={confirmingText}
    />
  );
}
