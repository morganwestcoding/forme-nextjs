'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import {
  FieldValues,
  UseFormRegister,
  FieldErrors,
} from 'react-hook-form';

interface AddressAutocompleteProps {
  id: string;
  label: string;
  register: UseFormRegister<FieldValues>;
  required?: boolean;
  disabled?: boolean;
  errors: FieldErrors;
  onAddressSelect: (address: {
    address: string;
    city: string;
    state: string;
    zipCode: string;
    coordinates: { lat: number; lng: number };
  }) => void;
  proximity?: { lat: number; lng: number };

  /** NEW: prefill the visible input (e.g., saved address in edit mode) */
  initialValue?: string;
}

interface Suggestion {
  place_name: string;
  geometry: { coordinates: [number, number] };
  context: Array<{ id: string; text: string; short_code?: string }>;
}

const US_CENTROID = { lat: 39.8283, lng: -98.5795 };

const AddressAutocomplete: React.FC<AddressAutocompleteProps> = ({
  id,
  label,
  register,
  required,
  disabled,
  errors,
  onAddressSelect,
  proximity,
  initialValue,                // ⬅️ NEW
}) => {
  const [query, setQuery] = useState(initialValue ?? ''); // ⬅️ start with initial
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [activeIndex, setActiveIndex] = useState<number>(-1);

  const [effectiveProximity, setEffectiveProximity] =
    useState<{ lat: number; lng: number } | null>(null);

  const rootRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<NodeJS.Timeout>();

  const {
    ref: inputRefFromRegister,
    onChange: rhfOnChange,
    onBlur: rhfOnBlur,
    name,
  } = register(id, { required });

  // Keep input in sync if initialValue changes (e.g. open modal with existing data)
  useEffect(() => {
    if (typeof initialValue === 'string') {
      setQuery(initialValue);
    }
  }, [initialValue]);

  useEffect(() => {
    if (proximity) {
      setEffectiveProximity(proximity);
      return;
    }
    if (typeof window !== 'undefined' && 'geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => setEffectiveProximity({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
        () => setEffectiveProximity(US_CENTROID),
        { enableHighAccuracy: false, timeout: 4000, maximumAge: 600000 }
      );
    } else {
      setEffectiveProximity(US_CENTROID);
    }
  }, [proximity]);

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
      return (data?.features as Suggestion[]) || [];
    } catch {
      return [];
    }
  }, [effectiveProximity]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setQuery(value);
    rhfOnChange(e);

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
    setQuery(parsed.address);
    setShowSuggestions(false);
    setActiveIndex(-1);
    onAddressSelect(parsed);
  };

  useEffect(() => {
    const clickHandler = (e: MouseEvent) => {
      if (!rootRef.current) return;
      if (!rootRef.current.contains(e.target as Node)) setShowSuggestions(false);
    };
    document.addEventListener('mousedown', clickHandler);
    return () => document.removeEventListener('mousedown', clickHandler);
  }, []);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!showSuggestions || suggestions.length === 0) return;
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveIndex((i) => {
        const ni = Math.min(i + 1, suggestions.length - 1);
        listRef.current?.children[ni]?.scrollIntoView({ block: 'nearest' });
        return ni;
      });
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveIndex((i) => {
        const ni = Math.max(i - 1, 0);
        listRef.current?.children[ni]?.scrollIntoView({ block: 'nearest' });
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

  return (
    <div className="w-full relative" ref={rootRef}>
      <input
        id={id}
        name={name}
        ref={inputRefFromRegister}
        value={query}
        onChange={handleChange}
        onBlur={rhfOnBlur}
        onKeyDown={handleKeyDown}
        disabled={disabled}
        placeholder=" "
        autoComplete="off"
        className={`
          peer w-full p-3 pt-6 bg-neutral-50 border rounded-lg outline-none transition
          disabled:opacity-70 disabled:cursor-not-allowed
          ${errors[id] ? 'border-rose-500' : 'border-neutral-300'}
          ${errors[id] ? 'focus:border-rose-500' : 'focus:border-black'}
          pl-4 pr-4 h-[60px]
        `}
        aria-autocomplete="list"
        aria-controls={`${id}-listbox`}
        aria-expanded={showSuggestions}
        aria-activedescendant={activeIndex >= 0 ? `${id}-option-${activeIndex}` : undefined}
      />
      <label
        htmlFor={id}
        className={`
          absolute text-sm duration-150 transform -translate-y-3 top-5 left-4 origin-[0]
          ${errors[id] ? 'text-rose-500' : 'text-neutral-500'}
          peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0
          peer-focus:scale-75 peer-focus:-translate-y-4
        `}
      >
        {label}
      </label>

      {showSuggestions && suggestions.length > 0 && (
        <div
          id={`${id}-listbox`}
          role="listbox"
          ref={listRef}
          className="absolute w-full bg-white shadow-md rounded-md mt-1 z-[9999] max-h-[220px] overflow-y-auto border border-neutral-200"
        >
          {suggestions.map((sugg, index) => (
            <div
              id={`${id}-option-${index}`}
              role="option"
              aria-selected={activeIndex === index}
              key={`${sugg.place_name}-${index}`}
              className={`p-3 cursor-pointer text-sm text-neutral-700 transition-colors
                ${activeIndex === index ? 'bg-blue-50' : 'hover:bg-neutral-100'}
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

      {errors[id] && (
        <span className="text-rose-500 text-xs mt-1 block">
          {typeof errors[id]?.message === 'string'
            ? (errors[id]?.message as string)
            : 'Please enter a valid address'}
        </span>
      )}
    </div>
  );
};

export default AddressAutocomplete;
