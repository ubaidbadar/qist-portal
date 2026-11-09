import { Route, Routes } from 'react-router-dom';
import { GuestOnly, RequireAuth, RequirePermission } from './auth';
import AppLayout from './app/layout/app_layout';
import { NAV_ITEMS } from './app/nav_items';
import AuthLayout from './features/auth/auth_layout';

import CustomerPrivacyPolicyPage from './features/legal/customer_privacy_policy_page';
import LoginPage from './features/auth/login_page';
import SignupPage from './features/auth/signup_page';
import ForgotPasswordPage from './features/auth/forgot_password_page';
import ResetPasswordPage from './features/auth/reset_password_page';
import VerifyEmailPage from './features/auth/verify_email_page';
import ChangePasswordPage from './features/auth/change_password_page';
import DashboardPage from './features/dashboard/dashboard_page';
import SettingsPage from './features/settings/settings_page';
import CustomersPage from './features/customers/customers_page';
import CustomerPage from './features/customers/customer_page';
import InventoryPage from './features/inventory/inventory_page';
import ContractsPage from './features/contracts/contracts_page';
import NewContractPage from './features/contracts/new_contract_page';
import ContractPage from './features/contracts/contract_page';
import AgreementPage from './features/contracts/agreement_page';
import PaymentsPage from './features/payments/payments_page';
import LockCenterPage from './features/locks/lock_center_page';
import ReceiptPage from './features/payments/receipt_page';
import ComingSoonPage from './app/pages/coming_soon_page';
import NotFoundPage from './app/pages/not_found_page';
import ShowcasePage from './showcase/showcase_page';

/** Screens not built yet; each milestone replaces its routes (docs/plan.md §7). */
const BUILT = new Set(['/', '/settings', '/customers', '/inventory', '/contracts', '/payments', '/lock-center']);
const UPCOMING = NAV_ITEMS.filter((item) => !BUILT.has(item.to));

export default function App() {
  return (
    <Routes>
      <Route
        path="/privacy-policy"
        element={<CustomerPrivacyPolicyPage />}
      />
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
          element={<ReceiptPage />}
        />
        <Route
          path="/contracts/:contractId/agreement"
          element={<AgreementPage />}
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
        element={<NotFoundPage />}
      />

      {import.meta.env.DEV && <Route path="/design-system" element={<ShowcasePage />} />}
    </Routes>
  );
}
