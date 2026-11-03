import type { ReactNode } from 'react';
import { ShieldOff } from 'lucide-react';
import type { Permission } from '@shop/shared';
import { Card, EmptyState } from '../ui';
import Page from '../shared/page';
import { useCan } from './me';

interface RequirePermissionProps {
  permission: Permission;
  title: string;
  children: ReactNode;
}

/** For a page reached by URL that the user's role can't use (the navigation already hides it). */
export default function RequirePermission({ permission, title, children }: RequirePermissionProps) {
  const can = useCan();
  if (can(permission)) return children;

  return (
    <Page title={title}>
      <Card padding="none">
        <EmptyState icon={ShieldOff} title="You don't have access to this page" description="Ask the owner if you need it." />
      </Card>
    </Page>
  );
}
