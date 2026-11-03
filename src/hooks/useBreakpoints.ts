import { useSyncExternalStore } from 'react';

export type Breakpoints = {
  sm: number;
  md: number;
  lg: number;
  xl: number;
};

export type BreakpointState = {
  width: number;
  sm: boolean;
  md: boolean;
  lg: boolean;
  xl: boolean;
};

const defaultBreakpoints: Breakpoints = {
  sm: 640,
  md: 768,
  lg: 992,
  xl: 1300,
};

type ViewportSubscriber = () => void;

const subscribers = new Set<ViewportSubscriber>();
let viewportWidth = window.innerWidth;
let animationFrame: number | undefined;

const emitViewportChange = () => {
  const nextWidth = window.innerWidth;
  if (nextWidth === viewportWidth) return;

  viewportWidth = nextWidth;
  subscribers.forEach(notify => notify());
};

const handleResize = () => {
  if (animationFrame !== undefined) return;

  animationFrame = window.requestAnimationFrame(() => {
    animationFrame = undefined;
    emitViewportChange();
  });
};

const subscribeToViewport = (notify: ViewportSubscriber) => {
  subscribers.add(notify);

  if (subscribers.size === 1) {
    viewportWidth = window.innerWidth;
    window.addEventListener('resize', handleResize);
  }

  return () => {
    subscribers.delete(notify);

    if (subscribers.size === 0) {
      window.removeEventListener('resize', handleResize);
      if (animationFrame !== undefined) {
        window.cancelAnimationFrame(animationFrame);
        animationFrame = undefined;
      }
    }
  };
};

const getViewportSnapshot = () => viewportWidth;
const getServerViewportSnapshot = () => 0;

export default function useBreakpoints(
  overrides: Partial<Breakpoints> = {},
): BreakpointState {
  const width = useSyncExternalStore(
    subscribeToViewport,
    getViewportSnapshot,
    getServerViewportSnapshot,
  );

  const sm = overrides.sm ?? defaultBreakpoints.sm;
  const md = overrides.md ?? defaultBreakpoints.md;
  const lg = overrides.lg ?? defaultBreakpoints.lg;
  const xl = overrides.xl ?? defaultBreakpoints.xl;

  return {
    width,
    sm: width >= sm,
    md: width >= md,
    lg: width >= lg,
    xl: width >= xl,
  };
}
