import { Sparkles } from 'lucide-react';
import { AccentWord, Button, FloatingElement, Tag, toast } from '../ui';
import MasteringDrawer from './overlays/mastering_drawer';
import RoomConfigModal from './overlays/room_config_modal';

export default function HeroSection() {
  return (
    <section className="relative overflow-hidden rounded-panel border border-border bg-hero p-6 sm:p-10 shadow-card">
      <div className="max-w-2xl space-y-4">
        <Tag>Component & Pattern Showcase</Tag>
        <h1 className="font-display text-3xl font-bold tracking-tight text-ink sm:text-5xl">
          Modern, Clean & Responsive <AccentWord>Components</AccentWord>
        </h1>
        <p className="text-base text-body sm:text-lg">
          Every component below has been refactored for React 19: ref forwarding, direct Context, elimination of
          state synchronization effects, form action status integration, and strict accessibility.
        </p>
        <div className="flex flex-wrap items-center gap-3 pt-2">
          <Button
            variant="primary"
            onClick={() => toast.success('Welcome to the design system!')}
            icon={Sparkles}
          >
            Trigger Toast
          </Button>
          <RoomConfigModal
            component={({ open }) => (
              <Button variant="outline" onClick={open}>
                Open Demo Modal
              </Button>
            )}
          />
          <MasteringDrawer
            component={({ open }) => (
              <Button variant="premium" onClick={open}>
                Open Drawer
              </Button>
            )}
          />
        </div>
      </div>

      <FloatingElement x="80%" y="15%" duration={5}>
        <div className="flex items-center gap-2">
          <Sparkles size={18} className="text-accent" />
          <span className="text-xs font-semibold text-ink">React 19 Compiler</span>
        </div>
      </FloatingElement>
    </section>
  );
}
