import { Pencil, UserPlus } from 'lucide-react';
import type { Customer } from '@shop/shared';
import { Button, Drawer } from '../../ui';
import CustomerForm from './customer_form';

/** "Add customer", or "Edit" on a customer's page; both open the same form. */
export default function CustomerDrawer({ customer, onCreated }: { customer?: Customer; onCreated?: (customer: Customer) => void }) {
  return (
    <Drawer
      title={customer ? `Edit ${customer.fullName}` : 'Add customer'}
      width="lg"
      component={({ open }) =>
        customer ? (
          <Button variant="outline" icon={Pencil} onClick={open}>
            Edit
          </Button>
        ) : (
          <Button icon={UserPlus} onClick={open}>
            Add customer
          </Button>
        )
      }
    >
      {(close) => <CustomerForm customer={customer} onDone={close} onCreated={onCreated} />}
    </Drawer>
  );
}
