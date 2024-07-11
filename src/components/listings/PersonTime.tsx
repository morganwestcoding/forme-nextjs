'use client';
import React, { useState } from 'react';
import Select, { StylesConfig } from 'react-select';

interface OptionType {
  label: string;
  value: string;
}

interface PersonTimeProps {
  time: string;
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
      borderColor: '#e3e8ef',
      color: 'white',
      boxShadow: 'none',
      padding: '10px',
      '&:hover': {
        borderColor: '#e3e8ef',
      },
    }),
    option: (styles, { isFocused, isSelected }) => ({
      ...styles,
      backgroundColor: isFocused ? 'grey' : 'white',
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
    <div style={{ display: 'flex', gap: '1rem' }}>
      <div style={{ flex: 1 }}>
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
      <div style={{ flex: 1 }}>
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