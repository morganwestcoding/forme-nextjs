'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { MapPin } from 'lucide-react';
import TypeformHeading from '../TypeformHeading';
import { itemVariants } from '../TypeformStep';

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

  useEffect(() => {
    // Parse existing location
    if (location) {
      const parts = location.split(', ');
      if (parts.length >= 2) {
        setCity(parts[0]);
        setSelectedState(parts[1]);
      }
    }
  }, []);

  useEffect(() => {
    if (city && selectedState) {
      onLocationChange(`${city}, ${selectedState}`);
    }
  }, [city, selectedState, onLocationChange]);

  return (
    <div>
      <TypeformHeading
        question="Where are you located?"
        subtitle="This helps clients find services near them"
      />

      <div className="space-y-5">
        {/* State select */}
        <div>
          <label htmlFor="state" className="block text-sm font-medium text-gray-700 mb-2">
            State
          </label>
          <div className="relative">
            <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
            <select
              id="state"
              value={selectedState}
              onChange={(e) => setSelectedState(e.target.value)}
              className="w-full pl-12 pr-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-all appearance-none cursor-pointer"
            >
              <option value="">Select a state</option>
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

        {/* City input */}
        {selectedState && (
          <motion.div
            variants={itemVariants}
          >
            <label htmlFor="city" className="block text-sm font-medium text-gray-700 mb-2">
              City
            </label>
            <input
              id="city"
              type="text"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              autoFocus
              className="w-full px-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-all"
              placeholder="Enter your city"
            />
          </motion.div>
        )}

        {/* Preview */}
        {city && selectedState && (
          <motion.div
            variants={itemVariants}
            className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl"
          >
            <div className="w-10 h-10 rounded-full bg-gray-900 flex items-center justify-center">
              <MapPin className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="font-medium text-gray-900">{city}, {selectedState}</p>
              <p className="text-sm text-gray-500">Your location</p>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
