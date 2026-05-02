'use client';

import { motion } from 'framer-motion';

import TypeformHeading from '../TypeformHeading';
import { itemVariants } from '../TypeformStep';
import { Service } from '@/components/inputs/ServiceSelector';
import { PlusSignIcon as Plus, PencilEdit01Icon as Edit3 } from 'hugeicons-react';

interface ServicesListStepProps {
  services: Service[];
  onEditService: (index: number) => void;
  onAddService: () => void;
}

export default function ServicesListStep({ services, onEditService, onAddService }: ServicesListStepProps) {
  const validServices = services.filter(
    s => (s.serviceName?.trim() || '') || s.category || s.price
  );

  return (
    <div>
      <TypeformHeading
        question="Add your services"
        subtitle="List what you offer so clients can book with you"
      />

      <div className="grid grid-cols-2 gap-3">
        {validServices.map((service, index) => (
          <motion.button
            key={`svc-${service.id ?? index}`}
            type="button"
            onClick={() => onEditService(index)}
            variants={itemVariants}
            whileHover={{ y: -2 }}
            whileTap={{ scale: 0.98 }}
            className="group relative p-4 rounded-xl bg-white dark:bg-stone-900 border-2 border-stone-200  text-left hover:border-stone-300 dark:border-stone-700 transition-all duration-200"
          >
            <span className="text-sm font-semibold text-stone-900 dark:text-stone-100 truncate block">
              {service.serviceName || 'Untitled'}
            </span>
            <span className="text-xs text-stone-500  dark:text-stone-500 truncate block mt-0.5">
              {service.category || 'No category'}
            </span>
            <div className="flex items-center justify-between mt-3 pt-3 border-t border-stone-100 dark:border-stone-800">
              <span className="text-base font-semibold text-stone-900 dark:text-stone-100">
                ${Number(service.price) || 0}
              </span>
              <Edit3 className="w-4 h-4 text-stone-400  group-hover:text-stone-600 dark:text-stone-300 transition-colors" />
            </div>
          </motion.button>
        ))}

        <motion.button
          type="button"
          onClick={onAddService}
          variants={itemVariants}
          whileHover={{ y: -2 }}
          whileTap={{ scale: 0.98 }}
          className="group p-4 rounded-xl border-2 border-dashed border-stone-200 dark:border-stone-800 bg-stone-50/50 text-left hover:border-stone-900 hover:bg-stone-100 dark:hover:bg-stone-800 dark:bg-stone-800 transition-all duration-200"
        >
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-white dark:bg-stone-900 border border-stone-200  flex items-center justify-center shadow-elevation-1 group-hover:border-stone-300 dark:border-stone-700 transition-all flex-shrink-0">
              <Plus className="w-4 h-4 text-stone-400  group-hover:text-stone-600 dark:text-stone-300 transition-colors" />
            </div>
            <div>
              <span className="text-sm font-semibold text-stone-500   group-hover:text-stone-700 dark:hover:text-stone-300 dark:text-stone-200 transition-colors block">Add service</span>
              <span className="text-xs text-stone-400 dark:text-stone-500 block mt-0.5">Name, category &amp; price</span>
            </div>
          </div>
          <div className="flex items-center justify-between mt-3 pt-3 border-t border-stone-100/60">
            <span className="text-base font-semibold text-stone-300">$0</span>
            <Plus className="w-4 h-4 text-stone-300" />
          </div>
        </motion.button>
      </div>

      <p className="text-sm text-stone-400 dark:text-stone-500 text-center mt-6">
        Optional — you can add services later
      </p>
    </div>
  );
}
