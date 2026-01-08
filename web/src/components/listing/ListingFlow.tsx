'use client';

import { useState, useCallback, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { FieldValues, FormProvider, SubmitHandler, useForm } from 'react-hook-form';
import { toast } from 'react-hot-toast';
import axios from 'axios';
import { AnimatePresence } from 'framer-motion';

import TypeformStep from '../registration/TypeformStep';
import TypeformProgress from '../registration/TypeformProgress';
import TypeformNavigation from '../registration/TypeformNavigation';

import CategoryStep from './steps/CategoryStep';
import LocationStep from './steps/LocationStep';
import ServicesListStep from './steps/ServicesListStep';
import ServiceFormStep from './steps/ServiceFormStep';
import DetailsStep from './steps/DetailsStep';
import GalleryStep from './steps/GalleryStep';
import HoursStep from './steps/HoursStep';
import EmployeesStep from './steps/EmployeesStep';

import { Service } from '../inputs/ServiceSelector';
import { StoreHourType } from '../inputs/StoreHours';
import { SafeListing } from '@/app/types';

interface EmployeeInput {
  userId: string;
  jobTitle?: string;
  serviceIds?: string[];
  user?: {
    id: string;
    name: string | null;
    email: string | null;
    image: string | null;
    imageSrc: string | null;
  };
}

function splitLocation(loc?: string | null): { city: string; state: string } {
  if (!loc) return { city: '', state: '' };
  const parts = loc.split(',').map(p => p.trim()).filter(Boolean);
  if (parts.length >= 2) return { city: parts[0] ?? '', state: parts[1] ?? '' };
  return { city: parts[0] ?? '', state: '' };
}

enum STEPS {
  CATEGORY = 0,
  LOCATION = 1,
  SERVICES_LIST = 2,
  SERVICES_FORM = 3,
  DETAILS = 4,
  GALLERY = 5,
  HOURS = 6,
  EMPLOYEE = 7,
}

const defaultStoreHours: StoreHourType[] = [
  { dayOfWeek: 'Monday', openTime: '8:00 AM', closeTime: '8:00 PM', isClosed: false },
  { dayOfWeek: 'Tuesday', openTime: '8:00 AM', closeTime: '8:00 PM', isClosed: false },
  { dayOfWeek: 'Wednesday', openTime: '8:00 AM', closeTime: '8:00 PM', isClosed: false },
  { dayOfWeek: 'Thursday', openTime: '8:00 AM', closeTime: '8:00 PM', isClosed: false },
  { dayOfWeek: 'Friday', openTime: '8:00 AM', closeTime: '8:00 PM', isClosed: false },
  { dayOfWeek: 'Saturday', openTime: '8:00 AM', closeTime: '8:00 PM', isClosed: false },
  { dayOfWeek: 'Sunday', openTime: '10:00 AM', closeTime: '6:00 PM', isClosed: false },
];

interface ListingFlowProps {
  mode?: 'create' | 'edit';
  listingId?: string;
  initialData?: SafeListing;
}

export default function ListingFlow({ mode = 'create', listingId, initialData }: ListingFlowProps) {
  const isEditMode = mode === 'edit' && !!initialData;
  const router = useRouter();

  const [step, setStep] = useState<STEPS>(STEPS.CATEGORY);
  const [direction, setDirection] = useState<1 | -1>(1);
  const [isLoading, setIsLoading] = useState(false);
  const [services, setServices] = useState<Service[]>(() => {
    if (isEditMode && initialData?.services) {
      return initialData.services.map(s => ({
        id: s.id,
        serviceName: s.serviceName,
        price: s.price,
        category: s.category,
        imageSrc: (s as any).imageSrc || '',
      }));
    }
    return [];
  });
  const [employees, setEmployees] = useState<EmployeeInput[]>(() => {
    if (isEditMode && initialData?.employees) {
      return initialData.employees.map(emp => ({
        userId: emp.userId,
        jobTitle: emp.jobTitle || '',
        serviceIds: emp.serviceIds || [],
        user: emp.user ? {
          id: emp.user.id,
          name: emp.user.name,
          email: null,
          image: emp.user.image,
          imageSrc: emp.user.imageSrc || null,
        } : undefined,
      }));
    }
    return [];
  });
  const [storeHours, setStoreHours] = useState<StoreHourType[]>(() => {
    if (isEditMode && initialData?.storeHours?.length) {
      return initialData.storeHours.map(h => ({
        dayOfWeek: h.dayOfWeek,
        openTime: h.openTime,
        closeTime: h.closeTime,
        isClosed: h.isClosed,
      }));
    }
    return defaultStoreHours;
  });
  const [editingServiceIndex, setEditingServiceIndex] = useState<number | null>(null);

  const methods = useForm<FieldValues>({
    defaultValues: {
      category: initialData?.category || '',
      location: initialData?.location || '',
      address: initialData?.address || '',
      zipCode: initialData?.zipCode || '',
      imageSrc: initialData?.imageSrc || '',
      title: initialData?.title || '',
      description: initialData?.description || '',
      phoneNumber: initialData?.phoneNumber || '',
      website: initialData?.website || '',
      galleryImages: initialData?.galleryImages || [],
    },
  });

  const { watch, setValue, handleSubmit, setError, clearErrors, formState: { errors } } = methods;

  const category = watch('category');
  const location = watch('location');
  const address = watch('address');
  const zipCode = watch('zipCode');
  const imageSrc = watch('imageSrc');
  const galleryImages = (watch('galleryImages') as string[]) || [];
  const title = watch('title');
  const description = watch('description');

  const setCustomValue = useCallback((id: string, value: any) => {
    setValue(id, value ?? '', {
      shouldDirty: true,
      shouldTouch: true,
      shouldValidate: true
    });
  }, [setValue]);

  // Location step handlers
  const handleLocationChange = useCallback((loc: string) => {
    setValue('location', loc);
    if (loc) clearErrors('location');
  }, [setValue, clearErrors]);

  const handleAddressSelect = useCallback((data: { address: string; zipCode: string; city: string; state: string }) => {
    setValue('address', data.address);
    setValue('zipCode', data.zipCode);
    if (data.city && data.state) {
      setValue('location', `${data.city}, ${data.state}`);
    }
    clearErrors(['address', 'zipCode', 'location']);
  }, [setValue, clearErrors]);

  const handleFieldChange = useCallback((fieldId: string) => {
    clearErrors(fieldId);
  }, [clearErrors]);

  // Calculate flow path (skip form steps in main flow)
  const getFlowPath = useCallback((): STEPS[] => {
    return [
      STEPS.CATEGORY,
      STEPS.LOCATION,
      STEPS.SERVICES_LIST,
      STEPS.DETAILS,
      STEPS.GALLERY,
      STEPS.HOURS,
      STEPS.EMPLOYEE,
    ];
  }, []);

  const getNextStep = useCallback((): STEPS | null => {
    // Handle special case for service form step
    if (step === STEPS.SERVICES_FORM) return STEPS.SERVICES_LIST;

    const flowPath = getFlowPath();
    const currentIndex = flowPath.indexOf(step);
    if (currentIndex === -1 || currentIndex === flowPath.length - 1) return null;
    return flowPath[currentIndex + 1];
  }, [step, getFlowPath]);

  const getPreviousStep = useCallback((): STEPS | null => {
    // Handle special case for service form step
    if (step === STEPS.SERVICES_FORM) return STEPS.SERVICES_LIST;

    const flowPath = getFlowPath();
    const currentIndex = flowPath.indexOf(step);
    if (currentIndex <= 0) return null;
    return flowPath[currentIndex - 1];
  }, [step, getFlowPath]);

  const canProceed = useCallback((): boolean => {
    switch (step) {
      case STEPS.CATEGORY:
        return Boolean(category);
      case STEPS.LOCATION:
        return Boolean(location && address && zipCode);
      case STEPS.SERVICES_LIST:
        return true; // Optional
      case STEPS.SERVICES_FORM:
        return true; // Can save anytime
      case STEPS.DETAILS:
        return Boolean(imageSrc && title?.trim() && description?.trim());
      case STEPS.GALLERY:
        return true; // Optional
      case STEPS.HOURS:
        return true; // Has defaults
      case STEPS.EMPLOYEE:
        return true; // Optional
      default:
        return true;
    }
  }, [step, category, location, address, zipCode, imageSrc, title, description]);

  const handleNext = useCallback(async () => {
    // Validation for location step
    if (step === STEPS.LOCATION) {
      let invalid = false;
      if (!location) { setError('location', { type: 'required', message: 'Location is required' }); invalid = true; }
      if (!address) { setError('address', { type: 'required', message: 'Address is required' }); invalid = true; }
      if (!zipCode) { setError('zipCode', { type: 'required', message: 'ZIP is required' }); invalid = true; }
      if (invalid) return;
    }

    const next = getNextStep();
    if (next !== null) {
      setDirection(1);
      setStep(next);
    }
  }, [step, location, address, zipCode, getNextStep, setError]);

  const handleBack = useCallback(() => {
    const prev = getPreviousStep();
    if (prev !== null) {
      setDirection(-1);
      setStep(prev);
    } else {
      // First step - go back to home
      router.push('/');
    }
  }, [getPreviousStep, router]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      const isInput = target.tagName === 'INPUT' || target.tagName === 'TEXTAREA';

      if (e.key === 'Enter' && !e.shiftKey) {
        if (isInput && target.tagName === 'TEXTAREA') return;
        if (canProceed() && !isLoading) {
          e.preventDefault();
          if (step === STEPS.EMPLOYEE) {
            handleSubmit(onSubmit)();
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
  }, [canProceed, isLoading, step, handleNext, handleBack, handleSubmit]);

  const onSubmit: SubmitHandler<FieldValues> = async (data) => {
    if (step !== STEPS.EMPLOYEE) {
      handleNext();
      return;
    }

    setIsLoading(true);

    const validServices = services.filter(s =>
      s.serviceName?.trim() &&
      s.category?.trim() &&
      Number(s.price) > 0
    );

    const { city, state } = splitLocation(String(data.location || ''));

    const payload = {
      ...data,
      city,
      state,
      services: validServices,
      employees,
      storeHours,
    };

    try {
      if (isEditMode && listingId) {
        await axios.put(`/api/listings/${listingId}`, payload);
        toast.success('Listing updated successfully!');
        router.push(`/listings/${listingId}`);
      } else {
        await axios.post('/api/listings', payload);
        toast.success('Listing created successfully!');
        router.push('/properties');
      }
      router.refresh();
    } catch (e: any) {
      console.error('[LISTING_SAVE]', e);
      toast.error(e?.response?.data?.message || `Failed to ${isEditMode ? 'update' : 'create'} listing`);
    } finally {
      setIsLoading(false);
    }
  };

  // Service management
  const openServiceEditor = (index: number) => {
    setEditingServiceIndex(index);
    setDirection(1);
    setStep(STEPS.SERVICES_FORM);
  };

  const addNewService = () => {
    const newService: Service = { serviceName: '', price: 0, category: '' };
    setServices((prev) => [...prev, newService]);
    setEditingServiceIndex(services.length);
    setDirection(1);
    setStep(STEPS.SERVICES_FORM);
  };

  const exitServiceForm = () => {
    setEditingServiceIndex(null);
    setDirection(-1);
    setStep(STEPS.SERVICES_LIST);
  };

  const flowPath = getFlowPath();
  const currentIndex = flowPath.indexOf(step);
  const totalSteps = flowPath.length;
  const isFormStep = step === STEPS.SERVICES_FORM;
  const showBack = step !== STEPS.CATEGORY; // Show back on all steps except first
  const isLastStep = step === STEPS.EMPLOYEE;

  const renderStep = () => {
    switch (step) {
      case STEPS.CATEGORY:
        return (
          <CategoryStep
            selectedCategory={category}
            onCategoryChange={(cat) => setCustomValue('category', cat)}
          />
        );
      case STEPS.LOCATION:
        // Parse initial location for edit mode
        const initialCity = initialData?.city || (initialData?.location?.split(',')[0]?.trim()) || '';
        const initialState = initialData?.state || (initialData?.location?.split(',')[1]?.trim()) || '';
        return (
          <LocationStep
            onLocationChange={handleLocationChange}
            onAddressSelect={handleAddressSelect}
            onFieldChange={handleFieldChange}
            errors={errors}
            initialState={initialState}
            initialCity={initialCity}
            initialAddress={initialData?.address || ''}
            initialZip={initialData?.zipCode || ''}
          />
        );
      case STEPS.SERVICES_LIST:
        return (
          <ServicesListStep
            services={services}
            onEditService={openServiceEditor}
            onAddService={addNewService}
          />
        );
      case STEPS.SERVICES_FORM:
        return (
          <ServiceFormStep
            services={services}
            setServices={setServices}
            editingIndex={editingServiceIndex}
            onBack={exitServiceForm}
          />
        );
      case STEPS.DETAILS:
        return (
          <DetailsStep
            imageSrc={imageSrc}
            title={title}
            location={location}
            onImageChange={(url) => setCustomValue('imageSrc', url)}
          />
        );
      case STEPS.GALLERY:
        return (
          <GalleryStep
            galleryImages={galleryImages}
            onGalleryChange={(images) => setCustomValue('galleryImages', images)}
          />
        );
      case STEPS.HOURS:
        return (
          <HoursStep
            storeHours={storeHours}
            onHoursChange={setStoreHours}
          />
        );
      case STEPS.EMPLOYEE:
        return (
          <EmployeesStep
            employees={employees}
            onEmployeesChange={setEmployees}
            services={services}
          />
        );
      default:
        return null;
    }
  };

  return (
    <FormProvider {...methods}>
      <div className="min-h-screen flex flex-col">
        {/* Progress bar */}
        {!isFormStep && (
          <TypeformProgress
            currentStep={currentIndex + 1}
            totalSteps={totalSteps}
          />
        )}

        {/* Main content */}
        <div className="flex-1 flex items-center justify-center px-6 py-12">
          <div className="w-full max-w-xl">
            <AnimatePresence mode="wait" custom={direction}>
              <TypeformStep key={step} direction={direction}>
                {renderStep()}
              </TypeformStep>
            </AnimatePresence>
          </div>
        </div>

        {/* Navigation */}
        {!isFormStep && (
          <TypeformNavigation
            canProceed={canProceed()}
            showBack={showBack}
            isLastStep={isLastStep}
            isLoading={isLoading}
            onNext={isLastStep ? handleSubmit(onSubmit) : handleNext}
            onBack={handleBack}
            submitLabel={isEditMode ? "Save changes" : "Create listing"}
          />
        )}
      </div>
    </FormProvider>
  );
}
