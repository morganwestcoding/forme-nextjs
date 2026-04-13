'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MapPin, Check, ChevronDown, Loader2 } from 'lucide-react';
import TypeformHeading from '@/components/registration/TypeformHeading';
import { itemVariants } from '@/components/registration/TypeformStep';
import { FieldErrors } from 'react-hook-form';

interface ShopLocationStepProps {
  onLocationChange: (location: string) => void;
  onAddressSelect: (data: { address: string; zipCode: string; city: string; state: string }) => void;
  onFieldChange: (fieldId: string) => void;
  onIsOnlineOnlyChange: (value: boolean) => void;
  isOnlineOnly: boolean;
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

export default function ShopLocationStep({
  onLocationChange,
  onAddressSelect,
  onFieldChange,
  onIsOnlineOnlyChange,
  isOnlineOnly,
  errors,
  initialState = '',
  initialCity = '',
  initialAddress = '',
  initialZip = '',
}: ShopLocationStepProps) {
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

  const handleAddressSelectOption = (address: string, suggestedZip: string) => {
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
        question="Where is your shop located?"
        subtitle="Help customers find you"
      />

      <div className="space-y-5">
        {/* Online Only Toggle */}
        <button
          type="button"
          onClick={() => {
            const newVal = !isOnlineOnly;
            onIsOnlineOnlyChange(newVal);
            if (newVal) {
              onLocationChange('Online Shop');
              onAddressSelect({ address: 'Online', zipCode: '00000', city: 'Online', state: 'Online' });
            }
          }}
          className={`
            w-full flex items-center gap-4 p-4 rounded-xl border text-left transition-all duration-200
            ${isOnlineOnly
              ? 'border-gray-300 bg-gray-100 shadow-[inset_0_2px_4px_rgba(0,0,0,0.1)]'
              : 'border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50'
            }
          `}
        >
          <div className={`
            w-5 h-5 rounded-lg border-2 flex items-center justify-center transition-all
            ${isOnlineOnly ? 'border-gray-900 bg-gray-900' : 'border-gray-300'}
          `}>
            {isOnlineOnly && (
              <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            )}
          </div>
          <div>
            <span className="text-sm font-medium text-gray-900">Online only</span>
            <p className="text-xs text-gray-500 mt-0.5">No physical location needed</p>
          </div>
        </button>

        {!isOnlineOnly && (
          <>
            {/* State & City row */}
            <div className="flex gap-3">
              {/* State dropdown */}
              <div ref={stateDropdownRef} className="flex-1 relative">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  State
                </label>
                <button
                  type="button"
                  onClick={() => { setIsStateOpen(!isStateOpen); setIsCityOpen(false); }}
                  className={`w-full flex items-center gap-3 px-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl text-left transition-all cursor-pointer focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent ${
                    isStateOpen ? 'ring-2 ring-gray-900 border-transparent' : ''
                  }`}
                >
                  <span className={selectedState ? 'text-gray-900' : 'text-gray-400'}>
                    {selectedState || 'Select'}
                  </span>
                  <ChevronDown
                    className={`ml-auto w-5 h-5 text-gray-400 transition-transform duration-200 ${isStateOpen ? 'rotate-180' : ''}`}
                  />
                </button>

                <AnimatePresence>
                  {isStateOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: -8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -8 }}
                      transition={{ duration: 0.15 }}
                      className="absolute z-50 mt-2 w-full bg-white border border-gray-200 rounded-xl shadow-lg overflow-hidden"
                    >
                      <div className="max-h-[240px] overflow-y-auto overscroll-contain">
                        {US_STATES.map((state) => (
                          <button
                            key={state}
                            type="button"
                            onClick={() => handleStateSelect(state)}
                            className={`w-full flex items-center gap-3 px-4 py-3 text-sm transition-colors cursor-pointer ${
                              selectedState === state
                                ? 'bg-gray-50 text-gray-900 font-medium'
                                : 'text-gray-700 hover:bg-gray-50'
                            }`}
                          >
                            <span className="flex-1 text-left">{state}</span>
                            {selectedState === state && (
                              <Check className="w-4 h-4 text-gray-900" />
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
                <label className="block text-sm font-medium text-gray-700 mb-2">
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
                    className="w-full px-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-all disabled:opacity-50 disabled:cursor-not-allowed"
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
                    <Loader2 className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 animate-spin" />
                  )}
                </div>

                <AnimatePresence>
                  {isCityOpen && !isLoadingCities && filteredCities.length > 0 && (
                    <motion.div
                      initial={{ opacity: 0, y: -8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -8 }}
                      transition={{ duration: 0.15 }}
                      className="absolute z-50 mt-2 w-full bg-white border border-gray-200 rounded-xl shadow-lg overflow-hidden"
                    >
                      <div className="max-h-[240px] overflow-y-auto overscroll-contain">
                        {filteredCities.map((c) => (
                          <button
                            key={c}
                            type="button"
                            onClick={() => handleCitySelect(c)}
                            className={`w-full flex items-center gap-3 px-4 py-3 text-sm transition-colors cursor-pointer ${
                              city === c
                                ? 'bg-gray-50 text-gray-900 font-medium'
                                : 'text-gray-700 hover:bg-gray-50'
                            }`}
                          >
                            <span className="flex-1 text-left">{c}</span>
                            {city === c && (
                              <Check className="w-4 h-4 text-gray-900" />
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
              <p className="-mt-3 text-sm text-red-500">{errors.location.message as string}</p>
            )}

            {/* Street Address & ZIP row */}
            {city && selectedState && (
              <motion.div
                variants={itemVariants}
                className="flex gap-3"
              >
                <div ref={addressDropdownRef} className="flex-[2] relative">
                  <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-2">
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
                      className="w-full px-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-all"
                      placeholder="Start typing an address..."
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && addressSuggestions.length > 0) {
                          handleAddressSelectOption(addressSuggestions[0].display, addressSuggestions[0].zip);
                          e.preventDefault();
                        }
                        e.stopPropagation();
                      }}
                    />
                    {isLoadingAddresses && (
                      <Loader2 className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 animate-spin" />
                    )}
                  </div>

                  <AnimatePresence>
                    {isAddressOpen && !isLoadingAddresses && addressSuggestions.length > 0 && (
                      <motion.div
                        initial={{ opacity: 0, y: -8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -8 }}
                        transition={{ duration: 0.15 }}
                        className="absolute z-50 mt-2 w-full bg-white border border-gray-200 rounded-xl shadow-lg overflow-hidden"
                      >
                        <div className="max-h-[200px] overflow-y-auto overscroll-contain">
                          {addressSuggestions.map((s, i) => (
                            <button
                              key={i}
                              type="button"
                              onClick={() => handleAddressSelectOption(s.display, s.zip)}
                              className={`w-full flex items-center justify-between px-4 py-3 text-sm transition-colors cursor-pointer ${
                                streetAddress === s.display
                                  ? 'bg-gray-50 text-gray-900 font-medium'
                                  : 'text-gray-700 hover:bg-gray-50'
                              }`}
                            >
                              <span className="text-left">{s.display}</span>
                              {s.zip && <span className="text-[11px] text-gray-400 ml-2 flex-shrink-0">{s.zip}</span>}
                            </button>
                          ))}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {errors.address && (
                    <p className="mt-2 text-sm text-red-500">{errors.address.message as string}</p>
                  )}
                </div>
                <div className="flex-1">
                  <label htmlFor="zipCode" className="block text-sm font-medium text-gray-700 mb-2">
                    ZIP code
                  </label>
                  <input
                    id="zipCode"
                    type="text"
                    value={zip}
                    onChange={handleZipChange}
                    className="w-full px-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-all"
                    placeholder="12345"
                    maxLength={10}
                  />
                  {errors.zipCode && (
                    <p className="mt-2 text-sm text-red-500">{errors.zipCode.message as string}</p>
                  )}
                </div>
              </motion.div>
            )}

            {/* Preview */}
            {streetAddress && city && selectedState && zip && (
              <motion.div
                variants={itemVariants}
                className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl"
              >
                <div className="w-10 h-10 rounded-full bg-gray-900 flex items-center justify-center flex-shrink-0">
                  <MapPin className="w-5 h-5 text-white" />
                </div>
                <div className="min-w-0">
                  <p className="font-medium text-gray-900 text-sm truncate">{streetAddress}</p>
                  <p className="text-sm text-gray-500">{city}, {selectedState} {zip}</p>
                </div>
              </motion.div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
