'use client';
import React, { useState } from 'react';
import Select, { StylesConfig } from 'react-select';
import useStates from '@/app/hooks/useStates';
import useCities from '@/app/hooks/useCities';

interface LocationSelection {
  label: string;
  value: string;
}

interface ListLocationSelectProps {
  onStateSelected: (selectedState: LocationSelection | null) => void;
  onCitySelected: (selectedCity: LocationSelection | null) => void;
}

const ListLocationSelect: React.FC<ListLocationSelectProps> = ({ onStateSelected, onCitySelected }) => {
  const [selectedCountry] = useState<string>('6252001'); // Correct country code for the United States
  const [selectedState, setSelectedState] = useState<LocationSelection | null>(null);

  const states = useStates(selectedCountry);
  const cities = useCities(selectedState?.value ?? '');

  const handleStateChange = (selectedOption: LocationSelection | null) => {
    setSelectedState(selectedOption);
    onStateSelected(selectedOption);
  };

  const handleCityChange = (selectedOption: LocationSelection | null) => {
    onCitySelected(selectedOption);
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
      <Select<LocationSelection>
        options={states}
        value={selectedState}
        onChange={handleStateChange}
        placeholder="Select State"
        styles={customStyles}
        getOptionLabel={(option) => option.label}
        getOptionValue={(option) => option.value}
      />
       </div>
      <Select<LocationSelection>
        options={cities}
        isDisabled={!selectedState}
        placeholder="Select City"
        onChange={handleCityChange}
        styles={customStyles}
        getOptionLabel={(option) => option.label}
        getOptionValue={(option) => option.value}
      />
     
    </div>
  );
};

export default ListLocationSelect;
