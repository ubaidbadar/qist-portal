import { Button, Input, Modal, Toggle, toast } from '../../ui';
import type { DemoOverlayProps } from './types';

export default function RoomConfigModal({ component }: DemoOverlayProps) {
  return (
    <Modal
      component={component}
      title="Spatial Room Configuration"
      footer={(close) => (
        <>
          <Button variant="ghost" onClick={close}>
            Cancel
          </Button>
          <Button
            variant="primary"
            onClick={() => {
              close();
              toast.success('Configuration saved successfully');
            }}
          >
            Save Parameters
          </Button>
        </>
      )}
    >
      <div className="space-y-3 text-sm text-body">
        <p>Configure simulated room dimensions, reflection damping, and convolution reverb targets.</p>
        <Input label="Room Reverberation Time (RT60)" defaultValue="1.4s" />
        <Toggle label="Enable early reflection clustering" defaultChecked />
      </div>
    </Modal>
  );
}
