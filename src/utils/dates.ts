import { format } from 'date-fns';

/** "2 Oct 2026": dates the way they are written on receipts. */
export const formatDate = (iso: string) => format(new Date(iso), 'd MMM yyyy');

/** "2 Oct 2026, 3:45 PM": a moment, such as a phone's last check-in. */
export const formatDateTime = (iso: string) => format(new Date(iso), 'd MMM yyyy, h:mm a');

/** "3:45 PM": a time later today, such as when a QR code expires. */
export const formatTime = (iso: string) => format(new Date(iso), 'h:mm a');
