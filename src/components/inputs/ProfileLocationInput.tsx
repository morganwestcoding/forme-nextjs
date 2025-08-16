'use client';
import React, { useMemo, useState } from 'react';
import Select, { SingleValue } from 'react-select';
import useStates from '@/app/hooks/useStates';
import useCities from '@/app/hooks/useCities';
import MapComponent from '../MapComponent';

type LocationSelection = { label: string; value: string };

interface ProfileLocationInputProps {
  onLocationSubmit: (location: string | null) => void;
}

/** ------- Shared select styles to match <Input> exactly ------- */
const makeSelectClasses = (hasError = false) => ({
  control: (state: any) => `
    w-full
    bg-neutral-50
    border
    ${hasError ? 'border-rose-500' : state.isFocused ? 'border-black' : 'border-neutral-300'}
    rounded-lg
    outline-none
    transition
    min-h-[56px]        /* p-3 pt-6 equivalent height */
    shadow-none
  `,
  valueContainer: () => `
    px-4 pr-10
    py-3 pt-6          /* matches Input’s p-3 pt-6 */
  `,
  placeholder: () => `
    opacity-0          /* keep placeholder for a11y, but hide (we use floating label) */
    text-sm
  `,
  singleValue: () => `text-black`,
  input: () => `text-neutral-700`,
  menu: () => `
    bg-white border border-neutral-200
    rounded-lg shadow-md mt-1 z-[9999]
  `,
  menuList: () => `p-1`,
  option: (state: any) => `
    cursor-pointer px-3 py-2 rounded-md
    ${state.isSelected ? 'bg-neutral-200 text-black' : state.isFocused ? 'bg-neutral-100' : ''}
  `,
  indicatorsContainer: () => `
    absolute right-0 top-0 h-full flex items-center pr-3
  `,
  dropdownIndicator: (state: any) => `
    p-0 m-0
    ${state.isFocused ? 'text-black' : 'text-neutral-500'}
  `,
  clearIndicator: () => `p-0 m-0`,
  indicatorSeparator: () => `hidden`,
  container: () => `relative w-full`,
});

/** A small wrapper that gives react-select a real floating label like your Input */
function FloatingLabelSelect(props: {
  label: string;
  value: LocationSelection | null;
  onChange: (v: SingleValue<LocationSelection>) => void;
  options: LocationSelection[];
  isLoading?: boolean;
  isDisabled?: boolean;
  noOptionsMessage?: () => string;
}) {
  const [focused, setFocused] = useState(false);
  const hasValue = !!props.value;
  const classes = useMemo(() => makeSelectClasses(false), []);

  return (
    <div className="relative">
      <Select<LocationSelection, false>
        classNames={classes as any}
        classNamePrefix="forme"
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
        // ensure keyboard focus isn’t swallowed
        tabSelectsValue
        // keep the menu above modals reliably
        menuPortalTarget={typeof window !== 'undefined' ? document.body : null}
        styles={{
          menuPortal: (base) => ({ ...base, zIndex: 9999 }),
        }}
      />
      <label
        className={[
          'absolute left-4 top-5 origin-[0] text-sm text-neutral-500',
          'transition-transform duration-150',
          // when focused or has a value, mimic Input: scale-75 and raise by ~1rem
          (focused || hasValue) ? 'scale-75 -translate-y-4' : 'scale-100 translate-y-0'
        ].join(' ')}
      >
        {props.label}
      </label>
    </div>
  );
}

const ProfileLocationInput: React.FC<ProfileLocationInputProps> = ({ onLocationSubmit }) => {
  const [selectedState, setSelectedState] = useState<LocationSelection | null>(null);
  const [selectedCity, setSelectedCity] = useState<LocationSelection | null>(null);
  const [currentLocation, setCurrentLocation] = useState<string | null>(null);

  const { states, loading: statesLoading } = useStates('US');
  const { cities, loading: citiesLoading } = useCities(selectedState?.value ?? '');

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
