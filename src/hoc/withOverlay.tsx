import type { ComponentType, ReactNode } from 'react';
import useShow, { type ShowTools } from '../hooks/useShow';

/** Props every overlay panel receives from `withOverlay`. */
export type OverlayProps = ShowTools;

/** Renders the element that opens the overlay: `component={({ open }) => <Button onClick={open} />}`. */
export type OverlayTrigger = (tools: ShowTools) => ReactNode;

/** Footer content, or a function of `close` (e.g. `footer={(close) => <Button onClick={close} />}`). */
export type OverlayFooter = ReactNode | ((close: () => void) => ReactNode);

export const renderFooter = (footer: OverlayFooter, close: () => void) =>
  typeof footer === 'function' ? footer(close) : footer;

export type OverlayControllerProps<Props extends ShowTools> = Omit<Props, keyof ShowTools> & {
  component?: OverlayTrigger;
};

/**
 * Turns a presentational panel into a self-managing overlay: owns the open state (via `useShow`),
 * renders the trigger, and mounts the panel only while it is open or closing.
 */
export default function withOverlay<Props extends ShowTools>(Panel: ComponentType<Props>) {
  return ({ component, ...panelProps }: OverlayControllerProps<Props>) => {
    const tools = useShow();

    return (
      <>
        {component?.(tools)}
        {tools.state && <Panel {...(panelProps as unknown as Props)} {...tools} />}
      </>
    );
  };
}
