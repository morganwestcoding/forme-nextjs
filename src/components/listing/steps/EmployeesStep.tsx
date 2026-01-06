'use client';

import TypeformHeading from '@/components/registration/TypeformHeading';
import EmployeeSelector from '@/components/inputs/EmployeeSelector';
import { Service } from '@/components/inputs/ServiceSelector';

interface EmployeeInput {
  userId: string;
  jobTitle?: string;
  serviceIds?: string[];
  user?: {
    id: string;
    name: string | null;
    email: string | null;
    image: string | null;
    imageSrc: string | null;
  };
}

interface EmployeesStepProps {
  employees: EmployeeInput[];
  onEmployeesChange: (employees: EmployeeInput[]) => void;
  services: Service[];
}

export default function EmployeesStep({
  employees,
  onEmployeesChange,
  services,
}: EmployeesStepProps) {
  const validServices = services
    .filter(s => s.id && s.serviceName?.trim())
    .map(s => ({
      id: s.id!,
      serviceName: s.serviceName!,
      price: s.price || 0,
      category: s.category || '',
    }));

  return (
    <div>
      <TypeformHeading
        question="Add your team members"
        subtitle="Who will be available for appointments?"
      />

      <EmployeeSelector
        onEmployeesChange={onEmployeesChange}
        existingEmployees={employees}
        services={validServices}
      />

      {employees.length === 0 && (
        <p className="text-sm text-gray-500 mt-4 text-center">
          No employees added yet. You can add team members or skip this step.
        </p>
      )}
    </div>
  );
}
