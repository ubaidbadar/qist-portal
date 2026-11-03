import { Plus, Users, Wallet } from 'lucide-react';
import { Alert, Button, Card, EmptyState, ErrorState, Skeleton, StatCard, toast } from '../ui';
import Section from './section';

export default function DataDisplaySection() {
  return (
    <Section title="Data Display">
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        <StatCard label="Active customers" value="1,248" icon={Users} hint="+12 this week" tone="accent" />
        <StatCard label="Collected" value="Rs 4.2M" icon={Wallet} hint="This month" tone="success" />
        <Card className="space-y-3" aria-label="Skeleton loading demo">
          <Skeleton className="h-4 w-1/2" />
          <Skeleton className="h-8 w-3/4" />
          <Skeleton className="h-3 w-1/3" />
        </Card>
        <Card padding="none">
          <EmptyState
            icon={Users}
            title="No customers yet"
            description="Add your first customer to start a contract."
            action={<Button icon={Plus}>Add customer</Button>}
          />
        </Card>
        <Card padding="none">
          <ErrorState onRetry={() => toast.info('Retrying…')} />
        </Card>
        <div className="space-y-3 sm:col-span-2 lg:col-span-3">
          <Alert tone="info">Branch codes are printed on receipts.</Alert>
          <Alert tone="success" title="Password updated">Sign in with your new password.</Alert>
          <Alert tone="warning" title="Confirm your email address" action={<Button size="sm" variant="ghost">Resend link</Button>}>
            We sent a link to owner@example.com.
          </Alert>
          <Alert tone="danger">Email or password is incorrect</Alert>
        </div>
      </div>
    </Section>
  );
}
