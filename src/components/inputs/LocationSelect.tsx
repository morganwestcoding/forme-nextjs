'use client';

import React, { useState } from 'react';
import Select from 'react-select';
import Input from '@/components/inputs/Input';
import { FieldValues, UseFormRegister, FieldErrors } from "react-hook-form";
import AddressAutocomplete from '@/components/inputs/AddressAutocomplete';

interface LocationSelection {
  label: string;
  value: string;
}

interface LocationSelectProps {
  id: string;
  label?: string;
  disabled?: boolean;
  register: UseFormRegister<FieldValues>;
  errors: FieldErrors;
  required?: boolean;
  onLocationSubmit: (location: { 
    state: string; 
    city: string; 
    address?: string;
    zipCode?: string;
  } | null) => void;
}

const states = [
  { value: "AL", label: "Alabama" },
  { value: "AK", label: "Alaska" },
  { value: "AZ", label: "Arizona" },
  { value: "AR", label: "Arkansas" },
  { value: "CA", label: "California" },
  { value: "CO", label: "Colorado" },
  { value: "CT", label: "Connecticut" },
  { value: "DE", label: "Delaware" },
  { value: "FL", label: "Florida" },
  { value: "GA", label: "Georgia" },
  { value: "HI", label: "Hawaii" },
  { value: "ID", label: "Idaho" },
  { value: "IL", label: "Illinois" },
  { value: "IN", label: "Indiana" },
  { value: "IA", label: "Iowa" },
  { value: "KS", label: "Kansas" },
  { value: "KY", label: "Kentucky" },
  { value: "LA", label: "Louisiana" },
  { value: "ME", label: "Maine" },
  { value: "MD", label: "Maryland" },
  { value: "MA", label: "Massachusetts" },
  { value: "MI", label: "Michigan" },
  { value: "MN", label: "Minnesota" },
  { value: "MS", label: "Mississippi" },
  { value: "MO", label: "Missouri" },
  { value: "MT", label: "Montana" },
  { value: "NE", label: "Nebraska" },
  { value: "NV", label: "Nevada" },
  { value: "NH", label: "New Hampshire" },
  { value: "NJ", label: "New Jersey" },
  { value: "NM", label: "New Mexico" },
  { value: "NY", label: "New York" },
  { value: "NC", label: "North Carolina" },
  { value: "ND", label: "North Dakota" },
  { value: "OH", label: "Ohio" },
  { value: "OK", label: "Oklahoma" },
  { value: "OR", label: "Oregon" },
  { value: "PA", label: "Pennsylvania" },
  { value: "RI", label: "Rhode Island" },
  { value: "SC", label: "South Carolina" },
  { value: "SD", label: "South Dakota" },
  { value: "TN", label: "Tennessee" },
  { value: "TX", label: "Texas" },
  { value: "UT", label: "Utah" },
  { value: "VT", label: "Vermont" },
  { value: "VA", label: "Virginia" },
  { value: "WA", label: "Washington" },
  { value: "WV", label: "West Virginia" },
  { value: "WI", label: "Wisconsin" },
  { value: "WY", label: "Wyoming" }
];

// Sample cities for demo purposes
const getCitiesForState = (stateValue: string) => {
  const stateCities: Record<string, LocationSelection[]> = {
    "AZ": [
      { value: "phoenix", label: "Phoenix" },
      { value: "tucson", label: "Tucson" },
      { value: "mesa", label: "Mesa" },
      { value: "chandler", label: "Chandler" },
      { value: "scottsdale", label: "Scottsdale" },
      { value: "glendale", label: "Glendale" },
      { value: "tempe", label: "Tempe" }
    ],
    "CA": [
      { value: "los_angeles", label: "Los Angeles" },
      { value: "san_diego", label: "San Diego" },
      { value: "san_francisco", label: "San Francisco" },
      { value: "san_jose", label: "San Jose" },
      { value: "fresno", label: "Fresno" },
      { value: "sacramento", label: "Sacramento" }
    ],
    "TX": [
      { value: "houston", label: "Houston" },
      { value: "austin", label: "Austin" },
      { value: "dallas", label: "Dallas" },
      { value: "san_antonio", label: "San Antonio" },
      { value: "fort_worth", label: "Fort Worth" },
      { value: "el_paso", label: "El Paso" }
    ],
    // Add more states and cities as needed
  };
  
  return stateCities[stateValue] || [];
};

