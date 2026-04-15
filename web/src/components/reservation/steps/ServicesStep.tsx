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
                  ? 'border-stone-300 dark:border-stone-700 bg-stone-100 dark:bg-stone-800 shadow-[inset_0_2px_4px_rgba(0,0,0,0.1)]'
                  : 'border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 hover:border-stone-300 dark:border-stone-700 hover:bg-stone-50 dark:hover:bg-stone-800 dark:bg-stone-900'
                }
              `}
            >
              <span className="text-sm font-medium block truncate text-stone-900 dark:text-stone-100">
                {service.label.split(' - ')[0]}
              </span>
              <span className="text-xs mt-1 block text-stone-500 dark:text-stone-400 dark:text-stone-500">
                ${service.price}
              </span>
            </motion.button>
          );
        })}
      </div>

      {selectedServices.length > 0 && (
        <p className="text-sm text-stone-500 dark:text-stone-400 dark:text-stone-500 text-center mt-6">
          {selectedServices.length} service{selectedServices.length !== 1 ? 's' : ''} selected — ${totalPrice} total
        </p>
      )}
    </div>
  );
}
