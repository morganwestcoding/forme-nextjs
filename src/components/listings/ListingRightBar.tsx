'use client';

import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import Calendar from '../inputs/Calender';
import { SafeListing, SafeReservation, SafeUser } from "@/app/types";
import { format, isSameDay } from 'date-fns';
import { SelectedEmployee, SelectedService } from "@/app/listings/[listingId]/ListingClient";
import useStripeCheckoutModal from '@/app/hooks/useStripeCheckoutModal';
import useLoginModal from "@/app/hooks/useLoginModal";
import { toast } from "react-hot-toast";

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
  selectedService: SelectedService | null;
  selectedEmployee: SelectedEmployee | null;
  date: Date | null;
  time: string;
  onServiceChange: (service: SelectedService) => void;
  onEmployeeChange: (employee: SelectedEmployee) => void;
  onDateChange: (date: Date) => void;
  onTimeChange: (time: string) => void;
}

interface InputFieldProps {
  value: string | undefined;
  onClick: () => void;
  placeholder: string;
  disabled?: boolean;
  isSelected: boolean;
  icon?: React.ReactNode;
}

const InputField: React.FC<InputFieldProps> = ({ 
  value, 
  onClick, 
  placeholder, 
  disabled = false, 
  isSelected,
  icon
}) => (
  <div className="mb-4 relative">
    <button
      onClick={onClick}
      disabled={disabled}
      className={`
        w-full
        py-4
        px-4
        text-sm
        rounded-lg
        focus:outline-none
        transition-all
        duration-300
        flex
        justify-between
        items-center
        ${isSelected 
          ? 'bg-gray-600 text-white' 
          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
        }
        ${disabled 
          ? 'opacity-70 cursor-not-allowed' 
          : 'cursor-pointer'
        }
      `}
    >
      <span>{value || placeholder}</span>
      <span className={isSelected ? 'text-white' : 'text-gray-400'}>
        {icon || (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M19 9l-7 7-7-7"
            />
          </svg>
        )}
      </span>
    </button>
  </div>
);

