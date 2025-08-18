'use client';

import React, { useState } from 'react';
import useStates from '@/app/hooks/useStates';
import useCities from '@/app/hooks/useCities';
import Input from '../inputs/Input';
import { FieldValues, UseFormRegister, FieldErrors } from "react-hook-form";
import MapComponent from '../MapComponent';
import AddressAutocomplete from './AddressAutocomplete';
import FloatingLabelSelect, { FLSelectOption } from './FloatingLabelSelect';

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
    coordinates?: {
      lat: number;
      lng: number;
    };
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
  const [selectedCountry] = useState<string>('6252001'); // USA geonameid
  const [selectedState, setSelectedState] = useState<LocationSelection | null>(null);
  const [selectedCity, setSelectedCity] = useState<LocationSelection | null>(null);
  const [coordinates, setCoordinates] = useState<{lat: number; lng: number} | null>(null);
  const [isLoading] = useState(false);

  const { states } = useStates(selectedCountry);
  const { cities } = useCities(selectedState?.value ?? '');

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
      setSelectedState(stateOption as LocationSelection);
      const cityOption: LocationSelection = {
        label: addressData.city,
        value: addressData.city
      };
      setSelectedCity(cityOption);
    }
  
    setCoordinates(addressData.coordinates);

    // Let parent (RHF owner) receive the values
    onLocationSubmit({
      address: addressData.address,
      city: addressData.city,
      state: addressData.state,
      zipCode: addressData.zipCode,
      coordinates: addressData.coordinates
    });
  };

  return (
    <div id={id} className="flex flex-col gap-3 text-sm -mt-4">
      {/* Hidden RHF fields so state/city participate in validation & errors */}
      <input
        type="hidden"
        {...register('state', { required: true })}
        value={selectedState?.label ?? ''}
        readOnly
      />
      <input
        type="hidden"
        {...register('city', { required: true })}
        value={selectedCity?.label ?? ''}
        readOnly
      />

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
        {/* STATE */}
        <FloatingLabelSelect
          label="State"
          options={states as FLSelectOption[]}
          value={selectedState as FLSelectOption | null}
          onChange={(opt) => setSelectedState(opt as LocationSelection | null)}
          isLoading={false}
          isDisabled={false}
          error={!!errors['state']}
          noOptionsMessage={() => 'No states found'}
        />

        {/* CITY */}
        <FloatingLabelSelect
          label="City"
          options={cities as FLSelectOption[]}
          value={selectedCity as FLSelectOption | null}
          onChange={(opt) => setSelectedCity(opt as LocationSelection | null)}
          isLoading={false}
          isDisabled={!selectedState}
          error={!!errors['city']}
          noOptionsMessage={() =>
            selectedState ? 'No cities found' : 'Select a state'
          }
        />

        {/* ZIP */}
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
          coordinates={coordinates}
          location={
            !coordinates && selectedCity && selectedState
              ? `${selectedCity.label}, ${selectedState.label}`
              : null
          }
          zoom={coordinates ? 15 : 10}
        />
      </div>
    </div>
  );
};

export default ListLocationSelect;
