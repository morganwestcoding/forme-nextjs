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
  const [stateError, setStateError] = useState<boolean>(false);
  const [cityError, setCityError] = useState<boolean>(false);

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
    } else {
      onLocationSubmit(null);
    }

    setStateError(!selectedState);
    setCityError(!selectedCity);
  }, [selectedState, selectedCity, onLocationSubmit]);

  const handleStateChange = (selectedOption: LocationSelection | null) => {
    setSelectedState(selectedOption);
    setSelectedCity(null);
    setStateError(!selectedOption);
  };

  const handleCityChange = (selectedOption: LocationSelection | null) => {
    setSelectedCity(selectedOption);
    setCityError(!selectedOption);
  };

  const customStyles: StylesConfig<LocationSelection, false> = {
    control: (styles, { isFocused }) => ({
      ...styles,
      backgroundColor: 'transparent',
      borderColor: isFocused ? 'white' : (stateError || cityError ? '#ce3b55' : 'white'),
      color: 'white',
      boxShadow: 'none',
      minHeight: '60px',
      height: '60px',
      '&:hover': {
        borderColor: isFocused ? 'white' : (stateError || cityError ? '#E22F50' : 'white'),
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
      color: stateError || cityError ? '#ce3b55' : 'white',
      marginLeft: '0.5rem',
    }),
    valueContainer: (styles) => ({
      ...styles,
      height: '58px',
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
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
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
      {(stateError || cityError) && (
        <p className="text-red-500 text-sm mt-1">
          {stateError && cityError ? 'State and City are required' : 
           stateError ? 'State is required' : 'City is required'}
        </p>
      )}
    </div>
  );
};

export default ListLocationSelect;