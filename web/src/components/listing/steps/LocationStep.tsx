'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { MapPin } from 'lucide-react';
import TypeformHeading from '@/components/registration/TypeformHeading';
import { itemVariants } from '@/components/registration/TypeformStep';
import { FieldErrors } from 'react-hook-form';

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
  const [streetAddress, setStreetAddress] = useState(initialAddress);
  const [zip, setZip] = useState(initialZip);

  const handleStateChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newState = e.target.value;
    setSelectedState(newState);
    onFieldChange('location');
    if (city && newState) {
      onLocationChange(`${city}, ${newState}`);
    }
    onAddressSelect({ address: streetAddress, zipCode: zip, city, state: newState });
  };

  const handleCityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newCity = e.target.value;
    setCity(newCity);
    onFieldChange('location');
    if (newCity && selectedState) {
      onLocationChange(`${newCity}, ${selectedState}`);
    }
    onAddressSelect({ address: streetAddress, zipCode: zip, city: newCity, state: selectedState });
  };

  const handleAddressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newAddress = e.target.value;
    setStreetAddress(newAddress);
    onFieldChange('address');
    onAddressSelect({ address: newAddress, zipCode: zip, city, state: selectedState });
  };

  const handleZipChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newZip = e.target.value;
    setZip(newZip);
    onFieldChange('zipCode');
    onAddressSelect({ address: streetAddress, zipCode: newZip, city, state: selectedState });
  };

  return (
    <div>
      <TypeformHeading
        question="Where is your business located?"
        subtitle="Help customers find you"
      />

      <div className="space-y-5">
        {/* State & City row */}
        <div className="flex gap-3">
          <div className="flex-1">
            <label htmlFor="state" className="block text-sm font-medium text-gray-700 mb-2">
              State
            </label>
            <div className="relative">
              <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
              <select
                id="state"
                value={selectedState}
                onChange={handleStateChange}
                className="w-full pl-12 pr-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-all appearance-none cursor-pointer"
              >
                <option value="">Select</option>
                {US_STATES.map((state) => (
                  <option key={state} value={state}>{state}</option>
                ))}
              </select>
              <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
                <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>
          </div>
          <div className="flex-1">
            <label htmlFor="city" className="block text-sm font-medium text-gray-700 mb-2">
              City
            </label>
            <input
              id="city"
              type="text"
              value={city}
              onChange={handleCityChange}
              disabled={!selectedState}
              className="w-full px-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              placeholder="Enter city"
            />
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
            <div className="flex-[2]">
              <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-2">
                Street address
              </label>
              <input
                id="address"
                type="text"
                value={streetAddress}
                onChange={handleAddressChange}
                autoFocus
                className="w-full px-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-all"
                placeholder="123 Main Street"
              />
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
      </div>
    </div>
  );
}
