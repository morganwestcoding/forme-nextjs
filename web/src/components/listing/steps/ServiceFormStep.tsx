'use client';

import TypeformHeading from '@/components/registration/TypeformHeading';
import ServiceSelector, { Service } from '@/components/inputs/ServiceSelector';
import { ArrowLeft01Icon as ArrowLeft } from 'hugeicons-react';
import Button from '@/components/ui/Button';

interface ServiceFormStepProps {
  services: Service[];
  setServices: React.Dispatch<React.SetStateAction<Service[]>>;
  editingIndex: number | null;
  onBack: () => void;
}

export default function ServiceFormStep({
  services,
  setServices,
  editingIndex,
  onBack,
}: ServiceFormStepProps) {
  return (
    <div>
      <div className="mb-6">
        <button
          type="button"
          onClick={onBack}
          className="flex items-center gap-2 text-stone-500   hover:text-stone-900 dark:hover:text-stone-100 dark:text-stone-100 transition-colors mb-4"
        >
          <ArrowLeft className="w-4 h-4" />
          <span className="text-sm">Back to services</span>
        </button>
      </div>

      <TypeformHeading
        question={editingIndex !== null && editingIndex < services.length ? "Edit service" : "Add a service"}
        subtitle="Set the name, price, and category"
      />

      <ServiceSelector
        id="service-selector"
        onServicesChange={setServices}
        existingServices={services}
        singleIndex={editingIndex ?? undefined}
      />

      <div className="mt-6">
        <Button type="button" onClick={onBack} fullWidth>
          Save service
        </Button>
      </div>
    </div>
  );
}
