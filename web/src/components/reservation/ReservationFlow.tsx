'use client';

import { useState, useCallback, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';
import axios from 'axios';
import { AnimatePresence } from 'framer-motion';
import { format, isSameDay } from 'date-fns';

import TypeformStep from '../registration/TypeformStep';
import TypeformProgress from '../registration/TypeformProgress';
import TypeformNavigation from '../registration/TypeformNavigation';

import ServicesStep from './steps/ServicesStep';
import EmployeeStep from './steps/EmployeeStep';
import DateStep from './steps/DateStep';
import TimeStep from './steps/TimeStep';
import SummaryStep from './steps/SummaryStep';

import { SafeListing, SafeUser } from '@/app/types';
import useStripeCheckoutModal from '@/app/hooks/useStripeCheckoutModal';

interface SelectedService {
  value: string;
  label: string;
  price: number;
}

interface SelectedEmployee {
  value: string;
  label: string;
}

interface ReservationFlowProps {
  listing: SafeListing;
  currentUser: SafeUser;
  initialServiceId?: string;
  initialEmployeeId?: string;
}

enum STEPS {
  SERVICES = 0,
  EMPLOYEE = 1,
  DATE = 2,
  TIME = 3,
  SUMMARY = 4,
}

export default function ReservationFlow({
  listing,
  currentUser,
  initialServiceId,
  initialEmployeeId,
}: ReservationFlowProps) {
  const router = useRouter();
  const stripeCheckoutModal = useStripeCheckoutModal();

  // Determine flow order based on entry point
  const isEmployeeFirstFlow = !!initialEmployeeId;

  const [step, setStep] = useState<STEPS>(isEmployeeFirstFlow ? STEPS.EMPLOYEE : STEPS.SERVICES);
  const [direction, setDirection] = useState<1 | -1>(1);
  const [isLoading, setIsLoading] = useState(false);

  const [selectedServices, setSelectedServices] = useState<SelectedService[]>([]);
  const [selectedEmployee, setSelectedEmployee] = useState<SelectedEmployee | null>(null);
  const [date, setDate] = useState<Date | null>(null);
  const [time, setTime] = useState('');
  const [note, setNote] = useState('');

  // Build options from listing
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

  // Initialize with provided IDs
  useEffect(() => {
    if (initialEmployeeId && employeeOptions.length > 0 && !selectedEmployee) {
      const initial = employeeOptions.find(e => e.value === initialEmployeeId);
      if (initial) setSelectedEmployee(initial);
    }
  }, [initialEmployeeId, employeeOptions, selectedEmployee]);

  useEffect(() => {
    if (initialServiceId && serviceOptions.length > 0 && selectedServices.length === 0) {
      const initial = serviceOptions.find(s => s.value === initialServiceId);
      if (initial) setSelectedServices([initial]);
    }
  }, [initialServiceId, serviceOptions, selectedServices.length]);

  const totalPrice = selectedServices.reduce((sum, service) => sum + service.price, 0);

  const timeOptions = [
    '09:00', '10:00', '11:00', '12:00',
    '13:00', '14:00', '15:00', '16:00', '17:00'
  ];

  // Disable time slots within 1h of "now" if booking for today
  const isTimeSlotDisabled = useCallback((timeSlot: string, checkDate?: Date) => {
    const targetDate = checkDate || date;
    if (!targetDate) return false;

    const today = new Date();
    const isToday = isSameDay(targetDate, today);
    if (!isToday) return false;

    const [hours, minutes] = timeSlot.split(':').map(Number);
    const slotTime = new Date();
    slotTime.setHours(hours, minutes, 0, 0);

    const currentTimeWithBuffer = new Date();
    currentTimeWithBuffer.setHours(currentTimeWithBuffer.getHours() + 1);

    return slotTime <= currentTimeWithBuffer;
  }, [date]);

  // Flow path based on entry point
  const getFlowPath = useCallback((): STEPS[] => {
    if (isEmployeeFirstFlow) {
      return [STEPS.EMPLOYEE, STEPS.SERVICES, STEPS.DATE, STEPS.TIME, STEPS.SUMMARY];
    }
    return [STEPS.SERVICES, STEPS.EMPLOYEE, STEPS.DATE, STEPS.TIME, STEPS.SUMMARY];
  }, [isEmployeeFirstFlow]);

  const canProceed = useCallback((): boolean => {
    switch (step) {
      case STEPS.SERVICES:
        return selectedServices.length > 0;
      case STEPS.EMPLOYEE:
        return selectedEmployee !== null;
      case STEPS.DATE:
        return date !== null;
      case STEPS.TIME:
        return time !== '';
      case STEPS.SUMMARY:
        return true;
      default:
        return true;
    }
  }, [step, selectedServices, selectedEmployee, date, time]);

  const getNextStep = useCallback((): STEPS | null => {
    const flowPath = getFlowPath();
    const currentIndex = flowPath.indexOf(step);
    if (currentIndex === -1 || currentIndex === flowPath.length - 1) return null;
    return flowPath[currentIndex + 1];
  }, [step, getFlowPath]);

  const getPreviousStep = useCallback((): STEPS | null => {
    const flowPath = getFlowPath();
    const currentIndex = flowPath.indexOf(step);
    if (currentIndex <= 0) return null;
    return flowPath[currentIndex - 1];
  }, [step, getFlowPath]);

  const handleNext = useCallback(() => {
    if (!canProceed()) {
      switch (step) {
        case STEPS.SERVICES:
          toast.error('Please select at least one service');
          break;
        case STEPS.EMPLOYEE:
          toast.error('Please select a professional');
          break;
        case STEPS.DATE:
          toast.error('Please select a date');
          break;
        case STEPS.TIME:
          toast.error('Please select a time');
          break;
      }
      return;
    }

    const next = getNextStep();
    if (next !== null) {
      setDirection(1);
      setStep(next);
    }
  }, [step, canProceed, getNextStep]);

  const handleBack = useCallback(() => {
    const prev = getPreviousStep();
    if (prev !== null) {
      setDirection(-1);
      setStep(prev);
    } else {
      // First step - go back to listing
      router.push(`/listings/${listing.id}`);
    }
  }, [getPreviousStep, router, listing.id]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      const isInput = target.tagName === 'INPUT' || target.tagName === 'TEXTAREA';

      if (e.key === 'Enter' && !e.shiftKey) {
        if (isInput && target.tagName === 'TEXTAREA') return;
        if (canProceed() && !isLoading) {
          e.preventDefault();
          if (step === STEPS.SUMMARY) {
            onSubmit();
          } else {
            handleNext();
          }
        }
      }

      if (e.key === 'Escape') {
        e.preventDefault();
        handleBack();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [canProceed, isLoading, step, handleNext, handleBack]);

  const onSubmit = useCallback(async () => {
    if (!date || !time || selectedServices.length === 0 || !selectedEmployee || !listing?.id) {
      toast.error('Please fill in all required fields');
      return;
    }

    setIsLoading(true);

    try {
      // 1) Create reservation in DB
      const reservationPayload = {
        listingId: listing.id,
        serviceId: selectedServices[0].value,
        serviceName: selectedServices[0].label.split(' - ')[0],
        employeeId: selectedEmployee.value,
        date: date.toISOString(),
        time,
        note,
        totalPrice,
      };

      const response = await axios.post('/api/reservations', reservationPayload);
      const createdReservation = response.data;

      toast.success('Reservation created! Proceeding to payment...');

      // 2) Prepare Stripe data
      const stripeData = {
        reservationId: createdReservation.id,
        totalPrice,
        date: date.toISOString(),
        time,
        listingId: listing.id,
        serviceId: selectedServices[0].value,
        serviceName: selectedServices[0].label.split(' - ')[0],
        employeeId: selectedEmployee.value,
        employeeName: selectedEmployee.label,
        note,
        businessName: listing.title || 'Business',
        services: selectedServices.map(service => ({
          serviceId: service.value,
          serviceName: service.label.split(' - ')[0],
          price: service.price,
        })),
        customerName: currentUser.name || '',
        customerEmail: currentUser.email || '',
      };

      // Navigate back and open Stripe modal
      router.push(`/listings/${listing.id}`);

      setTimeout(() => {
        stripeCheckoutModal.onOpen(stripeData);
      }, 200);
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message ||
        error.response?.data?.error ||
        'Failed to create reservation';
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [date, time, selectedServices, selectedEmployee, listing, note, totalPrice, currentUser, router, stripeCheckoutModal]);

  const flowPath = getFlowPath();
  const currentIndex = flowPath.indexOf(step);
  const totalSteps = flowPath.length;
  const showBack = true;
  const isLastStep = step === STEPS.SUMMARY;

  const renderStep = () => {
    switch (step) {
      case STEPS.SERVICES:
        return (
          <ServicesStep
            serviceOptions={serviceOptions}
            selectedServices={selectedServices}
            onToggleService={(service) => {
              setSelectedServices(prev => {
                const isSelected = prev.some(s => s.value === service.value);
                return isSelected ? prev.filter(s => s.value !== service.value) : [...prev, service];
              });
            }}
            totalPrice={totalPrice}
          />
        );
      case STEPS.EMPLOYEE:
        return (
          <EmployeeStep
            employeeOptions={employeeOptions}
            selectedEmployee={selectedEmployee}
            onSelectEmployee={setSelectedEmployee}
          />
        );
      case STEPS.DATE:
        return (
          <DateStep
            date={date}
            onDateChange={(newDate) => {
              setDate(newDate);
              // Clear time if it's now disabled
              if (time && isTimeSlotDisabled(time, newDate)) {
                setTime('');
              }
            }}
          />
        );
      case STEPS.TIME:
        return (
          <TimeStep
            timeOptions={timeOptions}
            selectedTime={time}
            onTimeChange={setTime}
            isTimeDisabled={isTimeSlotDisabled}
            isToday={date ? isSameDay(date, new Date()) : false}
          />
        );
      case STEPS.SUMMARY:
        return (
          <SummaryStep
            selectedServices={selectedServices}
            selectedEmployee={selectedEmployee}
            date={date}
            time={time}
            totalPrice={totalPrice}
            note={note}
            onNoteChange={setNote}
            businessName={listing.title || 'Business'}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* Progress bar */}
      <TypeformProgress
        currentStep={currentIndex + 1}
        totalSteps={totalSteps}
      />

      {/* Main content */}
      <div className="flex-1 flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-xl">
          {/* Business header */}
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
              <img
                src={listing.imageSrc || '/placeholder.jpg'}
                alt={listing.title}
                className="w-full h-full object-cover"
              />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-900">{listing.title}</p>
              <p className="text-xs text-gray-500">Booking appointment</p>
            </div>
          </div>

          <AnimatePresence mode="wait" custom={direction}>
            <TypeformStep key={step} direction={direction}>
              {renderStep()}
            </TypeformStep>
          </AnimatePresence>
        </div>
      </div>

      {/* Navigation */}
      <TypeformNavigation
        canProceed={canProceed()}
        showBack={showBack}
        isLastStep={isLastStep}
        isLoading={isLoading}
        onNext={isLastStep ? onSubmit : handleNext}
        onBack={handleBack}
        submitLabel="Reserve & Pay"
      />
    </div>
  );
}
