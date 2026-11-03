import { Hammer } from 'lucide-react';
import { Card, EmptyState } from '../../ui';
import Page from '../../shared/page';

/** Stand-in for a feature screen that has not been built yet; each feature step replaces its route. */
export default function ComingSoonPage({ title }: { title: string }) {
  return (
    <Page title={title}>
      <Card padding="none">
        <EmptyState icon={Hammer} title={`${title} is on the way`} description="This screen is built in a later step." />
      </Card>
    </Page>
  );
}
