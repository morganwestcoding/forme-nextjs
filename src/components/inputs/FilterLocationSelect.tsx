'use client';

import React, { useState } from 'react';
import Select, { StylesConfig, GroupBase } from 'react-select';
import useStates from '@/app/hooks/useStates';
import useCities from '@/app/hooks/useCities';

interface LocationSelection {
  label: string;
  value: string;
}

interface FilterLocationSelectProps {
  onLocationSubmit: (location: {
    state: string;
    city: string;
  } | null) => void;
}

const FilterLocationSelect: React.FC<FilterLocationSelectProps> = ({ 
  onLocationSubmit
}) => {
  const [selectedCountry] = useState<string>('6252001');
  const [selectedState, setSelectedState] = useState<LocationSelection | null>(null);
  const [selectedCity, setSelectedCity] = useState<LocationSelection | null>(null);

  const { states, loading: statesLoading } = useStates(selectedCountry);
  const { cities, loading: citiesLoading } = useCities(selectedState?.value ?? '');

  const stateOptions: LocationSelection[] = states.map(state => ({
    label: state.label,
    value: state.value
  }));

  const cityOptions: LocationSelection[] = cities.map(city => ({
    label: city.label,
    value: city.value
  }));

  const handleStateChange = (selectedOption: LocationSelection | null) => {
    setSelectedState(selectedOption);
    setSelectedCity(null); // Reset city when state changes
    if (selectedOption) {
      onLocationSubmit({
        state: selectedOption.label,
        city: '',
      });
    } else {
      onLocationSubmit(null);
    }
  };

  const handleCityChange = (selectedOption: LocationSelection | null) => {
    setSelectedCity(selectedOption);
    if (selectedState) {
      if (selectedOption) {
        onLocationSubmit({
          state: selectedState.label,
          city: selectedOption.label,
        });
      } else {
        onLocationSubmit({
          state: selectedState.label,
          city: '',
        });
      }
    }
  };

  const customStyles: StylesConfig<LocationSelection, false> = {
    menu: (styles) => ({
      ...styles,
      backgroundColor: 'rgba(0, 0, 0, 0.75)',
      backdropFilter: 'blur(8px)',
      borderRadius: '0.5rem',
      padding: '0.5rem',
      maxHeight: '250px',
    }),
    menuList: (styles) => ({
      ...styles,
      backgroundColor: 'transparent',
      padding: '0',
      maxHeight: '220px',
      overflowY: 'auto',
      '&::-webkit-scrollbar': {
        width: '6px',
      },
      '&::-webkit-scrollbar-track': {
        background: 'transparent',
      },
      '&::-webkit-scrollbar-thumb': {
        background: 'rgba(255, 255, 255, 0.3)',
        borderRadius: '3px',
      },
      '&::-webkit-scrollbar-thumb:hover': {
        background: 'rgba(255, 255, 255, 0.5)',
      },
    }),
    option: (styles, { isFocused }) => ({
      ...styles,
      backgroundColor: isFocused ? 'rgba(128, 128, 128, 0.5)' : 'transparent',
      color: 'white',
      cursor: 'pointer',
      padding: '0.75rem',
      borderRadius: '0.375rem',
      '&:hover': {
        backgroundColor: 'rgba(128, 128, 128, 0.5)',
      }
    }),
    control: (styles) => ({
      ...styles,
      backgroundColor: 'transparent',
      borderColor: 'white',
      color: 'white',
      boxShadow: 'none',
      minHeight: '62px',
      height: '62px',
      '&:hover': {
        borderColor: 'white',
      },
      borderRadius: '0.4rem',
    }),
    singleValue: (styles) => ({
      ...styles,
      color: 'white',
      marginLeft: '0.5rem',
    }),
    input: (styles) => ({
      ...styles,
      color: 'white',
      marginLeft: '0.5rem',
    }),
    placeholder: (styles) => ({
      ...styles,
      color: '#a2a2a2',
      marginLeft: '0.5rem',
    }),
    valueContainer: (styles) => ({
      ...styles,
      height: '58px',
      padding: '0 8px 0 0.5rem',
    }),
    dropdownIndicator: (styles) => ({
      ...styles,
      color: 'white',
      '&:hover': {
        color: 'rgba(255, 255, 255, 0.7)',
      },
    }),
    indicatorSeparator: (styles) => ({
      ...styles,
      backgroundColor: 'white',
    }),
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
      <Select
        options={stateOptions}
        value={selectedState}
        onChange={handleStateChange}
        placeholder="State"
        styles={customStyles}
        getOptionLabel={(option) => option.label}
        getOptionValue={(option) => option.value}
        className='text-sm rounded-2xl'
        isLoading={statesLoading}
        isClearable
        noOptionsMessage={() => "No states found"}
      />
      <Select
        options={cityOptions}
        value={selectedCity}
        onChange={handleCityChange}
        placeholder="City"
        styles={customStyles}
        getOptionLabel={(option) => option.label}
        getOptionValue={(option) => option.value}
        isDisabled={!selectedState}
        isLoading={citiesLoading}
        className='text-sm rounded-2xl'
        isClearable
        noOptionsMessage={() => selectedState ? "No cities found" : "Please select a state first"}
      />
    </div>
  );
};

export default FilterLocationSelect;