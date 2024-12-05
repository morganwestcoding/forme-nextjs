'use client';

import React, { useState } from 'react';
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
  id?: string;
}

const ListLocationSelect: React.FC<ListLocationSelectProps> = ({ 
  onLocationSubmit, 
  register, 
  errors,
  id
}) => {
  const [selectedCountry] = useState<string>('6252001');
  const [selectedState, setSelectedState] = useState<LocationSelection | null>(null);
  const [selectedCity, setSelectedCity] = useState<LocationSelection | null>(null);

  const states = useStates(selectedCountry);
  const cities = useCities(selectedState?.value ?? '');

  const handleStateChange = (selectedOption: LocationSelection | null) => {
    setSelectedState(selectedOption);
    updateLocation(selectedOption, selectedCity);
  };

  const handleCityChange = (selectedOption: LocationSelection | null) => {
    setSelectedCity(selectedOption);
    updateLocation(selectedState, selectedOption);
  };

  const updateLocation = (state: LocationSelection | null, city: LocationSelection | null) => {
    const address = (document.getElementById('address') as HTMLInputElement)?.value;
    const zipCode = (document.getElementById('zipCode') as HTMLInputElement)?.value;

    if (state && city && address && zipCode) {
      onLocationSubmit({
        state: state.label,
        city: city.label,
        address,
        zipCode,
      });
    }
  };

  const handleInputChange = () => {
    updateLocation(selectedState, selectedCity);
  };

  const customStyles: StylesConfig<LocationSelection, false> = {
    menu: (styles) => ({
      ...styles,
      backgroundColor: 'rgba(0, 0, 0, 0.75)',
      backdropFilter: 'blur(8px)',
      borderRadius: '0.5rem',
      padding: '0.5rem',
      maxHeight: '250px',
    }),
    menuList: (styles) => ({
      ...styles,
      backgroundColor: 'transparent',
      padding: '0',
      maxHeight: '220px',
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
      color: '#a2a2a2',
      marginLeft: '0.5rem',
    }),
    valueContainer: (styles) => ({
      ...styles,
      height: '58px',
      padding: '0 8px 0 0.5rem',
    }),
  };

  return (
    <div id={id} className="flex flex-col gap-3 text-sm">
      <Input
        id="address"
        label="Street"
        register={register}
        errors={errors}
        required
        onChange={handleInputChange}
      />
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm rounded-2xl">
        <Select
          id="state-select"
          options={states}
          value={selectedState}
          onChange={handleStateChange}
          placeholder="State"
          styles={customStyles}
          getOptionLabel={(option) => option.label}
          getOptionValue={(option) => option.value}
          className='text-sm rounded-2xl'
        />
        <Select
          id="city-select"
          options={cities}
          value={selectedCity}
          onChange={handleCityChange}
          placeholder="City"
          styles={customStyles}
          getOptionLabel={(option) => option.label}
          getOptionValue={(option) => option.value}
          isDisabled={!selectedState}
          className='text-sm rounded-2xl'
        />
        <Input
          id="zipCode"
          label="ZIP Code"
          register={register}
          errors={errors}
          required
          onChange={handleInputChange}
        />
      </div>
    </div>
  );
};

export default ListLocationSelect;