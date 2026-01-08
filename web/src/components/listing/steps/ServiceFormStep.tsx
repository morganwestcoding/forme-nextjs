'use client';

import { ArrowLeft } from 'lucide-react';
import TypeformHeading from '@/components/registration/TypeformHeading';
import ServiceSelector, { Service } from '@/components/inputs/ServiceSelector';

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
          className="flex items-center gap-2 text-gray-500 hover:text-gray-900 transition-colors mb-4"
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
        <button
          type="button"
          onClick={onBack}
          className="w-full px-6 py-2.5 rounded-lg font-medium text-sm bg-gray-900 text-white hover:bg-gray-800 active:scale-[0.98] transition-all duration-200"
        >
          Save service
        </button>
      </div>
    </div>
  );
}
