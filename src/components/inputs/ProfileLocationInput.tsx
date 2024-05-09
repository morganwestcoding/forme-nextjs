'use client';
import React, { useState } from 'react';
import Select, { StylesConfig } from 'react-select';
import useStates from '@/app/hooks/useStates';
import useCities from '@/app/hooks/useCities';

interface LocationSelection {
  label: string;
  value: string;
}

interface ProfileLocationInputProps {
  onLocationSubmit: (location: string | null) => void; // Update the type
}

const ProfileLocationInput: React.FC<ProfileLocationInputProps> = ({ onLocationSubmit }) => {
  const [selectedCountry] = useState<string>('6252001'); // Correct country code for the United States
  const [selectedState, setSelectedState] = useState<LocationSelection | null>(null);
  const [selectedCity, setSelectedCity] = useState<LocationSelection | null>(null);

  const states = useStates(selectedCountry);
  const cities = useCities(selectedState?.value ?? '');

  const handleStateChange = (selectedOption: LocationSelection | null) => {
    setSelectedState(selectedOption);
    setSelectedCity(null); // Reset city when state changes
    // Pass string value
  };

  const handleCityChange = (selectedOption: LocationSelection | null) => {

    setSelectedCity(selectedOption);
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
    <div>
      <div className='mb-3'>
        <Select
          options={states}
          value={selectedState}
          onChange={handleStateChange}
          placeholder="Select State"
          styles={customStyles}
          getOptionLabel={(option) => option.label}
          getOptionValue={(option) => option.value}
        />
      </div>
      <Select
        options={cities}
        value={selectedCity} // Updated to find the corresponding city object
        onChange={handleCityChange}
        placeholder="Select City"
        styles={customStyles}
        getOptionLabel={(option) => option.label}
        getOptionValue={(option) => option.value}
      />
    </div>
  );
};

export default ProfileLocationInput;

