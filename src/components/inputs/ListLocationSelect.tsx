'use client';

import React, { useState } from 'react';
import Select from 'react-select';
import useStates from '@/app/hooks/useStates';
import useCities from '@/app/hooks/useCities';
import Input from '../inputs/Input';
import { FieldValues, UseFormRegister, FieldErrors } from "react-hook-form";
import MapComponent from '../MapComponent';
import AddressAutocomplete from './AddressAutocomplete';

interface LocationSelection {
  label: string;
  value: string;
}

interface ListLocationInputProps {
  onLocationSubmit: (location: {
    state: string;
    city: string;
    address: string;
    zipCode: string;
    coordinates?: {
      lat: number;
      lng: number;
    };
  } | null) => void;
  register: UseFormRegister<FieldValues>;
  errors: FieldErrors;
  id?: string;
}

const ListLocationInput: React.FC<ListLocationInputProps> = ({ 
  onLocationSubmit, 
  register, 
  errors,
  id
}) => {
  const [selectedCountry] = useState<string>('6252001');
  const [selectedState, setSelectedState] = useState<LocationSelection | null>(null);
  const [selectedCity, setSelectedCity] = useState<LocationSelection | null>(null);
  const [coordinates, setCoordinates] = useState<{lat: number; lng: number} | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const { states, loading: statesLoading } = useStates(selectedCountry);
  const { cities, loading: citiesLoading } = useCities(selectedState?.value ?? '');

  const handleAddressSelect = (addressData: {
    address: string;
    city: string;
    state: string;
    zipCode: string;
    coordinates: {
      lat: number;
      lng: number;
    };
  }) => {
    const stateOption = states.find(s => s.label === addressData.state);
    if (stateOption) {
      setSelectedState(stateOption);
      const cityOption: LocationSelection = {
        label: addressData.city,
        value: addressData.city
      };
      setSelectedCity(cityOption);
    }
  
    setCoordinates(addressData.coordinates);
  
    const zipInput = document.getElementById('zipCode') as HTMLInputElement;
    if (zipInput) {
      zipInput.value = addressData.zipCode;
    }
  
    onLocationSubmit({
      address: addressData.address,
      city: addressData.city,
      state: addressData.state,
      zipCode: addressData.zipCode,
      coordinates: addressData.coordinates
    });
  };

  const baseSelectClasses = {
    option: (state: any) => `
      !py-4 !px-4 !cursor-pointer
      ${state.isFocused ? '!bg-neutral-100' : '!bg-white'}
      ${state.isSelected ? '!bg-neutral-200 !text-black' : ''}
      !text-black hover:!text-neutral-500
      !font-normal!  
    `,
    dropdownIndicator: () => `
      !flex !items-center !pb-3 !px-4
    `,
    indicatorSeparator: () => `!hidden`,
    singleValue: () => '!text-black',
    input: () => '!text-neutral-500 !font-normal!',
    placeholder: () => '!text-neutral-500 !text-sm !font-normal', 
    menu: () => '!bg-white !rounded-sm !shadow-md !mt-1 !z-[9999]',
    menuList: () => '!p-0',
    valueContainer: () => '!p-0.5',
    container: () => '!relative !w-full'
  };

  return (
    <div id={id} className="flex flex-col gap-3 text-sm -mt-4">
      <AddressAutocomplete
        id="address"
        label="Street Address"
        register={register}
        required
        disabled={isLoading}
        onAddressSelect={handleAddressSelect}
        errors={errors}
      />
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
        <div className="relative">
          <Select
            id="state-select"
            options={states}
            value={selectedState}
            isSearchable={false} 
            onChange={(option) => setSelectedState(option)}
            classNames={{
              ...baseSelectClasses,
              control: (state: any) => `
                !w-full !pl-3 !pb-1 !pt-3
                !bg-white !border !border-neutral-300
                !rounded-lg !outline-none !transition
                !ring-0 !outline-0 !box-shadow-none
                ${state.isFocused ? '!border-black' : '!border-neutral-500'}
                ${errors['state'] ? '!border-rose-500' : ''}
              `
            }}
            placeholder=" "
          />
          <label className={`
            absolute 
            left-4
            text-sm
            duration-150 
            transform 
            top-5 
            origin-[0] 
            text-neutral-500
            ${selectedState ? 'scale-100 -translate-y-3' : 'translate-y-0'}
          `}>
            State
          </label>
        </div>

        <div className="relative">
          <Select
            id="city-select"
            options={cities}
            value={selectedCity}
            isSearchable={false} 
            onChange={(option) => setSelectedCity(option)}
            classNames={{
              ...baseSelectClasses,
              control: (state: any) => `
                !w-full !pl-3 !pb-1 !pt-3
                 !bg-white !border !border-neutral-300
                !rounded-lg !outline-none !transition
                !ring-0 !outline-0 !box-shadow-none
                ${state.isFocused ? '!border-black' : '!border-neutral-500'}
                ${errors['city'] ? '!border-rose-500' : ''}
              `
            }}
            placeholder=" "
          />
          <label className={`
            absolute 
            text-sm
            duration-150 
            transform 
            top-5 
            left-4
            origin-[0] 
            text-neutral-500
            ${selectedCity ? 'scale-100 -translate-y-3' : 'translate-y-0'}
          `}>
            City
          </label>
        </div>

        <Input
          id="zipCode"
          label="ZIP Code"
          register={register}
          errors={errors}
          required
        />
      </div>

      <div className="mt-4">
        <MapComponent 
          coordinates={coordinates || { lat: 34.0522, lng: -118.2437 }}
          zoom={coordinates ? 15 : 10}
        />
      </div>
    </div>
  );
};

export default ListLocationInput;