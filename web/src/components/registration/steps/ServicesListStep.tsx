'use client';

import { motion } from 'framer-motion';
import { Plus, Edit3 } from 'lucide-react';
import TypeformHeading from '../TypeformHeading';
import { itemVariants } from '../TypeformStep';
import { Service } from '@/components/inputs/ServiceSelector';

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
            className="group relative p-4 rounded-xl bg-white border-2 border-gray-200 text-left hover:border-gray-300 transition-all duration-200"
          >
            <span className="text-sm font-semibold text-gray-900 truncate block">
              {service.serviceName || 'Untitled'}
            </span>
            <span className="text-xs text-gray-500 truncate block mt-0.5">
              {service.category || 'No category'}
            </span>
            <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100">
              <span className="text-base font-semibold text-gray-900">
                ${Number(service.price) || 0}
              </span>
              <Edit3 className="w-4 h-4 text-gray-400 group-hover:text-gray-600 transition-colors" />
            </div>
          </motion.button>
        ))}

        <motion.button
          type="button"
          onClick={onAddService}
          variants={itemVariants}
          whileHover={{ y: -2 }}
          whileTap={{ scale: 0.98 }}
          className="flex flex-col items-center justify-center p-4 rounded-xl border-2 border-dashed border-gray-200 bg-gray-50/50 text-center hover:border-gray-900 hover:bg-gray-100 transition-all duration-200 min-h-[106px]"
        >
          <div className="w-10 h-10 rounded-full bg-white border border-gray-200 flex items-center justify-center mb-2 shadow-sm">
            <Plus className="w-5 h-5 text-gray-400" />
          </div>
          <span className="text-sm font-medium text-gray-600">Add service</span>
        </motion.button>
      </div>

      <p className="text-sm text-gray-400 text-center mt-6">
        Optional — you can add services later
      </p>
    </div>
  );
}
