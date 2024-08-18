'use client';

import React, { useState, useCallback, useEffect } from 'react';
import Image from "next/image";
import Select, { StylesConfig } from 'react-select';
import Calendar from '../inputs/Calender';
import ModalButton from "../modals/ModalButton";
import { SafeListing, SafeReservation, SafeUser } from "@/app/types";
import { format } from 'date-fns';

interface ListingRightBarProps {
  listing: SafeListing & { user: SafeUser };
  reservations?: SafeReservation[];
  currentUser?: SafeUser | null;
  onCreateReservation: () => void;
  isLoading: boolean;
  disabledDates: Date[];
  description: string;
  selectedServices: Set<string>;
  toggleServiceSelection: (serviceId: string) => void;
  totalPrice: number;
}

interface OptionType {
  value: string;
  label: string;
  price?: number;
}

const ListingRightBar: React.FC<ListingRightBarProps> = ({
  listing,
  reservations = [],
  currentUser,
  onCreateReservation,
  isLoading,
  disabledDates,
  description,
  selectedServices,
  toggleServiceSelection,
  totalPrice: propTotalPrice
}) => {
  const [selectedEmployee, setSelectedEmployee] = useState<OptionType | null>(null);
  const [selectedService, setSelectedService] = useState<OptionType | null>(null);
  const [date, setDate] = useState<Date | null>(null);
  const [time, setTime] = useState<string>('');
  const [calculatedTotalPrice, setCalculatedTotalPrice] = useState(propTotalPrice);
  const [showCalendar, setShowCalendar] = useState(false);

  const employeeOptions: OptionType[] = [
    { value: '1', label: 'Employee 1' },
    { value: '2', label: 'Employee 2' },
    { value: '3', label: 'Employee 3' },
  ];

  const serviceOptions: OptionType[] = listing.services.map(service => ({
    value: service.id,
    label: `${service.serviceName} - $${service.price}`,
    price: service.price
  }));

  const timeOptions: OptionType[] = [
    { value: '09:00', label: '09:00 AM' },
    { value: '10:00', label: '10:00 AM' },
    { value: '11:00', label: '11:00 AM' },
    { value: '12:00', label: '12:00 PM' },
    { value: '13:00', label: '01:00 PM' },
    { value: '14:00', label: '02:00 PM' },
    { value: '15:00', label: '03:00 PM' },
    { value: '16:00', label: '04:00 PM' },
    { value: '17:00', label: '05:00 PM' },
  ];

  const handleEmployeeChange = (selectedOption: OptionType | null) => {
    setSelectedEmployee(selectedOption);
  };

  const handleServiceChange = (selectedOption: OptionType | null) => {
    setSelectedService(selectedOption);
    if (selectedOption && selectedOption.price) {
      toggleServiceSelection(selectedOption.value);
    }
  };

  const handleDateChange = (newDate: Date) => {
    setDate(newDate);
    setShowCalendar(false);
  };

  const handleTimeChange = (selectedOption: OptionType | null) => {
    setTime(selectedOption ? selectedOption.value : '');
  };

  // Dummy function for onTimeChange
  const dummyOnTimeChange = (time: string) => {
    // This function is intentionally left empty as we're handling time separately
  };

  useEffect(() => {
    const newTotalPrice = listing.services
      .filter(service => selectedServices.has(service.id))
      .reduce((sum, service) => sum + service.price, 0);
    setCalculatedTotalPrice(newTotalPrice);
  }, [selectedServices, listing.services]);

  const customStyles: StylesConfig<OptionType, false> = {
    control: (provided) => ({
      ...provided,
      backgroundColor: 'white',
      borderColor: '#e2e8f0',
      borderRadius: '0.5rem',
      padding: '0.5rem',
      boxShadow: 'none',
      '&:hover': {
        borderColor: '#cbd5e0',
      },
    }),
    option: (provided, state) => ({
      ...provided,
      backgroundColor: state.isSelected ? '#e2e8f0' : 'white',
      color: '#4a5568',
      '&:hover': {
        backgroundColor: '#edf2f7',
      },
    }),
    placeholder: (provided) => ({
      ...provided,
      fontSize: '0.875rem', // This makes the placeholder text smaller (text-sm)
    }),
  };

  return (
    <div className="flex flex-col justify-end bg-transparent gap-4 pr-16 h-auto">
      {/* Map and contact information */}
      <div className="w-full md:w-11/12 rounded-2xl shadow-sm bg-[#ffffff] px-8 md:px-6 py-6 mx-3 md:mr-16 md:ml-2 relative min-h-[128px]">
        <div className="text-xl font-bold mb-2">
          <div className="text-sm font-normal flex-grow">
            <ul>
              <li className="flex items-center justify-center mb-5 p-2 rounded-lg shadow-sm bg-white border px-2 w-full h-28 mb-2 relative">
                <Image
                  src="/assets/8KmHl.png"
                  alt="Map Placeholder"
                  layout="fill"
                  objectFit="cover"
                />
              </li>
              <li className="flex items-center pb-2 pt-2 rounded-lg shadow-sm bg-white border px-2 w-full mb-2">
                <div className="flex items-center justify-center p-1 cursor-pointer">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="19" height="19" color="#a2a2a2" fill="none">
                    <path d="M5 9C5 5.70017 5 4.05025 6.02513 3.02513C7.05025 2 8.70017 2 12 2C15.2998 2 16.9497 2 17.9749 3.02513C19 4.05025 19 5.70017 19 9V15C19 18.2998 19 19.9497 17.9749 20.9749C16.9497 22 15.2998 22 12 22C8.70017 22 7.05025 22 6.02513 20.9749C5 19.9497 5 18.2998 5 15V9Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                    <path d="M11 19H13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    <path d="M9 2L9.089 2.53402C9.28188 3.69129 9.37832 4.26993 9.77519 4.62204C10.1892 4.98934 10.7761 5 12 5C13.2239 5 13.8108 4.98934 14.2248 4.62204C14.6217 4.26993 14.7181 3.69129 14.911 2.53402L15 2" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
                  </svg>
                </div>
                <span className="ml-4 text-xs font-light text-[#a2a2a2]">{listing.phoneNumber}</span>
              </li>
              <li className="flex items-center pb-2 pt-2 w-full rounded-lg shadow-sm bg-white border px-2 mb-2">
                <div className="flex items-center justify-center p-1 cursor-pointer">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="19" height="19" color="#a2a2a2" fill="none">
                    <path d="M9.5 14.5L14.5 9.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                    <path d="M16.8463 14.6095L19.4558 12C21.5147 9.94113 21.5147 6.60303 19.4558 4.54416C17.397 2.48528 14.0589 2.48528 12 4.54416L9.39045 7.1537M14.6095 16.8463L12 19.4558C9.94113 21.5147 6.60303 21.5147 4.54416 19.4558C2.48528 17.397 2.48528 14.0589 4.54416 12L7.1537 9.39045" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                  </svg>
                </div>
                <span className="ml-4 text-xs font-light text-[#a2a2a2]">{listing.website}</span>
              </li>
              <li className="flex items-center pb-2 pt-2 w-full rounded-lg shadow-sm bg-white border px-2">
                <div className="flex items-center justify-center p-1 cursor-pointer">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="19" height="19" color="#a2a2a2" fill="none">
                    <path d="M11.922 4.79004C16.6963 3.16245 19.0834 2.34866 20.3674 3.63261C21.6513 4.91656 20.8375 7.30371 19.21 12.078L18.1016 15.3292C16.8517 18.9958 16.2267 20.8291 15.1964 20.9808C14.9195 21.0216 14.6328 20.9971 14.3587 20.9091C13.3395 20.5819 12.8007 18.6489 11.7231 14.783C11.4841 13.9255 11.3646 13.4967 11.0924 13.1692C11.0134 13.0742 10.9258 12.9866 10.8308 12.9076C10.5033 12.6354 10.0745 12.5159 9.21705 12.2769C5.35111 11.1993 3.41814 10.6605 3.0909 9.64127C3.00292 9.36724 2.97837 9.08053 3.01916 8.80355C3.17088 7.77332 5.00419 7.14834 8.6708 5.89838L11.922 4.79004Z" stroke="currentColor" strokeWidth="1.5" />
                  </svg>
                </div>
                <span className="ml-4 text-xs font-light text-[#a2a2a2]">{listing.address}</span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Reservation div */}
      <div className="w-full md:w-11/12 rounded-2xl shadow-sm bg-[#ffffff] px-8 md:px-6 py-6 mx-3 md:mr-16">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Booking</h2>
        </div>
        <div className="mb-4">
          <Select<OptionType>
            options={serviceOptions}
            styles={customStyles}
            placeholder="Select a service"
            onChange={handleServiceChange}
          />
        </div>
        <div className="mb-4">
          <Select<OptionType>
            options={employeeOptions}
            styles={customStyles}
            placeholder="Select employee"
            onChange={handleEmployeeChange}
          />
        </div>
        <div className="mb-4">
          <Select<OptionType>
            styles={customStyles}
            placeholder="Pick a date"
            value={date ? { value: date.toISOString(), label: format(date, 'PP') } : null}
            onChange={() => setShowCalendar(true)}
            options={[]}
            isSearchable={false}
          />
          {showCalendar && (
            <div className="mt-2">
              <Calendar
                value={date || new Date()}
                onChange={handleDateChange}
                disabledDates={disabledDates}
                onTimeChange={dummyOnTimeChange}
              />
            </div>
          )}
        </div>
        <div className="mb-4">
          <Select<OptionType>
            options={timeOptions}
            styles={customStyles}
            placeholder="Select time"
            onChange={handleTimeChange}
            isDisabled={!date}
          />
        </div>
        <div className="flex justify-between items-center mb-4">
          <span>Total Price:</span>
          <span>${calculatedTotalPrice}</span>
        </div>
        <ModalButton
          disabled={isLoading || !date || !time || !selectedService || !selectedEmployee}
          label="Reserve"
          onClick={onCreateReservation}
        />
      </div>
    </div>
  );
}


export default ListingRightBar;