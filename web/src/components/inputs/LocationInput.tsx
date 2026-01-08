'use client';

import React, { useEffect, useState, useRef, useCallback } from 'react';
import { FieldErrors, FieldValues, UseFormRegister } from 'react-hook-form';
import Select, {
  GroupBase,
  SingleValue,
  StylesConfig,
  components as RSComponents,
  type SelectInstance,
} from 'react-select';
import useStates from '@/app/hooks/useStates';
import useCities from '@/app/hooks/useCities';

type Coordinates = { lat: number; lng: number };

export type SelectOption = { label: string; value: string };

interface LocationInputProps {
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

  /** Prefill from listing (edit mode) */
  initialLocation?: string | null;
  initialAddress?: string | null;
  initialZipCode?: string | null;
}

interface Suggestion {
  place_name: string;
  geometry: { coordinates: [number, number] };
  context: Array<{ id: string; text: string; short_code?: string }>;
}

// Shared styling constants for consistency
const CONTROL_HEIGHT = 56;
const BORDER_RADIUS = 12;
const PADDING_LEFT = 16;
const PADDING_TOP = 22;
const PADDING_BOTTOM = 10;
const FONT_SIZE_PX = 14;
const LINE_HEIGHT_PX = 20;

const US_CENTROID = { lat: 39.8283, lng: -98.5795 };

/** Parse "City, State" into separate values */
function parseLocation(location: string | null): { city: string; state: string } | null {
  if (!location) return null;
  const parts = location.split(',').map(p => p.trim()).filter(Boolean);
  if (parts.length < 2) return null;
  return { city: parts[0], state: parts[1] };
}

/** Find option by label (case-insensitive) */
function findOption(options: SelectOption[], searchTerm: string): SelectOption | undefined {
  const normalized = searchTerm.toLowerCase().trim();
  return options.find(opt =>
    opt.label.toLowerCase() === normalized ||
    opt.value.toLowerCase() === normalized
  );
}

/** react-select styles - modern, sexy, minimalistic */
const makeSelectStyles = (
  error?: boolean
): StylesConfig<SelectOption, false, GroupBase<SelectOption>> => ({
  control: (base, state) => ({
    ...base,
    minHeight: CONTROL_HEIGHT,
    height: CONTROL_HEIGHT,
    borderRadius: BORDER_RADIUS,
    backgroundColor: '#ffffff',
    borderColor: error
      ? '#f87171'
      : state.isFocused
        ? '#60A5FA'
        : '#d1d5db',
    borderWidth: '1px',
    boxShadow: 'none',
    ':hover': {
      borderColor: error
        ? '#f87171'
        : state.isFocused
          ? '#60A5FA'
          : '#9ca3af',
    },
    padding: 0,
    cursor: 'pointer',
    transition: 'all 200ms cubic-bezier(0.4, 0, 0.2, 1)',
  }),
  valueContainer: (base) => ({
    ...base,
    paddingLeft: PADDING_LEFT,
    paddingRight: 40,
    paddingTop: PADDING_TOP,
    paddingBottom: PADDING_BOTTOM,
  }),
  placeholder: (base) => ({
    ...base,
    opacity: 0,
    fontSize: `${FONT_SIZE_PX}px`,
    lineHeight: `${LINE_HEIGHT_PX}px`,
  }),
  singleValue: (base) => ({
    ...base,
    color: '#374151',
    fontSize: `${FONT_SIZE_PX}px`,
    lineHeight: `${LINE_HEIGHT_PX}px`,
    margin: 0,
    padding: 0,
  }),
  input: (base) => ({
    ...base,
    color: '#374151',
    fontSize: `${FONT_SIZE_PX}px`,
    lineHeight: `${LINE_HEIGHT_PX}px`,
    margin: 0,
    padding: 0,
  }),
  indicatorsContainer: (base) => ({
    ...base,
    position: 'absolute',
    right: 0,
    top: 0,
    height: CONTROL_HEIGHT,
    paddingRight: 12,
    color: '#9ca3af',
  }),
  indicatorSeparator: () => ({ display: 'none' }),
  dropdownIndicator: (base) => ({ ...base, padding: 0, margin: 0 }),
  clearIndicator: (base) => ({ ...base, padding: 0, margin: 0 }),
  menuPortal: (base) => ({ ...base, zIndex: 9999 }),
  menu: (base) => ({
    ...base,
    borderRadius: BORDER_RADIUS,
    border: '1px solid #e5e7eb',
    overflow: 'hidden',
    marginTop: 4,
    boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)',
    backgroundColor: '#ffffff',
  }),
  menuList: (base) => ({ ...base, padding: 4 }),
  option: (base, state) => ({
    ...base,
    borderRadius: 8,
    padding: '10px 12px',
    margin: '2px 4px',
    backgroundColor: state.isSelected
      ? 'rgba(96, 165, 250, 0.12)'
      : state.isFocused
        ? 'rgba(96, 165, 250, 0.06)'
        : 'transparent',
    color: state.isSelected ? '#2563eb' : '#374151',
    cursor: 'pointer',
    fontSize: `${FONT_SIZE_PX}px`,
    lineHeight: `${LINE_HEIGHT_PX}px`,
    transition: 'all 200ms cubic-bezier(0.4, 0, 0.2, 1)',
    fontWeight: state.isSelected ? '500' : '400',
    ':active': {
      backgroundColor: 'rgba(96, 165, 250, 0.15)',
    },
  }),
});

