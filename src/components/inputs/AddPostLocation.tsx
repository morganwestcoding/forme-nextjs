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
    control: (styles) => ({
      ...styles,
      backgroundColor: 'transparent',
      borderColor: 'white',
      color: 'white',
      boxShadow: 'none',
      padding: '8px',
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
      color: 'white',
    }),
    input: (styles) => ({
      ...styles,
      color: 'white',
    }),
    placeholder: (styles) => ({
      ...styles,
      color: 'white',
    }),
  
  };

  return (
    <div className="relative">
      <Select
        options={states}
        value={selectedState}
        onChange={handleStateChange}
        placeholder="Select State"
        styles={customStyles}
        getOptionLabel={(option) => option.label}
        getOptionValue={(option) => option.value}
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








