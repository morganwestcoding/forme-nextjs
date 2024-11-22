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

interface InputFieldProps {
  value: string | undefined;
  onClick: () => void;
  readOnly: boolean;
  placeholder: string;
  disabled?: boolean;
  isSelected: boolean;
}

const InputField: React.FC<InputFieldProps> = ({ 
  value, 
  onClick, 
  readOnly, 
  placeholder, 
  disabled = false, 
  isSelected 
}) => (
  <div className="mb-3 relative">
    <div className="relative flex items-center">
      <input
        type="text"
        value={value || ''}
        onClick={onClick}
        readOnly={readOnly}
        placeholder={placeholder}
        disabled={disabled}
        className={`
          w-full 
          h-10 
          border 
          text-sm 
          rounded-lg 
          block 
          py-6 
          px-12 
          placeholder-[#a2a2a2]
          text-center
          transition-colors
          duration-250
          ${isSelected 
            ? 'bg-[#5E6365] text-white border-[#5E6365]' 
            : 'bg-white border-[#e2e8f0] hover:bg-[#e2e8f0]'
          }
          ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
        `}
      />
    </div>
  </div>
);

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


  const employeeOptions: OptionType[] = listing?.employees?.map(employee => ({
    value: employee.id,
    label: employee.fullName
  })) || [];

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
      <div className="w-full md:w-11/12 rounded-2xl shadow-sm bg-[#ffffff] px-8 md:px-6 pt-6 pb-6 mx-3 md:mr-16 relative">
        <div className="mb-4">
          <h2 className="text-xl font-bold mb-1">Booking</h2>
          <p className="text-sm text-gray-500">Reserve your spot before its too late!</p>
        </div>
        <InputField
          value={selectedService ? selectedService.label : undefined}
          onClick={() => setShowServiceDropdown(!showServiceDropdown)}
          readOnly={true}
          placeholder="Select a service"
          isSelected={!!selectedService}
        />

{showServiceDropdown && (
  <div className="absolute z-50 bg-white border border-gray-300 rounded-md shadow-lg w-[calc(100%-3rem)]">
    {serviceOptions.map((option) => (
      <div
        key={option.value}
        className="p-2 hover:bg-[#e2e8f0] cursor-pointer text-center transition-colors duration-250"
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
        <InputField
          value={selectedEmployee ? selectedEmployee.label : undefined}
          onClick={() => setShowEmployeeDropdown(!showEmployeeDropdown)}
          readOnly={true}
          placeholder="Select employee"
          isSelected={!!selectedEmployee}
        />

{showEmployeeDropdown && (
  <div className="absolute z-50  bg-white border border-gray-300 rounded-md shadow-lg w-[calc(100%-3rem)]">
    {employeeOptions.map((option) => (
      <div
        key={option.value}
        className="p-2 hover:bg-gray-100 cursor-pointer text-center"
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
        <InputField
          value={date ? format(date, 'PP') : undefined}
          onClick={handleDateClick}
          readOnly={true}
          placeholder="Pick a date"
          isSelected={!!date}
        />
{showCalendar && (
  <div 
    ref={calendarRef} 
    className="absolute z-50  w-[calc(100%-3rem)]"
  >
    <Calendar
      value={date || new Date()}
      onChange={handleDateChange}
      disabledDates={disabledDates}
    />
  </div>
)}
        <InputField
          value={time ? timeOptions.find(option => option.value === time)?.label : undefined}
          onClick={() => setShowTimeDropdown(!showTimeDropdown)}
          readOnly={true}
          placeholder={date ? "Select time..." : "Pick a date first"}
          disabled={!date}
          isSelected={!!time}
        />

{showTimeDropdown && date && (
  <div className="absolute z-50  bg-white border border-gray-300 rounded-md shadow-lg w-[calc(100%-3rem)]">
    {timeOptions.map((option) => (
      <div
        key={option.value}
        className="p-2 hover:bg-gray-100 cursor-pointer text-center "
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
    </div>
  );
}

export default ListingRightBar;