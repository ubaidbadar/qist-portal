# Qist portal redesign — execution plan

**Status:** Milestones 1–6 in progress on `redesign/qist-ui`; later milestones pending. **Scope:** Frontend only. Do not merge or deploy without review.

## Goals and boundaries
A calm, bank-like Qist interface matching the approved references; make everyday retailer workflows possible with minimal backtracking. Preserve all route URLs, backend endpoints, request/response data, existing user permissions, session handling, calculations, error handling, and manual payment processing. Contextual creation and auto-selection are approved frontend workflow improvements, not changes to backend behavior. Respect all five `.claude/skills` documents.

## Findings
The legacy design mixes `.portal-shell` token overrides, gradient auth sections, uneven button dimensions, and non-contextual actions. Contract creation sends users to Customers and Inventory when a record is absent; customer form redirects after saving; the Terms step unmounts and loses drafts; Payments has no entry button. Inventory defaults to in-stock, hiding the sold-phone QR. The original dashboard route was Coming Soon; the redesigned dashboard displays only live existing API values, without fabricated metrics. Login is email-only and signup requires first branch: the references' phone login cannot be implemented visually without backend changes.

## Tokens
Logo: `#06B6D4` → `#2F3FE0`, white soft keyhole; only logo uses gradient. Navy `#0A1A3F`, raised `#11275A`, muted-on-dark `#A9B8DD`, cyan `#22D3EE` with dark text `#04122E`; coral `#FFA383`, light blue-grey workspace, semantic success/warning/danger/info, Inter. One `src/index.css` token source, dark and light support, at least 4.5:1 text contrast, generous rounding and 48px action targets. Logical CSS for RTL readiness.

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
