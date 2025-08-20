'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';
import Select, {
  SingleValue,
  StylesConfig,
  GroupBase,
  type SelectInstance,
} from 'react-select';
import useStates from '@/app/hooks/useStates';
import useCities from '@/app/hooks/useCities';
import MapComponent from '../MapComponent';

type LocationSelection = { label: string; value: string };

interface ProfileLocationInputProps {
  onLocationSubmit: (location: string | null) => void;
  /** When editing, pass the saved location string, e.g. "Santa Monica, California" */
  initialLocation?: string | null;
}

/** ---- Dimensions to mirror your <Input> layout ---- **/
const CONTROL_HEIGHT = 64;   // h-16
const BORDER_RADIUS  = 8;    // rounded-lg
const PADDING_LEFT   = 16;   // pl-4
const PADDING_RIGHT  = 40;   // room for chevron
const PADDING_TOP    = 24;   // pt-6 → baseline under label
const PADDING_BOTTOM = 12;   // pb-3
const FONT_SIZE_PX   = 16;   // text-base
const LINE_HEIGHT_PX = 24;   // leading-6

/** Strong styles to enforce exact look/size/alignment */
const selectStyles: StylesConfig<LocationSelection, false, GroupBase<LocationSelection>> = {
  control: (base, state) => ({
    ...base,
    minHeight: CONTROL_HEIGHT,
    height: CONTROL_HEIGHT,
    borderRadius: BORDER_RADIUS,
    backgroundColor: '#fafafa',                               // bg-neutral-50
    borderColor: state.isFocused ? '#000000' : '#d4d4d4',     // black vs neutral-300
    boxShadow: 'none',
    ':hover': { borderColor: state.isFocused ? '#000000' : '#d4d4d4' },
    padding: 0,
    cursor: 'pointer',
  }),
  valueContainer: (base) => ({
    ...base,
    paddingLeft: PADDING_LEFT,
    paddingRight: PADDING_RIGHT,
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
    color: '#000000',
    fontSize: `${FONT_SIZE_PX}px`,
    lineHeight: `${LINE_HEIGHT_PX}px`,
    margin: 0,
    padding: 0,
  }),
  input: (base) => ({
    ...base,
    color: '#262626',
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
    color: '#737373',
  }),
  indicatorSeparator: () => ({ display: 'none' }),
  dropdownIndicator: (base) => ({ ...base, padding: 0, margin: 0 }),
  clearIndicator: (base) => ({ ...base, padding: 0, margin: 0 }),

  menuPortal: (base) => ({ ...base, zIndex: 9999 }),
  menu: (base) => ({
    ...base,
    borderRadius: BORDER_RADIUS,
    border: '1px solid #e5e5e5',
    overflow: 'hidden',
    marginTop: 4,
  }),
  menuList: (base) => ({ ...base, padding: 8 }),
  option: (base, state) => ({
    ...base,
    borderRadius: 6,
    padding: '10px 14px',
    backgroundColor: state.isSelected
      ? '#e5e5e5'
      : state.isFocused
      ? '#f5f5f5'
      : '#ffffff',
    color: '#000000',
    cursor: 'pointer',
  }),
};

/** Tailwind classNames just to mirror focus border color */
const classNames = {
  container: () => 'relative w-full',
  control: (state: any) =>
    [
      'bg-neutral-50 border rounded-lg transition outline-none',
      state.isFocused ? 'border-black' : 'border-neutral-300',
    ].join(' '),
};

/** Floating-label Select */
function FloatingLabelSelect(props: {
  label: string;
  value: LocationSelection | null;
  onChange: (v: SingleValue<LocationSelection>) => void;
  options: LocationSelection[];
  isLoading?: boolean;
  isDisabled?: boolean;
  noOptionsMessage?: () => string;
  styles?: StylesConfig<LocationSelection, false, GroupBase<LocationSelection>>;
}) {
  const [focused, setFocused] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const hasValue = !!props.value;

  const styles = useMemo(() => props.styles ?? selectStyles, [props.styles]);
  const selectRef = useRef<SelectInstance<LocationSelection, false, GroupBase<LocationSelection>>>(null);

  return (
    <div
      className="relative"
      tabIndex={-1}
      onPointerDownCapture={() => {
        selectRef.current?.focus();
        if (!menuOpen) {
          // @ts-expect-error internal method exists at runtime
          selectRef.current?.openMenu?.();
        }
      }}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          // @ts-expect-error internal method
          selectRef.current?.openMenu?.();
        }
      }}
    >
      <Select<LocationSelection, false, GroupBase<LocationSelection>>
        ref={selectRef}
        classNamePrefix="rsloc"
        classNames={classNames as any}
        styles={styles}
        options={props.options}
        value={props.value}
        onChange={props.onChange}
        isLoading={props.isLoading}
        isDisabled={props.isDisabled}
        getOptionLabel={(o) => o.label}
        getOptionValue={(o) => o.value}
        placeholder=" "
        noOptionsMessage={props.noOptionsMessage}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        onMenuOpen={() => setMenuOpen(true)}
        onMenuClose={() => setMenuOpen(false)}
        openMenuOnClick
        openMenuOnFocus
        menuShouldScrollIntoView
        isSearchable
        menuPortalTarget={typeof window !== 'undefined' ? document.body : null}
        menuPosition="fixed"
      />
      <label
        className={[
          'absolute left-4 top-5 origin-[0] text-sm text-neutral-500 pointer-events-none',
          'transition-transform duration-150',
          (focused || hasValue) ? 'scale-75 -translate-y-4' : 'scale-100 translate-y-0',
        ].join(' ')}
      >
        {props.label}
      </label>
    </div>
  );
}

