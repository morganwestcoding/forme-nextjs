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
          className="group p-4 rounded-xl border-2 border-dashed border-gray-200 bg-gray-50/50 text-left hover:border-gray-900 hover:bg-gray-100 transition-all duration-200"
        >
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-white border border-gray-200 flex items-center justify-center shadow-sm group-hover:border-gray-300 transition-all flex-shrink-0">
              <Plus className="w-4 h-4 text-gray-400 group-hover:text-gray-600 transition-colors" />
            </div>
            <div>
              <span className="text-sm font-semibold text-gray-500 group-hover:text-gray-700 transition-colors block">Add service</span>
              <span className="text-xs text-gray-400 block mt-0.5">Name, category &amp; price</span>
            </div>
          </div>
          <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100/60">
            <span className="text-base font-semibold text-gray-300">$0</span>
            <Plus className="w-4 h-4 text-gray-300" />
          </div>
        </motion.button>
      </div>

      <p className="text-sm text-gray-400 text-center mt-6">
        Optional — you can add services later
      </p>
    </div>
  );
}
