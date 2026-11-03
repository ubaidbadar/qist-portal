import { encode } from 'uqr';

interface QrCodeProps {
  value: string;
  /** What the code is for, read out by screen readers. */
  label: string;
  className?: string;
}

/** Quiet zone the scanner needs around the code, in modules. */
const MARGIN = 4;

/**
 * A QR code drawn as one SVG path. Always black on white, whatever the theme: phone cameras read that most reliably.
 * Low error correction keeps a long setup payload as sparse (and easy to scan) as possible on screen.
 */
export default function QrCode({ value, label, className = '' }: QrCodeProps) {
  const { data, size } = encode(value, { ecc: 'L', border: 0 });
  const path = data.flatMap((row, y) => row.flatMap((dark, x) => (dark ? [`M${x + MARGIN} ${y + MARGIN}h1v1h-1z`] : []))).join('');
  const side = size + MARGIN * 2;

  return (
    <svg viewBox={`0 0 ${side} ${side}`} role="img" aria-label={label} shapeRendering="crispEdges" className={className}>
      <rect width={side} height={side} fill="white" />
      <path d={path} fill="black" />
    </svg>
  );
}
