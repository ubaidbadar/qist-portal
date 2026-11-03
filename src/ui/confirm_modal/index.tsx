import type { ReactNode } from 'react';
import type { OverlayControllerProps, OverlayProps } from '../../hoc/withOverlay';
import Button, { type ButtonProps } from '../button';
import Modal from '../modal';

export interface ConfirmPanelProps extends OverlayProps {
  /** Called when the user confirms; the dialog closes right after. */
  onConfirm: () => void;
  title: string;
  description: ReactNode;
  confirmText?: string;
  confirmVariant?: ButtonProps['variant'];
  cancelText?: string;
  isConfirming?: boolean;
  confirmingText?: string;
}

export type ConfirmModalProps = OverlayControllerProps<ConfirmPanelProps>;

/** Presentational confirm dialog; `ConfirmModal` and `AlertModal` wrap it with `withOverlay`. */
export default function ConfirmPanel({
  onConfirm,
  title,
  description,
  confirmText = 'Confirm',
  confirmVariant = 'primary',
  cancelText = 'Cancel',
  isConfirming = false,
  confirmingText = 'Processing...',
  ...overlay
}: ConfirmPanelProps) {
  return (
    <Modal
      {...overlay}
      title={title}
      footer={(close) => (
        <>
          <Button variant="ghost" onClick={close} disabled={isConfirming}>
            {cancelText}
          </Button>
          <Button
            variant={confirmVariant}
            onClick={() => {
              onConfirm();
              close();
            }}
            loading={isConfirming}
          >
            {isConfirming ? confirmingText : confirmText}
          </Button>
        </>
      )}
    >
      <div className="text-sm text-body">{description}</div>
    </Modal>
  );
}

