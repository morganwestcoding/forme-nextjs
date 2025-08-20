// components/inputs/ListLocationSelect.tsx
'use client';

import React, { useEffect, useRef, useState } from 'react';
import useStates from '@/app/hooks/useStates';
import useCities from '@/app/hooks/useCities';
import Input from '../inputs/Input';
import { FieldValues, UseFormRegister, FieldErrors } from "react-hook-form";
import MapComponent from '../MapComponent';
import AddressAutocomplete from './AddressAutocomplete';
import FloatingLabelSelect, { FLSelectOption } from './FloatingLabelSelect';

type LocationSelection = { label: string; value: string };
type Coordinates = { lat: number; lng: number };

interface ListLocationSelectProps {
  onLocationSubmit: (location: {
    state: string;
    city: string;
    address: string;
    zipCode: string;
    coordinates?: Coordinates;
  } | null) => void;

  register: UseFormRegister<FieldValues>;
  errors: FieldErrors;
  id?: string;

  /** Pass like RegisterModal: "City, State" (also accepts "State, City" / "City, State, Country") */
  initialLocation?: string | null;

  /** Prefill the visible address input (edit mode) */
  initialAddress?: string | null;

  /** Prefill ZIP (edit mode); RHF defaultValues will also show it */
  initialZipCode?: string | null;
}

/** Normalizer for robust matching */
const normalize = (s?: string) =>
  (s ?? '')
    .toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/\bst[.\s]\b/g, 'saint ')
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();

const ListLocationSelect: React.FC<ListLocationSelectProps> = ({
  onLocationSubmit,
  register,
  errors,
  id,
  initialLocation,
  initialAddress,
  initialZipCode,
}) => {
  const [selectedCountry] = useState<string>('6252001'); // USA geonameid
  const [selectedState, setSelectedState] = useState<LocationSelection | null>(null);
  const [selectedCity, setSelectedCity] = useState<LocationSelection | null>(null);
  const [coordinates, setCoordinates] = useState<Coordinates | null>(null);
  const [isLoading] = useState(false);

  const { states } = useStates(selectedCountry);
  const { cities } = useCities(selectedState?.value ?? '');

  // Prefill once per mount
  const didPrefill = useRef(false);
  const desiredCityRef = useRef<string | null>(null);

  const findStateOption = (token: string): LocationSelection | undefined => {
    const want = normalize(token);
    return states.find(s => normalize(s.label) === want || normalize(s.value) === want);
  };

  /** 1) Prefill STATE (from initialLocation) when states load */
  useEffect(() => {
    if (didPrefill.current) return;
    if (!initialLocation) return;
    if (!states || states.length === 0) return;

    // Accept "City, State", "State, City", "City, State, Country"
    const parts = initialLocation.split(',').map(p => p.trim()).filter(Boolean);
    if (parts.length < 2) return;

    const last = parts[parts.length - 1];
    const secondLast = parts[parts.length - 2];

    // Try last or second last as state (covers extra country suffix)
    let stateOpt = findStateOption(last) || findStateOption(secondLast);
    let cityName =
      stateOpt && normalize(stateOpt.label) === normalize(secondLast)
        ? parts[parts.length - 3] ?? parts[0]   // "... City, State, Country"
        : parts[0];                              // "City, State"

    // Fallback: maybe "State, City"
    if (!stateOpt) {
      const maybeState = findStateOption(parts[0]);
      if (maybeState) {
        stateOpt = maybeState;
        cityName = parts[1] ?? cityName;
      }
    }

    if (stateOpt) {
      setSelectedState(stateOpt);
      desiredCityRef.current = cityName ?? null; // pick city after cities load
    }
  }, [initialLocation, states]);

  /** 2) Prefill CITY (after state is chosen & cities available).
   * Also push prefill up via onLocationSubmit without clobbering address/zip if parent guards.
   */
  useEffect(() => {
    if (didPrefill.current) return;
    if (!selectedState) return;

    const finishPrefill = (cityLabel?: string) => {
      onLocationSubmit({
        state: selectedState?.label ?? '',
        city: cityLabel ?? '',
        address: initialAddress ?? '',  // parent should only setValue if provided
        zipCode: initialZipCode ?? '',  // same
        coordinates: undefined,
      });
      didPrefill.current = true;
    };

    const targetCity = (desiredCityRef.current ?? '').trim();
    if (!targetCity) {
      finishPrefill();
      return;
    }

    if (!cities) return;

    const want = normalize(targetCity);
    let cityOpt =
      cities.find(c => normalize(c.label) === want || normalize(c.value) === want) ||
      cities.find(c => {
        const n = normalize(c.label);
        return n.includes(want) || want.includes(n);
      });

    if (!cityOpt) {
      // Synthetic option so original city still displays even if dataset lacks it
      cityOpt = { label: targetCity, value: targetCity };
    }

    setSelectedCity(cityOpt);
    finishPrefill(cityOpt.label);
  }, [selectedState, cities, onLocationSubmit, initialAddress, initialZipCode]);

  /** When user picks an address suggestion */
  const handleAddressSelect = (addressData: {
    address: string;
    city: string;
    state: string;
    zipCode: string;
    coordinates: Coordinates;
  }) => {
    const stateOption =
      states.find(s => s.label === addressData.state) ||
      states.find(s => s.value === addressData.state) ||
      ({ label: addressData.state, value: addressData.state } as LocationSelection);

    setSelectedState(stateOption);

    const cityOption: LocationSelection = {
      label: addressData.city,
      value: addressData.city,
    };
    setSelectedCity(cityOption);
    setCoordinates(addressData.coordinates);

    // Push all values up to RHF owner
    onLocationSubmit({
      address: addressData.address,
      city: addressData.city,
      state: addressData.state,
      zipCode: addressData.zipCode,
      coordinates: addressData.coordinates,
    });
  };

  /** When user changes State manually, clear City */
  const handleStateChange = (opt: FLSelectOption | null) => {
    setSelectedState(opt as LocationSelection | null);
    setSelectedCity(null);
    // Optionally inform parent, but hidden inputs already reflect state/city
  };

  /** When user changes City manually */
  const handleCityChange = (opt: FLSelectOption | null) => {
    setSelectedCity(opt as LocationSelection | null);
    // Optionally inform parent, but hidden inputs already reflect state/city
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

      {/* Address with visible prefill in edit mode */}
      <AddressAutocomplete
        id="address"
        label="Street Address"
        register={register}
        required
        disabled={isLoading}
        onAddressSelect={handleAddressSelect}
        errors={errors}
        initialValue={initialAddress ?? ''}   // 👈 prefill visible input
      />
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
        {/* STATE */}
        <FloatingLabelSelect
          label="State"
          options={states as FLSelectOption[]}
          value={selectedState as FLSelectOption | null}
          onChange={handleStateChange}
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
          onChange={handleCityChange}
          isLoading={false}
          isDisabled={!selectedState}
          error={!!errors['city']}
          noOptionsMessage={() =>
            selectedState ? 'No cities found' : 'Select a state'
          }
        />

        {/* ZIP — RHF defaultValues will render it; parent may also set via onLocationSubmit */}
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
          coordinates={coordinates ?? undefined}
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
