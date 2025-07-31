// ReservationModal.tsx
'use client';

import { useCallback, useMemo, useState } from 'react';
import { format, isSameDay, isAfter, parse } from 'date-fns';
import { toast } from 'react-hot-toast';
import useLoginModal from '@/app/hooks/useLoginModal';
import useStripeCheckoutModal from '@/app/hooks/useStripeCheckoutModal';
import useReservationModal from '@/app/hooks/useReservationModal';
import Modal from './Modal';
import Calendar from '../inputs/Calender';
import Heading from '../Heading';

interface SelectedService {
  value: string;
  label: string;
  price: number;
}

interface SelectedEmployee {
  value: string;
  label: string;
}

const ReservationModal: React.FC = () => {
  const {
    isOpen,
    onClose,
    listing,
    currentUser,
    serviceId,
  } = useReservationModal();

  const loginModal = useLoginModal();
  const stripeCheckoutModal = useStripeCheckoutModal();

  const [step, setStep] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [note, setNote] = useState('');
  const [selectedEmployee, setSelectedEmployee] = useState<SelectedEmployee | null>(null);
  const [selectedServices, setSelectedServices] = useState<SelectedService[]>([]);
  const [date, setDate] = useState<Date | null>(null);
  const [time, setTime] = useState('');

  const serviceOptions: SelectedService[] = useMemo(() => {
    return listing?.services?.map(service => ({
      value: service.id,
      label: `${service.serviceName} - $${service.price}`,
      price: service.price,
    })) || [];
  }, [listing]);

  const employeeOptions: SelectedEmployee[] = useMemo(() => {
    return listing?.employees?.map(employee => ({
      value: employee.id,
      label: employee.fullName,
    })) || [];
  }, [listing]);

  // Initialize with serviceId if provided
  useMemo(() => {
    if (serviceId && serviceOptions.length > 0 && selectedServices.length === 0) {
      const initialService = serviceOptions.find(s => s.value === serviceId);
      if (initialService) {
        setSelectedServices([initialService]);
      }
    }
  }, [serviceId, serviceOptions, selectedServices.length]);

  const timeOptions = [
    '09:00', '10:00', '11:00', '12:00',
    '13:00', '14:00', '15:00', '16:00', '17:00'
  ];

  // Check if a time slot is in the past (only relevant for today)
  const isTimeSlotDisabled = (timeSlot: string, checkDate?: Date) => {
    const targetDate = checkDate || date;
    if (!targetDate) return false;
    
    const today = new Date();
    const isToday = isSameDay(targetDate, today);
    
    if (!isToday) return false; // If not today, no time restrictions
    
    // Parse the time slot and compare with current time
    const [hours, minutes] = timeSlot.split(':').map(Number);
    const slotTime = new Date();
    slotTime.setHours(hours, minutes, 0, 0);
    
    // Add 1 hour buffer to current time to allow booking preparation
    const currentTimeWithBuffer = new Date();
    currentTimeWithBuffer.setHours(currentTimeWithBuffer.getHours() + 1);
    
    return slotTime <= currentTimeWithBuffer;
  };

  const totalPrice = selectedServices.reduce((sum, service) => sum + service.price, 0);

  const toggleService = (service: SelectedService) => {
    setSelectedServices(prev => {
      const isSelected = prev.some(s => s.value === service.value);
      if (isSelected) {
        return prev.filter(s => s.value !== service.value);
      } else {
        return [...prev, service];
      }
    });
  };

  const isServiceSelected = (serviceValue: string) => {
    return selectedServices.some(s => s.value === serviceValue);
  };

  // Check if current step requirements are met
  const isStepComplete = () => {
    switch (step) {
      case 0: return selectedServices.length > 0;
      case 1: return selectedEmployee !== null;
      case 2: return date !== null;
      case 3: return time !== '';
      default: return true;
    }
  };

  const onBack = () => setStep((value) => value - 1);
  const onNext = () => setStep((value) => value + 1);

  const onSubmit = useCallback(() => {
    if (!currentUser) return loginModal.onOpen();
    if (!date || !time || selectedServices.length === 0 || !selectedEmployee || !listing?.id) {
      toast.error('Please fill in all required fields');
      return;
    }

    setIsLoading(true);

    const reservationData = {
      totalPrice,
      date,
      time,
      listingId: listing.id,
      serviceId: selectedServices[0].value, // Primary service for backward compatibility
      serviceName: selectedServices[0].label.split(' - ')[0], // Primary service name
      services: selectedServices.map(service => ({
        serviceId: service.value,
        serviceName: service.label.split(' - ')[0],
        price: service.price
      })),
      employeeId: selectedEmployee.value,
      employeeName: selectedEmployee.label,
      note,
      businessName: listing.title || '',
    };

    stripeCheckoutModal.onOpen(reservationData);
    onClose();
    setIsLoading(false);
  }, [totalPrice, date, time, listing, selectedServices, selectedEmployee, currentUser, loginModal, stripeCheckoutModal, note, onClose]);

  // Reset state when modal closes
  const handleClose = useCallback(() => {
    setStep(0);
    setNote('');
    setSelectedEmployee(null);
    setSelectedServices([]);
    setDate(null);
    setTime('');
    onClose();
  }, [onClose]);

  let bodyContent = (
    <div className="flex flex-col gap-6">
      <Heading
        title="Which services are you interested in?"
        subtitle="Choose one or more services to continue."
      />
      <div className="grid grid-cols-2 gap-3">
        {serviceOptions.map(service => (
          <button
            key={service.value}
            onClick={() => toggleService(service)}
            className={`aspect-square p-4 rounded-xl border-2 transition-all duration-200 flex flex-col items-center justify-center text-center hover:shadow-md relative ${
              isServiceSelected(service.value)
                ? 'border-blue-500 bg-blue-50 shadow-md' 
                : 'border-gray-200 hover:border-gray-300 bg-white'
            }`}
          >
            {/* Checkbox indicator */}
            <div className={`absolute top-2 right-2 w-5 h-5 rounded border-2 flex items-center justify-center transition-all duration-200 ${
              isServiceSelected(service.value)
                ? 'bg-blue-500 border-blue-500'
                : 'border-gray-300 bg-white'
            }`}>
              {isServiceSelected(service.value) && (
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M2 6L5 9L10 3" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              )}
            </div>

            <div className="flex flex-col items-center gap-2">
              {/* Service Icon */}
              <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                isServiceSelected(service.value)
                  ? 'bg-blue-100 text-blue-600' 
                  : 'bg-gray-100 text-gray-600'
              }`}>
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="20" height="20" fill="none">
                  <path d="M7.99805 16H11.998M7.99805 11H15.998" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"></path>
                  <path d="M7.5 3.5C5.9442 3.54667 5.01661 3.71984 4.37477 4.36227C3.49609 5.24177 3.49609 6.6573 3.49609 9.48836L3.49609 15.9944C3.49609 18.8255 3.49609 20.241 4.37477 21.1205C5.25345 22 6.66767 22 9.49609 22L14.4961 22C17.3245 22 18.7387 22 19.6174 21.1205C20.4961 20.241 20.4961 18.8255 20.4961 15.9944V9.48836C20.4961 6.6573 20.4961 5.24177 19.6174 4.36228C18.9756 3.71984 18.048 3.54667 16.4922 3.5" stroke="currentColor" strokeWidth="1.5"></path>
                  <path d="M7.49609 3.75C7.49609 2.7835 8.2796 2 9.24609 2H14.7461C15.7126 2 16.4961 2.7835 16.4961 3.75C16.4961 4.7165 15.7126 5.5 14.7461 5.5H9.24609C8.2796 5.5 7.49609 4.7165 7.49609 3.75Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"></path>
                </svg>
              </div>
              
              {/* Service Name */}
              <div className="flex flex-col gap-1">
                <span className={`text-sm font-medium ${
                  isServiceSelected(service.value) ? 'text-blue-900' : 'text-gray-900'
                }`}>
                  {service.label.split(' - ')[0]}
                </span>
                <span className={`text-xs font-semibold ${
                  isServiceSelected(service.value) ? 'text-blue-600' : 'text-gray-600'
                }`}>
                  ${service.price}
                </span>
              </div>
            </div>
          </button>
        ))}
      </div>
      
      {/* Selected services summary */}
      {selectedServices.length > 0 && (
        <div className="bg-blue-50 rounded-xl p-4 border border-blue-200">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-sm font-medium text-blue-900">
                {selectedServices.length} service{selectedServices.length > 1 ? 's' : ''} selected
              </p>
              <p className="text-xs text-blue-700">
                {selectedServices.map(s => s.label.split(' - ')[0]).join(', ')}
              </p>
            </div>
            <div className="text-right">
              <p className="text-lg font-bold text-blue-600">${totalPrice}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  if (step === 1) {
    bodyContent = (
      <div className="flex flex-col gap-6">
        <Heading
          title="Who would you like to book with?"
          subtitle="Select a professional."
        />
        <div className="grid grid-cols-2 gap-3">
          {employeeOptions.map(emp => (
            <button
              key={emp.value}
              onClick={() => setSelectedEmployee(emp)}
              className={`aspect-square p-4 rounded-xl border-2 transition-all duration-200 flex flex-col items-center justify-center text-center hover:shadow-md ${
                selectedEmployee?.value === emp.value 
                  ? 'border-blue-500 bg-blue-50 shadow-md' 
                  : 'border-gray-200 hover:border-gray-300 bg-white'
              }`}
            >
              <div className="flex flex-col items-center gap-3">
                {/* Employee Avatar */}
                <div className={`w-12 h-12 rounded-full flex items-center justify-center text-white font-semibold text-lg ${
                  selectedEmployee?.value === emp.value 
                    ? 'bg-blue-500' 
                    : 'bg-gray-400'
                }`}>
                  {emp.label.split(' ').map(n => n[0]).join('').toUpperCase()}
                </div>
                
                {/* Employee Name */}
                <span className={`text-sm font-medium text-center leading-tight ${
                  selectedEmployee?.value === emp.value ? 'text-blue-900' : 'text-gray-900'
                }`}>
                  {emp.label}
                </span>
              </div>
            </button>
          ))}
        </div>
      </div>
    );
  }

  if (step === 2) {
    bodyContent = (
      <div className="flex flex-col gap-6">
        <Heading
          title="Pick a date"
          subtitle="When would you like to come in?"
        />
        <Calendar
          value={date || new Date()}
          onChange={(value) => {
            setDate(value);
            // Clear selected time if it becomes invalid for the new date
            if (time && isTimeSlotDisabled(time, value)) {
              setTime('');
            }
          }}
        />
      </div>
    );
  }

  if (step === 3) {
    const isToday = date && isSameDay(date, new Date());
    
    bodyContent = (
      <div className="flex flex-col gap-6">
        <Heading
          title="Pick a time"
          subtitle="Choose your preferred time slot."
        />
        <div className="grid grid-cols-3 gap-3">
          {timeOptions.map(t => {
            const isDisabled = isTimeSlotDisabled(t);
            const isSelected = time === t;
            
            return (
              <button
                key={t}
                onClick={() => !isDisabled && setTime(t)}
                disabled={isDisabled}
                className={`aspect-square p-3 rounded-xl border-2 transition-all duration-200 flex items-center justify-center ${
                  isDisabled
                    ? 'border-gray-200 bg-gray-50 text-gray-300 cursor-not-allowed'
                    : isSelected
                      ? 'border-blue-500 bg-blue-50 text-blue-900 shadow-md' 
                      : 'border-gray-200 hover:border-gray-300 bg-white text-gray-700 hover:shadow-md cursor-pointer'
                }`}
              >
                <span className={`font-medium text-sm ${isDisabled ? 'line-through' : ''}`}>
                  {format(new Date(`2021-01-01T${t}`), 'hh:mm a')}
                </span>
              </button>
            );
          })}
        </div>
        
        {/* Helper text for time restrictions */}
        {isToday && (
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-3">
            <p className="text-sm text-amber-700 text-center">
              <span className="font-medium">Today's booking:</span> Times shown with 1 hour advance notice required
            </p>
          </div>
        )}
      </div>
    );
  }

  if (step === 4) {
    bodyContent = (
      <div className="flex flex-col gap-6">
        <Heading
          title="Add a note (optional)"
          subtitle="Any special requests?"
        />
        
        {/* Booking Summary */}
        <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
          <h4 className="font-medium text-gray-900 mb-3">Booking Summary</h4>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between items-start">
              <span className="text-gray-600">Services:</span>
              <div className="text-right">
                {selectedServices.map((service, index) => (
                  <div key={service.value} className="flex justify-between gap-4 mb-1">
                    <span className="font-medium">{service.label.split(' - ')[0]}</span>
                    <span className="font-medium">${service.price}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Professional:</span>
              <span className="font-medium">{selectedEmployee?.label}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Date:</span>
              <span className="font-medium">{date ? format(date, 'MMM dd, yyyy') : 'Not selected'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Time:</span>
              <span className="font-medium">{time ? format(new Date(`2021-01-01T${time}`), 'hh:mm a') : 'Not selected'}</span>
            </div>
            <div className="border-t border-gray-300 pt-2 mt-3">
              <div className="flex justify-between">
                <span className="font-medium text-gray-900">Total:</span>
                <span className="font-bold text-lg text-blue-600">${totalPrice}</span>
              </div>
            </div>
          </div>
        </div>

        <textarea
          placeholder="Add any special requests or notes here..."
          value={note}
          onChange={(e) => setNote(e.target.value)}
          className="w-full p-4 rounded-xl bg-white text-gray-700 border-2 border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
          rows={3}
        />
      </div>
    );
  }

  return (
    <Modal
      id="reservation-modal"
      modalContentId="reservation-modal-content"
      disabled={isLoading || !isStepComplete()}
      isOpen={isOpen}
      title="Book Appointment"
      actionLabel={step === 4 ? "Reserve Now" : "Next"}
      actionId="reserve-button"
      onSubmit={step === 4 ? onSubmit : onNext}
      secondaryActionLabel={step === 0 ? undefined : "Back"}
      secondaryAction={step === 0 ? undefined : onBack}
      onClose={handleClose}
      body={bodyContent}
      className="w-full md:w-4/6 lg:w-3/6 xl:w-2/5 my-0 mx-auto rounded-t-3xl"
    />
  );
};

export default ReservationModal;