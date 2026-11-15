import type { OrgLogoInput } from '@shop/shared';

const MAX_LOGO_BYTES = 64 * 1024;
const MAX_SOURCE_BYTES = 8 * 1024 * 1024;
const MAX_DIMENSION = 512;
const ALLOWED_TYPES = ['image/png', 'image/jpeg', 'image/webp'] as const;

export interface PreparedOrgLogo extends OrgLogoInput {
  previewUrl: string;
}

function base64Of(bytes: Uint8Array): string {
  let binary = '';
  for (let offset = 0; offset < bytes.length; offset += 0x8000) {
    binary += String.fromCharCode(...bytes.subarray(offset, offset + 0x8000));
  }
  return btoa(binary);
}

function canvasBlob(canvas: HTMLCanvasElement, quality: number): Promise<Blob | null> {
  return new Promise((resolve) => canvas.toBlob(resolve, 'image/webp', quality));
}

/** Resize and compress a shop logo in the browser before sending it in the small onboarding request. */
export async function prepareOrgLogo(file: File): Promise<PreparedOrgLogo> {
  if (!ALLOWED_TYPES.includes(file.type as (typeof ALLOWED_TYPES)[number])) {
    throw new Error('Choose a PNG, JPG or WebP image.');
  }
  if (file.size > MAX_SOURCE_BYTES) {
    throw new Error('Choose an image smaller than 8 MB.');
  }

  const bitmap = await createImageBitmap(file);
  try {
    const scale = Math.min(1, MAX_DIMENSION / Math.max(bitmap.width, bitmap.height));
    const canvas = document.createElement('canvas');
    canvas.width = Math.max(1, Math.round(bitmap.width * scale));
    canvas.height = Math.max(1, Math.round(bitmap.height * scale));

    const context = canvas.getContext('2d');
    if (!context) throw new Error('This browser could not prepare the logo. Try another image.');

    context.drawImage(bitmap, 0, 0, canvas.width, canvas.height);

    let blob: Blob | null = null;
    for (const quality of [0.84, 0.72, 0.6, 0.48]) {
      blob = await canvasBlob(canvas, quality);
      if (blob && ['image/webp', 'image/png', 'image/jpeg'].includes(blob.type) && blob.size <= MAX_LOGO_BYTES) break;
    }

    if (!blob || !['image/webp', 'image/png', 'image/jpeg'].includes(blob.type) || blob.size > MAX_LOGO_BYTES) {
      throw new Error('This logo is still too large after optimization. Try a simpler image.');
    }

    const data = base64Of(new Uint8Array(await blob.arrayBuffer()));
    return {
      contentType: blob.type as OrgLogoInput['contentType'],
      data,
      previewUrl: 'data:' + blob.type + ';base64,' + data,
    };
  } finally {
    bitmap.close();
  }
}
