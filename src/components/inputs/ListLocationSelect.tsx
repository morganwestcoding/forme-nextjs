'use client';

import React, { useState, useEffect } from 'react';
import Select, { StylesConfig } from 'react-select';
import useStates from '@/app/hooks/useStates';
import useCities from '@/app/hooks/useCities';
import Input from '../inputs/Input';

interface LocationSelection {
  label: string;
  value: string;
}

interface ListLocationSelectProps {
  onLocationSubmit: (location: {
    state: string;
    city: string;
    address: string;
    zipCode: string;
  } | null) => void;
  register: any;
  errors: any;
}

const ListLocationSelect: React.FC<ListLocationSelectProps> = ({ onLocationSubmit, register, errors }) => {
  const [selectedCountry] = useState<string>('6252001'); // USA
  const [selectedState, setSelectedState] = useState<LocationSelection | null>(null);
  const [selectedCity, setSelectedCity] = useState<LocationSelection | null>(null);

  const states = useStates(selectedCountry);
  const cities = useCities(selectedState?.value ?? '');

  useEffect(() => {
    if (selectedState && selectedCity) {
      onLocationSubmit({
        state: selectedState.label,
        city: selectedCity.label,
        address: '', // This will be updated when the user types in the address
        zipCode: '', // This will be updated when the user types in the ZIP code
      });
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
      minHeight: '25px',
      height: '60px',
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
      marginLeft: '0.5rem', // Add this line
    }),
    input: (styles) => ({
      ...styles,
      color: 'white',
      marginLeft: '0.5rem', // Add this line
    }),
    placeholder: (styles) => ({
      ...styles,
      color: 'white',
      marginLeft: '0.5rem', // Add this line
    }),
    valueContainer: (styles) => ({
      ...styles,
      height: '48px',
      padding: '0 8px 0 0.5rem', // Modify this line
    }),
  };

  return (
    <div className="flex flex-col gap-4">
      <Input
        id="address"
        label="Street"
        register={register}
        errors={errors}
        required
        height='60px'
        className='text-center text-sm'
      />
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        
        <Select
          options={cities}
          value={selectedCity}
          onChange={handleCityChange}
          placeholder="City"
          styles={customStyles}
          getOptionLabel={(option) => option.label}
          getOptionValue={(option) => option.value}
          isDisabled={!selectedState}
          className='text-sm'
        />
        <Select
          options={states}
          value={selectedState}
          onChange={handleStateChange}
          placeholder="State"
          styles={customStyles}
          getOptionLabel={(option) => option.label}
          getOptionValue={(option) => option.value}
          className='text-sm'
        />
        <Input
          id="zipCode"
          label="ZIP Code"
          register={register}
          errors={errors}
          required
          height='60px'
          className='text-center text-sm'
        />
      </div>
    </div>
  );
};

export default ListLocationSelect;