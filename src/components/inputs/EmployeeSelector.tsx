'use client';

import React, { useState, useEffect } from 'react';

type EmployeeSelectorProps = {
  onEmployeesChange: (employees: string[]) => void;
  existingEmployees: string[];
  id?: string;
};

const EmployeeSelector: React.FC<EmployeeSelectorProps> = ({
  onEmployeesChange,
  existingEmployees,
  id,
}) => {
  const [employees, setEmployees] = useState<string[]>(existingEmployees ?? []);

  useEffect(() => {
    onEmployeesChange(employees);
  }, [employees, onEmployeesChange]);

  const handleInputChange = (index: number, value: string) => {
    setEmployees((prev) => {
      const next = [...prev];
      next[index] = value;
      return next;
    });
  };

  return (
    <div id={id} className="flex flex-col gap-3 -mt-4">
      {employees.map((employee, index) => (
        <div key={index} id={`employee-row-${index}`}>
          <div className="relative">
            <input
              type="text"
              id={`employee-input-${index}`}
              value={employee}
              onChange={(e) => handleInputChange(index, e.target.value)}
              placeholder=" "  // important for floating label (same as your Input)
              className={`
                peer
                w-full
                p-3
                pt-6
                bg-neutral-50
                border-neutral-300
                border
                rounded-lg
                outline-none
                transition
                text-black
                disabled:opacity-70
                disabled:cursor-not-allowed
                pl-4 pr-4
                focus:border-black
              `}
            />
            <label
              htmlFor={`employee-input-${index}`}
              className={`
                absolute
                text-sm
                duration-150
                transform
                -translate-y-3
                top-5
                left-4
                origin-[0]
                text-neutral-500
                peer-placeholder-shown:scale-100
                peer-placeholder-shown:translate-y-0
                peer-focus:scale-75
                peer-focus:-translate-y-4
              `}
            >
              Employee Name
            </label>
          </div>
        </div>
      ))}
    </div>
  );
};

export default EmployeeSelector;
