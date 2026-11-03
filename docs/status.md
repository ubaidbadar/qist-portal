# Project status

Last updated 2 October 2026. Everything built so far is merged into `main` (M1–M5, the brand and Phase 2 plan branches, and P2-1 to P2-3). Next: P2-4, and the real-phone test (A8, A9). The plan is in [plan.md](plan.md).

## Milestones

| # | Milestone | Status | Notes |
|---|---|---|---|
| M0 | Foundation | Done (2 Oct) | Verified on the Atlas `dev` cluster: the API starts, `/health` reports the database up, and 22 server tests pass on a throwaway database that is dropped afterwards |
| M1 | Accounts, branches, team | Done (2 Oct, merged) | Reworked at your request: server is MVC, documents are identified by `_id` everywhere (no branch codes), and only the indexes queries need remain; behavior re-verified. 41 server tests pass on a throwaway Atlas database, including organization and branch isolation and the permission matrix over HTTP. A browser run-through passes: signup, reload, add branch, add staff, forced password change, staff access limits, email confirmation, mobile and dark mode |
| M2 | Customers and stock | Done (2 Oct, merged) | 59 server tests pass on Atlas (17 new: customers, inventory, exact index set). A browser run-through passes: customer with guarantor, duplicate CNIC caught with a link, search, bad IMEI refused, transfer between branches, staff limits, Ctrl+K to a customer, phone layout. **Not done: CNIC photo uploads**, waiting for A2 and A3 |
| M3 | Plans and contracts | Done (2 Oct, merged) | 64 server tests pass on Atlas (5 new for contracts) and 8 new schedule tests (month ends, leap years, Pakistan time, exact totals). A browser run-through passes: plan, 3-step sale with live schedule, contract page, printed agreement, cancel. The down payment is recorded on the contract; its receipt arrives with payments in M4 |
| M4 | Payments and collections | Done (2 Oct, merged) | 72 server tests pass on Atlas (8 new: receipts per branch, part and advance payments, retries recorded once, simultaneous payments, payoff and void, void rules, daily collections) and 6 new allocation tests. Browser run-through passes. Late fees moved to M5 (added by the overdue job). Watch item: one test run took 131 s once and did not recur in two full reruns |
| M5 | Lock engine and Lock Center | Done (2 Oct, merged) | 9 new lock-engine tests on Atlas and 6 new rule tests (grace days, minimum, pause, late fees). Browser run-through on separate ports and a throwaway database passes: overdue list, proposal, approval, withdraw, promise to pay. Lock policy and late fee are set through the API now; their settings screen comes in M6. Commands are now carried out by the phone app (P2-3) |
| M6 | Dashboard, reminders, reports, settings, audit | Not started | |
| M7 | Go-live | Not started | needs A4 and A5 |

### Phase 2 — Android DPC (lock/unlock only, not on Google Play)

| # | Milestone | Status | Notes |
|---|---|---|---|
| P2-1 | Device API | Done (2 Oct, merged) | Issue/revoke a provisioning QR for a sold phone, `POST /device/enroll` (one-time token → `<deviceId>.<secret>` credential, only its hash stored), `POST /device/checkin`, `POST /device/commands/:id/ack`. FCM wake-up is stubbed (no-op until creds). 8 tests on Atlas |
| P2-2 | Enrolment + QR screen | Done (2 Oct, merged), needs a real phone | Kotlin app in `android/`: reads the token from the QR, redeems it, stores the credential encrypted (Android Keystore) and turns on the anti-reset protections. The server returns a full Android provisioning QR; Inventory → Sold → QR button shows it. Verified on an Android 16 emulator (adb stands in for the QR). Real QR setup needs A8 and A9 |
| P2-3 | Lock + lock screen | Done (2 Oct, merged) | Check-ins every 15 min plus on enrolment, reboot, and whenever a screen opens; lock = kiosk mode + lock screen as Home; unlock keeps protections; release removes everything and gives up Device Owner. 43 app tests (incl. 4 Compose UI tests). Emulator: lock, Home/Back/Recents/Settings blocked, emergency dialer opens, survives reboot, unlock on screen wake. Release verified on the emulator after a fix on branch `p2-hide-launcher` (a release could stop itself half-way; see plan §11.13). That branch also removes the launcher icon (§11.12): **ready for your review** |
| P2-4 | Offline + resilience | Not started | |

## Actions for you

| # | Action | Why | Needed by |
|---|---|---|---|
| A1 | Change the Atlas `admin` password (currently `1234`) and send me the new connection string. Better still, create a separate database user for the app that can only read and write this project's databases | a 4-digit admin password on an internet-facing cluster can be guessed, and it has been shared in chat | before any real customer data |
| A2 | **Still open:** the new R2 keys point at `tonora`. Create an R2 bucket just for this project, with public access off (no `r2.dev` URL) | `tonora` belongs to another project and has a public `r2.dev` URL; CNIC photos must never be publicly reachable | M2 |
| A3 | Done (2 Oct): R2 keys added to `server/.env`. Scope them to the new bucket once it exists | presigned uploads and downloads | M2 |
| A4 | Choose a domain; the portal will live on `app.<domain>` and the API on `api.<domain>` | login cookie and deployment | M7 |
| A5 | Brevo SMTP is set in `server/.env` (2 Oct). Verify a sending domain or sender address in Brevo, and set the same `SMTP_*` values in production | real verification and password-reset emails; set `SMTP_HOST` empty in development to print them to the console | M7 |
| A7 | Done (2 Oct): Android SDK licence accepted; emulator image installed | emulator testing of the device app | – |
| A8 | Decide where the device APK is hosted (an https link you control, e.g. a private R2 bucket with a public link for this one file) and keep a release signing key. I can generate the key; you keep the file and its password somewhere safe (a password manager) | phones download the app from that link during setup, and Android pins the app to the key: losing the key means re-setting up every phone | before the first real phone |
| A9 | Get one Android phone that can be factory-reset for testing (ideally a model your retailers sell most) | real QR setup only works on a factory-fresh phone; also checks the Play Protect risk in plan §2 | P2-2 real-phone test |
| A6 | Create a GitHub repository and send me its URL (or let me create one with `gh`) | backup off this laptop, and CI; today the code is only committed locally | soon |

## Decisions and risks

Decisions are recorded in [plan.md §11](plan.md#11-decisions) and risks in [plan.md §10](plan.md#10-risks).
