import { z } from 'zod';
import type { RetailerPaymentMethod } from './org';
import type { CommandType, DeviceLockState } from './constants';

/** A freshly issued enrolment QR is only valid this long; the phone must be provisioned at the counter. */
export const ENROLLMENT_TOKEN_TTL_MINUTES = 60;

/** How often an enrolled phone checks in when it has no push wake-up. */
export const DEVICE_CHECKIN_SECONDS = 15 * 60;

/** A phone the device app may describe about itself. Free text is kept short and optional. */
const platformSchema = z.enum(['android']).default('android');
const shortText = z.string().trim().max(80);
const pushTokenSchema = z.string().trim().max(4096);

/** Device app → server, once, to redeem the one-time enrolment token from the QR. */
export const deviceEnrollSchema = z.object({
  token: z.string().min(1),
  pushToken: pushTokenSchema.optional(),
  appVersion: shortText.optional(),
  androidVersion: shortText.optional(),
  platform: platformSchema,
});
export type DeviceEnrollInput = z.infer<typeof deviceEnrollSchema>;

/** Device app → server, on every check-in; all fields optional so an old app still checks in. */
export const deviceCheckinSchema = z.object({
  pushToken: pushTokenSchema.optional(),
  appVersion: shortText.optional(),
  lockState: z.enum(['unlocked', 'locked']).optional(),
});
export type DeviceCheckinInput = z.infer<typeof deviceCheckinSchema>;

/** Device app → server, reporting whether it carried out a delivered command. */
export const commandAckSchema = z.object({
  result: z.enum(['applied', 'failed']),
  detail: shortText.optional(),
});
export type CommandAckInput = z.infer<typeof commandAckSchema>;

/** Server → device app after a successful enrolment: the long-lived credential it stores and sends as a Bearer token. */
export interface DeviceCredential {
  deviceId: string;
  /** `<deviceId>.<secret>`; only its hash is kept on the server. */
  token: string;
  checkInSeconds: number;
}

/** What the phone shows the customer when it is locked. Built from the live contract, never cached by the server. */
export interface LockScreen {
  locked: boolean;
  customerName: string;
  deviceLabel: string;
  amountDue: number;
  nextDueDate: string | null;
  branchName: string;
  branchPhone: string;
  retailerName?: string;
  branchAddress?: string;
  paymentMethods?: RetailerPaymentMethod[];
  message: string;
}

/** A command waiting for the phone to carry out. */
export interface PendingCommand {
  _id: string;
  type: CommandType;
}

/** Server → device app on each check-in: what to do, how it should look, and when to come back. */
export interface DeviceCheckin {
  lockState: DeviceLockState;
  lockScreen: LockScreen;
  commands: PendingCommand[];
  checkInSeconds: number;
}

/** The device app's Device Owner receiver, as Android's provisioning names it (`package/.Class`). */
export const DEVICE_ADMIN_COMPONENT = 'pk.qist.device/.deviceadmin.QistAdminReceiver';

/** The key the device app reads the one-time token from, inside the QR's admin-extras bundle. */
export const ENROLL_TOKEN_EXTRA = 'enrollToken';

/**
 * What the Android setup wizard reads from the provisioning QR (keys are Android's own). It downloads the app from
 * the URL, checks it was signed with our key, makes it Device Owner and hands it the extras bundle.
 * https://developers.google.com/android/management/provision-device#create_qr_code
 */
export interface ProvisioningPayload {
  'android.app.extra.PROVISIONING_DEVICE_ADMIN_COMPONENT_NAME': string;
  'android.app.extra.PROVISIONING_DEVICE_ADMIN_PACKAGE_DOWNLOAD_LOCATION': string;
  /** SHA-256 of the app's signing certificate, URL-safe base64 without padding. Stays the same across app updates. */
  'android.app.extra.PROVISIONING_DEVICE_ADMIN_SIGNATURE_CHECKSUM': string;
  /** Keep the phone's own apps (dialer, camera, gallery…): it is the customer's phone, not a work device. */
  'android.app.extra.PROVISIONING_LEAVE_ALL_SYSTEM_APPS_ENABLED': true;
  'android.app.extra.PROVISIONING_SKIP_EDUCATION_SCREENS': true;
  'android.app.extra.PROVISIONING_TIME_ZONE': string;
  'android.app.extra.PROVISIONING_ADMIN_EXTRAS_BUNDLE': { [ENROLL_TOKEN_EXTRA]: string };
}

/** Portal → server, to issue a provisioning QR for a sold phone. Server → portal returns this. */
export interface EnrollmentTicket {
  deviceId: string;
  token: string;
  expiresAt: string;
  /** Encode `JSON.stringify(payload)` in the QR; the token travels inside it. */
  payload: ProvisioningPayload;
}
