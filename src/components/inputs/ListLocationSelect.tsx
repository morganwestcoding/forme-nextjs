'use client';

import React, { useEffect, useState } from 'react';
import { FieldErrors, FieldValues, UseFormRegister } from 'react-hook-form';
import useStates from '@/app/hooks/useStates';
import useCities from '@/app/hooks/useCities';
import AddressAutocomplete from './AddressAutocomplete';
import Input from '../inputs/Input';
import MapComponent from '../MapComponent';
import FloatingLabelSelect, { FLSelectOption } from './FloatingLabelSelect';

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

/** Parse "City, State" into separate values */
function parseLocation(location: string | null): { city: string; state: string } | null {
  if (!location) return null;
  const parts = location.split(',').map(p => p.trim()).filter(Boolean);
  if (parts.length < 2) return null;
  return { city: parts[0], state: parts[1] };
}

/** Find option by label (case-insensitive) */
function findOption(options: FLSelectOption[], searchTerm: string): FLSelectOption | undefined {
  const normalized = searchTerm.toLowerCase().trim();
  return options.find(opt =>
    opt.label.toLowerCase() === normalized ||
    opt.value.toLowerCase() === normalized
  );
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
  // Selected values
  const [selectedState, setSelectedState] = useState<FLSelectOption | null>(null);
  const [selectedCity, setSelectedCity] = useState<FLSelectOption | null>(null);
  const [coordinates, setCoordinates] = useState<Coordinates | null>(null);

  // Fetch data
  const { states, loading: statesLoading } = useStates('US');
  const { cities, loading: citiesLoading } = useCities(selectedState?.value ?? '');

  // Initialize from props (only runs once when data loads)
  useEffect(() => {
    if (!initialLocation || statesLoading || states.length === 0) return;
    if (selectedState) return; // Already initialized

    const parsed = parseLocation(initialLocation);
    if (!parsed) return;

    const stateOpt = findOption(states, parsed.state);
    if (stateOpt) {
      setSelectedState(stateOpt);
      // City will be set in a separate effect after cities load
    }
  }, [initialLocation, states, statesLoading, selectedState]);

  // Initialize city after state is set and cities are loaded
  useEffect(() => {
    if (!initialLocation || !selectedState || citiesLoading || cities.length === 0) return;
    if (selectedCity) return; // Already initialized

    const parsed = parseLocation(initialLocation);
    if (!parsed) return;

    const cityOpt = findOption(cities, parsed.city) ?? { label: parsed.city, value: parsed.city };
    setSelectedCity(cityOpt);

    // Emit initial location
    const loc = `${cityOpt.label}, ${selectedState.label}`;
    onLocationSubmit(loc);
  }, [initialLocation, selectedState, cities, citiesLoading, selectedCity, onLocationSubmit]);

  /** Handle state change */
  const handleStateChange = (opt: FLSelectOption | null) => {
    setSelectedState(opt);
    setSelectedCity(null); // Clear city when state changes

    // Only emit null if we're clearing, otherwise wait for city
    if (!opt) {
      onLocationSubmit(null);
    }
  };

  /** Handle city change */
  const handleCityChange = (opt: FLSelectOption | null) => {
    setSelectedCity(opt);

    // Only emit location when both state AND city are selected
    if (opt && selectedState) {
      const loc = `${opt.label}, ${selectedState.label}`;
      onLocationSubmit(loc);
    } else {
      onLocationSubmit(null);
    }
  };

  /** Handle address selection from autocomplete */
  const handleAddressSelect = (data: {
    address: string;
    city: string;
    state: string;
    zipCode: string;
    coordinates: Coordinates;
  }) => {
    // Sync state/city dropdowns from address
    const stateOpt = findOption(states, data.state) ?? { label: data.state, value: data.state };
    const cityOpt: FLSelectOption = { label: data.city, value: data.city };

    setSelectedState(stateOpt);
    setSelectedCity(cityOpt);
    setCoordinates(data.coordinates);

    // Emit location
    const loc = `${data.city}, ${data.state}`;
    onLocationSubmit(loc);

    // Forward to parent
    onAddressSelect?.(data);
  };

  // Determine if location fields have errors
  const hasLocationError = !!(errors.location || errors.address);

  return (
    <div id={id} className="flex flex-col gap-4">
      {/* Address Autocomplete */}
      <AddressAutocomplete
        id="address"
        label="Street Address"
        register={register}
        required
        disabled={false}
        onAddressSelect={handleAddressSelect}
        errors={errors}
        initialValue={initialAddress ?? ''}
        filterState={selectedState?.value}
        filterCity={selectedCity?.label}
        onFieldChange={onFieldChange}
      />

      {/* State, City, ZIP Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {/* State */}
        <div className="relative">
          <FloatingLabelSelect
            label="State"
            options={states}
            value={selectedState}
            onChange={handleStateChange}
            isLoading={statesLoading}
            isDisabled={false}
            noOptionsMessage={() => 'No states found'}
            name="state-select"
            inputId="state-input"
            error={hasLocationError}
          />
          {/* Error message for location - aligned with ZIP error */}
          {hasLocationError && (
            <span className="text-rose-500 text-xs mt-1.5 block font-medium">
              {errors.location?.message as string || errors.address?.message as string || 'Please complete the location fields'}
            </span>
          )}
        </div>

        {/* City */}
        <FloatingLabelSelect
          label="City"
          options={cities}
          value={selectedCity}
          onChange={handleCityChange}
          isLoading={citiesLoading}
          isDisabled={!selectedState}
          noOptionsMessage={() => selectedState ? 'No cities found' : 'Please select a state first'}
          name="city-select"
          inputId="city-input"
          error={hasLocationError}
        />

        {/* ZIP Code */}
        <Input
          id="zipCode"
          label="ZIP Code"
          register={register}
          errors={errors}
          required
          onChange={(e) => {
            // Clear zipCode error when user types
            if (e.target.value && onFieldChange) {
              onFieldChange('zipCode');
            }
          }}
        />
      </div>

      {/* Map */}
      <div className="mt-2">
        <MapComponent
          coordinates={coordinates ?? undefined}
          location={coordinates ? null : (selectedCity && selectedState ? `${selectedCity.label}, ${selectedState.label}` : null)}
          zoom={coordinates ? 15 : 10}
        />
      </div>
    </div>
  );
};

export default ListLocationSelect;
