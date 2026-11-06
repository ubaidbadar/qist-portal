# Payment instructions and markup basis

## Scope and data ownership

- Owners manage up to 10 cash, Easypaisa, JazzCash and bank instructions in portal Settings → Payment methods. Accounts can be edited, hidden or removed. Cash uses the selling branch address.
- `PATCH /org/payment-methods` validates complete account details; wallets normalize Pakistani mobile numbers and bank transfers validate Pakistani IBAN checksums. Existing organization-name updates cannot clear payment instructions.
- Customer overview and device check-in project only the selected retailer’s enabled methods. Device check-in caches those details in the existing encrypted state for offline display. No additional per-method requests or payment processor is added.
- Both plans and new contracts support `markupBasis: financed | cash_price`. Omitted values preserve the existing financed-balance calculation. Existing contracts and schedules are not recalculated. Plan changes affect new contracts only.
- For Rs 50,000 cash price, Rs 10,000 down and 20% markup: balance basis adds Rs 8,000 (Rs 48,000 in installments); full-price basis adds Rs 10,000 (Rs 50,000 in installments). The down payment is separate in both cases.

## Screens

1. Portal: configure payment accounts; choose markup basis on plans and contract creation; review the basis, amount and totals; display the saved basis in contract details and agreements.
2. Customer app: show configured accounts and copy actions, branch address, call and WhatsApp proof actions; use readable payment-method labels and installment numbers on receipts. Existing text receipt sharing/download remains available.
3. Locker: show enabled payment-method chips and a light bottom details dialog with copy actions. Open the installed customer app or its exact Google Play listing. Show a visible error if unavailable; never silently unlock or launch a general browser.

## Kiosk behavior and rollout

- The locker allow-list includes `pk.qist.customer` and Google Play (`com.android.vending`) alongside the locker and dialer. This permits Google Play navigation, not just a single immutable store page; the initial intent targets Qist’s listing explicitly. Home, Recents and connectivity restrictions remain in effect.
- Installation is customer initiated, with no second download during QR provisioning. Google Play availability, login, testing eligibility and internet access still apply. No silent-install promise is made.
- Deploy the backend first, then portal and Android builds. Older Android apps ignore added API fields, and new apps handle missing payment instructions. No data migration is required.
- Revert the feature commits to roll back UI/API behavior. Stored markup amounts and schedules remain authoritative. Existing contracts must not be repriced during rollback.

## Verification

- Portal: type check, lint, production build and 92 unit/render tests passed.
- Backend: type check, lint and 114 tests passed. Database integration suites are skipped without a test MongoDB. An isolated MongoDB replica-set startup was attempted; the sandbox denied an OS operation, so database integration remains pending.
- Android: parsing, formatting and sheet interaction regression tests added. Gradle could not download its pinned distribution (`Network is unreachable`), and no Android SDK/device is available here. Builds, lint, Android tests and device behavior are not verified.
- Browser: the cloud browser could not connect to the local development server. Visual verification remains pending.
- Before release: test owner account add/edit/hide/remove, retailer isolation, full-price and balance pricing, old stored device-state compatibility, sheet dismissal/copy on a locked phone, calls, Play install/open/back navigation, Google Play absence and closed-test eligibility. Check small screens, large fonts, rotation, reboot, offline data and return to lock screen.
