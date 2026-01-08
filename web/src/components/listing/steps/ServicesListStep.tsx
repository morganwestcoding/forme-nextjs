'use client';

import { motion } from 'framer-motion';
import TypeformHeading from '@/components/registration/TypeformHeading';
import { itemVariants } from '@/components/registration/TypeformStep';
import { Service } from '@/components/inputs/ServiceSelector';

interface ServicesListStepProps {
  services: Service[];
  onEditService: (index: number) => void;
  onAddService: () => void;
}

export default function ServicesListStep({
  services,
  onEditService,
  onAddService,
}: ServicesListStepProps) {
  const validServices = services.filter(
    s => (s.serviceName?.trim() || '') || s.category || s.price
  );

  return (
    <div>
      <TypeformHeading
        question="What services do you offer?"
        subtitle="Add services that customers can book"
      />

      <div className="grid grid-cols-2 gap-3">
        {validServices.map((s, i) => (
          <motion.button
            key={`svc-card-${s.id ?? i}`}
            type="button"
            onClick={() => onEditService(i)}
            variants={itemVariants}
            whileTap={{ scale: 0.98 }}
            className="p-4 rounded-xl border border-gray-200 bg-white text-left transition-all duration-200 hover:border-gray-300 hover:bg-gray-50"
          >
            <span className="text-sm font-medium block truncate text-gray-900">
              {s.serviceName || 'Untitled'}
            </span>
            {Number(s.price) > 0 && (
              <span className="text-xs mt-1 block text-gray-500">
                ${Number(s.price)}
              </span>
            )}
          </motion.button>
        ))}

        {/* Add Service tile */}
        <motion.button
          type="button"
          onClick={onAddService}
          variants={itemVariants}
          whileTap={{ scale: 0.98 }}
          className="p-4 rounded-xl border border-dashed border-gray-300 bg-gray-50 text-left transition-all duration-200 hover:border-gray-400 hover:bg-gray-100"
        >
          <span className="text-sm font-medium block text-gray-500">
            + Add service
          </span>
        </motion.button>
      </div>

      {validServices.length === 0 && (
        <p className="text-sm text-gray-400 text-center mt-6">
          Optional — you can add services later
        </p>
      )}
    </div>
  );
}
