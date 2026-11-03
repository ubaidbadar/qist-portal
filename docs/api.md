# Qist API reference

The HTTP API served by `server/` (Hono on Bun). The portal in `client/` and the Android device app are its only
clients. Request and response shapes are the Zod schemas and types in `shared/src/` (`@shop/shared`); when this
page and the code disagree, the code is right and this page needs fixing. In development the server shows this
page at `http://localhost:5001/docs`.

- [Conventions](#conventions)
- [Authentication](#authentication)
- [Roles and permissions](#roles-and-permissions)
- Portal endpoints: [auth](#auth) · [me](#me) · [org](#org) · [branches](#branches) · [users](#users) ·
  [plans](#plans) · [customers](#customers) · [devices](#devices) · [contracts](#contracts) ·
  [payments](#payments) · [commands and locks](#commands-and-locks)
- [Device API](#device-api) (Android app)
- [Internal jobs](#internal-jobs) · [Health](#health)

## Conventions

**Base URL.** Everything is under `/api/v1`, except `GET /health`. In development the server runs on
`http://localhost:5001`.

**Envelope.** Every response body is JSON and is one of:

```json
{ "data": ... }
{ "error": { "code": "VALIDATION_ERROR", "message": "Some fields are invalid", "details": { "fields": [{ "path": "cnic", "message": "Already registered" }] } } }
```

`details` is optional. For problems tied to a form field it is `{ fields: [{ path, message }] }`.

**Error codes.**

| Status | `code` | When |
| --- | --- | --- |
| 400 | `VALIDATION_ERROR` | Body, query or id failed validation; malformed JSON; a business rule on the input |
| 401 | `UNAUTHORIZED` | Missing, expired or revoked token; wrong email or password |
| 403 | `FORBIDDEN` | The role lacks the permission, the user doesn't work at that branch, the account is deactivated or the organization is suspended |
| 404 | `NOT_FOUND` | Unknown route, or the record doesn't exist in this organization |
| 409 | `CONFLICT` | Duplicate (email, CNIC, IMEI) or the record is in the wrong state for the action |
| 413 | `PAYLOAD_TOO_LARGE` | Body over 100 KB |
| 429 | `RATE_LIMITED` | Too many attempts; the `Retry-After` header gives the wait in seconds |
| 500 | `INTERNAL_ERROR` | Unexpected; the message is always "Something went wrong" |

Duplicate errors name the field but never echo the value.

**Data formats.**

- Ids are MongoDB ObjectIds: 24 hex characters, in the `_id` field. Documents are returned as stored.
- Money is an integer number of **paisa** (Rs 1 = 100). A single amount is capped at 1,000,000,000 paisa.
- Calendar dates (due dates, `receivedOn`, `until`) are `YYYY-MM-DD` in `Asia/Karachi`. Timestamps
  (`createdAt`, `updatedAt`…) are ISO 8601 strings.
- CNIC is stored as 13 digits, mobile numbers as `03XXXXXXXXX`, IMEIs as 15 digits with a valid check digit.
  Inputs may contain dashes, spaces or `+92`; the server normalizes them.

**Pagination.** Paged lists take `?limit` (1 to 100, default 20) and `?cursor`, and return newest first:

```json
{ "data": { "items": [...], "nextCursor": "665f1c..." } }
```

Pass `nextCursor` back as `cursor` for the next page; `null` means there are no more. Short lists (branches,
users, plans, a contract's payments, overdue accounts) are returned whole as a plain array.

**Tenancy and branches.** Every record belongs to the caller's organization; records of other organizations
answer 404. Owners work at every branch. Managers and staff work only at their assigned branches: a `branchId`
they don't work at answers 403, and branch-scoped lists show only their branches.

**Headers.**

| Header | Direction | Use |
| --- | --- | --- |
| `Authorization: Bearer <token>` | request | Access token (portal), device credential (device API) or job secret (internal) |
| `Idempotency-Key` | request | Required when recording a payment |
| `X-Request-Id` | response | Id of the request, for matching against server logs |
| `Retry-After` | response | Seconds to wait after a 429 |

CORS allows only the portal origin (`APP_ORIGIN`), with credentials.

## Authentication

A session is two tokens:

- **Access token**: a JWT valid for 15 minutes, returned in the body as `accessToken`. Send it as
  `Authorization: Bearer <accessToken>`. The portal keeps it in memory only.
- **Refresh token**: valid for 30 days, in the httpOnly cookie `qist_refresh` (path `/api/v1/auth`,
  `SameSite=Lax`, `Secure` in production). It is never in a response body. Each `POST /auth/refresh` replaces it;
  replaying an old one signs the user out on every device.

The user is loaded on every request, so deactivation, a role change or a password change takes effect at once.

`Session` (returned by signup, login, refresh and change-password):

```json
{
  "data": {
    "accessToken": "eyJ...",
    "user": { "_id": "...", "orgId": "...", "email": "...", "fullName": "...", "role": "owner", "branchIds": [], "active": true, "emailVerifiedAt": null, "mustChangePassword": false, "lastLoginAt": null, "createdAt": "...", "updatedAt": "..." },
    "org": { "_id": "...", "name": "...", "status": "active", "createdAt": "...", "updatedAt": "..." },
    "branches": [{ "_id": "...", "orgId": "...", "name": "...", "phone": "", "address": "", "active": true, "createdAt": "...", "updatedAt": "..." }]
  }
}
```

`branches` holds the active branches the user can work in. `Me` is the same without `accessToken`.

## Roles and permissions

Roles are `owner`, `manager` and `staff`. Reading needs no permission (it is limited by organization and
branch); each write below names the permission it needs.

| Permission | owner | manager | staff |
| --- | :-: | :-: | :-: |
| `org.manage` (organization, branches, plans, policy) | ✓ | | |
| `team.manage` | ✓ | | |
| `branches.all` (work at every branch) | ✓ | | |
| `customers.write` | ✓ | ✓ | ✓ |
| `customers.delete` | ✓ | | |
| `stock.write` | ✓ | ✓ | ✓ |
| `stock.transfer` | ✓ | ✓ | |
| `stock.costs` (see and set cost price) | ✓ | | |
| `stock.delete` | ✓ | | |
| `contracts.create` | ✓ | ✓ | ✓ |
| `contracts.cancel` | ✓ | ✓ | |
| `payments.record` | ✓ | ✓ | ✓ |
| `payments.void` | ✓ | ✓ | |
| `locks.manage` | ✓ | ✓ | |
| `devices.enroll` | ✓ | ✓ | ✓ |

The source is `shared/src/permissions.ts`.

## Portal endpoints

Unless marked **public**, every endpoint needs an access token. "ok" means `{ "data": { "ok": true } }`.

### Auth

All public. The five marked † are limited to 20 attempts per 15 minutes per IP address.

| Method | Path | Body | Returns |
| --- | --- | --- | --- |
| POST | `/auth/signup` † | `orgName`, `branchName`, `fullName`, `email`, `password` | 201 `Session` |
| POST | `/auth/login` † | `email`, `password` | `Session` |
| POST | `/auth/refresh` | none (uses the cookie) | `Session` |
| POST | `/auth/logout` | none (uses the cookie) | ok |
| POST | `/auth/verify-email` † | `token` | ok |
| POST | `/auth/forgot-password` † | `email` | ok |
| POST | `/auth/reset-password` † | `token`, `password` | ok |

- Names are 2 to 80 characters; passwords 8 to 128.
- **signup** creates the organization, its first branch and the owner, signs the owner in and emails a
  confirmation link. 409 if the email already has an account.
- **login** answers 401 for a wrong email or password (the same message for both) and 403 for a deactivated
  account or a suspended organization.
- **forgot-password** always answers ok, whether or not the email has an account.
- **reset-password** sets the password and signs the user out everywhere. An invalid or expired `token`
  answers 400.

### Me

| Method | Path | Body | Returns |
| --- | --- | --- | --- |
| GET | `/me` | | `Me` |
| POST | `/me/password` | `currentPassword`, `newPassword` | `Session` |
| POST | `/me/email-verification` | none | ok |

Changing the password signs out every other device and returns a fresh session for this one. The new password
must differ from the current one.

### Org

| Method | Path | Permission | Body | Returns |
| --- | --- | --- | --- | --- |
| GET | `/org` | | | Org |
| PATCH | `/org` | `org.manage` | `name` | Org |
| PATCH | `/org/policy` | `org.manage` | `lockPolicy?`, `lateFee?` | Org |

The org document also carries the policy. Only the fields sent to `/org/policy` change:

| Field | Type | Default |
| --- | --- | --- |
| `lockPolicy.mode` | `off` \| `approval` \| `automatic` | `approval` |
| `lockPolicy.graceDays` | integer 0 to 60 | 3 |
| `lockPolicy.lockHour` | integer 0 to 23 (Karachi time) | 10 |
| `lockPolicy.minOverdue` | paisa | 50000 |
| `lockPolicy.unlockOnPayment` | boolean | true |
| `lateFee.enabled` | boolean | false |
| `lateFee.amount` | paisa | 0 |

### Branches

| Method | Path | Permission | Body | Returns |
| --- | --- | --- | --- | --- |
| GET | `/branches` | | | Branch[] |
| POST | `/branches` | `org.manage` | `name`, `phone?`, `address?` | 201 Branch |
| PATCH | `/branches/:id` | `org.manage` | `name?`, `phone?`, `address?`, `active?` | Branch |

The list is sorted by name. Owners see every branch, inactive ones included; others see their assigned
branches. Deactivating the last active branch answers 409.

### Users

The team. Every endpoint needs `team.manage` (owner only).

| Method | Path | Body | Returns |
| --- | --- | --- | --- |
| GET | `/users` | | User[] |
| POST | `/users` | `fullName`, `email`, `role`, `branchIds` | 201 `{ user, temporaryPassword }` |
| PATCH | `/users/:id` | `fullName?`, `role?`, `branchIds?` | User |
| PATCH | `/users/:id/active` | `active` | User |
| POST | `/users/:id/temporary-password` | none | `{ user, temporaryPassword }` |

- `role` is `manager` or `staff`; `branchIds` is 1 to 100 active branches of the organization.
- `temporaryPassword` is returned once and only its hash is stored. The member must change it at first sign-in.
- Deactivating, or issuing a temporary password, signs the member out on every device.
- The owner can't be changed through these endpoints (400). 409 if the email already has an account.

### Plans

Ready-made installment terms. Changes apply to new sales only.

| Method | Path | Permission | Body | Returns |
| --- | --- | --- | --- | --- |
| GET | `/plans` | | | InstallmentPlan[] |
| POST | `/plans` | `org.manage` | see below | 201 InstallmentPlan |
| PATCH | `/plans/:id` | `org.manage` | any of the same fields | InstallmentPlan |

| Field | Type |
| --- | --- |
| `name` | 2 to 80 characters |
| `frequency` | `weekly` \| `biweekly` \| `monthly` |
| `count` | integer 1 to 60 installments |
| `markupPercent` | 0 to 200, at most 2 decimals |
| `minDownPaymentPercent` | 0 to 100, default 0 |
| `active` | boolean, default true |

### Customers

Customers belong to the organization: everyone can find any customer, whichever branch they came from.

| Method | Path | Permission | Body / query | Returns |
| --- | --- | --- | --- | --- |
| GET | `/customers` | | `?q&limit&cursor` | Page of Customer |
| GET | `/customers/:id` | | | Customer |
| POST | `/customers` | `customers.write` | see below | 201 Customer |
| PATCH | `/customers/:id` | `customers.write` | any of the same fields | Customer |
| DELETE | `/customers/:id` | `customers.delete` | | ok |

| Field | Type |
| --- | --- |
| `homeBranchId` | id of an active branch the user works at |
| `fullName` | 2 to 80 characters |
| `fatherName` | up to 80, default `""` |
| `cnic` | 13 digits, unique in the organization |
| `phone` | mobile number |
| `altPhone` | mobile number or `""`, default `""` |
| `address` | 5 to 200 characters |
| `notes` | up to 500, default `""` |
| `guarantors` | up to 2 of `{ fullName, cnic, phone, relation? }`, default `[]` |

- `q` (up to 60 characters): digits match the start of the CNIC or mobile number; anything else matches inside
  the name.
- Responses add `homeBranch: { _id, name }`.
- A CNIC already registered answers 409 with `details.customerId`, the id of the existing customer.
- A customer with contracts can't be deleted (409).

### Devices

Phones in stock or sold. Stock belongs to a branch: users see and change only the stock of their branches.

| Method | Path | Permission | Body / query | Returns |
| --- | --- | --- | --- | --- |
| GET | `/devices` | | `?branchId&status&q&limit&cursor` | Page of Device |
| POST | `/devices` | `stock.write` | see below | 201 Device |
| PATCH | `/devices/:id` | `stock.write` | any field below except `branchId` | Device |
| POST | `/devices/:id/transfer` | `stock.transfer` | `toBranchId` | Device |
| POST | `/devices/:id/enrollment` | `devices.enroll` | none | 201 EnrollmentTicket |
| DELETE | `/devices/:id/enrollment` | `devices.enroll` | | ok |
| DELETE | `/devices/:id` | `stock.delete` | | ok |

| Field | Type |
| --- | --- |
| `branchId` | id of an active branch the user works at |
| `brand` | 1 to 40 characters |
| `model` | 1 to 60 characters |
| `imeis` | 1 or 2 different IMEIs, unique in the organization |
| `storage` | up to 20, default `""` |
| `color` | up to 30, default `""` |
| `ptaApproved` | boolean, default true |
| `costPrice` | paisa or `null`, default `null` |

- `status` is `in_stock`, `sold`, `released` or `returned`. `q` (up to 40 characters): digits match the start of
  an IMEI; anything else matches inside the brand or model.
- Responses add `branch: { _id, name }`, `stockStatus`, `lockState` (`unlocked` \| `locked`) and `enrollment`
  (`{ enrolledAt, lastCheckInAt, appVersion }` or `null`).
- `costPrice` is returned only to roles with `stock.costs`, and ignored when sent by anyone else.
- Edit, transfer and delete work only while the phone is `in_stock` (409 otherwise). There is no
  `GET /devices/:id`.
- **enrollment** issues a one-time provisioning QR for a `sold` phone, valid for 60 minutes; issuing again
  replaces the previous one. Encode `JSON.stringify(payload)` as the QR:

  ```json
  { "data": { "deviceId": "...", "token": "...", "expiresAt": "2026-10-12T11:00:00.000Z", "payload": { "android.app.extra.PROVISIONING_...": "..." } } }
  ```

  It answers 409 if the phone isn't sold, or if the server has no `DEVICE_APP_APK_URL` and
  `DEVICE_APP_SIGNATURE_CHECKSUM` configured.
- Deleting the enrollment revokes both a waiting QR and an active enrolment, so the phone can no longer check in.

### Contracts

A sale on installments. Anyone in the organization can read any contract; selling, cancelling and locking
happen only at branches the user works at.

| Method | Path | Permission | Body / query | Returns |
| --- | --- | --- | --- | --- |
| GET | `/contracts` | | `?branchId&customerId&status&limit&cursor` | Page of Contract |
| GET | `/contracts/:id` | | | Contract with `installments` |
| POST | `/contracts` | `contracts.create` | see below | 201 Contract with `installments` |
| POST | `/contracts/:id/cancel` | `contracts.cancel` | `reason` | Contract with `installments` |
| GET | `/contracts/:id/payments` | | | Payment[] |
| POST | `/contracts/:id/payments` | `payments.record` | see [payments](#payments) | 201 Payment |
| POST | `/contracts/:id/lock` | `locks.manage` | `reason` | 201 DeviceCommand |
| POST | `/contracts/:id/unlock` | `locks.manage` | `reason` | ok |
| POST | `/contracts/:id/pause` | `locks.manage` | `until`, `reason` | ok |

Creating a contract:

| Field | Type |
| --- | --- |
| `branchId` | id of an active branch the user works at |
| `customerId` | id |
| `deviceId` | id of a phone in stock at that branch |
| `planId` | id of an active plan, or `null` (default) |
| `cashPrice` | paisa, at least 1 |
| `downPayment` | paisa, less than `cashPrice` |
| `downPaymentMethod` | `cash` \| `jazzcash` \| `easypaisa` \| `bank`, default `cash` |
| `markupPercent` | 0 to 200 |
| `count` | integer 1 to 60 |
| `frequency` | `weekly` \| `biweekly` \| `monthly` |
| `firstDueDate` | calendar date, today or later |

- The server recalculates `financedAmount`, `markupAmount`, `totalPayable` and the schedule from these terms.
  A down payment above zero is recorded as a payment with its own receipt.
- With a `planId`, the down payment must meet the plan's `minDownPaymentPercent` (400).
- The phone becomes `sold`; if it was sold in the meantime the request answers 409.
- `status` is `active`, `completed`, `defaulted` or `cancelled`. With `customerId` the list covers every
  branch; without it, only the user's branches.
- Each installment is `{ _id, contractId, number, dueDate, amount, lateFee, paidAmount, status }`, with status
  `pending`, `partial`, `paid` or `overdue`.
- **cancel** works only on an active contract with no installment payments (409 otherwise). The phone goes back
  into stock and the down payment is voided. `reason` is 5 to 300 characters, as are all reasons below.
- **lock** queues a lock now, whatever the policy says. 409 if the phone is already locked or a command is
  already waiting.
- **unlock** withdraws a lock still waiting, or queues an unlock for a locked phone. 409 if the phone isn't
  locked.
- **pause** is a promise to pay: no automatic lock through `until` (today or later), and a lock not yet sent
  is withdrawn.
- Lock, unlock and pause need an active contract (409 otherwise).

### Payments

| Method | Path | Permission | Body / query | Returns |
| --- | --- | --- | --- | --- |
| POST | `/contracts/:id/payments` | `payments.record` | `branchId`, `amount`, `method`, `reference?` | 201 Payment |
| GET | `/contracts/:id/payments` | | | Payment[] |
| GET | `/payments` | | `?branchId&date&limit&cursor` | Page of Payment |
| GET | `/payments/collections` | | `?date` (required) `&branchId` | Collections |
| GET | `/payments/:id` | | | Payment |
| POST | `/payments/:id/void` | `payments.void` | `reason` | Payment |

- **Recording** needs an `Idempotency-Key` header: any unique string of up to 100 characters, a new one for
  each new payment. Repeating the request with the same key returns the original payment with status 200
  instead of recording it twice. Reusing a key for a different contract or amount answers 409. A missing key
  answers 400.
- `branchId` is where the money was received. `amount` is paisa, at least 1. `method` is `cash`, `jazzcash`,
  `easypaisa` or `bank`. `reference` (up to 60 characters) is the transaction id for non-cash methods.
- The amount is allocated to the oldest unpaid installments; `allocations` lists
  `{ installmentId, number, amount }`. A payment that clears the balance completes the contract and releases
  the phone. Only active contracts take payments (409).
- A Payment also carries `kind` (`down_payment` \| `installment`), `receiptNumber`, `receivedByName`,
  `receivedOn`, `voidedAt`, `voidReason` and `branch: { _id, name }`.
- The contract ledger is newest first and includes voided payments.
- **collections** is one day's takings, voids left out:

  ```json
  { "data": { "date": "2026-10-12", "total": 4500000, "count": 9, "byMethod": [{ "method": "cash", "total": 3000000, "count": 6 }], "byStaff": [{ "userId": "...", "name": "...", "total": 4500000, "count": 9 }] } }
  ```

- **void** reverses the allocations and keeps the payment, marked void; a completed contract becomes active
  again. A down payment can't be voided (cancel the contract instead), nor can a payment already void (409).

### Commands and locks

A command is an instruction for a phone: `lock`, `unlock` or `release`. Its status moves through
`proposed` → `pending` → `delivered` → `acknowledged`, or ends as `failed` or `cancelled`. `source` is `auto`,
`manual` or `payment`.

| Method | Path | Permission | Body / query | Returns |
| --- | --- | --- | --- | --- |
| GET | `/commands` | | `?status&branchId&contractId&limit&cursor` | Page of DeviceCommand |
| POST | `/commands/:id/approve` | `locks.manage` | none | DeviceCommand |
| POST | `/commands/:id/cancel` | `locks.manage` | `reason` | DeviceCommand |
| GET | `/locks/overdue` | | `?branchId` | OverdueAccount[] |

- **approve** sends out a `proposed` lock (409 for any other status).
- **cancel** rejects a proposal or withdraws a command not yet delivered (409 once it has gone out).
- **overdue** lists contracts with installments past due, most days late first:
  `{ contractId, branchId, customerId, customerName, deviceId, deviceLabel, lockState, daysOverdue,
  overdueAmount, oldestDueDate, autoLockPausedUntil, openCommand }`.

## Device API

What the Android app calls. It never uses a user session.

| Method | Path | Auth | Body | Returns |
| --- | --- | --- | --- | --- |
| POST | `/device/enroll` | the one-time token in the body | `token`, `pushToken?`, `appVersion?`, `androidVersion?`, `platform?` | 201 DeviceCredential |
| POST | `/device/checkin` | device credential | `pushToken?`, `appVersion?`, `lockState?` | DeviceCheckin |
| POST | `/device/commands/:id/ack` | device credential | `result`, `detail?` | DeviceCommand |

**Enrol.** The app reads the token from the provisioning QR (the `enrollToken` admin extra) and redeems it once:

```json
{ "data": { "deviceId": "...", "token": "<deviceId>.<secret>", "checkInSeconds": 900 } }
```

The app stores `token` and sends it as `Authorization: Bearer <token>` from then on. Only its hash is kept on
the server. An unknown, used or expired enrolment token answers 401. Enrolling again replaces the earlier
credential.

**Check in.** Every `checkInSeconds`, and when woken by a push. Optional text fields are up to 80 characters.
The server's own lock state is authoritative; the `lockState` sent by the phone is accepted but not used.

```json
{
  "data": {
    "lockState": "locked",
    "lockScreen": { "locked": true, "customerName": "...", "deviceLabel": "...", "amountDue": 500000, "nextDueDate": "2026-10-20", "branchName": "...", "branchPhone": "...", "message": "..." },
    "commands": [{ "_id": "...", "type": "lock" }],
    "checkInSeconds": 900
  }
}
```

`commands` are the ones still to carry out, oldest first. A check-in marks pending commands as delivered; they
keep being returned until acknowledged.

**Acknowledge.** `result` is `applied` or `failed`, with an optional `detail`. `applied` sets the phone's lock
state (`lock` → locked, `unlock` and `release` → unlocked; `release` also marks the phone released). 409 if the
command is no longer waiting; 404 if it belongs to another phone.

## Internal jobs

`POST /api/v1/internal/jobs/:name` with `Authorization: Bearer <INTERNAL_JOB_SECRET>`, for an external
scheduler or a manual run. Not for the portal.

| `name` | Does |
| --- | --- |
| `overdue` | Marks installments overdue and applies late fees |
| `auto-lock` | Proposes or queues locks according to each organization's policy, at any hour |

Returns `{ "data": { "job": "overdue", "ran": true } }`. `ran` is `false` when another instance is already
running that job. A wrong secret answers 401, an unknown name 404.

## Health

`GET /health` (public, outside `/api/v1`): `{ "data": { "status": "ok", "db": "up" } }` with 200, or
`{ "status": "degraded", "db": "down" }` with 503 when the database is unreachable.
