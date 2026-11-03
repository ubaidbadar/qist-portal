import type { ComponentType } from 'react';
import { Button, Card, type ButtonProps } from '../ui';
import Section from './section';
import BroadcastConfirm from './overlays/broadcast_confirm';
import DeleteStemAlert from './overlays/delete_stem_alert';
import MasteringDrawer from './overlays/mastering_drawer';
import PlaybackSheet from './overlays/playback_sheet';
import RoomConfigModal from './overlays/room_config_modal';
import type { DemoOverlayProps } from './overlays/types';

const LAUNCHERS: { Overlay: ComponentType<DemoOverlayProps>; label: string; variant: ButtonProps['variant'] }[] = [
  { Overlay: RoomConfigModal, label: 'Launch Standard Modal', variant: 'primary' },
  { Overlay: BroadcastConfirm, label: 'Launch Confirm Modal', variant: 'secondary' },
  { Overlay: DeleteStemAlert, label: 'Launch Alert Dialog', variant: 'danger' },
  { Overlay: MasteringDrawer, label: 'Slide-Over Drawer', variant: 'outline' },
  { Overlay: PlaybackSheet, label: 'Bottom Sheet', variant: 'ghost' },
];

export default function OverlaysSection() {
  return (
    <Section title="Overlays & Dialogs" aside="CSS Enter & Exit Animations">
      <Card className="flex flex-wrap items-center gap-3">
        {LAUNCHERS.map(({ Overlay, label, variant }) => (
          <Overlay
            key={label}
            component={({ open }) => (
              <Button variant={variant} onClick={open}>
                {label}
              </Button>
            )}
          />
        ))}
      </Card>
    </Section>
  );
}
