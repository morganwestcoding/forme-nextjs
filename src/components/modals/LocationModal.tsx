// components/modals/LocationModal.tsx
'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Modal from './Modal';
import useStates from '@/app/hooks/useStates';
import useCities from '@/app/hooks/useCities';
import Select from 'react-select';
import MapComponent from '../MapComponent';
import { useSearchParams } from 'next/navigation';
import { categories } from '@/components/Categories';

interface LocationSelection {
  label: string;
  value: string;
}

interface LocationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLocationSelected: (location: LocationSelection | null) => void;
}

const LocationModal: React.FC<LocationModalProps> = ({
  isOpen,
  onClose,
  onLocationSelected
}) => {
  const [selectedState, setSelectedState] = useState<LocationSelection | null>(null);
  const [selectedCity, setSelectedCity] = useState<LocationSelection | null>(null);
  const [currentLocation, setCurrentLocation] = useState<string | null>(null);
  const params = useSearchParams();

  // Get dynamic accent color (for reference, not used in props anymore)
  const getAccentColor = useCallback(() => {
    const categoryParam = params?.get('category');
    if (categoryParam) {
      const categoryData = categories.find(cat => cat.label === categoryParam);
      if (categoryData) {
        return categoryData.color.replace('bg-[', '').replace(']', '');
      }
    }
    return '#0CD498'; // Default color
  }, [params]);

  const { states, loading: statesLoading } = useStates('US');
  const { cities, loading: citiesLoading } = useCities(selectedState?.value ?? '');

  const handleStateChange = (selectedOption: LocationSelection | null) => {
    setSelectedState(selectedOption);
    setSelectedCity(null);
    setCurrentLocation(null);
  };

  const handleCityChange = (selectedOption: LocationSelection | null) => {
    setSelectedCity(selectedOption);
    const location = selectedOption 
      ? `${selectedOption.label}, ${selectedState?.label}` 
      : null;
    setCurrentLocation(location);
    
    if (selectedOption) {
      onLocationSelected({
        label: `${selectedOption.label}, ${selectedState?.label}`,
        value: `${selectedOption.label}, ${selectedState?.label}`
      });
    } else {
      onLocationSelected(null);
    }
  };

  // Reset state when modal closes
  useEffect(() => {
    if (!isOpen) {
      // Don't reset selections when modal closes to preserve state
      // only reset if explicitly needed
    }
  }, [isOpen]);

  const selectClasses = {
    control: (state: any) => `
      !w-full !p-3 !pt-3.5
      !bg-slate-50 !border !border-neutral-500
      !rounded-md !outline-none !transition
      ${state.isFocused ? '!border-black' : '!border-neutral-500'}
    `,
    option: (state: any) => `
      !py-4 !px-4 !cursor-pointer
      ${state.isFocused ? '!bg-neutral-100' : '!bg-white'}
      ${state.isSelected ? '!bg-neutral-200 !text-black' : ''}
      !text-black hover:!text-neutral-500
      !font-normal!  
    `,
    singleValue: () => '!text-black pt-2',
    input: () => '!text-neutral-500 !font-normal',
    placeholder: () => '!text-neutral-500 !text-sm !font-normal', 
    menu: () => '!bg-white !rounded-md !border !border-neutral-200 !shadow-md !mt-1 !z-[9999] ',
    menuList: () => '!p-0',
    valueContainer: () => '!p-0',
    container: (state: any) => `
      !relative !w-full !
      ${state.isFocused ? 'peer-focus:border-black' : ''}
    `
  };

  const bodyContent = (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between mb-2">
        <h2 className="text-xl font-semibold">Select Your Location</h2>
        {currentLocation && (
          <button
            onClick={() => {
              setSelectedState(null);
              setSelectedCity(null);
              setCurrentLocation(null);
              onLocationSelected(null);
            }}
            className="text-sm text-gray-500 hover:text-gray-700"
          >
            Clear
          </button>
        )}
      </div>

      <div className="flex flex-col gap-3">
        <div className="relative">
          <Select
            options={states}
            value={selectedState}
            onChange={handleStateChange}
            placeholder=" "
            isLoading={statesLoading}
            classNames={selectClasses}
            getOptionLabel={(option: LocationSelection) => option.label}
            getOptionValue={(option: LocationSelection) => option.value}
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
            ${selectedState ? 'scale-100 -translate-y-3 ' : 'translate-y-0'}
          `}>
            State
          </label>
        </div>
        <div className="relative">
          <Select
            options={cities}
            value={selectedCity}
            onChange={handleCityChange}
            placeholder=" "
            isLoading={citiesLoading}
            classNames={selectClasses}
            getOptionLabel={(option: LocationSelection) => option.label}
            getOptionValue={(option: LocationSelection) => option.value}
            noOptionsMessage={() => selectedState ? "No cities found" : "Please select a state first"}
            isDisabled={!selectedState}
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
      </div>

      <div className="h-64 mt-4 rounded-lg overflow-hidden border border-gray-200">
        <MapComponent location={currentLocation} />
      </div>
    </div>
  );

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Add Location"
      body={bodyContent}
      actionLabel={selectedCity ? "Confirm Location" : "Cancel"}
      secondaryAction={onClose}
      secondaryActionLabel="Cancel"
      onSubmit={() => {
        if (selectedCity && selectedState) {
          onLocationSelected({
            label: `${selectedCity.label}, ${selectedState.label}`,
            value: `${selectedCity.label}, ${selectedState.label}`
          });
          onClose();
        } else {
          onClose();
        }
      }}
    />
  );
};

export default LocationModal;