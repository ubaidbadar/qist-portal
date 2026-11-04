import { lazy, Suspense } from 'react';
import { Route, Routes } from 'react-router-dom';
import { GuestOnly, RequireAuth, RequirePermission } from './auth';
import AppLayout from './app/layout/app_layout';
import { NAV_ITEMS } from './app/nav_items';
import AuthLayout from './features/auth/auth_layout';
import FullPageLoader from './shared/full_page_loader';

const LoginPage = lazy(() => import('./features/auth/login_page'));
const SignupPage = lazy(() => import('./features/auth/signup_page'));
const ForgotPasswordPage = lazy(() => import('./features/auth/forgot_password_page'));
const ResetPasswordPage = lazy(() => import('./features/auth/reset_password_page'));
const VerifyEmailPage = lazy(() => import('./features/auth/verify_email_page'));
const ChangePasswordPage = lazy(() => import('./features/auth/change_password_page'));
const DashboardPage = lazy(() => import('./features/dashboard/dashboard_page'));
const SettingsPage = lazy(() => import('./features/settings/settings_page'));
const CustomersPage = lazy(() => import('./features/customers/customers_page'));
const CustomerPage = lazy(() => import('./features/customers/customer_page'));
const InventoryPage = lazy(() => import('./features/inventory/inventory_page'));
const ContractsPage = lazy(() => import('./features/contracts/contracts_page'));
const NewContractPage = lazy(() => import('./features/contracts/new_contract_page'));
const ContractPage = lazy(() => import('./features/contracts/contract_page'));
const AgreementPage = lazy(() => import('./features/contracts/agreement_page'));
const PaymentsPage = lazy(() => import('./features/payments/payments_page'));
const LockCenterPage = lazy(() => import('./features/locks/lock_center_page'));
const ReceiptPage = lazy(() => import('./features/payments/receipt_page'));
const ComingSoonPage = lazy(() => import('./app/pages/coming_soon_page'));
const NotFoundPage = lazy(() => import('./app/pages/not_found_page'));
const ShowcasePage = lazy(() => import('./showcase/showcase_page'));

/** Screens not built yet; each milestone replaces its routes (docs/plan.md §7). */
const BUILT = new Set(['/', '/settings', '/customers', '/inventory', '/contracts', '/payments', '/lock-center']);
const UPCOMING = NAV_ITEMS.filter((item) => !BUILT.has(item.to));

export default function App() {
  return (
    <Routes>
      <Route element={<AuthLayout />}>
        <Route element={<GuestOnly />}>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        </Route>
        <Route path="/reset-password" element={<ResetPasswordPage />} />
        <Route path="/verify-email" element={<VerifyEmailPage />} />
      </Route>

      <Route element={<RequireAuth />}>
        <Route element={<AuthLayout />}>
          <Route path="/change-password" element={<ChangePasswordPage />} />
        </Route>
        <Route
          path="/payments/:paymentId/receipt"
          element={
            <Suspense fallback={<FullPageLoader />}>
              <ReceiptPage />
            </Suspense>
          }
        />
        <Route
          path="/contracts/:contractId/agreement"
          element={
            <Suspense fallback={<FullPageLoader />}>
              <AgreementPage />
            </Suspense>
          }
        />
        <Route element={<AppLayout />}>
          {UPCOMING.map((item) => (
            <Route
              key={item.to}
              path={item.to}
              element={
                item.permission ? (
                  <RequirePermission permission={item.permission} title={item.label}>
                    <ComingSoonPage title={item.label} />
                  </RequirePermission>
                ) : (
                  <ComingSoonPage title={item.label} />
                )
              }
            />
          ))}
          <Route path="/" element={<DashboardPage />} />
          <Route path="/customers" element={<CustomersPage />} />
          <Route path="/customers/:customerId" element={<CustomerPage />} />
          <Route path="/inventory" element={<InventoryPage />} />
          <Route path="/contracts" element={<ContractsPage />} />
          <Route
            path="/contracts/new"
            element={
              <RequirePermission permission="contracts.create" title="New contract">
                <NewContractPage />
              </RequirePermission>
            }
          />
          <Route path="/contracts/:contractId" element={<ContractPage />} />
          <Route path="/payments" element={<PaymentsPage />} />
          <Route path="/lock-center" element={<LockCenterPage />} />
          <Route
            path="/settings"
            element={
              <RequirePermission permission="org.manage" title="Settings">
                <SettingsPage />
              </RequirePermission>
            }
          />
        </Route>
      </Route>

      <Route
        path="*"
        element={
          <Suspense fallback={<FullPageLoader />}>
            <NotFoundPage />
          </Suspense>
        }
      />

      {import.meta.env.DEV && <Route path="/design-system" element={<ShowcasePage />} />}
    </Routes>
  );
}
