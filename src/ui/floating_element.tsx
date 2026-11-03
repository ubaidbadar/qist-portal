import type { CSSProperties, ReactNode } from 'react';

interface FloatingElementProps {
  children: ReactNode;
  delay?: number;
  duration?: number;
  x?: string | number;
  y?: string | number;
  className?: string;
}

/**
 * Decorative badge that pops in, then bobs. One element runs both CSS animations: they animate
 * different properties (scale/opacity vs translate), so they compose without a wrapper.
 */
export default function FloatingElement({
  children,
  delay = 0,
  duration = 4,
  x,
  y,
  className = '',
}: FloatingElementProps) {
  const style: CSSProperties = {
    left: x,
    top: y,
    animation: `pop-in 0.8s var(--ease-emphasized) ${delay}s both, float ${duration}s ease-in-out ${delay}s infinite`,
  };

  return (
    <div
      style={style}
      className={`absolute hidden md:flex items-center justify-center rounded-card border border-surface/50 bg-surface/60 p-4 text-accent shadow-xl shadow-accent/10 backdrop-blur-md motion-reduce:animate-none! ${className}`}
    >
      {children}
    </div>
  );
}
