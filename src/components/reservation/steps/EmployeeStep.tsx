'use client';

import TypeformHeading from '@/components/registration/TypeformHeading';

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
        {employeeOptions.map(emp => (
          <button
            key={emp.value}
            type="button"
            onClick={() => onSelectEmployee(emp)}
            className={`aspect-square p-4 rounded-xl border-2 transition-all duration-200 flex flex-col items-center justify-center text-center hover:shadow-md ${
              selectedEmployee?.value === emp.value
                ? 'border-gray-900 bg-gray-50 shadow-md'
                : 'border-gray-200 hover:border-gray-300 bg-white'
            }`}
          >
            <div className="flex flex-col items-center gap-3">
              <div className={`w-12 h-12 rounded-full flex items-center justify-center text-white font-semibold text-lg ${
                selectedEmployee?.value === emp.value ? 'bg-gray-900' : 'bg-gray-400'
              }`}>
                {emp.label.split(' ').map(n => n[0]).join('').toUpperCase()}
              </div>
              <span className={`text-sm font-medium text-center leading-tight ${
                selectedEmployee?.value === emp.value ? 'text-gray-900' : 'text-gray-900'
              }`}>
                {emp.label}
              </span>
            </div>
          </button>
        ))}
      </div>

      {employeeOptions.length === 0 && (
        <div className="text-center py-10 bg-gray-50 rounded-xl border border-gray-200">
          <p className="text-sm text-gray-500">No professionals available</p>
        </div>
      )}
    </div>
  );
}
