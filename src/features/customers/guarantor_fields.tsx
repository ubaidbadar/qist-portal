import { Plus, Trash2 } from 'lucide-react';
import { useFieldArray, type Control, type FieldErrors, type FieldValues, type UseFormRegister } from 'react-hook-form';
import { MAX_GUARANTORS } from '@shop/shared';
import { Button, fieldError, IconButton, Input } from '../../ui';

interface GuarantorFieldsProps {
  control: Control<FieldValues>;
  register: UseFormRegister<FieldValues>;
  errors: FieldErrors;
}

const EMPTY_GUARANTOR = { fullName: '', cnic: '', phone: '', relation: '' };

/** Up to two people who vouch for the customer. */
export default function GuarantorFields({ control, register, errors }: GuarantorFieldsProps) {
  const { fields, append, remove } = useFieldArray({ control, name: 'guarantors' });

  return (
    <fieldset className="space-y-3">
      <legend className="mb-1.5 text-sm font-medium text-body">Guarantors</legend>
      {fields.map((field, index) => {
        const path = (name: string) => `guarantors.${index}.${name}`;
        return (
          <div key={field.id} className="space-y-3 rounded-control border border-border bg-surface p-4">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-ink">Guarantor {index + 1}</p>
              <IconButton icon={Trash2} size="sm" aria-label={`Remove guarantor ${index + 1}`} onClick={() => remove(index)} />
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <Input label="Full name" {...register(path('fullName'))} error={fieldError(errors, path('fullName'))} />
              <Input label="Relation (optional)" placeholder="e.g. Brother" {...register(path('relation'))} error={fieldError(errors, path('relation'))} />
              <Input label="CNIC" placeholder="35202-1234567-1" inputMode="numeric" {...register(path('cnic'))} error={fieldError(errors, path('cnic'))} />
              <Input label="Mobile" type="tel" placeholder="0300 1234567" {...register(path('phone'))} error={fieldError(errors, path('phone'))} />
            </div>
          </div>
        );
      })}
      {fields.length < MAX_GUARANTORS && (
        <Button variant="ghost" size="sm" icon={Plus} onClick={() => append(EMPTY_GUARANTOR)}>
          Add guarantor
        </Button>
      )}
    </fieldset>
  );
}
