import { Link } from 'react-router-dom';
import { Compass } from 'lucide-react';
import { Button, Card, EmptyState } from '../../ui';
import Page from '../../shared/page';

export default function NotFoundPage() {
  return (
    <Page title="Page not found">
      <Card padding="none">
        <EmptyState
          icon={Compass}
          title="This page does not exist"
          description="The link may be old or mistyped."
          action={<Button as={Link} to="/">Go to dashboard</Button>}
        />
      </Card>
    </Page>
  );
}
