import { AlertModal, toast } from '../../ui';
import type { DemoOverlayProps } from './types';

export default function DeleteStemAlert({ component }: DemoOverlayProps) {
  return (
    <AlertModal
      component={component}
      onConfirm={() => toast.error('Stem track deleted permanently')}
      title="Delete Stem Track?"
      description="This action cannot be undone. All spatial calibration files associated with this stem will be permanently removed from disk."
      confirmText="Permanently Delete"
    />
  );
}
