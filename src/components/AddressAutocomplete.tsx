'use client';

import { useState, useEffect, useRef } from 'react';
import { FieldValues, UseFormRegister, FieldErrors } from "react-hook-form";

interface AddressAutocompleteProps {
    id: string;
    label: string;
    register: UseFormRegister<FieldValues>;
    required?: boolean;
    disabled?: boolean;
    errors: FieldErrors;  // Add this line
    onAddressSelect: (address: {
      address: string;
      city: string;
      state: string;
      zipCode: string;
      coordinates: {
        lat: number;
        lng: number;
      };
    }) => void;
  }
interface Suggestion {
  place_name: string;
  geometry: {
    coordinates: [number, number];
  };
  context: Array<{
    id: string;
    text: string;
    short_code?: string;
  }>;
}

const AddressAutocomplete: React.FC<AddressAutocompleteProps> = ({
  id,
  label,
  register,
  required,
  disabled,
  onAddressSelect
}) => {
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const debounceTimeout = useRef<NodeJS.Timeout>();

  const getSuggestions = async (input: string) => {
    try {
      const response = await fetch(
        `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(input)}.json?` + 
        `access_token=${process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN}&` +  // Changed this line
        'country=us&' +
        'types=address'
      );
      const data = await response.json();
      return data.features || [];
    } catch (error) {
      console.error('Error fetching suggestions:', error);
      return [];
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setQuery(value);

    if (debounceTimeout.current) {
      clearTimeout(debounceTimeout.current);
    }

    if (value.length > 2) {
      debounceTimeout.current = setTimeout(async () => {
        const newSuggestions = await getSuggestions(value);
        setSuggestions(newSuggestions);
        setShowSuggestions(true);
      }, 300);
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  };

  const handleSuggestionClick = (suggestion: Suggestion) => {
    const addressComponents = suggestion.place_name.split(',');
    const address = addressComponents[0].trim();
    
    let city = '', state = '', zipCode = '';
    suggestion.context.forEach(context => {
      if (context.id.startsWith('place')) {
        city = context.text;
      } else if (context.id.startsWith('region')) {
        state = context.text;
      } else if (context.id.startsWith('postcode')) {
        zipCode = context.text;
      }
    });

    setQuery(address);
    setShowSuggestions(false);

    onAddressSelect({
      address,
      city,
      state,
      zipCode,
      coordinates: {
        lat: suggestion.geometry.coordinates[1],
        lng: suggestion.geometry.coordinates[0]
      }
    });
  };

  return (
    <div className="relative">
      <input
        {...register(id, { required })}
        id={id}
        value={query}
        onChange={handleInputChange}
        disabled={disabled}
        placeholder=" "
        className="
          peer
          w-full 
          p-4
          pl-4
          pt-6
          font-light 
          bg-slate-50 
          border-neutral-500
          border
          rounded-sm
          outline-none
          transition
          disabled:opacity-70
          disabled:cursor-not-allowed
          text-black
          h-[60px]
        "
      />
      <label 
        className="
          absolute 
          text-sm
          duration-150 
          transform 
          -translate-y-3 
          top-5 
          left-4
          origin-[0] 
          text-neutral-500
          peer-placeholder-shown:scale-100 
          peer-placeholder-shown:translate-y-0 
          peer-focus:scale-75
          peer-focus:-translate-y-4
        "
      >
        {label}
      </label>

      {/* Suggestions dropdown remains the same */}
      {showSuggestions && suggestions.length > 0 && (
        <div className="absolute w-full bg-white shadow-md rounded-md mt-1 z-[9999] max-h-[200px] overflow-y-auto">
          {suggestions.map((suggestion, index) => (
            <div
              key={index}
              className="p-3 hover:bg-neutral-100 cursor-pointer text-sm text-neutral-600"
              onClick={() => handleSuggestionClick(suggestion)}
            >
              {suggestion.place_name}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AddressAutocomplete;