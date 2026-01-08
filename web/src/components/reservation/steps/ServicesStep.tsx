'use client';

import { motion } from 'framer-motion';
import TypeformHeading from '@/components/registration/TypeformHeading';
import { itemVariants } from '@/components/registration/TypeformStep';

interface SelectedService {
  value: string;
  label: string;
  price: number;
}

interface ServicesStepProps {
  serviceOptions: SelectedService[];
  selectedServices: SelectedService[];
  onToggleService: (service: SelectedService) => void;
  totalPrice: number;
}

export default function ServicesStep({
  serviceOptions,
  selectedServices,
  onToggleService,
  totalPrice,
}: ServicesStepProps) {
  const isServiceSelected = (serviceValue: string) =>
    selectedServices.some(s => s.value === serviceValue);

  return (
    <div>
      <TypeformHeading
        question="Which services are you interested in?"
        subtitle="Choose one or more services to continue"
      />

      <div className="grid grid-cols-2 gap-3">
        {serviceOptions.map((service, index) => {
          const isSelected = isServiceSelected(service.value);
          return (
            <motion.button
              key={service.value}
              type="button"
              onClick={() => onToggleService(service)}
              variants={itemVariants}
              whileTap={{ scale: 0.97 }}
              className={`
                p-4 rounded-xl border text-left transition-all duration-200
                ${isSelected
                  ? 'border-gray-300 bg-gray-100 shadow-[inset_0_2px_4px_rgba(0,0,0,0.1)]'
                  : 'border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50'
                }
              `}
            >
              <span className="text-sm font-medium block truncate text-gray-900">
                {service.label.split(' - ')[0]}
              </span>
              <span className="text-xs mt-1 block text-gray-500">
                ${service.price}
              </span>
            </motion.button>
          );
        })}
      </div>

      {selectedServices.length > 0 && (
        <p className="text-sm text-gray-500 text-center mt-6">
          {selectedServices.length} service{selectedServices.length !== 1 ? 's' : ''} selected — ${totalPrice} total
        </p>
      )}
    </div>
  );
}