const LocationSelect: React.FC<LocationSelectProps> = ({
  id,
  label = "Location",
  disabled = false,
  register,
  errors,
  required,
  onLocationSubmit
}) => {
  const [selectedState, setSelectedState] = useState<LocationSelection | null>(null);
  const [selectedCity, setSelectedCity] = useState<LocationSelection | null>(null);
  const [cities, setCities] = useState<LocationSelection[]>([]);
  const [address, setAddress] = useState("");
  const [zipCode, setZipCode] = useState("");

  // Update cities when state changes
  const handleStateChange = (option: LocationSelection | null) => {
    setSelectedState(option);
    setSelectedCity(null);
    
    if (option) {
      const citiesForState = getCitiesForState(option.value);
      setCities(citiesForState);
    } else {
      setCities([]);
    }
    
    updateLocationData(option, null);
  };

  // Handle city selection
  const handleCityChange = (option: LocationSelection | null) => {
    setSelectedCity(option);
    updateLocationData(selectedState, option);
  };

  // Update main location data
  const updateLocationData = (
    state: LocationSelection | null, 
    city: LocationSelection | null,
    addressVal?: string,
    zipCodeVal?: string
  ) => {
    if (!state) {
      onLocationSubmit(null);
      return;
    }
    
    onLocationSubmit({
      state: state.label,
      city: city?.label || '',
      address: addressVal || address,
      zipCode: zipCodeVal || zipCode
    });
  };

  // Handle address selection from autocomplete
  const handleAddressSelect = (addressData: {
    address: string;
    city: string;
    state: string;
    zipCode: string;
    coordinates?: {
      lat: number;
      lng: number;
    };
  }) => {
    setAddress(addressData.address);
    setZipCode(addressData.zipCode);
    
    // Find the matching state in our options
    const stateOption = states.find(s => 
      s.label.toLowerCase() === addressData.state.toLowerCase() || 
      s.value.toLowerCase() === addressData.state.toLowerCase()
    );
    
    if (stateOption) {
      handleStateChange(stateOption);
      
      // Create a city option if we don't have it
      const cityOption: LocationSelection = {
        label: addressData.city,
        value: addressData.city.toLowerCase().replace(/\s+/g, '_')
      };
      
      // Set city after a small delay to ensure cities are loaded
      setTimeout(() => {
        setSelectedCity(cityOption);
        updateLocationData(stateOption, cityOption, addressData.address, addressData.zipCode);
      }, 100);
    }
  };

  // Base styling for react-select
  const baseSelectClasses = {
    option: (state: any) => `
      !py-4 !px-4 !cursor-pointer
      ${state.isFocused ? '!bg-neutral-100' : '!bg-neutral-50'}
      ${state.isSelected ? '!bg-neutral-200 !text-black' : ''}
      !text-black hover:!text-neutral-600
      !font-normal!  
    `,
    dropdownIndicator: () => `
      !flex !items-center !pb-3 !px-4
    `,
    indicatorSeparator: () => `!hidden`,
    singleValue: () => '!text-black',
    input: () => '!text-neutral-600 !font-normal!',
    placeholder: () => '!text-neutral-600 !text-sm !font-normal', 
    menu: () => '!bg-white !rounded-sm !shadow-md !mt-1 !z-[9999]',
    menuList: () => '!p-0',
    valueContainer: () => '!p-0.5',
    container: () => '!relative !w-full'
  };

  return (
    <div className="flex flex-col gap-3 text-sm" id={id}>
      <label className="text-md font-medium">
        {label}
      </label>
      
      {/* Optional Address Autocomplete - uncomment if you want to use it */}
      {/* 
      <AddressAutocomplete
        id="address"
        label="Street Address"
        register={register}
        required
        disabled={disabled}
        onAddressSelect={handleAddressSelect}
        errors={errors}
      />
      */}
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
        <div className="relative">
          <Select
            id="state-select"
            options={states}
            value={selectedState}
            isSearchable={true}
            onChange={(option) => handleStateChange(option)}
            isDisabled={disabled}
            classNames={{
              ...baseSelectClasses,
              control: (state: any) => `
                !w-full !pl-3 !pb-1 !pt-3
                !bg-neutral-50 !border !border-neutral-300
                !rounded-lg !outline-none !transition
                !ring-0 !outline-0 !box-shadow-none
                ${state.isFocused ? '!border-black' : '!border-neutral-500'}
                ${errors['state'] ? '!border-rose-500' : ''}
                ${disabled ? '!opacity-70 !cursor-not-allowed' : ''}
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
            text-neutral-600
            ${selectedState ? 'scale-100 -translate-y-3' : 'translate-y-0'}
            ${disabled ? 'opacity-70' : ''}
          `}>
            State
          </label>
        </div>

        <div className="relative">
          <Select
            id="city-select"
            options={cities}
            value={selectedCity}
            isSearchable={true}
            onChange={(option) => handleCityChange(option)}
            isDisabled={disabled || !selectedState}
            classNames={{
              ...baseSelectClasses,
              control: (state: any) => `
                !w-full !pl-3 !pb-1 !pt-3
                !bg-neutral-50 !border !border-neutral-200
                !rounded-lg !outline-none !transition
                !ring-0 !outline-0 !box-shadow-none
                ${state.isFocused ? '!border-black' : '!border-neutral-500'}
                ${errors['city'] ? '!border-rose-500' : ''}
                ${(disabled || !selectedState) ? '!opacity-70 !cursor-not-allowed' : ''}
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
            ${(disabled || !selectedState) ? 'opacity-70' : ''}
          `}>
            City
          </label>
        </div>
      </div>

      {/* Custom city input for cities not in the list - optional */}
      {/* 
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-2">
        <Input
          id="address"
          label="Address"
          register={register}
          errors={errors}
          disabled={disabled}
          value={address}
          onChange={(e) => {
            setAddress(e.target.value);
            updateLocationData(selectedState, selectedCity, e.target.value, zipCode);
          }}
        />
        <Input
          id="zipCode"
          label="ZIP Code"
          register={register}
          errors={errors}
          disabled={disabled}
          value={zipCode}
          onChange={(e) => {
            setZipCode(e.target.value);
            updateLocationData(selectedState, selectedCity, address, e.target.value);
          }}
        />
      </div>
      */}
    </div>
  );
};

export default LocationSelect;