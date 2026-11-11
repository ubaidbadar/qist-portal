---
name: base-data-forms-auth
description: How API calls, data fetching, mutations, forms, validation, login/session state, permissions and toast notifications work in this codebase (axios client with silent refresh, TanStack Query, the Form component with shared Zod schemas, the in-memory session, RequireAuth/useMe/useCan, toast). Use whenever the user wants to call an API, load or submit data, build a form, validate input, handle login/logout/tokens/roles, show success or error messages, or add a page that talks to the backend.
---

# Data, forms and auth

Everything below exists. Use and extend it; don't add a second HTTP client, data layer, form layer or auth store.
Request and response types and validation schemas come from `@shop/shared` (the `shared/` workspace), so the
portal and the API validate the same way.

## API client: `client/src/config/api.ts`
Axios instance, `baseURL = VITE_API_URL` (`client/src/config/urls.ts`), `withCredentials` for the refresh cookie.
- Adds `Authorization: Bearer <access token>` from the in-memory session.
- On a 401 it refreshes the session once (shared by concurrent requests) and retries the request. Pass
  `{ skipAuthRefresh: true }` for sign-in, sign-up and email-link calls, where 401 means wrong credentials.
- The API answers `{ data }` or `{ error: { code, message, details } }`. Use `apiGet<T>`, `apiPost<T>`, `apiPatch<T>`,
  which return what's inside `data`. `getAxiosMessage(err)` gives a readable message; `getFieldErrors(err)` the
  field-level problems (`details.fields: [{ path, message }]`).

## Reading data: TanStack Query
```ts
// features/<name>/queries.ts
export const branchesQuery = queryOptions({ queryKey: ['branches'], queryFn: () => apiGet<Branch[]>('/branches') });
// in a component
const query = useQuery(branchesQuery);
<QueryView query={query} skeleton={<ListSkeleton />}>{(branches) => …}</QueryView>
```
- `shared/query_view.tsx` renders the loading skeleton, the error state with retry, then your content. Use it for
  every data screen; add an empty state inside the content when the list can be empty.
- Defaults (`app/query_client.ts`): 30 s stale time; no automatic retries, retry-on-mount, focus or reconnect refetches. Explicit Retry and mutation invalidation still work. Session metadata uses `staleTime: Infinity` and explicit `ME_KEY` invalidation.
- After a change, invalidate what it affects: `queryClient.invalidateQueries({ queryKey: branchesQuery.queryKey })`,
  plus `ME_KEY` when the signed-in user's org or branches change.

## Lists that grow: `usePagedList` + `DataTable`
```tsx
const list = usePagedList<Customer>(CUSTOMERS_KEY, '/customers', { q: search || undefined });
<QueryView query={{ ...list, data: list.rows }} skeleton={<ListSkeleton rows={5} />}>
  {(rows) => <DataTable rows={rows} columns={COLUMNS} rowKey={(c) => c._id} rowHref={(c) => `/customers/${c._id}`}
    empty={<EmptyState … />} hasMore={list.hasNextPage} loadingMore={list.isFetchingNextPage} onLoadMore={list.loadMore} />}
</QueryView>
```
- The API pages newest first with `?limit&cursor` (`Page<T>` = `{ items, nextCursor }`); filters are part of the cache key.
- `DataTable` is a table on wide screens and cards on phones (first column = card title; `hideOnMobile` drops a
  column from the card). Keep filters and search in the URL (`useSearchParams`) and debounce typing with
  `useDebouncedValue`.

## Writing data
- **Forms** use `ui/Form` (react-hook-form + zod) with the shared schema, and call the API in `onSubmit`:
  ```tsx
  <Form
    schema={branchCreateSchema}
    defaultValues={{ name: '' }}
    onSubmit={async ({ data }) => {
      await apiPost('/branches', branchCreateSchema.parse(data)); // parse() gives typed input
      await queryClient.invalidateQueries({ queryKey: branchesQuery.queryKey });
      toast.success('Branch added');
      onDone();
    }}
    component={({ register, errors, loading, error }) => (
      <>
        <Input label="Name" {...register('name')} error={fieldError(errors, 'name')} />
        {error && <Alert tone="danger">{error}</Alert>}
        <Button type="submit" loading={loading}>Add branch</Button>
      </>
    )}
  />
  ```
  If `onSubmit` throws, Form shows the message in `error` **and** puts the API's field errors under their inputs.
  Checkbox groups and other custom inputs use `control` with react-hook-form's `Controller`.
  To show something computed from the values as they are typed (a live preview), use `useWatch({ control })` in a
  child component. Never call `watch()` while rendering: the React Compiler memoizes it and the preview goes stale.
- **Buttons** (deactivate, issue password…) use `useMutation`. Failures show as a toast automatically (the
  `MutationCache` in `app/query_client.ts`); add `onSuccess` for the success toast and invalidation.
- A form inside a `Drawer` or `Modal` gets `close` by passing a function as children: `{(close) => <MyForm onDone={close} />}`.

## Session and auth: `client/src/auth`
- `sessionStore` holds `{ status: 'loading' | 'signed_in' | 'signed_out', accessToken }`, **in memory only**. The
  refresh token is an httpOnly cookie the browser sends to `/api/v1/auth/*`; `restoreSession()` (called in
  `main.tsx`) uses it to resume after a reload.
- `signIn(session)` after sign-in, sign-up or a password change; `logOut()` to sign out. The user, organization and
  branches live in the TanStack cache under `ME_KEY`.
- Routes: `RequireAuth` (guests go to /login; temporary passwords go to /change-password first), `GuestOnly`
  (sign-in pages), `RequirePermission` (a page the role can't use).
- Inside `RequireAuth`: `useMe()` gives `{ user, org, branches }` without null checks, and `useCan()(permission)`
  checks the shared permission map. Hide what the role can't do; the server enforces it anyway.
- `useActiveBranch()` gives the branch the user is working in (`'all'` for owners); lists filter by it.

## Notifications: `toast` and `Alert`
`toast.success|error|warning|info(message)` from `ui` for transient feedback. `Alert` for messages that belong
on the page (form errors, banners). Mutation errors already toast; don't toast them again.


## Page loading and request budget
- Use one page-owned query and one layout-shaped skeleton for initial screen data. Keep the shell mounted. Never show a logo/spinner for route code and then a data skeleton on ordinary portal navigation.
- Import the signed-in portal screens statically in `src/app.tsx`; do not add route lazy loading or a code-loading fallback. Reassess the production gzip size when changing this boundary.
- Pass snapshot data to child panels; never fetch the same entity independently in each panel or start a child request only after the parent resolves.
- Use `/dashboard`, `/customers/:id/overview`, `/payments/overview`, and `/users/overview` for their respective screens. Preserve tenant/branch permissions, bounded cursor pagination, voided receipt handling and full-day collection totals.
- Keep related composite query keys under the entity prefix used by mutations. Invalidate customer overviews when contracts change, and team overviews when branches change.
- Count one page-data request per cold visit/filter/explicit page operation. Fresh cached visits need zero. Authentication recovery, writes, user-triggered pagination/search/retry, and existing lock polling are separate operations; never claim the entire session makes one HTTP request.
- Keep already rendered data visible during background refresh. On initial failure show one actionable error; on refresh failure keep existing content. Do not disable financial/lock refreshes just to reduce a counter.
- Verify actual request counts with delayed responses, StrictMode, a warm revisit, failure + Retry, pagination, and branch/date/ID changes. Build/typecheck/lint alone do not verify this behavior.
