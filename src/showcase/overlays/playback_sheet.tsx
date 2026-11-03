import { BottomSheet, Button, toast } from '../../ui';
import type { DemoOverlayProps } from './types';

const PLAYBACK_OPTIONS = ['96kHz / 24-bit Lossless', 'Binaural Spatial Audio'];

export default function PlaybackSheet({ component }: DemoOverlayProps) {
  return (
    <BottomSheet component={component}>
      {(close) => (
          <div className="space-y-4">
          <h3 className="font-display text-xl font-bold text-ink">Playback Options</h3>
          <p className="text-sm text-body">Choose your desired sample rate and spatial output format:</p>
          <div className="flex flex-col gap-2">
            {PLAYBACK_OPTIONS.map((option) => (
              <Button
                key={option}
                variant="outline"
                className="w-full justify-start"
                onClick={() => {
                  close();
                  toast.info(`Selected: ${option}`);
                }}
              >
                {option}
              </Button>
            ))}
          </div>
        </div>
      )}
    </BottomSheet>
  );
}
