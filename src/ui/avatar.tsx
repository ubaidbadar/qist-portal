import { useState } from 'react';
import { User } from 'lucide-react';

export interface AvatarProps {
  src?: string;
  alt?: string;
  initials?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

const sizeClasses = {
  sm: 'w-8 h-8 text-xs',
  md: 'w-10 h-10 text-sm',
  lg: 'w-12 h-12 text-base',
  xl: 'w-16 h-16 text-xl',
};

const iconSizes = {
  sm: 14,
  md: 18,
  lg: 20,
  xl: 28,
};

export default function Avatar({
  src,
  alt = 'Avatar',
  initials,
  size = 'md',
  className = '',
}: AvatarProps) {
  // Remembering which src failed resets the fallback automatically when src changes.
  const [failedSrc, setFailedSrc] = useState<string>();
  const shapeClasses = `inline-flex shrink-0 items-center justify-center overflow-hidden rounded-full border border-accent/20 bg-accent/10 ${sizeClasses[size]} ${className}`;

  if (src && failedSrc !== src) {
    return <img src={src} alt={alt} onError={() => setFailedSrc(src)} className={`object-cover ${shapeClasses}`} />;
  }

  return (
    <span role="img" aria-label={alt} className={`font-medium text-accent uppercase ${shapeClasses}`}>
      {initials ? initials.substring(0, 2) : <User size={iconSizes[size]} aria-hidden="true" />}
    </span>
  );
}
