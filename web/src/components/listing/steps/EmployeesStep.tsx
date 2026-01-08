'use client';

import { motion } from 'framer-motion';
import TypeformHeading from '@/components/registration/TypeformHeading';
import { itemVariants } from '@/components/registration/TypeformStep';
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

      <motion.div variants={itemVariants}>
        <EmployeeSelector
          onEmployeesChange={onEmployeesChange}
          existingEmployees={employees}
          services={validServices}
        />
      </motion.div>

      {employees.length === 0 && (
        <p className="text-sm text-gray-400 text-center mt-6">
          Optional — you can add team members later
        </p>
      )}
    </div>
  );
}
