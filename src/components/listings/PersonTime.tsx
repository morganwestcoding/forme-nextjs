'use client';
import React, { useState } from 'react';
import Select, { StylesConfig } from 'react-select';

interface OptionType {
  label: string;
  value: string;
}

interface PersonTimeProps {
time: string; // This represents the currently selected time
  onTimeChange: (time: string) => void; 
}

const PersonTime: React.FC<PersonTimeProps> = ({ onTimeChange }) => {
  const [selectedEmployee, setSelectedEmployee] = useState<OptionType | null>(null);
  const [selectedTime, setSelectedTime] = useState<OptionType | null>(null);

  const employees = [
    { label: 'Employee 1', value: '1' },
    { label: 'Employee 2', value: '2' },
    { label: 'Employee 3', value: '3' }
  ];

  const times = Array.from({length: 13}, (_, i) => ({
    label: `${8 + i}:00 ${8 + i < 12 ? 'AM' : 'PM'}`,
    value: `${8 + i}:00`
  }));

  const customStyles: StylesConfig<OptionType, false> = {
    control: (styles) => ({
      ...styles,
      backgroundColor: 'transparent',
    
      color: 'white',
      boxShadow: 'none',
      padding: '10px',
      '&:hover': {
        borderColor: 'white',
      },
    }),
    option: (styles, { isFocused, isSelected }) => ({
      ...styles,
      backgroundColor: isFocused ? 'grey' : 'black',
      color: 'white',
      cursor: 'pointer',
    }),
    singleValue: (styles) => ({
      ...styles,
     
    }),
    input: (styles) => ({
      ...styles,
     
    }),
    placeholder: (styles) => ({
      ...styles,
     
    }),
  };

  const handleEmployeeChange = (selectedOption: OptionType | null) => {
    setSelectedEmployee(selectedOption);
  };

  const handleTimeChange = (selectedOption: OptionType | null) => {
    setSelectedTime(selectedOption);
    if (selectedOption) {
      onTimeChange(selectedOption.value);
    }
  };

  return (
    <div className="flex justify-between">
      <div className="w-1/2 pr-2 ml-4 mt-4">
        <Select
          options={employees}
          value={selectedEmployee}
          onChange={handleEmployeeChange}
          placeholder="Select Employee"
          styles={customStyles}
          getOptionLabel={(option) => option.label}
          getOptionValue={(option) => option.value}
        />
      </div>
      <div className="w-1/2 pl-2 mr-4 mt-4">
        <Select
          options={times}
          value={selectedTime}
          onChange={handleTimeChange}
          placeholder="Select Time Slot"
          styles={customStyles}
          getOptionLabel={(option) => option.label}
          getOptionValue={(option) => option.value}
        />
      </div>
    </div>
  );
};

export default PersonTime;
