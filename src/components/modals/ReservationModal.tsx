// ReservationModal.tsx
'use client';

import { useCallback, useMemo, useState } from 'react';
import { format } from 'date-fns';
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
  const [selectedServiceState, setSelectedServiceState] = useState<SelectedService | null>(null);
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

  const selectedService = useMemo(() => {
    return selectedServiceState || (serviceId ? serviceOptions.find(s => s.value === serviceId) || null : null);
  }, [serviceOptions, serviceId, selectedServiceState]);

  const timeOptions = [
    '09:00', '10:00', '11:00', '12:00',
    '13:00', '14:00', '15:00', '16:00', '17:00'
  ];

  const totalPrice = selectedService?.price || 0;

  const onBack = () => setStep((value) => value - 1);
  const onNext = () => setStep((value) => value + 1);

  const onSubmit = useCallback(() => {
    if (!currentUser) return loginModal.onOpen();
    if (!date || !time || !selectedService || !selectedEmployee || !listing?.id) {
      toast.error('Please fill in all required fields');
      return;
    }

    setIsLoading(true);

    const reservationData = {
      totalPrice,
      date,
      time,
      listingId: listing.id,
      serviceId: selectedService.value,
      serviceName: selectedService.label.split(' - ')[0],
      employeeId: selectedEmployee.value,
      employeeName: selectedEmployee.label,
      note,
      businessName: listing.title || '',
    };

    stripeCheckoutModal.onOpen(reservationData);
    onClose();
    setIsLoading(false);
  }, [totalPrice, date, time, listing, selectedService, selectedEmployee, currentUser, loginModal, stripeCheckoutModal, note, onClose]);

  let bodyContent = (
    <div className="flex flex-col gap-6">
      <Heading
        title="Which service are you interested in?"
        subtitle="Choose one to continue."
      />
      <div className="grid grid-cols-2 gap-3">
        {serviceOptions.map(service => (
          <button
            key={service.value}
            onClick={() => {
              setSelectedServiceState(service);
              setStep(1);
            }}
            className={`aspect-square p-4 rounded-xl border-2 transition-all duration-200 flex flex-col items-center justify-center text-center hover:shadow-md ${
              selectedService?.value === service.value 
                ? 'border-blue-500 bg-blue-50 shadow-md' 
                : 'border-gray-200 hover:border-gray-300 bg-white'
            }`}
          >
            <div className="flex flex-col items-center gap-2">
              {/* Service Icon */}
              <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                selectedService?.value === service.value 
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
                  selectedService?.value === service.value ? 'text-blue-900' : 'text-gray-900'
                }`}>
                  {service.label.split(' - ')[0]}
                </span>
                <span className={`text-xs font-semibold ${
                  selectedService?.value === service.value ? 'text-blue-600' : 'text-gray-600'
                }`}>
                  ${service.price}
                </span>
              </div>
            </div>
          </button>
        ))}
      </div>
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
              onClick={() => {
                setSelectedEmployee(emp);
                setStep(2);
              }}
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
          onChange={(value) => setDate(value)}
        />
      </div>
    );
  }

  if (step === 3) {
    bodyContent = (
      <div className="flex flex-col gap-6">
        <Heading
          title="Pick a time"
          subtitle="Choose your preferred time slot."
        />
        <div className="grid grid-cols-3 gap-3">
          {timeOptions.map(t => (
            <button
              key={t}
              onClick={() => {
                setTime(t);
                setStep(4);
              }}
              className={`aspect-square p-3 rounded-xl border-2 transition-all duration-200 flex items-center justify-center hover:shadow-md ${
                time === t 
                  ? 'border-blue-500 bg-blue-50 text-blue-900 shadow-md' 
                  : 'border-gray-200 hover:border-gray-300 bg-white text-gray-700'
              }`}
            >
              <span className="font-medium text-sm">
                {format(new Date(`2021-01-01T${t}`), 'hh:mm a')}
              </span>
            </button>
          ))}
        </div>
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
            <div className="flex justify-between">
              <span className="text-gray-600">Service:</span>
              <span className="font-medium">{selectedService?.label.split(' - ')[0]}</span>
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
      disabled={isLoading}
      isOpen={isOpen}
      title="Book Appointment"
      actionLabel={step === 4 ? "Reserve Now" : "Next"}
      actionId="reserve-button"
      onSubmit={step === 4 ? onSubmit : onNext}
      secondaryActionLabel={step === 0 ? undefined : "Back"}
      secondaryAction={step === 0 ? undefined : onBack}
      onClose={onClose}
      body={bodyContent}
      className="w-full md:w-4/6 lg:w-3/6 xl:w-2/5 my-0 mx-auto rounded-t-3xl"
    />
  );
};

export default ReservationModal;