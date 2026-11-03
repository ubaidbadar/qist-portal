import type { ReactNode } from 'react';
import Card from './card';

interface InfoCardProps {
  title: string;
  children: ReactNode;
  className?: string;
}

export default function InfoCard({ title, children, className = '' }: InfoCardProps) {
  return (
    <Card className={className}>
      <p className="font-display text-sm text-ink mb-3">{title}</p>
      {children}
    </Card>
  );
}
