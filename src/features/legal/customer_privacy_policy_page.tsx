import { Link } from 'react-router-dom';
import Brand from '../../app/layout/brand';
import ThemeToggle from '../../app/layout/theme_toggle';
import Page from '../../shared/page';
import { Card } from '../../ui';

const sections = [
  {
    "title": "About this policy",
    "body": "This policy applies to Qist Customer (Android package pk.qist.customer), provided by Ubaid Badar. The connected app lets registered customers view their retailer's installment plans, recorded payments, receipts, and the phone's last acknowledged status."
  },
  {
    "title": "Sign-in and WhatsApp verification",
    "body": "The app sends your phone number and password over HTTPS to the Qist backend to authenticate you. Passwords are stored on the server as Argon2 hashes, not plaintext. The enrolled Locker may securely approve same-phone sign-in or an approval you initiate on another phone. Password sign-in and WhatsApp recovery remain available. If you request WhatsApp first-password setup or recovery, Qist sends your phone number and a one-time verification code to Meta's WhatsApp Business Platform for delivery to you. Codes expire after five minutes and are stored as server-keyed hashes. Meta handles WhatsApp delivery under its own policies. We do not use WhatsApp to send unsolicited marketing through this flow."
  },
  {
    "title": "Customer and financial records",
    "body": "The backend matches your verified phone number to customer records registered by your retailers. The app retrieves your name, phone number, plan and installment amounts, due dates, paid amounts, late fees, payment receipts, retailer contact details, and the last device lock state recorded by the retailer's system. It does not display other customers' records, unrelated guarantor scans, retailer inventory costs, or device-enrollment credentials. Ask your retailer to correct inaccurate registration or payment records."
  },
  {
    "title": "Local storage and permissions",
    "body": "The app uses Android Keystore to encrypt the session token and last-viewed account snapshot in backup-excluded storage. Offline screens identify saved data. Privacy acceptance and preferences remain locally. Photo and document selection uses Android system pickers without broad photo, storage, contact or SMS permissions. Pending document copies are encrypted in backup-excluded storage, limited in size and number, and removed after upload, cancellation, expiry or sign-out. Files exported by you remain at your chosen destination."
  },
  {
    "title": "Reminders and device status",
    "body": "With your notification preference and Android permission where required, Firebase Cloud Messaging handles an installation token and generic account notifications. Notification delivery is not a connectivity or approval guarantee. Qist Customer displays the last acknowledged phone state; the separate Qist Locker handles device management and cryptographically signed sign-in approval. The customer app itself does not enroll, lock, unlock or manage your phone."
  },
  {
    "title": "Private documents and staff review",
    "body": "If your retailer enables documents, staff and customers may upload identity, phone-box, warranty, invoice and signed agreement records for a specific retailer and plan. A customer may submit a guarantor identity scan only for a specific staff request and with permission to share it. Files are held privately for antivirus and format checks before access is allowed. Authorized owners and managers review submissions; ordinary staff can submit documents and see status but cannot retrieve file content, because a category alone cannot reliably identify sensitive content. Customers may access their own permitted submissions and review feedback; staff-uploaded files are not automatically shared to customer accounts, but cannot retrieve guarantor identity scans. Acceptance means staff review, not independent identity verification. The retailer retention notice is shown before submission. Contract files are retained through the contract and the disclosed period after it ends; standalone identity documents count from upload. A retailer dispute hold may extend retention. Removed or expired files lose access immediately and stored objects are deleted by a retryable cleanup process. Exported copies are under your control. Contact your retailer for correction, deletion or a hold dispute. Deleting your app account does not automatically erase retailer business documents."
  },
  {
    "title": "Payments, contact actions, and receipts",
    "body": "Qist Customer does not transfer money, approve financing, or process payments. Payments are made directly to your retailer and recorded by them. Call opens your dialer; WhatsApp contact opens a retailer chat, and a call/message is made only if you choose to continue. Download uses Android's file picker to save a text receipt where you choose. Share opens Android's share sheet; the destination you select receives the receipt text under its own policies. Exported receipts remain until you delete them."
  },
  {
    "title": "Retention, sign-out, and deletion requests",
    "body": "Customer-login sessions expire after 30 days and may be revoked sooner. Signing out removes the sign-in token on this device and attempts to revoke that session on the server; if the device is offline, server expiry still applies. Resetting the password revokes all customer-login sessions. Preferences remain until you clear app storage or uninstall. Use Delete my data in the app to remove your login identity, password, sessions, push registrations and notification inbox. You can also contact m.ubaidbadar@gmail.com for privacy requests. Retailer transaction and contract records are separate business records; contact the relevant retailer about correction or deletion and any applicable retention requirements. No fixed retention period for those records is promised here."
  },
  {
    "title": "Support, analytics, and advertising",
    "body": "If you email us, we receive your email address and the information you choose to provide, and use it to respond. Avoid sending passwords, verification codes, identity documents, or sensitive payment information unless necessary. This implementation includes no advertising or analytics SDK, and does not sell customer data through an advertising feature."
  },
  {
    "title": "Changes to this policy",
    "body": "We will update this policy and applicable store disclosures when the app's data handling changes. Contact us with questions about which features are enabled in your installed version."
  },
  {
    "title": "Privacy contact",
    "body": "For privacy questions, customer-login account deletion, or other requests, email m.ubaidbadar@gmail.com. Developer: Ubaid Badar."
  }
];

export default function CustomerPrivacyPolicyPage() {
  return (
    <div className="min-h-dvh bg-canvas">
      <title>Qist Customer Privacy Policy</title>
      <meta name="description" content="Privacy policy for the connected Qist Customer Android app, provided by Ubaid Badar." />
      <a href="#privacy-content" className="sr-only focus:not-sr-only focus:inline-flex focus:min-h-12 focus:items-center focus:px-4">
        Skip to privacy policy
      </a>
      <header className="border-b border-border bg-surface">
        <div className="mx-auto flex max-w-4xl items-center justify-between gap-4 px-4 py-4 sm:px-6">
          <Link to="/login" aria-label="Qist sign in"><Brand /></Link>
          <ThemeToggle />
        </div>
      </header>
      <main id="privacy-content" className="mx-auto max-w-4xl">
        <Page title="Privacy policy" description="Qist Customer Android app · Provided by Ubaid Badar">
          <article className="space-y-5">
            <Card padding="lg">
              <p className="text-sm text-muted">Last updated <time dateTime="2026-11-17">17 November 2026</time></p>
              <p className="mt-4 text-sm leading-relaxed text-body">
                This policy covers connected versions of Qist Customer, including phone/password login,
                WhatsApp password recovery, and retailer-provided account records. Earlier demo versions
                may provide fewer features.
              </p>
            </Card>
            {sections.map(({ title, body }) => (
              <section key={title} aria-label={title}>
                <Card padding="lg">
                  <h2 className="text-xl">{title}</h2>
                  <p className="mt-3 whitespace-pre-line text-sm leading-relaxed text-body">{body}</p>
                </Card>
              </section>
            ))}
          </article>
          <footer className="mt-8 border-t border-border pt-5 text-sm text-muted">
            <p>
              Privacy questions?{' '}
              <a href="mailto:m.ubaidbadar@gmail.com" className="inline-flex min-h-12 items-center break-all text-accent underline underline-offset-4">
                m.ubaidbadar@gmail.com
              </a>
            </p>
          </footer>
        </Page>
      </main>
    </div>
  );
}
