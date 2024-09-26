'use client';

import React, { useState, useEffect } from 'react';
import Select, { StylesConfig } from 'react-select';
import useStates from '@/app/hooks/useStates';
import useCities from '@/app/hooks/useCities';
import Input from '../inputs/Input';
import { FieldValues, UseFormRegister, FieldErrors } from "react-hook-form";

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
  register: UseFormRegister<FieldValues>;
  errors: FieldErrors;
}

const ListLocationSelect: React.FC<ListLocationSelectProps> = ({ onLocationSubmit, register, errors }) => {
  const [selectedCountry] = useState<string>('6252001'); // USA
  const [selectedState, setSelectedState] = useState<LocationSelection | null>(null);
  const [selectedCity, setSelectedCity] = useState<LocationSelection | null>(null);

  const states = useStates(selectedCountry);
  const cities = useCities(selectedState?.value ?? '');

  useEffect(() => {
    const address = (document.getElementById('address') as HTMLInputElement)?.value;
    const zipCode = (document.getElementById('zipCode') as HTMLInputElement)?.value;

    if (selectedState && selectedCity && address && zipCode) {
      onLocationSubmit({
        state: selectedState.label,
        city: selectedCity.label,
        address,
        zipCode,
      });
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
      height: '48px',
      padding: '0 8px 0 0.5rem',
    }),
  };


  return (
    <div className="flex flex-col gap-3">
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