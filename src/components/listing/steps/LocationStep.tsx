'use client';

import { useFormContext } from 'react-hook-form';
import TypeformHeading from '@/components/registration/TypeformHeading';
import ListLocationSelect from '@/components/inputs/ListLocationSelect';
import { FieldErrors } from 'react-hook-form';

interface LocationStepProps {
  location: string;
  address: string;
  zipCode: string;
  onLocationChange: (location: string) => void;
  onAddressSelect: (data: { address: string; zipCode: string; city: string; state: string }) => void;
  onFieldChange: (fieldId: string) => void;
  errors: FieldErrors;
}

export default function LocationStep({
  location,
  address,
  zipCode,
  onLocationChange,
  onAddressSelect,
  onFieldChange,
  errors,
}: LocationStepProps) {
  const { register } = useFormContext();

  return (
    <div>
      <TypeformHeading
        question="Where is your business located?"
        subtitle="Help customers find you"
      />

      <ListLocationSelect
        id="location"
        initialLocation={null}
        initialAddress={null}
        initialZipCode={null}
        onLocationSubmit={(value) => onLocationChange(value ?? '')}
        onAddressSelect={onAddressSelect}
        onFieldChange={onFieldChange}
        register={register}
        errors={errors}
      />
    </div>
  );
}