/** Normalize strings for matching (case/diacritics/punct/abbrev) */
const normalize = (s: string) =>
  s
    .toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')   // strip accents
    .replace(/\bst[.\s]\b/g, 'saint ')                  // St. => Saint
    .replace(/\bsaint\b/g, 'st ')                       // also handle reverse datasets
    .replace(/[^a-z0-9]+/g, ' ')                        // collapse punctuation
    .replace(/\s+/g, ' ')                               // squeeze spaces
    .trim();

/** Try multiple ways to find a city option */
function findCityOption(cities: LocationSelection[], desiredRaw: string): LocationSelection | undefined {
  const want = normalize(desiredRaw);
  if (!want) return;

  // 1) exact label/value match post-normalize
  let match = cities.find(c => normalize(c.label) === want || normalize(c.value) === want);
  if (match) return match;

  // 2) inclusive match (handles "los angeles" vs "los angeles city", etc.)
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

const ProfileLocationInput: React.FC<ProfileLocationInputProps> = ({ onLocationSubmit, initialLocation }) => {
  const [selectedState, setSelectedState] = useState<LocationSelection | null>(null);
  const [selectedCity, setSelectedCity] = useState<LocationSelection | null>(null);
  const [currentLocation, setCurrentLocation] = useState<string | null>(null);

  const { states, loading: statesLoading } = useStates('US');
  const { cities, loading: citiesLoading } = useCities(selectedState?.value ?? '');

  // One-time prefill
  const initializedRef = useRef(false);
  const targetCityRef = useRef<string | null>(null);

  const findStateOption = (token: string): LocationSelection | undefined => {
    const want = normalize(token);
    return states.find(s => normalize(s.label) === want || normalize(s.value) === want);
  };

  // Stage 1: pick State from initialLocation
  useEffect(() => {
    if (initializedRef.current) return;
    if (!initialLocation) return;
    if (statesLoading || states.length === 0) return;

    // Accept "City, State" | "State, City" | "City, State, Country"
    const parts = initialLocation.split(',').map(p => p.trim()).filter(Boolean);
    if (parts.length < 2) return;

    // Try last part as state (handles "City, State" and "City, State, Country")
    const last = parts[parts.length - 1];
    const secondLast = parts[parts.length - 2];

    let stateOpt = findStateOption(last) || findStateOption(secondLast);
    let cityName = stateOpt && stateOpt.label === last ? secondLast : parts[0];

    // If still not found, try the first token as state (for "State, City")
    if (!stateOpt) {
      const maybeState = findStateOption(parts[0]);
      if (maybeState) {
        stateOpt = maybeState;
        cityName = parts[1] ?? cityName;
      }
    }

    if (stateOpt) {
      setSelectedState(stateOpt);
      targetCityRef.current = cityName ?? null; // keep original case for synthetic option
      // Wait for cities to load to select city
    }
  }, [initialLocation, states, statesLoading]);

  // Stage 2: set City once its list is loaded
  useEffect(() => {
    if (initializedRef.current) return;
    if (!selectedState) return;
    if (citiesLoading) return;

    const desiredCityRaw = (targetCityRef.current ?? '').trim();
    if (!desiredCityRaw) {
      initializedRef.current = true;
      return;
    }

    const cityOpt = findCityOption(cities, desiredCityRaw);

    if (cityOpt) {
      setSelectedCity(cityOpt);
      const loc = `${cityOpt.label}, ${selectedState.label}`;
      setCurrentLocation(loc);
      onLocationSubmit(loc);
    } else {
      // Fallback: show the saved city even if our dataset doesn't include it
      const synthetic: LocationSelection = { label: desiredCityRaw, value: desiredCityRaw };
      setSelectedCity(synthetic);
      const loc = `${desiredCityRaw}, ${selectedState.label}`;
      setCurrentLocation(loc);
      onLocationSubmit(loc);
      // Optional: console.warn for debugging missing city data
      // console.warn('[Location prefill] City not found in dataset:', { desiredCityRaw, state: selectedState });
    }

    initializedRef.current = true;
  }, [selectedState, cities, citiesLoading, onLocationSubmit]);

  const handleStateChange = (opt: SingleValue<LocationSelection>) => {
    setSelectedState(opt ?? null);
    setSelectedCity(null);
    setCurrentLocation(null);
    if (!opt) onLocationSubmit(null);
  };

  const handleCityChange = (opt: SingleValue<LocationSelection>) => {
    setSelectedCity(opt ?? null);
    const location = opt ? `${opt.label}, ${selectedState?.label}` : null;
    setCurrentLocation(location);
    onLocationSubmit(location);
  };

  return (
    <div className="flex flex-col gap-3 -mt-4">
      <div className="flex flex-col gap-3">
        <FloatingLabelSelect
          label="State"
          options={states}
          value={selectedState}
          onChange={handleStateChange}
          isLoading={statesLoading}
          noOptionsMessage={() => 'No states found'}
        />
        <FloatingLabelSelect
          label="City"
          options={cities}
          value={selectedCity}
          onChange={handleCityChange}
          isLoading={citiesLoading}
          isDisabled={!selectedState}
          noOptionsMessage={() =>
            selectedState ? 'No cities found' : 'Please select a state first'
          }
        />
      </div>

      <div className="mt-4">
        <MapComponent location={currentLocation} />
      </div>
    </div>
  );
};

export default ProfileLocationInput;
