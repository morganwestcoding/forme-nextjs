'use client';

import React, { useState, useEffect, useRef } from 'react';
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
  const [showServiceDropdown, setShowServiceDropdown] = useState(false);
  const [showEmployeeDropdown, setShowEmployeeDropdown] = useState(false);
  const [showTimeDropdown, setShowTimeDropdown] = useState(false);

  const calendarRef = useRef<HTMLDivElement>(null);

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

  const handleServiceChange = (selectedOption: OptionType) => {
    setSelectedService(selectedOption);
    if (selectedOption && selectedOption.price) {
      toggleServiceSelection(selectedOption.value);
    }
  };

  const handleEmployeeChange = (selectedOption: OptionType) => {
    setSelectedEmployee(selectedOption);
  };

  const handleDateClick = () => {
    setShowCalendar(!showCalendar);
  };

  const handleDateChange = (newDate: Date) => {
    setDate(newDate);
    setShowCalendar(false);
  };

  const handleTimeChange = (selectedOption: OptionType) => {
    setTime(selectedOption.value);
  };

  useEffect(() => {
    const newTotalPrice = listing.services
      .filter(service => selectedServices.has(service.id))
      .reduce((sum, service) => sum + service.price, 0);
    setCalculatedTotalPrice(newTotalPrice);
  }, [selectedServices, listing.services]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (calendarRef.current && !calendarRef.current.contains(event.target as Node)) {
        setShowCalendar(false);
        setShowServiceDropdown(false);
        setShowEmployeeDropdown(false);
        setShowTimeDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <div className="flex flex-col justify-end bg-transparent gap-4 pr-16 h-auto">
      <div className="w-full md:w-11/12 rounded-2xl shadow-sm bg-[#ffffff] px-8 md:px-6 pt-6 pb-6 mx-3 md:mr-16">
        <div className="mb-4">
          <h2 className="text-xl font-bold mb-1">Booking</h2>
          <p className="text-sm text-gray-500">Reserve your spot before it's too late!</p>
        </div>
        <div className="mb-3 relative">
          <input
            type="text"
            value={selectedService ? selectedService.label : ''}
            onClick={() => setShowServiceDropdown(!showServiceDropdown)}
            readOnly
            placeholder="Select a service"
            className="w-full h-10 bg-white border border-[#e2e8f0] text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block py-6 text-center placeholder-[#718096]"
          />
          {showServiceDropdown && (
            <div className="absolute z-50 mt-1 w-full bg-white border border-gray-300 rounded-md shadow-lg">
              {serviceOptions.map((option) => (
                <div
                  key={option.value}
                  className="p-2 hover:bg-gray-100 cursor-pointer"
                  onClick={() => {
                    handleServiceChange(option);
                    setShowServiceDropdown(false);
                  }}
                >
                  {option.label}
                </div>
              ))}
            </div>
          )}
        </div>
        <div className="mb-3 relative">
          <input
            type="text"
            value={selectedEmployee ? selectedEmployee.label : ''}
            onClick={() => setShowEmployeeDropdown(!showEmployeeDropdown)}
            readOnly
            placeholder="Select employee"
            className="w-full h-10 bg-white border border-[#e2e8f0] text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block py-6 text-center placeholder-[#718096]"
          />
          {showEmployeeDropdown && (
            <div className="absolute z-50 mt-1 w-full bg-white border border-gray-300 rounded-md shadow-lg">
              {employeeOptions.map((option) => (
                <div
                  key={option.value}
                  className="p-2 hover:bg-gray-100 cursor-pointer"
                  onClick={() => {
                    handleEmployeeChange(option);
                    setShowEmployeeDropdown(false);
                  }}
                >
                  {option.label}
                </div>
              ))}
            </div>
          )}
        </div>
        <div className="mb-3 relative">
          <input
            type="text"
            value={date ? format(date, 'PP') : ''}
            onClick={handleDateClick}
            readOnly
            placeholder="Pick a date"
            className="w-full h-10 bg-white border border-[#e2e8f0] text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block py-6 text-center placeholder-[#718096]"
          />
          {showCalendar && (
            <div 
              ref={calendarRef} 
              className="absolute z-50 mt-1 bg-white shadow-lg rounded-md"
              style={{
                left: '0',
                width: '100%',
              }}
            >
              <Calendar
                value={date || new Date()}
                onChange={handleDateChange}
                disabledDates={disabledDates}
              />
            </div>
          )}
        </div>
        <div className="mb-4 relative">
          <input
            type="text"
            value={time ? timeOptions.find(option => option.value === time)?.label : ''}
            onClick={() => setShowTimeDropdown(!showTimeDropdown)}
            readOnly
            placeholder={date ? "Select time..." : "Pick a date first"}
            className="w-full h-10 bg-white border border-[#e2e8f0] text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block py-6 text-center placeholder-[#718096]"
            disabled={!date}
          />
          {showTimeDropdown && date && (
            <div className="absolute z-50 mt-1 w-full bg-white border border-gray-300 rounded-md shadow-lg">
              {timeOptions.map((option) => (
                <div
                  key={option.value}
                  className="p-2 hover:bg-gray-100 cursor-pointer"
                  onClick={() => {
                    handleTimeChange(option);
                    setShowTimeDropdown(false);
                  }}
                >
                  {option.label}
                </div>
              ))}
            </div>
          )}
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
      <div className="w-full md:w-11/12 rounded-2xl shadow-sm bg-[#ffffff] md:px-6 py-6 text-center mx-3 md:mr-16 relative flex flex-col justify-end">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">Hours</h2>
        </div>
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
        <div className="mt-3 text-sm text-gray-500 italic flex items-center">
          <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
          <span>Open all week • Walk-ins welcome</span>
        </div>
      </div>
    </div>
  );
}

export default ListingRightBar;