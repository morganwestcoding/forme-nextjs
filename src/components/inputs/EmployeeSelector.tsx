// components/inputs/EmployeeSelector.tsx
'use client';

import React, { useState, useEffect } from 'react';

type EmployeeSelectorProps = {
  onEmployeesChange: (employees: string[]) => void;
  existingEmployees: string[];
};

const EmployeeSelector: React.FC<EmployeeSelectorProps> = ({ onEmployeesChange, existingEmployees }) => {
  const [employees, setEmployees] = useState<string[]>(existingEmployees);

  useEffect(() => {
    onEmployeesChange(employees);
  }, [employees, onEmployeesChange]);

  const handleInputChange = (index: number, value: string) => {
    const updatedEmployees = [...employees];
    updatedEmployees[index] = value;
    setEmployees(updatedEmployees);
  };

  return (
    <div className="max-w-2xl">
      {employees.map((employee, index) => (
        <div key={index} className="mb-3">
          <div className="relative">
            <input
              type="text"
              id={`employee-${index}`}
              value={employee}
              onChange={(e) => handleInputChange(index, e.target.value)}
              className="
                peer
                w-full
                h-[60px]
                px-4
                pt-1
                font-light 
                bg-transparent
                border-white 
                border
                rounded-md
                outline-none
                transition
                disabled:opacity-70
                disabled:cursor-not-allowed
                text-white
                text-sm
              "
              placeholder=""
            />
            <label 
              htmlFor={`employee-${index}`}
              className={`
                absolute 
                text-sm
                duration-150 
                transform 
                -translate-y-3 
                top-5 
                z-10 
                origin-[0] 
                left-4
                peer-placeholder-shown:scale-100 
                peer-placeholder-shown:translate-y-0 
                peer-focus:scale-75
                peer-focus:-translate-y-4
                text-zinc-400
                ${employee ? 'scale-75 -translate-y-4' : ''}
              `}
            >
              Full Name
            </label>
          </div>
        </div>
      ))}
    </div>
  );
};

export default EmployeeSelector;