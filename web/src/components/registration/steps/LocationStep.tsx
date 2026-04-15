'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

import TypeformHeading from '../TypeformHeading';
import { Location01Icon as MapPin, Tick02Icon as Check, ArrowDown01Icon as ChevronDown, Loading03Icon as Loader2 } from 'hugeicons-react';

interface LocationStepProps {
  location: string;
  onLocationChange: (location: string) => void;
}

const US_STATES = [
  'Alabama', 'Alaska', 'Arizona', 'Arkansas', 'California', 'Colorado', 'Connecticut',
  'Delaware', 'Florida', 'Georgia', 'Hawaii', 'Idaho', 'Illinois', 'Indiana', 'Iowa',
  'Kansas', 'Kentucky', 'Louisiana', 'Maine', 'Maryland', 'Massachusetts', 'Michigan',
  'Minnesota', 'Mississippi', 'Missouri', 'Montana', 'Nebraska', 'Nevada', 'New Hampshire',
  'New Jersey', 'New Mexico', 'New York', 'North Carolina', 'North Dakota', 'Ohio',
  'Oklahoma', 'Oregon', 'Pennsylvania', 'Rhode Island', 'South Carolina', 'South Dakota',
  'Tennessee', 'Texas', 'Utah', 'Vermont', 'Virginia', 'Washington', 'West Virginia',
  'Wisconsin', 'Wyoming'
];