const ListingRightBar: React.FC<ListingRightBarProps> = ({
  listing,
  reservations = [],
  currentUser,
  isLoading,
  disabledDates,
  description,
  selectedServices,
  toggleServiceSelection,
  totalPrice,
  selectedService,
  selectedEmployee,
  date,
  time,
  onServiceChange,
  onEmployeeChange,
  onDateChange,
  onTimeChange
}) => {
  const [showCalendar, setShowCalendar] = useState(false);
  const [showServiceDropdown, setShowServiceDropdown] = useState(false);
  const [showEmployeeDropdown, setShowEmployeeDropdown] = useState(false);
  const [showTimeDropdown, setShowTimeDropdown] = useState(false);
  const [checkoutLoading, setCheckoutLoading] = useState(false);

  const calendarRef = useRef<HTMLDivElement>(null);
  const stripeCheckoutModal = useStripeCheckoutModal();
  const loginModal = useLoginModal();

  const activeReservations = useMemo(() => {
    return reservations.filter(reservation => 
      reservation.status !== 'declined'
    );
  }, [reservations]);

  const getAvailableTimes = (selectedDate: Date, employeeId?: string) => {
    if (!employeeId) return [];

    const bookedTimes = activeReservations
      .filter(reservation => 
        isSameDay(new Date(reservation.date), selectedDate) && 
        reservation.employeeId === employeeId
      )
      .map(reservation => reservation.time);

    return bookedTimes;
  };

  const isDateFullyBooked = (date: Date, employeeId: string) => {
    const bookingsForDate = activeReservations.filter(r => 
      isSameDay(new Date(r.date), date) && 
      r.employeeId === employeeId
    );

    const timeOptions = [
      '09:00', '10:00', '11:00', '12:00', '13:00',
      '14:00', '15:00', '16:00', '17:00'
    ];

    return timeOptions.every(time => 
      bookingsForDate.some(booking => booking.time === time)
    );
  };

  const employeeOptions: SelectedEmployee[] = listing?.employees?.map(employee => ({
    value: employee.id,
    label: employee.fullName
  })) || [];

  const serviceOptions: SelectedService[] = listing.services.map(service => ({
    value: service.id,
    label: `${service.serviceName} - $${service.price}`,
    price: service.price
  }));

  const timeOptions: SelectedService[] = [
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

  const bookedTimes = date && selectedEmployee 
    ? getAvailableTimes(date, selectedEmployee.value) 
    : [];

  const handleReservation = useCallback(() => {
    if (!currentUser) {
      return loginModal.onOpen();
    }

    if (!date || !time || !selectedService || !selectedEmployee) {
      toast.error('Please fill in all required fields');
      return;
    }

    setCheckoutLoading(true);

    const reservationData = {
      totalPrice,
      date,
      time,
      listingId: listing?.id,
      serviceId: selectedService.value,
      serviceName: listing.services.find(service => 
        service.id === selectedService.value
      )?.serviceName,
      employeeId: selectedEmployee.value,
      employeeName: selectedEmployee.label,
      note: '',
      businessName: listing.title
    };

    // Open the Stripe checkout modal
    stripeCheckoutModal.onOpen(reservationData);
    setCheckoutLoading(false);
  }, [
    totalPrice,
    date,
    time,
    listing?.id,
    selectedService,
    selectedEmployee,
    listing.services,
    listing.title,
    currentUser,
    loginModal,
    stripeCheckoutModal
  ]);

  return (
    <div className="flex flex-col justify-end bg-transparent gap-4 h-auto">
      <div className="w-full rounded-2xl shadow-sm bg-white border px-6 py-6 relative hover:shadow-md transition-all duration-300">
        <div className="mb-6">
          <h2 className="text-xl font-bold mb-1">Booking</h2>
          <p className="text-gray-500 text-sm">Reserve your spot before its too late!</p>
        </div>

        <InputField
          value={selectedService ? selectedService.label.split(' - ')[0] : undefined}
          onClick={() => setShowServiceDropdown(!showServiceDropdown)}
          placeholder="Select a service"
          isSelected={!!selectedService}
        />

        {showServiceDropdown && (
          <div className="absolute z-50 left-6 right-6 bg-white rounded-md shadow-lg 
                        border border-gray-100 overflow-hidden mt-1">
            {serviceOptions.map((option) => (
              <div
                key={option.value}
                className="p-4 hover:bg-gray-50 cursor-pointer border-b border-gray-50 last:border-none"
                onClick={() => {
                  onServiceChange(option);
                  setShowServiceDropdown(false);
                }}
              >
                <div className="flex justify-between items-center">
                  <div>
                    <p className="font-medium text-gray-900">{option.label.split(' - ')[0]}</p>
                    <p className="text-sm text-gray-500">45 min</p>
                  </div>
                  <span className="text-base font-semibold">${option.price}</span>
                </div>
              </div>
            ))}
          </div>
        )}

        <InputField
          value={selectedEmployee ? selectedEmployee.label : undefined}
          onClick={() => setShowEmployeeDropdown(!showEmployeeDropdown)}
          placeholder="Select employee"
          isSelected={!!selectedEmployee}
        />

        {showEmployeeDropdown && (
          <div className="absolute z-50 left-6 right-6 bg-white rounded-md shadow-lg 
                        border border-gray-100 overflow-hidden mt-1">
            {employeeOptions.map((option) => (
              <div
                key={option.value}
                className="p-4 hover:bg-gray-50 cursor-pointer border-b border-gray-50 last:border-none"
                onClick={() => {
                  onEmployeeChange(option);
                  setShowEmployeeDropdown(false);
                }}
              >
                <span className="text-gray-900">{option.label}</span>
              </div>
            ))}
          </div>
        )}

        <InputField
          value={date ? format(date, 'MMM d, yyyy') : undefined}
          onClick={() => setShowCalendar(!showCalendar)}
          placeholder="Pick a date"
          isSelected={!!date}
          icon={
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor">
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2" strokeWidth={1.5}/>
              <line x1="16" y1="2" x2="16" y2="6" strokeWidth={1.5}/>
              <line x1="8" y1="2" x2="8" y2="6" strokeWidth={1.5}/>
              <line x1="3" y1="10" x2="21" y2="10" strokeWidth={1.5}/>
            </svg>
          }
        />

        {showCalendar && (
          <div ref={calendarRef} className="absolute z-50 left-6 right-6 mt-1">
            <Calendar
              value={date || new Date()}
              onChange={(newDate) => {
                onDateChange(newDate);
                setShowCalendar(false);
              }}
              disabledDates={selectedEmployee ? disabledDates.filter(date => 
                isDateFullyBooked(date, selectedEmployee.value)
              ) : []}
            />
          </div>
        )}

        <InputField
          value={time ? timeOptions.find(option => option.value === time)?.label : undefined}
          onClick={() => date && setShowTimeDropdown(!showTimeDropdown)}
          placeholder={date ? "Select time..." : "Pick a date first"}
          disabled={!date}
          isSelected={!!time}
          icon={
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor">
              <circle cx="12" cy="12" r="10" strokeWidth={1.5}/>
              <polyline points="12 6 12 12 16 14" strokeWidth={1.5}/>
            </svg>
          }
        />

        {showTimeDropdown && date && (
          <div className="absolute z-50 left-6 right-6 bg-white rounded-md shadow-lg 
                        border border-gray-100 overflow-hidden mt-1">
            <div className="grid grid-cols-3 gap-1 p-2">
              {timeOptions.map((option) => {
                const isBooked = bookedTimes.includes(option.value);
                return (
                  <div
                    key={option.value}
                    className={`
                      p-3
                      rounded-lg
                      text-center
                      transition-all
                      duration-250
                      ${isBooked 
                        ? 'opacity-50 cursor-not-allowed bg-gray-50' 
                        : 'hover:bg-gray-50 cursor-pointer'
                      }
                    `}
                    onClick={() => {
                      if (!isBooked) {
                        onTimeChange(option.value);
                        setShowTimeDropdown(false);
                      }
                    }}
                  >
                    <span className={isBooked ? 'text-gray-400' : 'text-gray-600'}>
                      {option.label}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        <div className="mt-8 space-y-6">
          <div className="flex justify-between items-center">
            <span className="text-gray-600 text-base">Total Price</span>
            <span className="text-lg font-semibold">${totalPrice}</span>
          </div>
          
          <button
            disabled={checkoutLoading || isLoading || !date || !time || !selectedService || !selectedEmployee}
            onClick={handleReservation}
            className={`
              w-full py-4 px-4 rounded-md transition-all duration-300 
              flex items-center justify-center gap-2 text-white
              ${checkoutLoading || isLoading || !date || !time || !selectedService || !selectedEmployee
                ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                : 'bg-[#60A5FA] hover:bg-[#4A94F9] shadow-sm hover:shadow'
              }
            `}
          >
            <span>Reserve Now</span>
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              viewBox="0 0 24 24" 
              fill="none" 
              stroke="currentColor" 
              className="w-4 h-4"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={1.5} 
                d="M5 12h14M12 5l7 7-7 7"
              />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}

export default ListingRightBar;