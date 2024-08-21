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

      {/* Reservation div */}
      <div className="w-full md:w-11/12 rounded-2xl shadow-sm bg-[#ffffff] px-8 md:px-6 pt-6 pb-6 mx-3 md:mr-16">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Booking</h2>
        </div>
        <div className="mb-3">
          <Select<OptionType>
            options={serviceOptions}
            styles={customStyles}
            placeholder="Select a service"
            onChange={handleServiceChange}
          />
        </div>
        <div className="mb-3">
          <Select<OptionType>
            options={employeeOptions}
            styles={customStyles}
            placeholder="Select employee"
            onChange={handleEmployeeChange}
          />
        </div>
        <div className="mb-3">
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
        <div className="mb-3">
          <Select<OptionType>
            options={timeOptions}
            styles={customStyles}
            placeholder="Select time"
            onChange={handleTimeChange}
            isDisabled={!date}
          />
        </div>
        <div className="flex justify-between items-center mb-3">
          <span>Total Price:</span>
          <span>${calculatedTotalPrice}</span>
        </div>
        <ModalButton
          disabled={isLoading || !date || !time || !selectedService || !selectedEmployee}
          label="Reserve"
          onClick={onCreateReservation}
        />
      </div>
      <div className="w-full md:w-11/12 rounded-2xl shadow-sm bg-[#ffffff] px-8 md:px-6 py-6 mx-3 md:mr-16 relative flex flex-col justify-end">
  <h2 className="text-xl font-bold mb-4">Hours</h2>
  <div className="space-y-3">
    <div className="flex justify-between items-center">
      <span className="text-sm font-semibold">Mon - Fri</span>
      <span className="text-sm">8:00 AM - 5:00 PM</span>
    </div>
    <div className="flex justify-between items-center">
      <span className="text-sm font-semibold">Sat - Sun</span>
      <span className="text-sm">8:00 AM - 5:00 PM</span>
    </div>
  </div>
  <div className="mt-3 text-sm text-gray-500 italic">
    Open all week • Walk-ins welcome
  </div>
</div>
    </div>
  );
}


export default ListingRightBar;