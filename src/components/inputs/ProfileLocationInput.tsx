'use client';
import React, { useState } from 'react';
import Select from 'react-select';
import useStates from '@/app/hooks/useStates';
import useCities from '@/app/hooks/useCities';

interface LocationSelection {
  label: string;
  value: string;
}

interface ProfileLocationInputProps {
  onLocationSubmit: (location: string | null) => void;
}

const ProfileLocationInput: React.FC<ProfileLocationInputProps> = ({ onLocationSubmit }) => {
  const [selectedCountry] = useState<string>('6252001');
  const [selectedState, setSelectedState] = useState<LocationSelection | null>(null);
  const [selectedCity, setSelectedCity] = useState<LocationSelection | null>(null);

  const states = useStates(selectedCountry);
  const cities = useCities(selectedState?.value ?? '');

  const handleStateChange = (selectedOption: LocationSelection | null) => {
    setSelectedState(selectedOption);
    setSelectedCity(null);
  };

  const handleCityChange = (selectedOption: LocationSelection | null) => {
    setSelectedCity(selectedOption);
    const location = selectedOption ? `${selectedOption.label}, ${selectedState?.label}` : null;
    onLocationSubmit(location);
  };

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
      !font-normal
    `,
    singleValue: () => '!text-black pt-2',
    input: () => '!text-neutral-500 !font-normal',
    placeholder: () => '!text-neutral-500 !text-sm !font-normal', 
    menu: () => '!bg-white !rounded-md !border !border-neutral-200 !shadow-md !mt-1',
    menuList: () => '!p-0',
    valueContainer: () => '!p-0',
    container: (state: any) => `
      !relative !w-full
      ${state.isFocused ? 'peer-focus:border-black' : ''}
    `
};

  return (
    <div className="flex flex-col gap-3">
      <div className="relative">
        <Select
          options={states}
          value={selectedState}
          onChange={handleStateChange}
          placeholder=" "
          classNames={selectClasses}
          getOptionLabel={(option) => option.label}
          getOptionValue={(option) => option.value}
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
          classNames={selectClasses}
          getOptionLabel={(option) => option.label}
          getOptionValue={(option) => option.value}
          noOptionsMessage={() => "No cities found"}
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
  );
};

export default ProfileLocationInput;