# Qist portal redesign — execution plan

**Status:** Original portal design restored; new auth layout and UX workflows retained. Browser/device QA pending. **Scope:** Frontend only. Do not merge or deploy without review.

## Goals and boundaries
Preserve the original Qist light design with the newer authentication layout; make everyday retailer workflows possible with minimal backtracking. Preserve all route URLs, backend endpoints, request/response data, existing user permissions, session handling, calculations, error handling, and manual payment processing. Contextual creation and auto-selection are approved frontend workflow improvements, not changes to backend behavior. Respect all five `.claude/skills` documents.

## Findings
The legacy design mixes `.portal-shell` token overrides, gradient auth sections, uneven button dimensions, and non-contextual actions. Contract creation sends users to Customers and Inventory when a record is absent; customer form redirects after saving; the Terms step unmounts and loses drafts; Payments has no entry button. Inventory defaults to in-stock, hiding the sold-phone QR. The original dashboard route was Coming Soon; the redesigned dashboard displays only live existing API values, without fabricated metrics. Login is email-only and signup requires first branch: the references' phone login cannot be implemented visually without backend changes.

## Tokens
Logo: `#06B6D4` → `#2F3FE0`, white soft keyhole; only logo uses gradient. Navy `#0A1A3F`, raised `#11275A`, muted-on-dark `#A9B8DD`, cyan `#22D3EE` with dark text `#04122E`; coral `#FFA383`, light blue-grey workspace, semantic success/warning/danger/info, Inter. One `src/index.css` token source, light-and-dark interface, at least 4.5:1 text contrast, generous rounding and 48px action targets. Logical CSS for RTL readiness.

## Ordered milestones
1. **Foundation:** tokens, one SVG Logo, Inter, remove competing backgrounds/gradients.
2. **Primitives:** Button/fields/statuses, cards/tables, toasts and overlays; preserve existing component APIs, form/overlay semantics and design-system showcase.
3. **Layouts:** navy sidebar, mobile navigation, search, branch context, responsive auth pages matching the reference while keeping real email/branch fields.
4. **Sell a phone in one journey:** inline add/select customer and stock phone with existing API; preserve Terms draft on Back; make selected branch explicit; final review before create.
5. **Collections and onboarding:** payment initiation from Payments via existing contract selection; contextual sold-phone setup QR and current lock actions with accurate command states.
6. **Remaining pages:** consistent customer/stock/contracts/payments/settings/lock-center, receipts and agreements, loading/empty/error/permission states; preserve Coming Soon as honest state for unimplemented features.
7. **Final pass:** 390px and 1440px, keyboard and contrast, logical CSS, dark mode, role permissions and every existing route, remove dead styles.

Each milestone: one commit, run GitHub CI (typecheck, lint, build), applicable tests and browser smoke checks; inspect errors before next milestone. No new dependency unless justified. Roll back by reverting one commit.

## Acceptance
Retailer can begin a sale without preregistered customer or phone, add both in context, retain inputs when navigating between steps, and submit using existing validated payloads; existing data flows and permissions still work. Payment and setup actions discoverable. No misleading device status, fake stats, raw palette classes or dead components. Maintain this plan with actual verification and any deferred items.

## Implementation summary — 4 November 2026

- Established semantic Qist semantic light and dark tokens and canonical SVG logo.
- Restyled shared interactive controls, tables, badges and feedback; preserved component APIs.
- Rebuilt full-bleed navy desktop auth layout, updated login/signup/recovery visuals without changing email-only authentication or mandatory first branch.
- Built a working dashboard from the existing collections, overdue and daily payments endpoints. All figures are server-derived; no sample totals.
- Added inline customer and stock-phone creation in the contract wizard, auto-selection, explicit selling branch, preserved Terms form state on Back, and a final review summary.
- Added a Payments-page entry flow to select an existing customer and active unpaid contract, then reuse the same idempotent payment form and receipt route.
- Exposed device-setup QR from eligible contract detail, retaining backend authorization and enrollment semantics.
- Preserved every existing endpoint, route, Zod business rule, permissions, money representation, and device lock confirmation flow. No dependency changes.

**Verification:** GitHub Actions on the redesign branch passed `bun run check` (TypeScript, ESLint, Vite production build) and `bun test` (existing unit tests). `main` is unchanged; the redesign branch is current with `main`. Automatic Firebase Hosting production deployment was not invoked.

**Remaining acceptance checks before production:** click through auth, contract creation with a new customer and phone, duplicate customer recovery, payment and receipt, QR enrollment, lock/unlock and role-specific permissions on real connected data; inspect mobile (390px), desktop (1440px), keyboard navigation and Urdu/RTL layouts in a browser. These interactive checks cannot be certified by CI alone. The reference's phone-number login remains out of scope because the actual authentication API is email-based.

**Rollback:** Each feature group is isolated in the redesign branch's commit history. Revert its associated commits if it causes a regression; do not merge to `main` until review.

### Visual preference revision
The sidebar and mobile navigation are white; primary action buttons use accessible teal with white labels. Dark mode remains available with an improved neutral palette and a saved preference. The navy authentication brand illustration remains as a deliberate identity element, not an alternate color theme.

### Final user-approved style direction — 4 Nov 2026
Restore the original `main` visual styles for the portal: white sidebar, original blue primary buttons, inputs, tables, badges, and spacing. Retain the newer **authentication page layout** (left navy introduction panel on desktop, simplified auth form), with its shared new SVG logo; this is a brand panel, not dark mode. Retain all existing UX workflow improvements (inline customer/stock creation, persistent contract terms, payment launcher, setup QR, live dashboard) and their backend contracts. Dark mode uses a separate low-glare charcoal palette, with a restored accessible toggle and saved preference. Run typecheck, lint, build and tests before merge; verify in browser at mobile/desktop breakpoints.

### Theme clarification
The user wants **both themes**. The old dark theme's colors were the problem, not dark mode itself. Preserve the original white/light portal and blue buttons, and implement dark mode with charcoal neutral surfaces, crisp light typography, softly contrasted borders and an accessible lighter-blue accent. Start in light mode until a user explicitly switches. Keep the new auth page layout.


## Payment instructions and markup basis (6 November 2026)

Owner payment settings, customer/locker payment details and selectable markup basis are implemented across the four Qist repositories. See `docs/PAYMENTS_AND_MARKUP.md` for scope, formulas, rollout, kiosk implications and pending device/database verification. Existing contracts retain their stored totals and schedules.
