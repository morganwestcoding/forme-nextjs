'use client';
import React, { useState, useEffect } from 'react';
import Select, { StylesConfig } from 'react-select';
import useStates from '@/app/hooks/useStates';
import useCities from '@/app/hooks/useCities';
import { SafeUser } from '@/app/types';

interface LocationSelection {
  label: string;
  value: string;
}

interface AddPostLocationProps {
  currentUser: SafeUser | null;
  onLocationSubmit: (location: LocationSelection | null) => void;
}

const AddPostLocation: React.FC<AddPostLocationProps> = ({ currentUser, onLocationSubmit }) => {
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
    onLocationSubmit(selectedOption);
  };

  const customStyles: StylesConfig<LocationSelection, false> = {
    control: (styles) => ({
      ...styles,
      backgroundColor: 'white',
      borderColor: 'gray',
      color: 'black',
      boxShadow: 'none',
      padding: '8px',
      '&:hover': {
        borderColor: 'gray',
      },
    }),
    option: (styles, { isFocused, isSelected }) => ({
      ...styles,
      backgroundColor: isFocused ? 'lightgray' : 'white',
      color: 'black',
      cursor: 'pointer',
    }),
    singleValue: (styles) => ({
      ...styles,
      color: 'black',
    }),
    input: (styles) => ({
      ...styles,
      color: 'black',
    }),
    placeholder: (styles) => ({
      ...styles,
      color: 'gray',
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
