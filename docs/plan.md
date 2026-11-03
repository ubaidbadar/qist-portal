# Qist: product and delivery plan

Updated 2 October 2026 after your answers. This replaces the earlier 6-step frontend plan and the 8-phase backend plan.
"Qist" is a placeholder name (`APP_NAME` in `shared/src/constants.ts`).

## 1. Scope

Qist is a multi-tenant web portal for phone retailers who sell on installments. Each retailer signs up and runs
one **organization** with several **branches**. Staff sell phones on installment plans and record payments.
When an installment stays unpaid past the retailer's rule, the phone is due to be locked. When the customer pays,
it is unlocked.

| Phase | What | Status |
|---|---|---|
| 1 | Retailer web portal and its backend (this plan, milestones M0–M7) | M0 foundation built |
| 2 | Android: your DPC on customers' phones, and the device API it talks to | after Phase 1 |
| 3 | Backlog (§8) | later |

| User | Uses | Can |
|---|---|---|
| Retailer owner | portal | sign up, then do everything in their organization, across all branches |
| Branch manager | portal | daily work plus voids, cancellations and lock decisions, in their assigned branches |
| Staff | portal | customers, stock, contracts and payments, in their assigned branches |
| Customer | Phase 2: the DPC on their phone | see the lock screen: what they owe and whom to call |

What changed from the earlier briefs:
- A retailer is an organization with branches (it was a single shop), and retailers sign up themselves.
- Locking is done by your own DPC in Phase 2. Phase 1 decides *when* to lock and queues the commands; the device
  API arrives with the DPC.
- Web and backend are built together, feature by feature, against the real API. There is no mock layer.
- A device's stock status and lock state are separate fields, and a payment records the branch that received it.

## 2. Locking: what Phase 1 does and what waits for the DPC

**Phase 1 (portal)** builds:
- the lock rules (§5) and the daily overdue and lock jobs;
- lock proposals and approvals;
- manual lock and unlock requests;
- pausing locks for a promise to pay;
- a command queue. Until the DPC exists, commands wait in the queue and the Lock Center shows them as "waiting for device app".

**Phase 2 (Android)** builds your DPC (a small Device Owner app that only locks or unlocks) and the device API:
- enrolment during phone setup (provisioning QR), with a per-device token stored only as a hash;
- check-in, which returns pending commands and the lock-screen policy (message, branch phone, next due date);
- acknowledgements, and push messages to wake the phone;
- offline rules: the phone locks itself if it can't check in past its paid-until date;
- unlock codes for phones that have no internet.

