'use client';

import React, { useState, useEffect, useRef, useMemo } from 'react';
import Calendar from '../inputs/Calender';
import ModalButton from "../modals/ModalButton";
import { SafeListing, SafeReservation, SafeUser } from "@/app/types";
import { format, isSameDay } from 'date-fns';
import { SelectedEmployee, SelectedService } from "@/app/listings/[listingId]/ListingClient";

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
  readOnly: boolean;
  placeholder: string;
  disabled?: boolean;
  isSelected: boolean;
  showHoverEffect?: boolean;
  icon?: React.ReactNode;
}

const InputField: React.FC<InputFieldProps> = ({ 
  value, 
  onClick, 
  readOnly, 
  placeholder, 
  disabled = false, 
  isSelected,
  showHoverEffect = false,
  icon
}) => (
  <div className="mb-4 relative group">
    <div className="relative flex items-center">
      <input
        type="text"
        value={value || ''}
        onClick={onClick}
        readOnly={readOnly}
        placeholder=""
        disabled={disabled}
        className={`
          w-full
          py-4
          px-4
          text-sm
          rounded-md
          border
          border-neutral-500
          outline-none
          transition-all
          duration-300
          ${isSelected 
            ? 'bg-gradient-to-r from-[#5E6365] to-[#5E6365]/90 text-white border-transparent shadow-sm' 
            : 'bg-white border-gray-100 hover:border-gray-200 shadow-sm'
          }
          ${disabled 
            ? 'opacity-50 cursor-not-allowed' 
            : 'cursor-pointer hover:shadow-sm'
          }
          ${showHoverEffect && !isSelected
            ? 'hover:bg-gray-50/80' 
            : ''
          }
          ${value ? 'pt-6 pb-2' : 'py-4'}
        `}
      />
      
      {/* Floating Label */}
      <span className={`
        absolute 
        left-4
        transition-all 
        duration-300
        pointer-events-none
        ${value 
          ? 'text-xs top-2' 
          : 'text-sm top-1/2 -translate-y-1/2'
        }
        ${isSelected 
          ? 'text-white/80' 
          : 'text-gray-400'
        }
      `}>
        {placeholder}
      </span>

      {/* Value Text */}
      {value && (
        <span className={`
          absolute 
          left-4 
          bottom-2.5
          text-sm
          pointer-events-none
          ${isSelected ? 'text-white' : 'text-gray-900'}
        `}>
          {value}
        </span>
      )}

      {/* Dropdown Icon */}
      <div className={`
        absolute 
        right-4 
        transition-transform
        duration-300
        ${isSelected ? 'text-white' : 'text-gray-400'}
        ${showHoverEffect ? 'group-hover:translate-y-0.5' : ''}
      `}>
        {icon || (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            color='#71717A'
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M19 9l-7 7-7-7"
            />
          </svg>
        )}
      </div>
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

  const calendarRef = useRef<HTMLDivElement>(null);

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

  return (
    <div className="flex flex-col justify-end bg-transparent gap-4 h-auto">
      <div className="w-full rounded-md shadow-sm bg-white px-8 md:px-6 pt-6 pb-6 relative">
        <div className="mb-6">
          <h2 className="text-xl font-bold mb-1">Booking</h2>
          <p className="text-sm text-gray-500">Reserve your spot before its too late!</p>
        </div>

        <InputField
          value={selectedService ? selectedService.label : undefined}
          onClick={() => setShowServiceDropdown(!showServiceDropdown)}
          readOnly={true}
          placeholder="Select a service"
          isSelected={!!selectedService}
          showHoverEffect={true}
        />

        {showServiceDropdown && (
          <div className="absolute z-50 w-[calc(100%-3rem)] bg-white rounded-md shadow-lg 
                        border border-gray-100 overflow-hidden animate-in slide-in-from-top-2 duration-300">
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
          readOnly={true}
          placeholder="Select employee"
          isSelected={!!selectedEmployee}
          showHoverEffect={true}
        />

        {showEmployeeDropdown && (
          <div className="absolute z-50 w-[calc(100%-3rem)] bg-white rounded-md shadow-lg 
                        border border-gray-100 overflow-hidden animate-in slide-in-from-top-2 duration-300">
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
          value={date ? format(date, 'PP') : undefined}
          onClick={() => setShowCalendar(!showCalendar)}
          readOnly={true}
          placeholder="Pick a date"
          isSelected={!!date}
          showHoverEffect={true}
          icon={
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" color='#71717A'>
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2" strokeWidth={1.5}/>
              <line x1="16" y1="2" x2="16" y2="6" strokeWidth={1.5}/>
              <line x1="8" y1="2" x2="8" y2="6" strokeWidth={1.5}/>
              <line x1="3" y1="10" x2="21" y2="10" strokeWidth={1.5}/>
            </svg>
          }
        />

        {showCalendar && (
          <div ref={calendarRef} className="absolute z-50 w-[calc(100%-3rem)]">
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
          onClick={() => setShowTimeDropdown(!showTimeDropdown)}
          readOnly={true}
          placeholder={date ? "Select time..." : "Pick a date first"}
          disabled={!date}
          isSelected={!!time}
          icon={
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" color='#71717A'>
              <circle cx="12" cy="12" r="10" strokeWidth={1.5}/>
              <polyline points="12 6 12 12 16 14" strokeWidth={1.5}/>
            </svg>
          }
        />

        {showTimeDropdown && date && (
          <div className="absolute z-50 w-[calc(100%-3rem)] bg-white rounded-md shadow-lg 
                        border border-gray-100 overflow-hidden animate-in slide-in-from-top-2 duration-300">
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

        <div className="mt-6 space-y-4">
          <div className="flex justify-between items-center py-4 px-4 bg-gray-50 rounded-md">
            <span className="text-gray-600">Total Price</span>
            <span className="text-xl font-semibold">${totalPrice}</span>
          </div>
          
          <button
            disabled={isLoading || !date || !time || !selectedService || !selectedEmployee}
            onClick={onCreateReservation}
            className={`
              w-full py-4 px-4 rounded-md transition-all duration-300 
              flex items-center justify-center gap-2
              ${isLoading || !date || !time || !selectedService || !selectedEmployee
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                : 'bg-gradient-to-r from-[#F9AE8B] to-[#FFC5A8] text-white shadow-sm hover:shadow-lg hover:from-[#F9AE8B] hover:to-[#F9AE8B]'
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