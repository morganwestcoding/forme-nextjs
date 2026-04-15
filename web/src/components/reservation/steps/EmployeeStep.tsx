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
                  ? 'border-stone-300 dark:border-stone-700 bg-stone-100 dark:bg-stone-800 shadow-[inset_0_2px_4px_rgba(0,0,0,0.1)]'
                  : 'border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 hover:border-stone-300 dark:border-stone-700 hover:bg-stone-50 dark:hover:bg-stone-800 dark:bg-stone-900'
                }
              `}
            >
              <span className="text-sm font-medium block truncate text-stone-900 dark:text-stone-100">
                {emp.label}
              </span>
            </motion.button>
          );
        })}
      </div>

      {employeeOptions.length === 0 && (
        <div className="text-center py-10 bg-stone-50 dark:bg-stone-900 rounded-xl border border-stone-200 dark:border-stone-800">
          <p className="text-sm text-stone-500 dark:text-stone-400 dark:text-stone-500">No professionals available</p>
        </div>
      )}
    </div>
  );
}