**Distribution is outside Google Play**, so Play's ban on device-financing DPCs doesn't apply. The app is set as
Device Owner via a QR scanned on a factory-fresh phone in the shop (the only point Android allows it); you host the
signed APK. Test enrolment on the phones your retailers actually sell, since the six-tap QR flow varies a little by
Android version. Phase 1 doesn't depend on this.
Sources: [Android: provision a fully managed device](https://developer.android.com/work/dpc/build-dpc) ·
[Android: DevicePolicyManager](https://developer.android.com/reference/android/app/admin/DevicePolicyManager)

## 3. Tenancy and data

An organization has branches. Every document is identified by its own `_id`; there are no extra identifiers.
Every record carries `orgId` (the organization's `_id`), and branch-owned records also carry `branchId`.
- **Customers belong to the organization**, shared by all its branches, each with a home branch. A customer who
  defaults at one branch is visible at the others. CNIC is unique within an organization.
- **Devices belong to the branch that holds the stock** and can be transferred between branches.
- **Contracts belong to the selling branch. Payments record the branch that received them.** A customer can pay
  at any branch, so cash reports follow the money.
- Owners see all branches; managers and staff see only their assigned branches. The server enforces this in every
  query, and the UI only hides what a user cannot do.

| Collection | Scope | Main fields |
|---|---|---|
| `orgs` | – | name, status (active, suspended), settings: lock policy (§5), late fee, message templates |
| `branches` | org | name, phone, address, lock-screen contact, active |
| `users` | org | email (verified), password hash, name, role, branchIds, active, mustChangePassword, tokenVersion |
| `refreshTokens`, `emailTokens` | user | the token is `<_id>.<secret>`: found by `_id`, checked against the stored secret hash; purpose (verify, reset), expiry (deleted automatically), revoked or used |
| `customers` | org | name, father/husband name, CNIC (13 digits, unique per retailer), mobile, second mobile, address, up to 2 guarantors, notes, home branch; CNIC photos (R2) arrive with the private bucket |
| `devices` | org + branch | brand, model, 1–2 IMEIs (Luhn check, unique per retailer), storage, colour, cost price (owners only), PTA approved, stock status; lock state arrives in M5, enrolment with Phase 2 |
| `installmentPlans` | org | name, frequency, number of installments, markup %, minimum down payment % |
| `contracts` | org + branch | number, customer, device, name and IMEI snapshots, price, down payment, markup, total, frequency, count, first due date, status, paid total, next due date, overdue {amount, since}, auto-lock paused until, salesperson |
| `installments` | org + branch | contract, number, due date, amount, late fee, paid amount, status |
| `payments` | org + receiving branch | contract, amount, method, reference, receipt number, allocations[], received by and at, void {by, at, reason} |
| `deviceCommands` | org + branch | device, contract, type (lock, unlock, release), status, source (auto, manual, payment), reason, requested by, delivered and acknowledged times |
| `auditLogs` | org (+ branch) | actor, action, entity, summary, metadata, time; append-only |
| `counters`, `idempotencyKeys`, `jobLocks`, `jobRuns` | infra | numbering, retried requests (24 h TTL), job leases, job history |

Status flows:
- **Contract:** active → completed (paid off), cancelled or defaulted.
- **Installment:** pending → partial → paid. Once unpaid past its due date it becomes overdue, and it can still be paid.
- **Device stock:** in stock → sold → released (paid off). A sold device can also be returned, which puts it back in stock.
- **Device lock:** unlocked ⇄ locked, changed by acknowledged commands. Release ends control once the phone is paid off.
- **Command:** (proposed →) pending → delivered → acknowledged, or failed. A pending command can be cancelled, for
  example when the customer pays first. In Phase 1, commands stay pending.

## 4. Roles and permissions

| Capability | Owner | Manager | Staff |
|---|---|---|---|
| Branches, installment plans, settings, lock policy | ✓ | | |
| Team: users, roles, branch access | ✓ | | |
| Branches visible | all | assigned | assigned |
| Customers: add, edit | ✓ | ✓ | ✓ |
| Customers: delete (only without contracts) | ✓ | | |
| Stock: add, edit | ✓ | ✓ | ✓ |
| Stock: transfer between branches | ✓ | ✓ | |
| Stock: delete (only phones never sold) | ✓ | | |
| Cost prices and margins | ✓ | | |
| Contracts: create | ✓ | ✓ | ✓ |
| Contracts: cancel, mark defaulted | ✓ | ✓ | |
| Payments: record | ✓ | ✓ | ✓ |
| Payments: void | ✓ | ✓ | |
| Lock, unlock, approve lock proposals, pause auto-lock | ✓ | ✓ | |
| Enrol a sold phone (issue/revoke its provisioning QR) | ✓ | ✓ | ✓ |
| Dashboard | all | assigned | assigned |
| Reports, audit log | all | assigned | |

The permission map lives in `shared/`. The server uses it to enforce access and the portal uses it to hide actions.

## 5. Lock rules

Organization settings, set by the owner:

| Setting | Proposed default | Meaning |
|---|---|---|
| Lock mode | Approval | Off · Approval (the system proposes, a manager approves) · Automatic |
| Grace days | 3 | days after a due date before a phone can be locked; 0 means the day after the due date |
| Lock time | 10:00 | locks go out when shops open, so the customer can come and pay |
| Minimum overdue | Rs 500 | small remainders never lock a phone |
| Unlock on payment | On | unlock as soon as nothing is overdue past the grace days |

A contract is **eligible to lock** when all of these hold:
- the contract is active;
- the oldest unpaid installment is more than the grace days past due, using Asia/Karachi dates;
- the overdue amount is at least the minimum;
- auto-lock is not paused on the contract (a promise to pay, with a date and reason);
- the phone is not already locked, and no lock is pending for it.

Delivering the command to the phone needs the DPC (Phase 2).

Triggers:
- **00:05 daily:** mark overdue installments, add late fees, refresh each contract's overdue summary.
- **At the lock time, daily:** eligible contracts become proposals (approval mode) or lock commands (automatic mode).
- **After a payment, void, pause or settings change:** re-check that contract straight away. This can cancel a
  pending lock, queue an unlock, or queue a release once the phone is paid off.
- **Manually:** managers can request a lock or unlock at any time, with a reason. Every action is audited.

Jobs run inside the API process with `Bun.cron` (timezone `Asia/Karachi`; Bun never overlaps two runs of a job).
Each run takes a lease in `jobLocks` so only one instance runs it, and is recorded in `jobRuns`. A job can also be
started by calling `POST /internal/jobs/:name` with `INTERNAL_JOB_SECRET`. Every job is safe to run twice
([Bun cron docs](https://bun.com/docs/runtime/cron)). The pure rules (overdue, eligibility, payment allocation,
schedule generation) live in `shared/` with unit tests.

## 6. Architecture

The existing stack stays:
- React 19, Vite and Tailwind at the repo root;
- Hono on Bun in `server/`;
- shared Zod schemas and logic in `shared/`;
- MongoDB Atlas through Mongoose, and Cloudflare R2.

**Backend**
- **Structure (MVC):**
  - `routes/` map each URL to who may call it and to a controller action;
  - `controllers/` handle the request: validated input in, models used directly, documents out;
  - `models/` are the Mongoose schemas with their rules. The model also decides what a document looks like as
    JSON: the API sends documents as they are, `_id` included, and secrets are hidden by the model (`select: false`);
  - `lib/` holds helpers the controllers share (sessions, audit, emails, tokens).

  There are no repository, service or view layers.
- **Database (Mongoose 9):**
  - every document is found by its own `_id`, which MongoDB always indexes. Other indexes exist only where a
    query needs one: unique email on users, `orgId` on organization data ("this retailer's branches"), `userId`
    on refresh tokens (sign out everywhere), and expiry indexes that delete old tokens automatically;
  - schemas use automatic type inference, `timestamps`, and no `__v` version field;
  - a tenant guard plugin makes any query on organization data without `orgId` in its filter throw; the few
    sign-in and token lookups that run before the organization is known are marked with `acrossTenants()`;
  - the audit log model refuses updates and deletes;
  - strict mode throws on fields the schema doesn't define, in documents and in filters;
  - collections and indexes are created at start-up and by `db:indexes`; nothing is ever dropped automatically;
  - `withTransaction()` runs `connection.transaction()`, and every query inside it joins the transaction on its own;
  - the error handler turns invalid ids, schema violations and duplicates into 400 and 409 responses, naming the
    field but never echoing the value.
- **API conventions:** everything is under `/api/v1` and returns `{data}` or `{error}`. Lists use cursor pagination
  and accept `?branchId=`, which is checked against the user's branches. Payments and contract creation require an
  `Idempotency-Key` header.
- **Auth:**
  - self-signup creates the organization, its first branch and the owner, then verifies the owner's email;
  - a 15-minute access token kept in memory;
  - a 30-day refresh token in an httpOnly cookie, rotated on every use; replaying an old one signs the user out everywhere;
  - argon2id password hashes;
  - password reset by email (SMTP via Brevo, or a console driver in development);
  - users created by an owner get a temporary password that they must change at first login.

  Host the portal and API on sibling subdomains (`app.` and `api.`) so the cookie stays same-site.
- **Money and dates:** money is integer paisa; due dates are `YYYY-MM-DD` in Asia/Karachi.
- **Audit and logging:** every change writes an audit entry in the same transaction. Logs never contain CNIC or phone numbers.
- **Files:** a private R2 bucket. Uploads use presigned links (JPG, PNG or PDF, up to 5 MB) and viewing uses short-lived links.

**Portal**
- **Sidebar:** Dashboard · Customers · Contracts · Payments · Inventory · Lock Center · Reminders · Reports ·
  Settings · Audit log. A branch switcher sits at the top; owners also get "All branches".
- **Settings tabs:** Organization · Branches · Team · Installment plans · Lock policy · Late fees · Messages.
- **Components:** built from the existing `ui/` kit and the CLAUDE.md conventions. One shared `DataTable` handles
  sorting, filters and cursor pages, and shows cards on mobile. Receipts print on A4 or 80 mm thermal paper, and
  the installment agreement has its own print layout.
- **Data layer:** TanStack Query (decision 4).

## 7. Phase 1 milestones

Each milestone ships backend, shared logic, portal screens and tests together. Each ends with a demo and waits for your go-ahead.

| # | Milestone | Includes | Done when |
|---|---|---|---|
| M0 | Foundation | workspace, env, Atlas connection (Mongoose), index creation, errors, middleware, health, Docker, test database, shared permission map, CI workflow, git (models and their indexes arrive with each milestone) | `bun run check` passes, including the Atlas integration tests |
| M1 | Accounts, branches, team | self-signup (organization, first branch and owner) with email verification; login, refresh rotation, logout, password reset and change; branches; users with roles and branch access; audit writer. Portal: TanStack Query data layer, session kept in memory with silent refresh, signup, login and reset pages, route guards, branch switcher, Settings → Organization, Branches, Team | organization-isolation, branch-isolation and permission-matrix tests pass |
| M2 | Customers and stock | customers with guarantors; CNIC photos (R2 upload with a progress bar, once the private bucket exists); search by name, phone or CNIC; devices with IMEI checks, PTA status and transfers between branches; shared `DataTable` | staff can add customers and stock, and only at their own branches |
| M3 | Plans and contracts | installment plans; schedule generator (weekly, biweekly or monthly, with month-end and leap-day rules; the rounding remainder goes on the last installment); contract creation in one transaction (device marked sold; the down-payment receipt arrives with M4); 3-step wizard with a live schedule; contract page; printable agreement with a lock-consent clause; cancel | schedule tests pass, and installments always sum to the total |
| M4 | Payments and collections | record a payment (oldest installment first; partial and advance payments) with idempotency; receipt numbers per branch; printable receipt; void with reversal; ledger; daily collections by branch, staff member and method | retrying a payment never charges twice, and a void restores balances |
| M5 | Lock engine and Lock Center | overdue and lock jobs (the overdue job also adds late fees), eligibility rules, proposals and approval, command queue (commands cancelled by payments), manual lock and unlock with a reason, pause (promise to pay); Lock Center: proposals, queue, history | tests show the full flow: overdue → proposal → approval → lock queued; a payment then cancels the pending lock or queues an unlock, and paying off queues a release |
| M6 | Dashboard, reminders, reports, settings, audit | KPI cards and charts per branch or for all branches, overdue age buckets, branch comparison; reminder tabs with WhatsApp templates; reports with CSV export; lock policy and other settings; audit log with filters | an owner can run their day from the dashboard |
| M7 | Go-live | security review; backups with a restore drill; monitoring and alerts when a job fails; staging; deploy; end-to-end tests; pilot with one retailer | the pilot retailer is live |

## 8. Phase 2 and backlog

**Phase 2: Android DPC (native Kotlin, Device Owner, QR-provisioned in the shop). Not on Google Play.**

A small app with one job: lock or unlock the phone on the portal's command. No in-app schedule or receipts.

Milestones (progress in [status.md](status.md); decisions in §11):
- **P2-1 Device API.** Enrolment (one-time QR token → per-device credentials, stored only as a hash), check-in
  (returns pending commands + lock-screen policy), acknowledgements, and a push channel (FCM) to wake the phone.
  Extends the §6 command queue; commands move pending → delivered → acknowledged for real.
- **P2-2 Enrolment + QR.** Portal generates the provisioning QR for a device (package, checksum, Wi-Fi, enrolment
  token). The app receives Device Owner on first boot, registers, and binds to that contract.
- **P2-3 Lock + lock screen.** Kiosk/lock-task lock on command; a full-screen lock screen showing the amount due,
  next due date and the branch phone; unlock on command and on "release" once the phone is paid off.
- **P2-4 Offline + resilience.** The phone locks itself if it can't check in past its paid-until date; short-lived
  offline unlock codes for customers with no internet; survives reboot and factory reset.

If you'd rather start even smaller, P2-1 and P2-3 alone give a working lock/unlock over the internet; P2-2's QR and
P2-4's offline rules can follow. Each milestone is its own branch with a review gate, same as Phase 1.

**Backlog:**
- a platform admin console (suspend retailers, see usage);
- subscription billing for retailers;
- JazzCash and Easypaisa payments with automatic reconciliation;
- automated SMS and WhatsApp reminders;
- an Urdu interface;
- returns and repossession;
- a recovery-officer role;
- stock import from CSV;
- accounting export;
- defaulter checks across retailers (legal review first).

## 9. Quality and operations

- **Tests:**
  - unit tests for the shared logic, with a fixed clock for dates;
  - integration tests on a throwaway Atlas database per run, covering tenant and branch isolation, the
    permission matrix, money totals, idempotency, concurrent payments, and jobs run twice;
  - end-to-end tests (Playwright) for the main path.
- **Environments:** development, staging and production, each with its own Atlas project, R2 bucket and secrets.
- **Hosting:**
  - the portal on Cloudflare Pages;
  - the API container in a region close to Pakistan, with Atlas in the nearest region;
  - production on a dedicated Atlas tier (M10 or above) for continuous backup and point-in-time restore.
- **Monitoring:** uptime checks on `/health`, error alerts, and an alert when a lock or overdue job fails or doesn't run.

## 10. Risks

| Risk | Mitigation |
|---|---|
| Google blocks the DPC during setup on your retailers' phones | test enrolment on those phones before Phase 2 (§2); the portal works without it |
| Legal exposure from locking customers' phones | written consent clause in the agreement, emergency calls stay available on locked phones (build this into the DPC), review by a Pakistani lawyer before go-live |
| A bug locks a customer who has paid | approval mode by default, unlock on payment, every lock audited with a reason |
| Fake or abusive sign-ups | email verification, rate limits on signup and login, organizations can be suspended |
| Leak of CNIC or phone data | private R2 with short-lived links, no personal data in logs, least-privilege roles, Atlas encryption at rest |
| Date and time-zone mistakes | one shared date module in Asia/Karachi, tests with a fixed clock |
| Running several API instances | job leases are already planned; move the rate-limit counters to a shared store before scaling out |

## 11. Decisions

**Settled on 2 October 2026:**
- Retailers sign up themselves, with no approval step.
- Phase 1 is the retailer portal only.
- Android locking uses your own DPC, built in Phase 2. Knox Guard (Samsung only) and Device Lock Controller integrators are not used.
- The database is accessed through Mongoose, not the native MongoDB driver.
- The server is MVC (routes, controllers, models) with no repository, service or view layers.
- Documents are identified by their own `_id` everywhere, including in the API; no extra identifiers such as
  branch codes. Indexes exist only where a query needs one.

**Added on 2 October 2026 for Phase 2** (each can still be changed):
- **DPC is a Device Owner app.** It is set as Device Owner during provisioning, so Android itself stops the
  customer uninstalling it or removing it with a factory reset (factory reset protection re-enrols). This role can
  only be set on a phone with no accounts yet, so it is set in the shop, not pushed to a phone later.
- **Provisioning: QR at the shop.** Staff factory-reset (or start a new phone), tap the setup wizard six times, and
  scan a QR the portal generates. Brand-agnostic; no laptop at the counter. adb was the fallback, not chosen.
- **The app is native Kotlin.** `DevicePolicyManager` and kiosk/lock-task are Android-native; the lock logic is the
  whole point, so there is no cross-platform layer under it.
- **Distribution is outside Google Play.** A lock-on-default-payment DPC is not allowed on Play unless the retailer
  is on Google's lending allowlist, and Device Owner can't be self-provisioned from a Play install anyway. You host
  the signed APK and the portal serves the enrolment QR.
- **Keep it small.** The app only locks and unlocks; no in-app schedule or receipts. Those stay in the portal.

**Adopted on 2 October 2026 with your go-ahead to the plan** (each can still be changed):
1. **Customers:** shared across a retailer's branches.
2. **Lock defaults:** approval mode, 3 grace days, lock at 10:00, Rs 500 minimum.
3. **Roles:** owner, manager and staff.
4. **Data layer:** TanStack Query replaces `useGet`/`usePost` in this project. Caching, refresh after payments,
   polling and cursor lists are built in.
5. **Version control:** git, one branch per milestone, merged after your review. The GitHub repository is pending
   ([status.md](status.md), action A6).

**Phase 2 device app, adopted on 2 October 2026** (each can still be changed):
6. **The app** is native Kotlin in `android/` (its own Gradle project, outside the bun workspaces), package
   `pk.qist.device`, minimum Android 7.0. The package name is part of every provisioned phone: change it, if at all,
   before the first real phone is set up (see status A4).
7. **Setup QR** is the standard Android provisioning payload. It pins the app by its **signing-certificate checksum**,
   not the APK file's checksum, so publishing a new app version does not change the QR settings. It keeps all of
   the phone's own apps enabled (it is the customer's phone, not a work phone) and sets the Asia/Karachi time zone.
   The server needs `DEVICE_APP_APK_URL` (https) and `DEVICE_APP_SIGNATURE_CHECKSUM`; without them it refuses to
   issue a QR.
8. **Protections start at enrolment, not at the first lock.** Factory reset, safe boot, new users, USB debugging
   (release builds) and uninstalling the app are blocked as soon as the server accepts the phone, and stay blocked
   through locks and unlocks until release. Otherwise a customer falling behind could reset the phone before the
   first lock.
9. **Lock** is Android kiosk (lock-task) mode with a full-screen lock screen that is also made the Home screen while
   locked, so a reboot or a Home press lands back on it. Only the dialer may open, for "Call branch" and emergency
   calls; the power menu stays for its Emergency button. **Unlock** removes the lock and keeps the protections.
   **Release** removes everything, confirms to the server, and only then gives up Device Owner.
10. **A revoked phone (401) stands down quietly:** it unlocks, stops checking in and shows "not linked to a shop",
    but keeps Device Owner and the anti-reset protections. Only an authenticated release command hands a phone back
    for good, so a server mistake or a restored backup can never free financed phones by itself. A shop that wants
    a revoked phone fully freed factory-resets it (the clerk can, from recovery mode).
11. **Commands are re-delivered until acknowledged,** so the phone keeps no queue: if a confirmation does not get
    through, the next check-in brings the same command again and carrying it out twice is harmless.
12. **No launcher icon.** The customer has nothing to open; the app runs in the background and shows only the lock
    screen. Android adds no stand-in icon for a Device Owner app (checked on Android 16), so it appears only in
    Settings → Apps, where it cannot be uninstalled until release. The clerk sees enrolment and the last check-in on
    the portal's setup-QR screen instead.
13. **A release survives interruptions.** Once the protections are removed the phone saves a "releasing" state
    before telling the server, so a release cut short (app stopped, no network, reboot) is finished on the next run
    and never protected again.
