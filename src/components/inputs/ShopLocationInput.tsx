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

interface ShopLocationInputProps {
  onLocationSubmit: (location: {
    state: string;
    city: string;
    address: string;
    zipCode: string;
    isOnlineOnly: boolean;
    coordinates?: {
      lat: number;
      lng: number;
    };
  } | null) => void;
  register: UseFormRegister<FieldValues>;
  errors: FieldErrors;
  id?: string;
  isOnlineOnly?: boolean;
  onIsOnlineOnlyChange: (isOnline: boolean) => void;
}

const ShopLocationInput: React.FC<ShopLocationInputProps> = ({ 
  onLocationSubmit, 
  register, 
  errors,
  id,
  isOnlineOnly = false,
  onIsOnlineOnlyChange
}) => {
  const [selectedCountry] = useState<string>('6252001');
  const [selectedState, setSelectedState] = useState<LocationSelection | null>(null);
  const [selectedCity, setSelectedCity] = useState<LocationSelection | null>(null);
  const [coordinates, setCoordinates] = useState<{lat: number; lng: number} | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isOnline, setIsOnline] = useState<boolean>(isOnlineOnly);

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
      isOnlineOnly: isOnline,
      coordinates: addressData.coordinates
    });
  };

  const handleOnlineToggle = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.checked;
    setIsOnline(newValue);
    onIsOnlineOnlyChange(newValue);
    
    // If switching to online only, clear location data
    if (newValue) {
      setSelectedState(null);
      setSelectedCity(null);
      setCoordinates(null);
      onLocationSubmit({
        address: '',
        city: '',
        state: '',
        zipCode: '',
        isOnlineOnly: true
      });
    }
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
    menu: () => '!bg-neutral-50 !rounded-sm !shadow-md !mt-1 !z-[9999]',
    menuList: () => '!p-0',
    valueContainer: () => '!p-0.5',
    container: () => '!relative !w-full'
  };

  return (
    <div id={id} className="flex flex-col gap-4 text-sm -mt-4">
      {/* Online Shop Toggle */}
      <div className="flex items-center py-5 px-4 bg-neutral-50 rounded-lg border border-neutral-200">
        <div className="flex items-center">
          <input
            type="checkbox"
            id="online-shop"
            checked={isOnline}
            onChange={handleOnlineToggle}
            className="w-5 h-5 text-green-600 rounded border-gray-300 focus:ring-green-500"
          />
          <label htmlFor="online-shop" className="ml-2 text-neutral-800 font-medium">
            This is an online-only shop
          </label>
        </div>
        <div className="ml-3 text-sm text-neutral-500">
          No physical address required
        </div>
      </div>

      {/* Physical Location Fields - only show if not online-only */}
      {!isOnline && (
        <>
          <AddressAutocomplete
            id="address"
            label="Street Address"
            register={register}
            required={!isOnline}
            disabled={isLoading || isOnline}
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
                isDisabled={isOnline}
                classNames={{
                  ...baseSelectClasses,
                  control: (state: any) => `
                    !w-full !pl-3 !pb-1 !pt-3
                    !bg-neutral-50 !border !border-neutral-200
                    !rounded-lg !outline-none !transition
                    !ring-0 !outline-0 !box-shadow-none
                    ${state.isFocused ? '!border-black' : '!border-neutral-200'}
                    ${errors['state'] ? '!border-rose-500' : ''}
                    ${isOnline ? '!opacity-50 !cursor-not-allowed' : ''}
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
                isDisabled={isOnline}
                onChange={(option) => setSelectedCity(option)}
                classNames={{
                  ...baseSelectClasses,
                  control: (state: any) => `
                    !w-full !pl-3 !pb-1 !pt-3
                    !bg-neutral-50 !border !border-neutral-200
                    !rounded-lg !outline-none !transition
                    !ring-0 !outline-0 !box-shadow-none
                    ${state.isFocused ? '!border-black' : '!border-neutral-200'}
                    ${errors['city'] ? '!border-rose-500' : ''}
                    ${isOnline ? '!opacity-50 !cursor-not-allowed' : ''}
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
              required={!isOnline}
              disabled={isOnline}
            />
          </div>

          <div className="mt-4">
            <MapComponent 
              coordinates={coordinates || { lat: 34.0522, lng: -118.2437 }}
              zoom={coordinates ? 15 : 10}
            />
          </div>
        </>
      )}
    </div>
  );
};

export default ShopLocationInput;