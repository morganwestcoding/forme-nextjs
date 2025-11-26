'use client';

import React, { useState } from 'react';
import { FieldErrors, FieldValues, UseFormRegister } from 'react-hook-form';
import MapComponent from '../MapComponent';
import LocationInput from './LocationInput';

type Coordinates = { lat: number; lng: number };

interface ListLocationSelectProps {
  /** Callback when location ("City, State") changes */
  onLocationSubmit: (location: string | null) => void;

  /** Callback when address is selected from autocomplete */
  onAddressSelect?: (data: {
    address: string;
    city: string;
    state: string;
    zipCode: string;
    coordinates: Coordinates;
  }) => void;

  /** Callback to clear errors when user types */
  onFieldChange?: (fieldId: string) => void;

  register: UseFormRegister<FieldValues>;
  errors: FieldErrors;
  id?: string;

  /** Prefill from listing (edit mode) */
  initialLocation?: string | null;
  initialAddress?: string | null;
  initialZipCode?: string | null;
}

const ListLocationSelect: React.FC<ListLocationSelectProps> = ({
  onLocationSubmit,
  onAddressSelect,
  onFieldChange,
  register,
  errors,
  id,
  initialLocation,
  initialAddress,
  initialZipCode,
}) => {
  const [coordinates, setCoordinates] = useState<Coordinates | null>(null);
  const [location, setLocation] = useState<string | null>(null);

  const handleLocationChange = (loc: string | null) => {
    setLocation(loc);
    onLocationSubmit(loc);
  };

  const handleAddressSelectInternal = (data: {
    address: string;
    city: string;
    state: string;
    zipCode: string;
    coordinates: Coordinates;
  }) => {
    setCoordinates(data.coordinates);
    onAddressSelect?.(data);
  };

  return (
    <div id={id} className="flex flex-col gap-4">
      {/* Unified Location Input */}
      <LocationInput
        onLocationSubmit={handleLocationChange}
        onAddressSelect={handleAddressSelectInternal}
        onFieldChange={onFieldChange}
        register={register}
        errors={errors}
        initialLocation={initialLocation}
        initialAddress={initialAddress}
        initialZipCode={initialZipCode}
      />

      {/* Map */}
      <div className="mt-2">
        <MapComponent
          coordinates={coordinates ?? undefined}
          location={coordinates ? null : location}
          zoom={coordinates ? 15 : 10}
        />
      </div>
    </div>
  );
};

export default ListLocationSelect;
