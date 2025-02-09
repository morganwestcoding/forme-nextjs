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
  id 
}) => {
  const [employees, setEmployees] = useState<string[]>(existingEmployees);
  const [focusedInputs, setFocusedInputs] = useState<boolean[]>(existingEmployees.map(() => false));

  useEffect(() => {
    onEmployeesChange(employees);
  }, [employees, onEmployeesChange]);

  const handleInputChange = (index: number, value: string) => {
    const updatedEmployees = [...employees];
    updatedEmployees[index] = value;
    setEmployees(updatedEmployees);
  };

  const handleFocus = (index: number) => {
    const newFocusedInputs = [...focusedInputs];
    newFocusedInputs[index] = true;
    setFocusedInputs(newFocusedInputs);
  };

  const handleBlur = (index: number) => {
    const newFocusedInputs = [...focusedInputs];
    newFocusedInputs[index] = false;
    setFocusedInputs(newFocusedInputs);
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
              onFocus={() => handleFocus(index)}
              onBlur={() => handleBlur(index)}
              className="
                peer
                w-full 
                p-3 
                pt-3.5
                font-light 
                bg-slate-50 
                border-neutral-500
                border
                rounded-md
                outline-none
                transition
                disabled:opacity-70
                disabled:cursor-not-allowed
                text-black
                h-[60px]
              "
              placeholder=" "
            />
            <label 
              htmlFor={`employee-input-${index}`}
              className={`
                absolute 
                text-sm
                duration-150 
                transform 
                top-5 
                left-4
                origin-[0] 
                text-neutral-500
                ${employee || focusedInputs[index] ? 'scale-100 -translate-y-3' : 'translate-y-0'}
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