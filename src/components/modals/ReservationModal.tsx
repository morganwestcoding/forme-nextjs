'use client';

import { useState, useEffect, useCallback } from "react";
import { SafeListing, SafeUser, SafeService } from "@/app/types";
import { format } from 'date-fns';
import { toast } from "react-hot-toast";
import useLoginModal from "@/app/hooks/useLoginModal";
import useStripeCheckoutModal from '@/app/hooks/useStripeCheckoutModal';
import { ChevronRight } from 'lucide-react';

import Modal from "./Modal";
import Calendar from "../inputs/Calender";
import Input from "../inputs/Input";

interface InputFieldProps {
  value: string | undefined;
  onClick: () => void;
  placeholder: string;
  disabled?: boolean;
  isSelected: boolean;
  icon?: React.ReactNode;
}

interface SelectedService {
  value: string;
  label: string;
  price: number;
}

interface SelectedEmployee {
  value: string;
  label: string;
}

interface ReservationModalProps {
  isOpen: boolean;
  onClose: () => void;
  service?: {
    id: string;
    name: string;
    price: number;
  } | null;
  listing: SafeListing; // Change this to accept SafeListing
  currentUser?: SafeUser | null;
  disabledDates?: Date[];
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

const ReservationModal: React.FC<ReservationModalProps> = ({
  isOpen,
  onClose,
  service,
  listing,
  currentUser,
  disabledDates = []
}) => {
  const [showCalendar, setShowCalendar] = useState(false);
  const [showServiceDropdown, setShowServiceDropdown] = useState(false);
  const [showEmployeeDropdown, setShowEmployeeDropdown] = useState(false);
  const [showTimeDropdown, setShowTimeDropdown] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [note, setNote] = useState('');
  
  const [selectedService, setSelectedService] = useState<SelectedService | null>(
    service ? {
      value: service.id,
      label: `${service.name} - $${service.price}`,
      price: service.price
    } : null
  );
  const [selectedEmployee, setSelectedEmployee] = useState<SelectedEmployee | null>(null);
  const [date, setDate] = useState<Date | null>(null);
  const [time, setTime] = useState('');
  
  const loginModal = useLoginModal();
  const stripeCheckoutModal = useStripeCheckoutModal();
  
  // Reset form when modal closes
  useEffect(() => {
    if (!isOpen) {
      if (!service) {
        setSelectedService(null);
      }
      setSelectedEmployee(null);
      setDate(null);
      setTime('');
      setNote('');
    }
  }, [isOpen, service]);
  
  const employeeOptions: SelectedEmployee[] = listing?.employees?.map(employee => ({
    value: employee.id,
    label: employee.fullName
  })) || [];

  const serviceOptions: SelectedService[] = listing.services.map(service => ({
    value: service.id,
    label: `${service.serviceName} - $${service.price}`,
    price: service.price
  }));

  const timeOptions = [
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

  const totalPrice = selectedService?.price || 0;

  const onServiceChange = (service: SelectedService) => {
    setSelectedService(service);
  };

  const onEmployeeChange = (employee: SelectedEmployee) => {
    setSelectedEmployee(employee);
  };

  const onDateChange = (newDate: Date) => {
    setDate(newDate);
    setTime(''); // Reset time when date changes
  };

  const onTimeChange = (newTime: string) => {
    setTime(newTime);
  };

  const onSubmit = useCallback(() => {
    if (!currentUser) {
      return loginModal.onOpen();
    }

    if (!date || !time || !selectedService || !selectedEmployee) {
      toast.error('Please fill in all required fields');
      return;
    }

    setIsLoading(true);

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
      note,
      businessName: listing.title
    };
    
    stripeCheckoutModal.onOpen(reservationData);
    onClose();
    setIsLoading(false);
  }, [
    totalPrice,
    date,
    time,
    listing,
    selectedService,
    selectedEmployee,
    currentUser,
    loginModal,
    stripeCheckoutModal,
    note,
    onClose
  ]);

  const bodyContent = (
    <div className="flex flex-col gap-4">
      <h2 className="text-xl font-bold">Make a Reservation</h2>
      <p className="text-gray-500 text-sm mb-2">Reserve your spot at {listing.title}</p>

      <InputField
        value={selectedService ? selectedService.label.split(' - ')[0] : undefined}
        onClick={() => setShowServiceDropdown(!showServiceDropdown)}
        placeholder="Select a service"
        isSelected={!!selectedService}
      />

      {showServiceDropdown && (
        <div className="relative z-50 bg-white rounded-md shadow-lg 
                      border border-gray-100 overflow-hidden mt-1 max-h-60 overflow-y-auto">
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
        <div className="relative z-50 bg-white rounded-md shadow-lg 
                      border border-gray-100 overflow-hidden mt-1 max-h-60 overflow-y-auto">
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

      <div className="relative">
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
          <div className="absolute z-50 w-full mt-1 shadow-lg">
            <Calendar
              value={date || new Date()}
              onChange={(newDate) => {
                onDateChange(newDate);
                setShowCalendar(false);
              }}
              disabledDates={disabledDates}
            />
          </div>
        )}
      </div>

      <div className="relative">
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
          <div className="absolute z-50 w-full bg-white rounded-md shadow-lg 
                        border border-gray-100 overflow-hidden mt-1">
            <div className="grid grid-cols-3 gap-1 p-2">
              {timeOptions.map((option) => (
                <div
                  key={option.value}
                  className="p-3 rounded-lg text-center transition-all duration-250 hover:bg-gray-50 cursor-pointer"
                  onClick={() => {
                    onTimeChange(option.value);
                    setShowTimeDropdown(false);
                  }}
                >
                  <span className="text-gray-600">
                    {option.label}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="mt-2">
        <textarea
          placeholder="Add any special requests or notes here..."
          value={note}
          onChange={(e) => setNote(e.target.value)}
          className="w-full p-4 rounded-lg bg-gray-100 text-gray-700 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
          rows={3}
        />
      </div>

      <div className="mt-4 flex justify-between items-center pb-2">
        <span className="text-gray-600 text-base">Total Price</span>
        <span className="text-lg font-semibold">${totalPrice}</span>
      </div>
    </div>
  );

  return (
    <Modal
      id="reservation-modal"
      modalContentId="reservation-modal-content"
      disabled={isLoading}
      isOpen={isOpen}
      title="Book Appointment"
      actionLabel="Reserve Now"
      actionId="reserve-button"
      onSubmit={onSubmit}
      secondaryActionLabel="Cancel"
      secondaryAction={onClose}
      onClose={onClose}
      body={bodyContent}
      className="w-full md:w-4/6 lg:w-3/6 xl:w-2/5"
    />
  );
};

export default ReservationModal;