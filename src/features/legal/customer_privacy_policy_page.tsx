import { Link } from 'react-router-dom';
import Brand from '../../app/layout/brand';
import ThemeToggle from '../../app/layout/theme_toggle';
import Page from '../../shared/page';
import { Card } from '../../ui';

const sections = [
  {
    "title": "About this policy",
    "body": "This policy applies to Qist Customer (Android package pk.qist.customer), provided by Ubaid Badar. It describes the current demonstration version, which uses sample installment plans, payments, phone status and receipts."
  },
  {
    "title": "Information used by the app",
    "body": "You can enter a phone number and a demo verification code. They are used locally to demonstrate sign-in and display your number in the app. The app does not send SMS messages or create a real customer account. Phone numbers and codes may be included in Android's temporary saved screen state so the screen can be restored."
  },
  {
    "title": "Collection and sharing",
    "body": "The current app does not send your phone number, installment information or payment information to the developer or a backend server. It includes no advertising or analytics SDK. The plan, payment, retailer, phone-status and receipt records shown in this version are sample records."
  },
  {
    "title": "Local preferences and Android services",
    "body": "The app stores your privacy acceptance and notification preference locally. The notification preference is a demo setting; this version does not register for remote push messages. Android's backup and restore services may back up app preferences according to your device settings. Those services are governed by the platform provider's terms and privacy policies."
  },
  {
    "title": "Receipts you save or share",
    "body": "Downloading a receipt uses Android's file picker to save a text file to a location you choose. Sharing a receipt opens Android's share sheet. Only if you choose a destination will the selected app or service receive the receipt text. The selected provider handles that information under its own policies. Demo receipts are marked as demo data."
  },
  {
    "title": "Retention and your choices",
    "body": "Logging out clears the entered phone number and code from the current app session. Preferences remain until you clear the app's storage or uninstall it, subject to Android backup and restore settings. You can change the notification preference in Profile. Exported receipts remain in your selected storage location until you delete them there. Because this demo creates no server account, there is no server account record to delete."
  },
  {
    "title": "Support correspondence",
    "body": "If you email us, we receive your email address and the information you choose to send. We use that correspondence to respond to your request and address support or privacy concerns. Keep sensitive account, payment and identity information out of support messages unless necessary. You may request deletion of support correspondence, subject to applicable retention requirements."
  },
  {
    "title": "Phone status and retailer payments",
    "body": "The customer app displays sample phone status and payment guidance. It does not manage or lock your device, approve financing, transfer money or process payments. Retailer contact controls in this demo do not contact a real retailer."
  },
  {
    "title": "Changes to this policy",
    "body": "We will update this policy and the applicable Google Play disclosures before releasing features that change how user data is handled, such as real sign-in, backend synchronization, analytics or push notifications."
  },
  {
    "title": "Privacy contact",
    "body": "For privacy questions or requests, email m.ubaidbadar@gmail.com. Developer: Ubaid Badar."
  }
];

export default function CustomerPrivacyPolicyPage() {
  return (
    <div className="min-h-dvh bg-canvas">
      <title>Qist Customer Privacy Policy</title>
      <meta name="description" content="Privacy policy for the Qist Customer Android demo, provided by Ubaid Badar." />
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
              <p className="text-sm text-muted">Last updated <time dateTime="2026-11-05">5 November 2026</time></p>
              <p className="mt-4 text-sm leading-relaxed text-body">
                This policy covers the current Android demo. Real customer accounts, live payment records
                and backend services have not been enabled in this version.
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
