'use client';

import React, { useState } from 'react';
import Select from 'react-select';
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

  const { states, loading: statesLoading } = useStates(selectedCountry);
  const { cities, loading: citiesLoading } = useCities(selectedState?.value ?? '');

  const stateOptions: LocationSelection[] = states.map(state => ({
    label: state.label,
    value: state.value
  }));

  const cityOptions: LocationSelection[] = cities.map(city => ({
    label: city.label,
    value: city.value
  }));

  const handleStateChange = (selectedOption: LocationSelection | null) => {
    setSelectedState(selectedOption);
    setSelectedCity(null);
    updateLocation(selectedOption, null);
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

  const selectClasses = {
    control: (state: any) => `
      !w-full !p-2.5 !pt-2.5
      !bg-slate-50 !border !border-neutral-500
      !rounded-md !outline-none !transition
      ${state.isFocused ? '!border-black' : '!border-neutral-500'}
    `,
    option: (state: any) => `
      !py-4 !px-4 !cursor-pointer
      ${state.isFocused ? '!bg-neutral-100' : '!bg-white'}
      ${state.isSelected ? '!bg-neutral-200 !text-black' : ''}
      !text-black hover:!text-neutral-500
      !font-normal
    `,
    singleValue: () => '!text-black',
    input: () => '!text-neutral-500 !font-normal',
    placeholder: () => '!text-neutral-500 !text-sm !font-normal', 
    menu: () => '!bg-white !rounded-md !border !border-neutral-200 !shadow-md !mt-1',
    menuList: () => '!p-0',
    valueContainer: () => '!p-0',
    container: (state: any) => `
      !relative !w-full
      ${state.isFocused ? 'peer-focus:border-black' : ''}
    `
  };

  return (
    <div id={id} className="flex flex-col gap-3 text-sm -mt-4">
      <Input
        id="address"
        label="Street"
        register={register}
        errors={errors}
        required
        onChange={handleInputChange}
      />
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
        <div className="relative">
          <Select
            id="state-select"
            options={stateOptions}
            value={selectedState}
            onChange={handleStateChange}
            placeholder=" "
            classNames={selectClasses}
            isLoading={statesLoading}
            getOptionLabel={(option) => option.label}
            getOptionValue={(option) => option.value}
            noOptionsMessage={() => "No states found"}
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
            ${selectedState ? 'scale-100 -translate-y-3' : 'translate-y-0'}
          `}>
            State
          </label>
        </div>

        <div className="relative">
          <Select
            id="city-select"
            options={cityOptions}
            value={selectedCity}
            onChange={handleCityChange}
            placeholder=" "
            classNames={selectClasses}
            isLoading={citiesLoading}
            getOptionLabel={(option) => option.label}
            getOptionValue={(option) => option.value}
            isDisabled={!selectedState}
            noOptionsMessage={() => selectedState ? "No cities found" : "Please select a state first"}
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
          onChange={handleInputChange}
        />
      </div>
    </div>
  );
};

export default ListLocationSelect;