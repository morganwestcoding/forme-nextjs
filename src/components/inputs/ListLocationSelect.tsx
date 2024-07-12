'use client';

import React, { useState, useEffect } from 'react';
import Select, { StylesConfig } from 'react-select';
import useStates from '@/app/hooks/useStates';
import useCities from '@/app/hooks/useCities';

interface LocationSelection {
  label: string;
  value: string;
}

interface ListLocationSelectProps {
  onLocationSubmit: (location: string | null) => void;
}

const ListLocationSelect: React.FC<ListLocationSelectProps> = ({ onLocationSubmit }) => {
  const [selectedCountry] = useState<string>('6252001'); // USA
  const [selectedState, setSelectedState] = useState<LocationSelection | null>(null);
  const [selectedCity, setSelectedCity] = useState<LocationSelection | null>(null);

  const states = useStates(selectedCountry);
  const cities = useCities(selectedState?.value ?? '');

  useEffect(() => {
    if (selectedState && selectedCity) {
      const location = `${selectedCity.label}, ${selectedState.label}`;
      onLocationSubmit(location);
    } else {
      onLocationSubmit(null);
    }
  }, [selectedState, selectedCity, onLocationSubmit]);

  const handleStateChange = (selectedOption: LocationSelection | null) => {
    setSelectedState(selectedOption);
    setSelectedCity(null); // Reset city when state changes
  };

  const handleCityChange = (selectedOption: LocationSelection | null) => {
    setSelectedCity(selectedOption);
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
        value={selectedCity}
        onChange={handleCityChange}
        placeholder="Select City"
        styles={customStyles}
        getOptionLabel={(option) => option.label}
        getOptionValue={(option) => option.value}
        isDisabled={!selectedState}
      />
    </div>
  );
};

export default ListLocationSelect;