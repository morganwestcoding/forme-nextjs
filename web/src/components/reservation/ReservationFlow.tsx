'use client';

import { useState, useCallback, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';
import { AnimatePresence, motion } from 'framer-motion';
import { format, isSameDay } from 'date-fns';

import TypeformProgress from '../registration/TypeformProgress';
import TypeformNavigation from '../registration/TypeformNavigation';

import ServicesStep from './steps/ServicesStep';
import EmployeeStep from './steps/EmployeeStep';
import DateStep from './steps/DateStep';
import TimeStep from './steps/TimeStep';
import SummaryStep from './steps/SummaryStep';
import GuestInfoStep from './steps/GuestInfoStep';

import { SafeListing, SafeUser } from '@/app/types';
import useStripeCheckoutModal from '@/app/hooks/useStripeCheckoutModal';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

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
  // currentUser is null for guest checkout — flow then mounts GUEST_INFO
  // before SUMMARY so we have a name + email to bill and confirm to.
  currentUser: SafeUser | null;
  initialServiceId?: string;
  initialEmployeeId?: string;
}

enum STEPS {
  SERVICES = 0,
  EMPLOYEE = 1,
  DATE = 2,
  TIME = 3,
  GUEST_INFO = 4,
  SUMMARY = 5,
}

export default function ReservationFlow({
  listing,
  currentUser,
  initialServiceId,
  initialEmployeeId,
}: ReservationFlowProps) {
  const router = useRouter();
  const stripeCheckoutModal = useStripeCheckoutModal();

  // When the professional is pre-assigned (e.g. clicking a service from their profile),
  // skip the EMPLOYEE step entirely.
  const skipEmployeeStep = !!initialEmployeeId;

  const [step, setStep] = useState<STEPS>(STEPS.SERVICES);
  const [direction, setDirection] = useState<1 | -1>(1);
  const [isLoading, setIsLoading] = useState(false);

  const [selectedServices, setSelectedServices] = useState<SelectedService[]>([]);
  const [selectedEmployee, setSelectedEmployee] = useState<SelectedEmployee | null>(null);
  const [date, setDate] = useState<Date | null>(null);
  const [time, setTime] = useState('');
  // Per-service notes — keyed by serviceId. Serialized into the single
  // Reservation.note string at submit time so the worker-side render stays
  // a simple string ("Massage: please be gentle\nHaircut: short on sides").
  const [serviceNotes, setServiceNotes] = useState<Record<string, string>>({});
  // Tip is in dollars (matches Service.price's unit).
  const [tipAmount, setTipAmount] = useState(0);
  // Guest checkout fields — only used when currentUser is null.
  const [guestInfo, setGuestInfo] = useState({ name: '', email: '', phone: '' });

  const isGuest = !currentUser;

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

  // Flow path — omit EMPLOYEE when the professional is pre-assigned, and
  // insert GUEST_INFO right before SUMMARY for guest checkouts so we have
  // a name/email to bill and confirm to.
  const getFlowPath = useCallback((): STEPS[] => {
    const path: STEPS[] = skipEmployeeStep
      ? [STEPS.SERVICES, STEPS.DATE, STEPS.TIME]
      : [STEPS.SERVICES, STEPS.EMPLOYEE, STEPS.DATE, STEPS.TIME];
    if (isGuest) path.push(STEPS.GUEST_INFO);
    path.push(STEPS.SUMMARY);
    return path;
  }, [skipEmployeeStep, isGuest]);

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
      case STEPS.GUEST_INFO:
        return Boolean(
          guestInfo.name.trim() &&
            guestInfo.email.trim() &&
            EMAIL_REGEX.test(guestInfo.email.trim())
        );
      case STEPS.SUMMARY:
        return true;
      default:
        return true;
    }
  }, [step, selectedServices, selectedEmployee, date, time, guestInfo]);

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
        case STEPS.GUEST_INFO:
          toast.error('Please enter your name and a valid email');
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
      // First step — replace so the listing's back button doesn't return to /reserve.
      router.replace(`/listings/${listing.id}`);
    }
  }, [getPreviousStep, router, listing.id]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      const isInput = target.tagName === 'INPUT' || target.tagName === 'TEXTAREA';

      if (e.key === 'Enter' && !e.shiftKey) {
        if (isInput && target.tagName === 'TEXTAREA') return;
        if (isInput && step === STEPS.GUEST_INFO) return;
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
    if (isGuest) {
      const trimmedName = guestInfo.name.trim();
      const trimmedEmail = guestInfo.email.trim();
      if (!trimmedName || !trimmedEmail || !EMAIL_REGEX.test(trimmedEmail)) {
        toast.error('Please enter your name and a valid email');
        return;
      }
    }

    setIsLoading(true);

    try {
      const subtotal = totalPrice; // totalPrice is the services subtotal here
      const total = subtotal + tipAmount;
      const leadServiceLabel =
        selectedServices.length > 1
          ? `${selectedServices.length} services`
          : selectedServices[0].label.split(' - ')[0];

      // Flatten per-service notes into a single readable string for the
      // worker. Skipped services with empty notes drop out.
      const note = selectedServices
        .map((s) => {
          const trimmed = (serviceNotes[s.value] || '').trim();
          if (!trimmed) return null;
          const name = s.label.split(' - ')[0];
          return `${name}: ${trimmed}`;
        })
        .filter(Boolean)
        .join('\n');

      // Prepare Stripe data — reservation is created by the webhook after payment
      const stripeData = {
        totalPrice: total,
        subtotal,
        tipAmount,
        date: date.toISOString(),
        time,
        listingId: listing.id,
        serviceId: selectedServices[0].value,
        serviceIds: selectedServices.map((s) => s.value),
        serviceName: leadServiceLabel,
        serviceCount: selectedServices.length,
        employeeId: selectedEmployee.value,
        employeeName: selectedEmployee.label,
        note,
        businessName: listing.title || 'Business',
        // Customer identity — currentUser when signed-in, guest fields otherwise.
        ...(isGuest
          ? {
              guestName: guestInfo.name.trim(),
              guestEmail: guestInfo.email.trim(),
              guestPhone: guestInfo.phone.trim(),
            }
          : {
              userId: currentUser?.id,
            }),
      };

      // Guests have no /bookings page to return to; signed-in users get
      // pre-routed there so the post-payment back-arrow lands in the right place.
      if (!isGuest) {
        router.replace(`/bookings/reservations`);
      }

      setTimeout(() => {
        stripeCheckoutModal.onOpen(stripeData);
      }, 800);
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message ||
        error.response?.data?.error ||
        'Failed to create reservation';
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [
    date,
    time,
    selectedServices,
    selectedEmployee,
    listing,
    serviceNotes,
    totalPrice,
    tipAmount,
    currentUser,
    isGuest,
    guestInfo,
    router,
    stripeCheckoutModal,
  ]);

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
      case STEPS.GUEST_INFO:
        return (
          <GuestInfoStep
            guestInfo={guestInfo}
            onChange={setGuestInfo}
          />
        );
      case STEPS.SUMMARY:
        return (
          <SummaryStep
            selectedServices={selectedServices}
            selectedEmployee={selectedEmployee}
            date={date}
            time={time}
            subtotal={totalPrice}
            tipAmount={tipAmount}
            onTipChange={setTipAmount}
            serviceNotes={serviceNotes}
            onServiceNotesChange={setServiceNotes}
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

      {/* Main content — extra bottom padding so the last element on tall
          steps (e.g. Summary's note textarea) clears the fixed bottom nav. */}
      <div className="flex-1 flex items-center justify-center px-6 pt-12 pb-32">
        <div className="w-full max-w-xl">
          <AnimatePresence initial={false} mode="wait" custom={direction}>
            <motion.div
              key={step}
              custom={direction}
              initial={((d: number) => ({ opacity: 0, y: d > 0 ? 30 : -30 })) as any}
              animate={{ opacity: 1, y: 0, transition: { duration: 0.35, ease: [0.22, 1, 0.36, 1] } }}
              exit={((d: number) => ({ opacity: 0, y: d > 0 ? -15 : 15, transition: { duration: 0.25, ease: [0.22, 1, 0.36, 1] } })) as any}
            >
              {renderStep()}
            </motion.div>
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
        termsNotice
      />
    </div>
  );
}
