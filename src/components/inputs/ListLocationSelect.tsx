'use client';

import React, { useEffect, useRef, useState, useMemo } from 'react';
import { FieldErrors, FieldValues, UseFormRegister } from 'react-hook-form';
import useStates from '@/app/hooks/useStates';
import useCities from '@/app/hooks/useCities';
import AddressAutocomplete from './AddressAutocomplete';
import Input from '../inputs/Input';
import MapComponent from '../MapComponent';
import FloatingLabelSelect, { FLSelectOption } from './FloatingLabelSelect';

type LocationSelection = { label: string; value: string };
type Coordinates = { lat: number; lng: number };

interface ListLocationSelectProps {
  /** EXACTLY like register flow: emit "City, State" or null */
  onLocationSubmit: (location: string | null) => void;

  /** Let parent set address/zip (since RHF lives above) */
  onAddressSelect?: (data: {
    address: string;
    city: string;
    state: string;
    zipCode: string;
    coordinates: Coordinates;
  }) => void;

  register: UseFormRegister<FieldValues>;
  errors: FieldErrors;
  id?: string;

  /** Prefill from listing (edit mode) */
  initialLocation?: string | null;
  initialAddress?: string | null;
  initialZipCode?: string | null;
}

/** Normalize strings for matching (case/diacritics/punct/abbrev) */
const normalize = (s: string) =>
  s
    .toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/\bst[.\s]\b/g, 'saint ')
    .replace(/[^a-z0-9]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

/** Find a city option with several heuristics */
function findCityOption(cities: LocationSelection[], desiredRaw: string): LocationSelection | undefined {
  const want = normalize(desiredRaw);
  if (!want) return;

  // 1) exact label/value match post-normalize
  let match = cities.find(c => normalize(c.label) === want || normalize(c.value) === want);
  if (match) return match;

  // 2) inclusive match
  match = cities.find(c => {
    const n = normalize(c.label);
    return n.includes(want) || want.includes(n);
  });
  if (match) return match;

  // 3) token-based (all tokens present)
  const tokens = want.split(' ');
  match = cities.find(c => {
    const n = normalize(c.label);
    return tokens.every(t => n.includes(t));
  });
  return match;
}

const ListLocationSelect: React.FC<ListLocationSelectProps> = ({
  onLocationSubmit,
  onAddressSelect,
  register,
  errors,
  id,
  initialLocation,
  initialAddress,
  initialZipCode,
}) => {
  // EXACTLY like register flow: local-only state/city, emit single string
  const [selectedState, setSelectedState] = useState<LocationSelection | null>(null);
  const [selectedCity, setSelectedCity] = useState<LocationSelection | null>(null);
  const [currentLocation, setCurrentLocation] = useState<string | null>(null);

  // Map-only coords (optional)
  const [coordinates, setCoordinates] = useState<Coordinates | null>(null);

  // Datasets — use the same inputs as your register flow
  const { states, loading: statesLoading } = useStates('US');
  const { cities, loading: citiesLoading } = useCities(selectedState?.value ?? '');

  // One-time prefill tracking
  const initializedRef = useRef(false);
  const targetCityRef = useRef<string | null>(null);

  const findStateOption = (token: string): LocationSelection | undefined => {
    const want = normalize(token);
    return states.find(s => normalize(s.label) === want || normalize(s.value) === want);
  };

  /** Stage 1: derive State from initialLocation */
  useEffect(() => {
    if (initializedRef.current) return;
    if (!initialLocation) return;
    if (statesLoading || states.length === 0) return;

    // Accept "City, State" | "State, City" | "City, State, Country"
    const parts = initialLocation.split(',').map(p => p.trim()).filter(Boolean);
    if (parts.length < 2) return;

    const last = parts[parts.length - 1];
    const secondLast = parts[parts.length - 2];

    let stateOpt = findStateOption(last) || findStateOption(secondLast);
    let cityName = stateOpt && stateOpt.label === last ? secondLast : parts[0];

    // Fallback "State, City"
    if (!stateOpt) {
      const maybeState = findStateOption(parts[0]);
      if (maybeState) {
        stateOpt = maybeState;
        cityName = parts[1] ?? cityName;
      }
    }

    if (stateOpt) {
      setSelectedState(stateOpt);
      targetCityRef.current = cityName ?? null;
    }
  }, [initialLocation, states, statesLoading]);

  /** Stage 2: set City once its list is loaded, emit location string */
  useEffect(() => {
    if (initializedRef.current) return;
    if (!selectedState) return;
    if (citiesLoading) return;

    const desiredCityRaw = (targetCityRef.current ?? '').trim();
    if (!desiredCityRaw) {
      // We still want to emit state (but no city yet) — keep it null to force user pick
      initializedRef.current = true;
      return;
    }

    const cityOpt = findCityOption(cities, desiredCityRaw) ?? { label: desiredCityRaw, value: desiredCityRaw };
    setSelectedCity(cityOpt);

    // Emit "City, State" to RHF
    const loc = `${cityOpt.label}, ${selectedState.label}`;
    setCurrentLocation(loc);
    onLocationSubmit(loc);

    initializedRef.current = true;
  }, [selectedState, cities, citiesLoading, onLocationSubmit]);

  /** Manual State change (clear city & location like register flow) */
  const handleStateChange = (opt: FLSelectOption | null) => {
    setSelectedState(opt as LocationSelection | null);
    setSelectedCity(null);
    setCurrentLocation(null);
    onLocationSubmit(null);
  };

  /** Manual City change (emit "City, State") */
  const handleCityChange = (opt: FLSelectOption | null) => {
    setSelectedCity(opt as LocationSelection | null);
    const loc = opt && selectedState ? `${opt.label}, ${selectedState.label}` : null;
    setCurrentLocation(loc);
    onLocationSubmit(loc);
  };

  /** Address picker — also emit location from address and forward address/zip up */
  const handleAddressSelect = (data: {
    address: string;
    city: string;
    state: string;
    zipCode: string;
    coordinates: Coordinates;
  }) => {
    // Sync local dropdowns from address selection (nice UX)
    const stateOpt =
      states.find(s => s.label === data.state) ||
      states.find(s => s.value === data.state) ||
      ({ label: data.state, value: data.state });

    setSelectedState(stateOpt as LocationSelection);
    const cityOpt: LocationSelection = { label: data.city, value: data.city };
    setSelectedCity(cityOpt);

    // Emit "City, State" like register flow
    const loc = `${data.city}, ${data.state}`;
    setCurrentLocation(loc);
    onLocationSubmit(loc);

    // Keep coordinates for map
    setCoordinates(data.coordinates);

    // Let parent set address & zip in RHF
    onAddressSelect?.(data);
  };

  const menuNoCityMessage = useMemo(
    () => (selectedState ? 'No cities found' : 'Please select a state first'),
    [selectedState]
  );

  return (
    <div id={id} className="flex flex-col gap-3 -mt-4">
      {/* Address input (visible + RHF) */}
      <AddressAutocomplete
        id="address"
        label="Street Address"
        register={register}
        required
        disabled={false}
        onAddressSelect={handleAddressSelect}
        errors={errors}
        initialValue={initialAddress ?? ''}
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
        {/* STATE (local only) */}
        <FloatingLabelSelect
          label="State"
          options={states as FLSelectOption[]}
          value={selectedState as FLSelectOption | null}
          onChange={handleStateChange}
          isLoading={statesLoading}
          isDisabled={false}
          noOptionsMessage={() => 'No states found'}
        />

        {/* CITY (local only) */}
        <FloatingLabelSelect
          label="City"
          options={cities as FLSelectOption[]}
          value={selectedCity as FLSelectOption | null}
          onChange={handleCityChange}
          isLoading={citiesLoading}
          isDisabled={!selectedState}
          noOptionsMessage={() => menuNoCityMessage}
        />

        {/* ZIP (RHF-controlled by parent) */}
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
          location={coordinates ? null : currentLocation}
          zoom={coordinates ? 15 : 10}
        />
      </div>
    </div>
  );
};

export default ListLocationSelect;