export default function LocationStep({ location, onLocationChange }: LocationStepProps) {
  const [selectedState, setSelectedState] = useState('');
  const [city, setCity] = useState('');
  const [cityInput, setCityInput] = useState('');
  const [isStateOpen, setIsStateOpen] = useState(false);
  const [isCityOpen, setIsCityOpen] = useState(false);
  const [cities, setCities] = useState<string[]>([]);
  const [isLoadingCities, setIsLoadingCities] = useState(false);
  const stateDropdownRef = useRef<HTMLDivElement>(null);
  const cityDropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (location) {
      const parts = location.split(', ');
      if (parts.length >= 2) {
        setCity(parts[0]);
        setCityInput(parts[0]);
        setSelectedState(parts[1]);
      }
    }
  }, []);

  const fetchCities = useCallback(async (state: string) => {
    setIsLoadingCities(true);
    setCities([]);
    try {
      const res = await fetch('https://countriesnow.space/api/v0.1/countries/state/cities', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ country: 'United States', state }),
      });
      const json = await res.json();
      if (!json.error && Array.isArray(json.data)) {
        setCities(json.data.sort((a: string, b: string) => a.localeCompare(b)));
      }
    } catch {
      setCities([]);
    } finally {
      setIsLoadingCities(false);
    }
  }, []);

  useEffect(() => {
    if (selectedState) {
      fetchCities(selectedState);
    }
  }, [selectedState, fetchCities]);

  useEffect(() => {
    if (city && selectedState) {
      onLocationChange(`${city}, ${selectedState}`);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [city, selectedState]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (stateDropdownRef.current && !stateDropdownRef.current.contains(e.target as Node)) {
        setIsStateOpen(false);
      }
      if (cityDropdownRef.current && !cityDropdownRef.current.contains(e.target as Node)) {
        setIsCityOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleStateSelect = (state: string) => {
    setSelectedState(state);
    setCity('');
    setCityInput('');
    setIsStateOpen(false);
  };

  const handleCitySelect = (selectedCity: string) => {
    setCity(selectedCity);
    setCityInput(selectedCity);
    setIsCityOpen(false);
  };

  const filteredCities = cityInput
    ? cities.filter((c) => c.toLowerCase().includes(cityInput.toLowerCase()))
    : cities;

  return (
    <div>
      <TypeformHeading
        question="Where are you located?"
        subtitle="This helps clients find services near them"
      />

      <div className="space-y-5">
        {/* State select */}
        <div ref={stateDropdownRef} className="relative">
          <label className="block text-sm font-medium text-stone-700 dark:text-stone-200 mb-2">
            State
          </label>
          <button
            type="button"
            onClick={() => { setIsStateOpen(!isStateOpen); setIsCityOpen(false); }}
            className={`w-full flex items-center gap-3 px-4 py-3.5 bg-stone-50 dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-xl text-left transition-all cursor-pointer focus:outline-none focus:ring-2 focus:ring-stone-900 focus:border-transparent ${
              isStateOpen ? 'ring-2 ring-stone-900 border-transparent' : ''
            }`}
          >
            <span className={selectedState ? 'text-stone-900 dark:text-stone-100' : 'text-stone-400 dark:text-stone-500'}>
              {selectedState || 'Select a state'}
            </span>
            <ChevronDown
              className={`ml-auto w-5 h-5 text-stone-400 dark:text-stone-500 transition-transform duration-200 ${isStateOpen ? 'rotate-180' : ''}`}
            />
          </button>

          <AnimatePresence>
            {isStateOpen && (
              <motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.15 }}
                className="absolute z-50 mt-2 w-full bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-xl shadow-lg overflow-hidden"
              >
                <div className="max-h-[240px] overflow-y-auto overscroll-contain">
                  {US_STATES.map((state) => (
                    <button
                      key={state}
                      type="button"
                      onClick={() => handleStateSelect(state)}
                      className={`w-full flex items-center gap-3 px-4 py-3 text-sm transition-colors cursor-pointer ${
                        selectedState === state
                          ? 'bg-stone-50 dark:bg-stone-900 text-stone-900 dark:text-stone-100 font-medium'
                          : 'text-stone-700 dark:text-stone-200 hover:bg-stone-50 dark:hover:bg-stone-800 dark:bg-stone-900'
                      }`}
                    >
                      <span className="flex-1 text-left">{state}</span>
                      {selectedState === state && (
                        <Check className="w-4 h-4 text-stone-900 dark:text-stone-100" />
                      )}
                    </button>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* City input with autocomplete dropdown */}
        <AnimatePresence>
          {selectedState && (
            <motion.div
              ref={cityDropdownRef}
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3, ease: [0.25, 0.1, 0.25, 1] }}
              className="relative overflow-visible"
            >
              <label className="block text-sm font-medium text-stone-700 dark:text-stone-200 mb-2">
                City
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={cityInput}
                  onChange={(e) => {
                    setCityInput(e.target.value);
                    setCity('');
                    setIsCityOpen(true);
                    setIsStateOpen(false);
                  }}
                  onFocus={() => { setIsCityOpen(true); setIsStateOpen(false); }}
                  autoFocus
                  className="w-full px-4 py-3.5 bg-stone-50 dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-xl text-stone-900 dark:text-stone-100 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-stone-900 focus:border-transparent transition-all"
                  placeholder={isLoadingCities ? 'Loading cities...' : 'Type to search cities...'}
                  disabled={isLoadingCities}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && filteredCities.length > 0) {
                      handleCitySelect(filteredCities[0]);
                      e.preventDefault();
                    }
                    e.stopPropagation();
                  }}
                />
                {isLoadingCities && (
                  <Loader2 className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-stone-400 dark:text-stone-500 animate-spin" />
                )}
              </div>

              <AnimatePresence>
                {isCityOpen && !isLoadingCities && filteredCities.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: -8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{ duration: 0.15 }}
                    className="absolute z-50 mt-2 w-full bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-xl shadow-lg overflow-hidden"
                  >
                    <div className="max-h-[240px] overflow-y-auto overscroll-contain">
                      {filteredCities.map((c) => (
                        <button
                          key={c}
                          type="button"
                          onClick={() => handleCitySelect(c)}
                          className={`w-full flex items-center gap-3 px-4 py-3 text-sm transition-colors cursor-pointer ${
                            city === c
                              ? 'bg-stone-50 dark:bg-stone-900 text-stone-900 dark:text-stone-100 font-medium'
                              : 'text-stone-700 dark:text-stone-200 hover:bg-stone-50 dark:hover:bg-stone-800 dark:bg-stone-900'
                          }`}
                        >
                          <span className="flex-1 text-left">{c}</span>
                          {city === c && (
                            <Check className="w-4 h-4 text-stone-900 dark:text-stone-100" />
                          )}
                        </button>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Preview */}
        <AnimatePresence>
          {city && selectedState && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3, ease: [0.25, 0.1, 0.25, 1] }}
              className="flex items-center gap-3 p-4 bg-stone-50 dark:bg-stone-900 rounded-xl"
            >
              <div className="w-10 h-10 rounded-full bg-stone-900 flex items-center justify-center">
                <MapPin className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="font-medium text-stone-900 dark:text-stone-100">{city}, {selectedState}</p>
                <p className="text-sm text-stone-500 dark:text-stone-400 dark:text-stone-500">Your location</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
