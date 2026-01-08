'use client';

import { motion } from 'framer-motion';
import TypeformHeading from '@/components/registration/TypeformHeading';
import { itemVariants } from '@/components/registration/TypeformStep';

interface SelectedEmployee {
  value: string;
  label: string;
}

interface EmployeeStepProps {
  employeeOptions: SelectedEmployee[];
  selectedEmployee: SelectedEmployee | null;
  onSelectEmployee: (employee: SelectedEmployee) => void;
}

export default function EmployeeStep({
  employeeOptions,
  selectedEmployee,
  onSelectEmployee,
}: EmployeeStepProps) {
  return (
    <div>
      <TypeformHeading
        question="Who would you like to book with?"
        subtitle="Select a professional"
      />

      <div className="grid grid-cols-2 gap-3">
        {employeeOptions.map((emp, index) => {
          const isSelected = selectedEmployee?.value === emp.value;
          return (
            <motion.button
              key={emp.value}
              type="button"
              onClick={() => onSelectEmployee(emp)}
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
                {emp.label}
              </span>
            </motion.button>
          );
        })}
      </div>

      {employeeOptions.length === 0 && (
        <div className="text-center py-10 bg-gray-50 rounded-xl border border-gray-200">
          <p className="text-sm text-gray-500">No professionals available</p>
        </div>
      )}
    </div>
  );
}
