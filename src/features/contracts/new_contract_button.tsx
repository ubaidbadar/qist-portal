import { Link } from 'react-router-dom';
import { FilePlus2 } from 'lucide-react';
import { Button } from '../../ui';
import { useCan } from '../../auth';

/** Starts the sale wizard, with the customer already chosen when given. Hidden from roles that can't sell. */
export default function NewContractButton({ customerId }: { customerId?: string }) {
  const can = useCan();
  if (!can('contracts.create')) return null;
  return (
    <Button as={Link} to={customerId ? `/contracts/new?customerId=${customerId}` : '/contracts/new'} icon={FilePlus2}>
      New contract
    </Button>
  );
}
