import type { ReactNode } from 'react';

interface AccentWordProps {
  children: ReactNode;
}

export default function AccentWord({ children }: AccentWordProps) {
  return (
    <em className="font-display italic text-accent font-medium">
      {children}
    </em>
  );
}
