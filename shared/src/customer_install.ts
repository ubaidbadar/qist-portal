import { z } from 'zod';

/** One immutable, approved universal APK. The locker never downloads an AAB or scrapes Google Play. */
export const customerAppReleaseSchema = z.object({
  packageName: z.literal('pk.qist.customer'),
  versionCode: z.number().int().positive().max(2_100_000_000),
  minSdk: z.number().int().min(24),
  apkUrl: z.url().refine((value) => {
    const url = new URL(value);
    return url.protocol === 'https:' && !url.username && !url.password && !url.hash;
  }, 'must be an HTTPS APK URL without credentials or a fragment'),
  sizeBytes: z.number().int().positive().max(200 * 1024 * 1024),
  sha256: z.string().regex(/^[a-f0-9]{64}$/),
  signingCertificateSha256: z.string().regex(/^[a-f0-9]{64}$/),
  wifiOnly: z.boolean().default(true),
});
export type CustomerAppRelease = z.infer<typeof customerAppReleaseSchema>;

export const customerAppReportSchema = z.object({
  status: z.enum(['pending', 'downloading', 'installing', 'installed', 'failed', 'needs_attention', 'not_configured']),
  versionCode: z.number().int().positive().max(2_100_000_000).optional(),
  detailCode: z.enum(['waiting_for_wifi', 'waiting_for_setup', 'network', 'storage', 'invalid_release', 'signature_mismatch', 'install_failed', 'user_action', 'unsupported_android', 'not_device_owner']).optional(),
});
export type CustomerAppReport = z.infer<typeof customerAppReportSchema>;
