'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

import TypeformHeading from '@/components/registration/TypeformHeading';
import { itemVariants } from '@/components/registration/TypeformStep';
import { FieldErrors } from 'react-hook-form';
import { Location01Icon as MapPin, Tick02Icon as Check, ArrowDown01Icon as ChevronDown, Loading03Icon as Loader2 } from 'hugeicons-react';

interface LocationStepProps {
  onLocationChange: (location: string) => void;
  onAddressSelect: (data: { address: string; zipCode: string; city: string; state: string }) => void;
  onFieldChange: (fieldId: string) => void;
  errors: FieldErrors;
  initialState?: string;
  initialCity?: string;
  initialAddress?: string;
  initialZip?: string;
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

export default function LocationStep({
  onLocationChange,
  onAddressSelect,
  onFieldChange,
  errors,
  initialState = '',
  initialCity = '',
  initialAddress = '',
  initialZip = '',
}: LocationStepProps) {
  const [selectedState, setSelectedState] = useState(initialState);
  const [city, setCity] = useState(initialCity);
  const [cityInput, setCityInput] = useState(initialCity);
  const [streetAddress, setStreetAddress] = useState(initialAddress);
  const [zip, setZip] = useState(initialZip);

  const [isStateOpen, setIsStateOpen] = useState(false);
  const [isCityOpen, setIsCityOpen] = useState(false);
  const [isAddressOpen, setIsAddressOpen] = useState(false);
  const [cities, setCities] = useState<string[]>([]);
  const [isLoadingCities, setIsLoadingCities] = useState(false);
  const [addressSuggestions, setAddressSuggestions] = useState<{ display: string; zip: string }[]>([]);
  const [isLoadingAddresses, setIsLoadingAddresses] = useState(false);
  const addressDebounceRef = useRef<NodeJS.Timeout | null>(null);

  const stateDropdownRef = useRef<HTMLDivElement>(null);
  const cityDropdownRef = useRef<HTMLDivElement>(null);
  const addressDropdownRef = useRef<HTMLDivElement>(null);

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

  const fetchAddresses = useCallback(async (query: string, cityName: string, stateName: string) => {
    if (query.length < 3) { setAddressSuggestions([]); return; }
    setIsLoadingAddresses(true);
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?` +
        `street=${encodeURIComponent(query)}&city=${encodeURIComponent(cityName)}&state=${encodeURIComponent(stateName)}&country=US` +
        `&format=json&addressdetails=1&limit=6`,
        { headers: { 'Accept-Language': 'en' } }
      );
      const data = await res.json();
      if (Array.isArray(data)) {
        const results = data
          .filter((r: any) => r.address?.road)
          .map((r: any) => ({
            display: [r.address.house_number, r.address.road].filter(Boolean).join(' '),
            zip: r.address.postcode || '',
          }));
        // dedupe
        const seen = new Set<string>();
        setAddressSuggestions(results.filter((r: { display: string }) => {
          if (seen.has(r.display)) return false;
          seen.add(r.display);
          return true;
        }));
      }
    } catch {
      setAddressSuggestions([]);
    } finally {
      setIsLoadingAddresses(false);
    }
  }, []);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (stateDropdownRef.current && !stateDropdownRef.current.contains(e.target as Node)) {
        setIsStateOpen(false);
      }
      if (cityDropdownRef.current && !cityDropdownRef.current.contains(e.target as Node)) {
        setIsCityOpen(false);
      }
      if (addressDropdownRef.current && !addressDropdownRef.current.contains(e.target as Node)) {
        setIsAddressOpen(false);
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
    onFieldChange('location');
    onAddressSelect({ address: streetAddress, zipCode: zip, city: '', state });
  };

  const handleCitySelect = (selectedCity: string) => {
    setCity(selectedCity);
    setCityInput(selectedCity);
    setIsCityOpen(false);
    onFieldChange('location');
    onLocationChange(`${selectedCity}, ${selectedState}`);
    onAddressSelect({ address: streetAddress, zipCode: zip, city: selectedCity, state: selectedState });
  };

  const handleAddressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newAddress = e.target.value;
    setStreetAddress(newAddress);
    setIsAddressOpen(true);
    onFieldChange('address');
    onAddressSelect({ address: newAddress, zipCode: zip, city, state: selectedState });

    if (addressDebounceRef.current) clearTimeout(addressDebounceRef.current);
    addressDebounceRef.current = setTimeout(() => {
      fetchAddresses(newAddress, city, selectedState);
    }, 300);
  };

  const handleAddressSelect = (address: string, suggestedZip: string) => {
    setStreetAddress(address);
    setIsAddressOpen(false);
    setAddressSuggestions([]);
    onFieldChange('address');
    if (suggestedZip && !zip) {
      setZip(suggestedZip);
      onFieldChange('zipCode');
      onAddressSelect({ address, zipCode: suggestedZip, city, state: selectedState });
    } else {
      onAddressSelect({ address, zipCode: zip, city, state: selectedState });
    }
  };

  const handleZipChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newZip = e.target.value;
    setZip(newZip);
    onFieldChange('zipCode');
    onAddressSelect({ address: streetAddress, zipCode: newZip, city, state: selectedState });
  };

  const filteredCities = cityInput
    ? cities.filter((c) => c.toLowerCase().includes(cityInput.toLowerCase()))
    : cities;

  return (
    <div>
      <TypeformHeading
        question="Where is your business located?"
        subtitle="Help customers find you"
      />

      <div className="space-y-5">
        {/* State & City row */}
        <div className="flex gap-3">
          {/* State dropdown */}
          <div ref={stateDropdownRef} className="flex-1 relative">
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
                {selectedState || 'Select'}
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
                  className="absolute z-50 mt-2 w-full bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-xl shadow-elevation-3 overflow-hidden"
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

          {/* City autocomplete */}
          <div ref={cityDropdownRef} className="flex-1 relative">
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
                  onFieldChange('location');
                }}
                onFocus={() => { if (selectedState) { setIsCityOpen(true); setIsStateOpen(false); } }}
                disabled={!selectedState || isLoadingCities}
                className="w-full px-4 py-3.5 bg-stone-50 dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-xl text-stone-900 dark:text-stone-100 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-stone-900 focus:border-transparent transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                placeholder={isLoadingCities ? 'Loading...' : selectedState ? 'Type to search...' : 'Select state first'}
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
                  className="absolute z-50 mt-2 w-full bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-xl shadow-elevation-3 overflow-hidden"
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
          </div>
        </div>
        {errors.location && (
          <p className="-mt-3 text-sm text-danger">{errors.location.message as string}</p>
        )}

        {/* Street Address & ZIP row */}
        {city && selectedState && (
          <motion.div
            variants={itemVariants}
            className="flex gap-3"
          >
            <div ref={addressDropdownRef} className="flex-[2] relative">
              <label htmlFor="address" className="block text-sm font-medium text-stone-700 dark:text-stone-200 mb-2">
                Street address
              </label>
              <div className="relative">
                <input
                  id="address"
                  type="text"
                  value={streetAddress}
                  onChange={handleAddressChange}
                  onFocus={() => { if (addressSuggestions.length > 0) setIsAddressOpen(true); }}
                  autoFocus
                  className="w-full px-4 py-3.5 bg-stone-50 dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-xl text-stone-900 dark:text-stone-100 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-stone-900 focus:border-transparent transition-all"
                  placeholder="Start typing an address..."
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && addressSuggestions.length > 0) {
                      handleAddressSelect(addressSuggestions[0].display, addressSuggestions[0].zip);
                      e.preventDefault();
                    }
                    e.stopPropagation();
                  }}
                />
                {isLoadingAddresses && (
                  <Loader2 className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-stone-400 dark:text-stone-500 animate-spin" />
                )}
              </div>

              <AnimatePresence>
                {isAddressOpen && !isLoadingAddresses && addressSuggestions.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: -8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{ duration: 0.15 }}
                    className="absolute z-50 mt-2 w-full bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-xl shadow-elevation-3 overflow-hidden"
                  >
                    <div className="max-h-[200px] overflow-y-auto overscroll-contain">
                      {addressSuggestions.map((s, i) => (
                        <button
                          key={i}
                          type="button"
                          onClick={() => handleAddressSelect(s.display, s.zip)}
                          className={`w-full flex items-center justify-between px-4 py-3 text-sm transition-colors cursor-pointer ${
                            streetAddress === s.display
                              ? 'bg-stone-50 dark:bg-stone-900 text-stone-900 dark:text-stone-100 font-medium'
                              : 'text-stone-700 dark:text-stone-200 hover:bg-stone-50 dark:hover:bg-stone-800 dark:bg-stone-900'
                          }`}
                        >
                          <span className="text-left">{s.display}</span>
                          {s.zip && <span className="text-[11px] text-stone-400 dark:text-stone-500 ml-2 flex-shrink-0">{s.zip}</span>}
                        </button>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {errors.address && (
                <p className="mt-2 text-sm text-danger">{errors.address.message as string}</p>
              )}
            </div>
            <div className="flex-1">
              <label htmlFor="zipCode" className="block text-sm font-medium text-stone-700 dark:text-stone-200 mb-2">
                ZIP code
              </label>
              <input
                id="zipCode"
                type="text"
                value={zip}
                onChange={handleZipChange}
                className="w-full px-4 py-3.5 bg-stone-50 dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-xl text-stone-900 dark:text-stone-100 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-stone-900 focus:border-transparent transition-all"
                placeholder="12345"
                maxLength={10}
              />
              {errors.zipCode && (
                <p className="mt-2 text-sm text-danger">{errors.zipCode.message as string}</p>
              )}
            </div>
          </motion.div>
        )}

        {/* Preview */}
        {streetAddress && city && selectedState && zip && (
          <motion.div
            variants={itemVariants}
            className="flex items-center gap-3 p-4 bg-stone-50 dark:bg-stone-900 rounded-xl"
          >
            <div className="w-10 h-10 rounded-full bg-stone-900 flex items-center justify-center flex-shrink-0">
              <MapPin className="w-5 h-5 text-white" />
            </div>
            <div className="min-w-0">
              <p className="font-medium text-stone-900 dark:text-stone-100 text-sm truncate">{streetAddress}</p>
              <p className="text-sm text-stone-500  dark:text-stone-500">{city}, {selectedState} {zip}</p>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
