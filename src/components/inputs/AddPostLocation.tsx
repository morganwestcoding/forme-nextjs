'use client';
import React, { useState } from 'react';
import Select, { StylesConfig } from 'react-select';
import useStates from '@/app/hooks/useStates';
import useCities from '@/app/hooks/useCities';
import { SafeUser } from '@/app/types';

interface LocationSelection {
  label: string;
  value: string;
}

interface AddPostLocationProps {
  onLocationSubmit: (location: string | null) => void; // Update the type
}

const AddPostLocation: React.FC<AddPostLocationProps> = ({ onLocationSubmit }) => {
  const [selectedCountry] = useState<string>('6252001'); // Assuming United States for simplicity
  const [selectedState, setSelectedState] = useState<LocationSelection | null>(null);
  const [selectedCity, setSelectedCity] = useState<LocationSelection | null>(null);

  const states = useStates(selectedCountry);
  const cities = useCities(selectedState?.value ?? '');

  const handleStateChange = (selectedOption: LocationSelection | null) => {
    setSelectedState(selectedOption);
    setSelectedCity(null); // Reset city when state changes
  };

  const handleCityChange = (selectedOption: LocationSelection | null) => {
    setSelectedCity(selectedOption);
    // Combine state and city into a single string for location
    const location = selectedOption ? `${selectedOption.label}, ${selectedState?.label}` : null;
    onLocationSubmit(location);
  };

  const customStyles: StylesConfig<LocationSelection, false> = {
    menu: (styles) => ({
      ...styles,
      backgroundColor: 'rgba(0, 0, 0, 0.75)',
      backdropFilter: 'blur(8px)',
      borderRadius: '0.5rem',
      padding: '0.5rem',
      maxHeight: '250px', // This helps ensure consistent height with 5 items
    }),
    menuList: (styles) => ({
      ...styles,
      backgroundColor: 'transparent',
      padding: '0',
      maxHeight: '220px', // Approximately height for 5 items
      overflowY: 'auto',
      '&::-webkit-scrollbar': {
        width: '6px',
      },
      '&::-webkit-scrollbar-track': {
        background: 'transparent',
      },
      '&::-webkit-scrollbar-thumb': {
        background: 'rgba(255, 255, 255, 0.3)',
        borderRadius: '3px',
      },
      '&::-webkit-scrollbar-thumb:hover': {
        background: 'rgba(255, 255, 255, 0.5)',
      },
    }),
    option: (styles, { isFocused }) => ({
      ...styles,
      backgroundColor: isFocused ? 'rgba(128, 128, 128, 0.5)' : 'transparent',
      color: 'white',
      cursor: 'pointer',
      padding: '0.75rem',
      borderRadius: '0.375rem',
      '&:hover': {
        backgroundColor: 'rgba(128, 128, 128, 0.5)',
      }
    }),
    control: (styles) => ({
      ...styles,
      backgroundColor: 'transparent',
      borderColor: 'white',
      color: 'white',
      boxShadow: 'none',
      minHeight: '62px',
      height: '62px',
      '&:hover': {
        borderColor: 'white',
      },
      borderRadius: '0.4rem',
    }),
    singleValue: (styles) => ({
      ...styles,
      color: 'white',
      marginLeft: '0.5rem',
    }),
    input: (styles) => ({
      ...styles,
      color: 'white',
      marginLeft: '0.5rem',
    }),
    placeholder: (styles) => ({
      ...styles,
      color: 'white',
      marginLeft: '0.5rem',
    }),
    valueContainer: (styles) => ({
      ...styles,
      height: '58px',
      padding: '0 8px 0 0.5rem',
    }),
  };

  return (
    <div>
      <Select
        options={states}
        value={selectedState}
        onChange={handleStateChange}
        placeholder="Select State"
        styles={customStyles}
        getOptionLabel={(option) => option.label}
        getOptionValue={(option) => option.value}
        className='mb-3 w-full'
      />
      <Select
        options={cities}
        value={selectedCity}
        onChange={handleCityChange}
        placeholder="Select City"
        styles={customStyles}
        isDisabled={!selectedState}
        getOptionLabel={(option) => option.label}
        getOptionValue={(option) => option.value}
      />
    </div>
  );
};

export default AddPostLocation;








