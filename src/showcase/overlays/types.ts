import type { OverlayTrigger } from '../../hoc/withOverlay';

/** Every demo overlay renders its own panel and lets the caller decide what opens it. */
export interface DemoOverlayProps {
  component: OverlayTrigger;
}