/** Custom Input to discourage Chrome autofill injecting stray text */
const AutoCompleteOffInput = (props: any) => (
  <RSComponents.Input {...props} autoComplete="new-password" />
);

const LocationInput: React.FC<LocationInputProps> = ({
  onLocationSubmit,
  onAddressSelect,
  onFieldChange,
  register,
  errors,
  initialLocation,
  initialAddress,
  initialZipCode,
}) => {
  // Address autocomplete state
  const [addressQuery, setAddressQuery] = useState(initialAddress ?? '');
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [activeIndex, setActiveIndex] = useState<number>(-1);
  const [addressFocused, setAddressFocused] = useState(false);

  // State/City selection state
  const [selectedState, setSelectedState] = useState<SelectOption | null>(null);
  const [selectedCity, setSelectedCity] = useState<SelectOption | null>(null);
  const [coordinates, setCoordinates] = useState<Coordinates | null>(null);

  // State/City input values for react-select
  const [stateInputValue, setStateInputValue] = useState('');
  const [cityInputValue, setCityInputValue] = useState('');
  const [stateFocused, setStateFocused] = useState(false);
  const [cityFocused, setCityFocused] = useState(false);
  const [stateMenuOpen, setStateMenuOpen] = useState(false);
  const [cityMenuOpen, setCityMenuOpen] = useState(false);

  // ZIP code state
  const [zipValue, setZipValue] = useState(initialZipCode ?? '');
  const [zipFocused, setZipFocused] = useState(false);

  // Proximity for address search
  const [effectiveProximity, setEffectiveProximity] = useState<{ lat: number; lng: number } | null>(null);

  // Refs
  const addressRootRef = useRef<HTMLDivElement>(null);
  const addressListRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<NodeJS.Timeout>();
  const stateSelectRef = useRef<SelectInstance<SelectOption, false, GroupBase<SelectOption>>>(null);
  const citySelectRef = useRef<SelectInstance<SelectOption, false, GroupBase<SelectOption>>>(null);

  // Fetch data
  const { states, loading: statesLoading } = useStates('US');
  const { cities, loading: citiesLoading } = useCities(selectedState?.value ?? '');

  // Register form fields
  const {
    ref: addressRefFromRegister,
    onChange: addressRHFOnChange,
    onBlur: addressRHFOnBlur,
    name: addressName,
  } = register('address', { required: true });

  const {
    ref: zipRefFromRegister,
    onChange: zipRHFOnChange,
    onBlur: zipRHFOnBlur,
    name: zipName,
  } = register('zipCode', { required: true });

  // Initialize proximity for address search
  useEffect(() => {
    if (typeof window !== 'undefined' && 'geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => setEffectiveProximity({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
        () => setEffectiveProximity(US_CENTROID),
        { enableHighAccuracy: false, timeout: 4000, maximumAge: 600000 }
      );
    } else {
      setEffectiveProximity(US_CENTROID);
    }
  }, []);

  // Keep address input in sync with initialAddress
  useEffect(() => {
    if (typeof initialAddress === 'string') {
      setAddressQuery(initialAddress);
    }
  }, [initialAddress]);

  // Keep ZIP in sync with initialZipCode
  useEffect(() => {
    if (typeof initialZipCode === 'string') {
      setZipValue(initialZipCode);
    }
  }, [initialZipCode]);

  // Initialize from initialLocation
  useEffect(() => {
    if (!initialLocation || statesLoading || states.length === 0) return;
    if (selectedState) return; // Already initialized

    const parsed = parseLocation(initialLocation);
    if (!parsed) return;

    const stateOpt = findOption(states, parsed.state);
    if (stateOpt) {
      setSelectedState(stateOpt);
    }
  }, [initialLocation, states, statesLoading, selectedState]);

  useEffect(() => {
    if (!initialLocation || !selectedState || citiesLoading || cities.length === 0) return;
    if (selectedCity) return; // Already initialized

    const parsed = parseLocation(initialLocation);
    if (!parsed) return;

    const cityOpt = findOption(cities, parsed.city) ?? { label: parsed.city, value: parsed.city };
    setSelectedCity(cityOpt);

    const loc = `${cityOpt.label}, ${selectedState.label}`;
    onLocationSubmit(loc);
  }, [initialLocation, selectedState, cities, citiesLoading, selectedCity, onLocationSubmit]);

  // Address autocomplete fetching
  const fetchSuggestions = useCallback(async (input: string) => {
    if (!process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN) return [];
    try {
      const params = new URLSearchParams({
        access_token: process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN,
        country: 'us',
        types: 'address',
        limit: '6',
        autocomplete: 'true',
        language: 'en',
      });

      if (effectiveProximity) {
        params.set('proximity', `${effectiveProximity.lng},${effectiveProximity.lat}`);
      }

      const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(input)}.json?${params.toString()}`;
      const res = await fetch(url);
      const data = await res.json();
      let results = (data?.features as Suggestion[]) || [];

      // Filter by state and/or city if provided
      if (selectedState || selectedCity) {
        results = results.filter(sugg => {
          let matchesState = true;
          let matchesCity = true;

          if (selectedState) {
            const stateContext = sugg.context?.find(c => c.id.startsWith('region'));
            matchesState = stateContext?.short_code?.replace('US-', '') === selectedState.value;
          }

          if (selectedCity) {
            const cityContext = sugg.context?.find(c => c.id.startsWith('place'));
            matchesCity = cityContext?.text.toLowerCase() === selectedCity.label.toLowerCase();
          }

          return matchesState && matchesCity;
        });
      }

      return results;
    } catch {
      return [];
    }
  }, [effectiveProximity, selectedState, selectedCity]);

  const handleAddressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setAddressQuery(value);
    addressRHFOnChange(e);

    // Only clear address and location errors (not zipCode - it's separate)
    if (value.trim() && onFieldChange) {
      onFieldChange('address');
      onFieldChange('location');
    }

    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (value.length > 2) {
      debounceRef.current = setTimeout(async () => {
        const next = await fetchSuggestions(value);
        setSuggestions(next);
        setShowSuggestions(next.length > 0);
        setActiveIndex(-1);
      }, 300);
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
      setActiveIndex(-1);
    }
  };

  const parseSuggestion = (s: Suggestion) => {
    const address = (s.place_name?.split(',')[0] || '').trim();
    let city = '', state = '', zipCode = '';
    for (const c of s.context || []) {
      if (c.id.startsWith('place')) city = c.text;
      if (c.id.startsWith('region')) state = c.text;
      if (c.id.startsWith('postcode')) zipCode = c.text;
    }
    return {
      address, city, state, zipCode,
      coordinates: { lat: s.geometry.coordinates[1], lng: s.geometry.coordinates[0] },
    };
  };

  const applySuggestion = (s: Suggestion) => {
    const parsed = parseSuggestion(s);
    setAddressQuery(parsed.address);
    setShowSuggestions(false);
    setActiveIndex(-1);

    // Sync state/city dropdowns from address
    const stateOpt = findOption(states, parsed.state) ?? { label: parsed.state, value: parsed.state };
    const cityOpt: SelectOption = { label: parsed.city, value: parsed.city };

    setSelectedState(stateOpt);
    setSelectedCity(cityOpt);
    setCoordinates(parsed.coordinates);
    setZipValue(parsed.zipCode);

    // Emit location
    const loc = `${parsed.city}, ${parsed.state}`;
    onLocationSubmit(loc);

    // Forward to parent
    onAddressSelect?.(parsed);
  };

  // Close suggestions when clicking outside
  useEffect(() => {
    const clickHandler = (e: MouseEvent) => {
      if (!addressRootRef.current) return;
      if (!addressRootRef.current.contains(e.target as Node)) setShowSuggestions(false);
    };
    document.addEventListener('mousedown', clickHandler);
    return () => document.removeEventListener('mousedown', clickHandler);
  }, []);

  const handleAddressKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!showSuggestions || suggestions.length === 0) return;
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveIndex((i) => {
        const ni = Math.min(i + 1, suggestions.length - 1);
        addressListRef.current?.children[ni]?.scrollIntoView({ block: 'nearest' });
        return ni;
      });
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveIndex((i) => {
        const ni = Math.max(i - 1, 0);
        addressListRef.current?.children[ni]?.scrollIntoView({ block: 'nearest' });
        return ni;
      });
    } else if (e.key === 'Enter') {
      if (activeIndex >= 0 && activeIndex < suggestions.length) {
        e.preventDefault();
        applySuggestion(suggestions[activeIndex]);
      }
    } else if (e.key === 'Escape') {
      setShowSuggestions(false);
    }
  };

  const handleStateChange = (opt: SingleValue<SelectOption>) => {
    setSelectedState(opt);
    setSelectedCity(null);

    if (!opt) {
      onLocationSubmit(null);
    } else {
      // Clear location error when state is selected (not address or zipCode)
      if (onFieldChange) {
        onFieldChange('location');
      }
    }

    setStateInputValue('');
  };

  const handleCityChange = (opt: SingleValue<SelectOption>) => {
    setSelectedCity(opt);

    if (opt && selectedState) {
      const loc = `${opt.label}, ${selectedState.label}`;
      onLocationSubmit(loc);

      // Clear location error when city is selected (not address or zipCode)
      if (onFieldChange) {
        onFieldChange('location');
      }
    } else {
      onLocationSubmit(null);
    }

    setCityInputValue('');
  };

  const handleZipChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setZipValue(value);
    zipRHFOnChange(e);

    // Only clear zipCode error when typing (not other fields)
    if (value.trim() && onFieldChange) {
      onFieldChange('zipCode');
    }
  };

  // Determine if location fields have errors - treat all fields as one unit
  const hasLocationError = !!(errors.location || errors.address || errors.zipCode);

  // Floating label logic for each field - all use the same error state
  const addressLabelFloated = addressFocused || addressQuery || hasLocationError;
  const zipLabelFloated = zipFocused || zipValue || hasLocationError;
  const stateLabelFloated = stateFocused || stateMenuOpen || selectedState || hasLocationError;
  const cityLabelFloated = cityFocused || cityMenuOpen || selectedCity || hasLocationError;

  const addressLabelSize = addressLabelFloated ? 'text-xs scale-75' : 'text-sm scale-100';
  const addressLabelPos = addressLabelFloated ? 'top-5 -translate-y-4' : 'top-1/2 -translate-y-1/2';

  const zipLabelSize = zipLabelFloated ? 'text-xs scale-75' : 'text-sm scale-100';
  const zipLabelPos = zipLabelFloated ? 'top-5 -translate-y-4' : 'top-1/2 -translate-y-1/2';

  const stateLabelSize = stateLabelFloated ? 'text-xs scale-75' : 'text-sm scale-100';
  const stateLabelPos = stateLabelFloated ? 'top-5 -translate-y-4' : 'top-1/2 -translate-y-1/2';

  const cityLabelSize = cityLabelFloated ? 'text-xs scale-75' : 'text-sm scale-100';
  const cityLabelPos = cityLabelFloated ? 'top-5 -translate-y-4' : 'top-1/2 -translate-y-1/2';

  const stateStyles = makeSelectStyles(hasLocationError);
  const cityStyles = makeSelectStyles(hasLocationError);

  return (
    <div className="flex flex-col gap-4">
      {/* Address Autocomplete with Floating Label */}
      <div className="w-full relative" ref={addressRootRef}>
        <input
          id="address"
          name={addressName}
          ref={addressRefFromRegister}
          value={addressQuery}
          onChange={handleAddressChange}
          onBlur={(e) => {
            setAddressFocused(false);
            addressRHFOnBlur(e);
          }}
          onFocus={() => setAddressFocused(true)}
          onKeyDown={handleAddressKeyDown}
          placeholder=" "
          autoComplete="off"
          className={`
            peer w-full p-3 pt-6 bg-white border rounded-xl outline-none
            transition-all duration-200 ease-out
            hover:border-gray-400 pl-4 pr-4 h-[56px]
            ${hasLocationError
              ? 'border-red-400 focus:border-red-400'
              : 'border-gray-300 focus:border-[#60A5FA]'
            }
          `}
          aria-autocomplete="list"
          aria-controls="address-listbox"
          aria-expanded={showSuggestions}
          aria-activedescendant={activeIndex >= 0 ? `address-option-${activeIndex}` : undefined}
        />
        <label
          htmlFor="address"
          className={`
            absolute duration-150 transform origin-[0] pointer-events-none left-4
            ${hasLocationError ? 'text-red-500' : 'text-gray-600'}
            ${addressLabelSize} ${addressLabelPos}
          `}
        >
          Street Address
        </label>

        {showSuggestions && suggestions.length > 0 && (
          <div
            id="address-listbox"
            role="listbox"
            ref={addressListRef}
            className="absolute w-full bg-white rounded-xl mt-1 z-[9999] max-h-[220px] overflow-y-auto border border-gray-200 p-1 shadow-lg"
          >
            {suggestions.map((sugg, index) => (
              <div
                id={`address-option-${index}`}
                role="option"
                aria-selected={activeIndex === index}
                key={`${sugg.place_name}-${index}`}
                className={`p-2.5 px-3 cursor-pointer text-sm rounded-lg transition-all duration-200
                  ${activeIndex === index ? 'bg-[#60A5FA]/12 text-[#2563eb] font-medium' : 'text-gray-700 hover:bg-[#60A5FA]/6'}
                `}
                onMouseEnter={() => setActiveIndex(index)}
                onMouseLeave={() => setActiveIndex(-1)}
                onClick={() => applySuggestion(sugg)}
              >
                {sugg.place_name}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* State, City, ZIP Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {/* State Select with Floating Label */}
        <div className="relative">
          <div
            className="relative cursor-pointer"
            tabIndex={-1}
            onPointerDownCapture={(e) => {
              e.preventDefault();
              // @ts-expect-error runtime method exists in react-select
              stateSelectRef.current?.openMenu?.();
              stateSelectRef.current?.focus();
            }}
            onMouseDownCapture={(e) => {
              e.preventDefault();
              // @ts-expect-error runtime method exists in react-select
              stateSelectRef.current?.openMenu?.();
              stateSelectRef.current?.focus();
            }}
          >
            <Select<SelectOption, false, GroupBase<SelectOption>>
              ref={stateSelectRef}
              classNamePrefix="state-select"
              styles={stateStyles}
              options={states}
              value={selectedState}
              onChange={handleStateChange}
              isLoading={statesLoading}
              isDisabled={false}
              getOptionLabel={(o) => o.label}
              getOptionValue={(o) => o.value}
              placeholder=" "
              noOptionsMessage={() => 'No states found'}
              onFocus={() => setStateFocused(true)}
              onBlur={() => setStateFocused(false)}
              onMenuOpen={() => {
                setStateMenuOpen(true);
                setStateInputValue('');
              }}
              onMenuClose={() => {
                setStateMenuOpen(false);
                setStateInputValue('');
              }}
              openMenuOnClick
              openMenuOnFocus
              menuShouldScrollIntoView
              isSearchable={true}
              inputValue={stateInputValue}
              onInputChange={(val, meta) => {
                if (meta.action === 'input-change') setStateInputValue(val);
                if (meta.action === 'menu-close') setStateInputValue('');
                return val;
              }}
              name="state-select"
              inputId="state-input"
              components={{ Input: AutoCompleteOffInput }}
              menuPortalTarget={typeof window !== 'undefined' ? document.body : null}
              menuPosition="fixed"
            />

            <label
              className={`
                absolute left-4 origin-[0] pointer-events-none transition-all duration-150
                ${hasLocationError ? 'text-red-500' : 'text-gray-600'}
                ${stateLabelSize} ${stateLabelPos}
              `}
            >
              State
            </label>
          </div>

          {hasLocationError && (
            <span className="text-red-500 text-xs mt-1.5 block font-medium">
              {errors.location?.message as string || errors.address?.message as string || 'Please complete the location fields'}
            </span>
          )}
        </div>

        {/* City Select with Floating Label */}
        <div className="relative">
          <div
            className="relative cursor-pointer"
            tabIndex={-1}
            onPointerDownCapture={(e) => {
              e.preventDefault();
              // @ts-expect-error runtime method exists in react-select
              citySelectRef.current?.openMenu?.();
              citySelectRef.current?.focus();
            }}
            onMouseDownCapture={(e) => {
              e.preventDefault();
              // @ts-expect-error runtime method exists in react-select
              citySelectRef.current?.openMenu?.();
              citySelectRef.current?.focus();
            }}
          >
            <Select<SelectOption, false, GroupBase<SelectOption>>
              ref={citySelectRef}
              classNamePrefix="city-select"
              styles={cityStyles}
              options={cities}
              value={selectedCity}
              onChange={handleCityChange}
              isLoading={citiesLoading}
              isDisabled={!selectedState}
              getOptionLabel={(o) => o.label}
              getOptionValue={(o) => o.value}
              placeholder=" "
              noOptionsMessage={() => selectedState ? 'No cities found' : 'Please select a state first'}
              onFocus={() => setCityFocused(true)}
              onBlur={() => setCityFocused(false)}
              onMenuOpen={() => {
                setCityMenuOpen(true);
                setCityInputValue('');
              }}
              onMenuClose={() => {
                setCityMenuOpen(false);
                setCityInputValue('');
              }}
              openMenuOnClick
              openMenuOnFocus
              menuShouldScrollIntoView
              isSearchable={true}
              inputValue={cityInputValue}
              onInputChange={(val, meta) => {
                if (meta.action === 'input-change') setCityInputValue(val);
                if (meta.action === 'menu-close') setCityInputValue('');
                return val;
              }}
              name="city-select"
              inputId="city-input"
              components={{ Input: AutoCompleteOffInput }}
              menuPortalTarget={typeof window !== 'undefined' ? document.body : null}
              menuPosition="fixed"
            />

            <label
              className={`
                absolute left-4 origin-[0] pointer-events-none transition-all duration-150
                ${hasLocationError ? 'text-red-500' : 'text-gray-600'}
                ${cityLabelSize} ${cityLabelPos}
              `}
            >
              City
            </label>
          </div>
        </div>

        {/* ZIP Code with Floating Label */}
        <div className="relative">
          <input
            id="zipCode"
            name={zipName}
            ref={zipRefFromRegister}
            value={zipValue}
            onChange={handleZipChange}
            onBlur={(e) => {
              setZipFocused(false);
              zipRHFOnBlur(e);
            }}
            onFocus={() => setZipFocused(true)}
            placeholder=" "
            autoComplete="off"
            className={`
              peer w-full p-3 pt-6 bg-white border rounded-xl outline-none
              transition-all duration-200 ease-out
              hover:border-gray-400 pl-4 pr-4 h-[56px]
              ${hasLocationError
                ? 'border-red-400 focus:border-red-400'
                : 'border-gray-300 focus:border-[#60A5FA]'
              }
            `}
          />
          <label
            htmlFor="zipCode"
            className={`
              absolute duration-150 transform origin-[0] pointer-events-none left-4
              ${hasLocationError ? 'text-red-500' : 'text-gray-600'}
              ${zipLabelSize} ${zipLabelPos}
            `}
          >
            ZIP Code
          </label>

          {errors.zipCode && (
            <span className="text-red-500 text-xs mt-1.5 block font-medium">
              {typeof errors.zipCode?.message === 'string'
                ? (errors.zipCode?.message as string)
                : 'ZIP Code is required'}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

export default LocationInput;
