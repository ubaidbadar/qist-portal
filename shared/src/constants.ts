/** Product name shown in the portal and in emails. A placeholder until the brand is decided. */
export const APP_NAME = 'Qist';

/** Enumerations shared by the API and the portal (docs/plan.md §3). The order is the order they are shown in. */
export const ROLES = ['owner', 'manager', 'staff'] as const;
export const ORG_STATUSES = ['active', 'suspended'] as const;
export const DEVICE_STOCK_STATUSES = ['in_stock', 'sold', 'released', 'returned'] as const;
export const DEVICE_LOCK_STATES = ['unlocked', 'locked'] as const;
export const CONTRACT_STATUSES = ['active', 'completed', 'defaulted', 'cancelled'] as const;
export const INSTALLMENT_STATUSES = ['pending', 'partial', 'paid', 'overdue'] as const;
export const FREQUENCIES = ['weekly', 'biweekly', 'monthly'] as const;
export const PAYMENT_METHODS = ['cash', 'jazzcash', 'easypaisa', 'bank'] as const;
export const COMMAND_TYPES = ['lock', 'unlock', 'release'] as const;
export const COMMAND_STATUSES = ['proposed', 'pending', 'delivered', 'acknowledged', 'failed', 'cancelled'] as const;
export const COMMAND_SOURCES = ['auto', 'manual', 'payment'] as const;
export const LOCK_MODES = ['off', 'approval', 'automatic'] as const;

export type Role = (typeof ROLES)[number];
export type OrgStatus = (typeof ORG_STATUSES)[number];
export type DeviceStockStatus = (typeof DEVICE_STOCK_STATUSES)[number];
export type DeviceLockState = (typeof DEVICE_LOCK_STATES)[number];
export type ContractStatus = (typeof CONTRACT_STATUSES)[number];
export type InstallmentStatus = (typeof INSTALLMENT_STATUSES)[number];
export type Frequency = (typeof FREQUENCIES)[number];
export type PaymentMethod = (typeof PAYMENT_METHODS)[number];
export type CommandType = (typeof COMMAND_TYPES)[number];
export type CommandStatus = (typeof COMMAND_STATUSES)[number];
export type CommandSource = (typeof COMMAND_SOURCES)[number];
export type LockMode = (typeof LOCK_MODES)[number];

/** Due dates are calendar days in the shops' time zone. */
export const SHOP_TIME_ZONE = 'Asia/Karachi';
export const DEFAULT_GRACE_DAYS = 3;
