'use client';

import { useState, useCallback, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { FieldValues, FormProvider, SubmitHandler, useForm } from 'react-hook-form';
import { signIn, useSession } from 'next-auth/react';
import { toast } from 'react-hot-toast';
import axios from 'axios';
import { AnimatePresence } from 'framer-motion';

import TypeformStep from './TypeformStep';
import TypeformProgress from './TypeformProgress';
import TypeformNavigation from './TypeformNavigation';

import AccountStep from './steps/AccountStep';
import InterestsStep from './steps/InterestsStep';
import UserTypeStep from './steps/UserTypeStep';
import JobTitleStep from './steps/JobTitleStep';
import BusinessSelectStep from './steps/BusinessSelectStep';
import ServiceSelectStep from './steps/ServiceSelectStep';
import ServicesListStep from './steps/ServicesListStep';
import ServiceFormStep from './steps/ServiceFormStep';
import ListingCategoryStep from './steps/ListingCategoryStep';
import ListingInfoStep from './steps/ListingInfoStep';
import LocationStep from './steps/LocationStep';
import ImagesStep from './steps/ImagesStep';

import { Service } from '@/components/inputs/ServiceSelector';

type UserType = 'customer' | 'individual' | 'team';

interface ProfileData {
  id: string;
  name: string;
  email: string;
  location: string;
  bio: string;
  image: string;
  backgroundImage: string;
  interests?: string[];
}

interface TypeformFlowProps {
  mode?: 'create' | 'edit';
  userId?: string;
  initialData?: ProfileData;
}

enum STEPS {
  ACCOUNT = 0,
  INTERESTS = 1,
  USER_TYPE = 2,
  JOB_TITLE = 3,
  BUSINESS_SELECT = 4,
  SERVICE_SELECT = 5,
  SERVICES_FORM = 6,
  SERVICES_LIST = 7,
  LISTING_CATEGORY = 8,
  LISTING_INFO = 9,
  LOCATION = 10,
  IMAGES = 11,
}

function safeToastError(err: any, fallback = "Something went wrong!") {
  const data = err?.response?.data;
  const msg =
    (typeof data === "object" && (data?.error || data?.message)) ||
    (typeof err?.message === "string" && err.message) ||
    (typeof data === "string" && !/<[a-z][\s\S]*>/i.test(data) && data) ||
    null;
  const finalMsg = typeof msg === "string" && msg.length < 240 ? msg : fallback;
  toast.error(finalMsg);
}

const validatePassword = (password: string) => ({
  hasMinLength: password.length >= 6,
  hasMaxLength: password.length <= 18,
  hasUpperCase: /[A-Z]/.test(password),
  hasLowerCase: /[a-z]/.test(password),
  hasNumber: /[0-9]/.test(password),
  hasSpecialChar: /[!@#$%^&*(),]/.test(password)
});

export default function TypeformFlow({ mode = 'create', userId, initialData }: TypeformFlowProps) {
  const router = useRouter();
  const { update } = useSession();
  const isEditMode = mode === 'edit' && !!initialData;

  // Edit mode uses a simplified flow starting from INTERESTS
  const [step, setStep] = useState<STEPS>(isEditMode ? STEPS.INTERESTS : STEPS.ACCOUNT);
  const [direction, setDirection] = useState<1 | -1>(1);
  const [isLoading, setIsLoading] = useState(false);
  const [services, setServices] = useState<Service[]>([]);
  const [editingServiceIndex, setEditingServiceIndex] = useState<number | null>(null);

  const methods = useForm<FieldValues>({
    defaultValues: {
      name: initialData?.name || '',
      email: initialData?.email || '',
      password: '',
      interests: initialData?.interests || [],
      location: initialData?.location || '',
      bio: initialData?.bio || '',
      image: initialData?.image || '',
      backgroundImage: initialData?.backgroundImage || '',
      userType: '',
      selectedListing: '',
      jobTitle: '',
      isOwnerManager: false,
      selectedServices: [],
      listingCategory: '',
      listingTitle: '',
      listingDescription: '',
      listingImage: '',
    },
  });

  const { watch, setValue, handleSubmit } = methods;

  const userType = watch('userType') as UserType;
  const selectedListing = watch('selectedListing');
  const password = watch('password');
  const interests = watch('interests') || [];
  const jobTitle = watch('jobTitle');
  const isOwnerManager = watch('isOwnerManager');
  const selectedServices = watch('selectedServices') || [];
  const listingCategory = watch('listingCategory');
  const listingTitle = watch('listingTitle');
  const listingDescription = watch('listingDescription');
  const locationVal = watch('location');

  const setCustomValue = useCallback((id: string, value: any) => {
    setValue(id, value ?? '', {
      shouldDirty: true,
      shouldTouch: true,
      shouldValidate: true
    });
  }, [setValue]);

  // Calculate flow path based on user type and mode
  const getFlowPath = useCallback((): STEPS[] => {
    // Edit mode has a simplified flow: just update profile info
    if (isEditMode) {
      return [STEPS.INTERESTS, STEPS.LOCATION, STEPS.IMAGES];
    }

    const basePath = [STEPS.ACCOUNT, STEPS.INTERESTS, STEPS.USER_TYPE];

    if (userType === 'customer') {
      return [...basePath, STEPS.LOCATION, STEPS.IMAGES];
    }

    if (userType === 'individual') {
      return [
        ...basePath,
        STEPS.JOB_TITLE,
        STEPS.SERVICES_LIST,
        STEPS.LISTING_CATEGORY,
        STEPS.LISTING_INFO,
        STEPS.LOCATION,
        STEPS.IMAGES,
      ];
    }

    if (userType === 'team') {
      const teamPath = [...basePath, STEPS.BUSINESS_SELECT, STEPS.JOB_TITLE];
      if (selectedListing && selectedListing !== 'SKIP' && selectedListing.trim() !== '') {
        teamPath.push(STEPS.SERVICE_SELECT);
      }
      teamPath.push(STEPS.LOCATION, STEPS.IMAGES);
      return teamPath;
    }

    return basePath;
  }, [userType, selectedListing, isEditMode]);

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

  const canProceed = useCallback((): boolean => {
    const data = methods.getValues();

    switch (step) {
      case STEPS.ACCOUNT:
        const p = validatePassword(data.password || '');
        return Boolean(data.email?.trim() && data.name?.trim() && Object.values(p).every(Boolean));
      case STEPS.INTERESTS:
        return true; // Optional
      case STEPS.USER_TYPE:
        return Boolean(data.userType);
      case STEPS.JOB_TITLE:
        if (userType === 'team') {
          return Boolean(data.isOwnerManager || data.jobTitle?.trim());
        }
        return Boolean(data.jobTitle?.trim());
      case STEPS.BUSINESS_SELECT:
        return true; // Can skip
      case STEPS.SERVICE_SELECT:
        return (data.selectedServices?.length || 0) > 0;
      case STEPS.SERVICES_LIST:
        return true; // Optional
      case STEPS.LISTING_CATEGORY:
        return Boolean(data.listingCategory?.trim());
      case STEPS.LISTING_INFO:
        return Boolean(data.listingTitle?.trim() && data.listingDescription?.trim());
      case STEPS.LOCATION:
        return Boolean(data.location?.trim());
      case STEPS.IMAGES:
        return true; // Optional
      default:
        return true;
    }
  }, [step, methods, userType]);

  const handleNext = useCallback(async () => {
    const data = methods.getValues();

    // Validation for ACCOUNT step
    if (step === STEPS.ACCOUNT) {
      const p = validatePassword(data.password || '');
      if (!Object.values(p).every(Boolean)) {
        toast.error('Password must be 6-18 chars, include upper/lowercase, number & special char.');
        return;
      }
      try {
        setIsLoading(true);
        const response = await axios.get(`/api/check-email?email=${encodeURIComponent(data.email)}`);
        if (response.data?.exists) {
          toast.error('Email already exists');
          setIsLoading(false);
          return;
        }
      } catch (e) {
        safeToastError(e, "Could not validate email uniqueness.");
        setIsLoading(false);
        return;
      }
      setIsLoading(false);
    }

    const next = getNextStep();
    if (next !== null) {
      setDirection(1);
      setStep(next);
    }
  }, [step, methods, getNextStep]);

  const handleBack = useCallback(() => {
    const prev = getPreviousStep();
    if (prev !== null) {
      setDirection(-1);
      setStep(prev);
    }
  }, [getPreviousStep]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      const isInput = target.tagName === 'INPUT' || target.tagName === 'TEXTAREA';

      if (e.key === 'Enter' && !e.shiftKey) {
        if (isInput && target.tagName === 'TEXTAREA') return;
        if (canProceed() && !isLoading) {
          e.preventDefault();
          if (step === STEPS.IMAGES) {
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
    setIsLoading(true);

    try {
      // Edit mode - update existing profile
      if (isEditMode && userId) {
        await axios.put(`/api/users/${userId}`, {
          name: data.name,
          location: data.location,
          bio: data.bio,
          image: data.image,
          backgroundImage: data.backgroundImage,
        });

        toast.success('Profile updated!');
        router.push(`/profile/${userId}`);
        router.refresh();
        return;
      }

      // Create mode - register new user
      const validServices = services.filter(s =>
        s.serviceName?.trim() &&
        s.category?.trim() &&
        Number(s.price) > 0
      );

      await axios.post('/api/register', {
        name: data.name,
        email: data.email,
        password: data.password,
        interests: data.interests,
        location: data.location,
        bio: data.bio,
        image: data.image,
        backgroundImage: data.backgroundImage,
        userType: data.userType,
        selectedListing: data.selectedListing === 'SKIP' ? null : data.selectedListing,
        jobTitle: data.jobTitle,
        isOwnerManager: data.isOwnerManager,
        selectedServices: data.selectedListing === 'SKIP' ? [] : data.selectedServices,
        individualServices: data.userType === 'individual' ? validServices : undefined,
        listingCategory: data.userType === 'individual' ? data.listingCategory : undefined,
        listingTitle: data.userType === 'individual' ? data.listingTitle : undefined,
        listingDescription: data.userType === 'individual' ? data.listingDescription : undefined,
        listingImage: data.userType === 'individual' ? data.listingImage : undefined,
      });

      toast.success('Registered! Logging you in...');

      const signInRes = await signIn('credentials', {
        email: data.email,
        password: data.password,
        redirect: false
      });

      if (signInRes?.ok || signInRes?.status === 200) {
        await update();
        router.refresh();

        setTimeout(() => {
          if (data.userType === 'individual' || data.userType === 'team') {
            router.push('/licensing?onboarding=true');
          } else {
            router.push('/subscription');
          }
        }, 250);
        return;
      }

      toast.error(signInRes?.error || 'Login after registration failed.');
      router.push('/');
    } catch (error: any) {
      safeToastError(error);
    } finally {
      setIsLoading(false);
    }
  };

  // Service management for individual providers
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
  const showBack = currentIndex > 0 && step !== STEPS.SERVICES_FORM;
  const isLastStep = step === STEPS.IMAGES;

  const renderStep = () => {
    switch (step) {
      case STEPS.ACCOUNT:
        return <AccountStep />;
      case STEPS.INTERESTS:
        return (
          <InterestsStep
            selectedInterests={interests}
            onInterestsChange={(selected) => setCustomValue('interests', selected)}
          />
        );
      case STEPS.USER_TYPE:
        return (
          <UserTypeStep
            userType={userType}
            onUserTypeChange={(type) => setCustomValue('userType', type)}
          />
        );
      case STEPS.JOB_TITLE:
        return (
          <JobTitleStep
            userType={userType}
            isOwnerManager={isOwnerManager}
            onOwnerManagerChange={(value) => {
              setCustomValue('isOwnerManager', value);
              if (value) setCustomValue('jobTitle', '');
            }}
          />
        );
      case STEPS.BUSINESS_SELECT:
        return (
          <BusinessSelectStep
            selectedListing={selectedListing}
            onListingChange={(listingId) => setCustomValue('selectedListing', listingId)}
            onSkip={() => {
              setCustomValue('selectedListing', 'SKIP');
              setDirection(1);
              setStep(STEPS.JOB_TITLE);
            }}
          />
        );
      case STEPS.SERVICE_SELECT:
        return (
          <ServiceSelectStep
            selectedListingId={selectedListing}
            selectedServices={selectedServices}
            onServicesChange={(serviceIds) => setCustomValue('selectedServices', serviceIds)}
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
      case STEPS.LISTING_CATEGORY:
        return (
          <ListingCategoryStep
            selectedCategory={listingCategory}
            onCategoryChange={(category) => setCustomValue('listingCategory', category)}
          />
        );
      case STEPS.LISTING_INFO:
        return <ListingInfoStep />;
      case STEPS.LOCATION:
        return (
          <LocationStep
            location={locationVal}
            onLocationChange={(value) => setCustomValue('location', value)}
          />
        );
      case STEPS.IMAGES:
        return <ImagesStep />;
      default:
        return null;
    }
  };

  return (
    <FormProvider {...methods}>
      <div className="min-h-screen flex flex-col">
        {/* Progress bar */}
        <TypeformProgress
          currentStep={currentIndex + 1}
          totalSteps={totalSteps}
        />

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
        {step !== STEPS.SERVICES_FORM && (
          <TypeformNavigation
            canProceed={canProceed()}
            showBack={showBack}
            isLastStep={isLastStep}
            isLoading={isLoading}
            onNext={isLastStep ? handleSubmit(onSubmit) : handleNext}
            onBack={handleBack}
            submitLabel={isEditMode ? 'Save changes' : 'Create account'}
          />
        )}
      </div>
    </FormProvider>
  );
}
