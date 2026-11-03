import { z } from 'zod';
import { deviceCreateSchema, imeiSchema, toPaisa, type Device } from '@shop/shared';

const { brand, model, storage, color } = deviceCreateSchema.shape;

/** The form keeps the two IMEIs and the price in rupees as typed; `toDeviceInput` turns them into the API's shape. */
export const deviceFormSchema = z
  .object({
    branchId: z.string().min(1, 'Choose a branch'),
    brand,
    model,
    storage,
    color,
    imei1: imeiSchema,
    imei2: z.union([z.literal(''), imeiSchema]),
    ptaApproved: z.boolean(),
    costRupees: z.string().trim().regex(/^(\d+(\.\d{1,2})?)?$/, 'Enter an amount in rupees, e.g. 45000'),
  })
  .refine((form) => form.imei2 === '' || form.imei1 !== form.imei2, { message: 'IMEI 2 must differ from IMEI 1', path: ['imei2'] });

export type DeviceFormValues = z.input<typeof deviceFormSchema>;

export const toDeviceInput = ({ imei1, imei2, costRupees, ...rest }: z.output<typeof deviceFormSchema>) => ({
  ...rest,
  imeis: imei2 ? [imei1, imei2] : [imei1],
  costPrice: costRupees === '' ? null : toPaisa(Number(costRupees)),
});

export const deviceFormValues = (device: Device | undefined, branchId: string): DeviceFormValues => ({
  branchId: device?.branchId ?? branchId,
  brand: device?.brand ?? '',
  model: device?.model ?? '',
  storage: device?.storage ?? '',
  color: device?.color ?? '',
  imei1: device?.imeis[0] ?? '',
  imei2: device?.imeis[1] ?? '',
  ptaApproved: device?.ptaApproved ?? true,
  costRupees: device?.costPrice == null ? '' : String(device.costPrice / 100),
});
