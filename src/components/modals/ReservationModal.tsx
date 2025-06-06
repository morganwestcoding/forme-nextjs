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
    return serviceId ? serviceOptions.find(s => s.value === serviceId) || null : null;
  }, [serviceOptions, serviceId]);

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
      <div className="space-y-2">
        {serviceOptions.map(service => (
          <button
            key={service.value}
            onClick={() => {
              setStep(1);
            }}
            className={`w-full text-left border p-4 rounded-lg ${selectedService?.value === service.value ? 'bg-gray-200' : ''}`}
          >
            <div className="flex justify-between">
              <span>{service.label.split(' - ')[0]}</span>
              <span>${service.price}</span>
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
        <div className="space-y-2">
          {employeeOptions.map(emp => (
            <button
              key={emp.value}
              onClick={() => {
                setSelectedEmployee(emp);
                setStep(2);
              }}
              className={`w-full text-left border p-4 rounded-lg ${selectedEmployee?.value === emp.value ? 'bg-gray-200' : ''}`}
            >
              {emp.label}
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
        <div className="grid grid-cols-3 gap-2">
          {timeOptions.map(t => (
            <button
              key={t}
              onClick={() => {
                setTime(t);
                setStep(4);
              }}
              className={`p-3 rounded-lg border ${time === t ? 'bg-gray-300' : ''}`}
            >
              {format(new Date(`2021-01-01T${t}`), 'hh:mm a')}
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
        <textarea
          placeholder="Add any special requests or notes here..."
          value={note}
          onChange={(e) => setNote(e.target.value)}
          className="w-full p-4 rounded-lg bg-gray-100 text-gray-700 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-green-500"
          rows={3}
        />
        <div className="flex justify-between text-lg font-medium">
          <span>Total:</span>
          <span>${totalPrice}</span>
        </div>
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
