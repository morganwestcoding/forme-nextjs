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
      boxShadow: 'none',
      padding: '10px',
      borderRadius: '0.5rem', // rounded-lg
      '&:hover': {
        borderColor: '#e3e8ef',
      },
    }),
    option: (styles, { isFocused, isSelected }) => ({
      ...styles,
      backgroundColor: isFocused ? '#e2e8f0' : 'white',
      color: isFocused ? 'white' : '#a2a2a2',
      cursor: 'pointer',
      '&:hover': {
        backgroundColor: '#e2e8f0',
        color: 'white',
      },
    }),
    singleValue: (styles) => ({
      ...styles,
      color: '#a2a2a2',
    }),
    input: (styles) => ({
      ...styles,
      color: '#a2a2a2',
    }),
    placeholder: (styles) => ({
      ...styles,
      color: '#a2a2a2',
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