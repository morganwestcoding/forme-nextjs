'use client';

import { useState, useCallback, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { FieldValues, FormProvider, SubmitHandler, useForm } from 'react-hook-form';
import { signIn, useSession } from 'next-auth/react';
import { toast } from 'react-hot-toast';
import axios from 'axios';
import { AnimatePresence, motion } from 'framer-motion';

import TypeformStep from './TypeformStep';
import TypeformProgress from './TypeformProgress';
import EditStepJumper from './EditStepJumper';
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
import StudentAcademyStep from './steps/StudentAcademyStep';

import { Service } from '@/components/inputs/ServiceSelector';

type UserType = 'customer' | 'individual' | 'team' | 'student';

interface ProfileData {
  id: string;
  name: string;
  email: string;
  location: string;
  bio: string;
  image: string;
  backgroundImage: string;
  interests?: string[];
  jobTitle?: string;
  userType?: string | null;
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
  STUDENT_ACADEMY = 12,
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
  const [isExiting, setIsExiting] = useState(false);

  const methods = useForm<FieldValues>({
    defaultValues: {
      firstName: initialData?.name?.split(' ')[0] || '',
      lastName: initialData?.name?.split(' ').slice(1).join(' ') || '',
      email: initialData?.email || '',
      password: '',
      confirmPassword: '',
      interests: initialData?.interests || [],
      location: initialData?.location || '',
      bio: initialData?.bio || '',
      image: initialData?.image || '',
      backgroundImage: initialData?.backgroundImage || '',
      userType: '',
      selectedListing: '',
      jobTitle: initialData?.jobTitle || '',
      isOwnerManager: false,
      ownerPerformsServices: null,
      selectedServices: [],
      listingCategory: '',
      listingTitle: '',
      listingDescription: '',
      listingImage: '',
      academyId: '',
    },
  });

  const { watch, setValue, handleSubmit } = methods;

  const userType = watch('userType') as UserType;
  const selectedListing = watch('selectedListing');
  const password = watch('password');
  const interests = watch('interests') || [];
  const jobTitle = watch('jobTitle');
  const isOwnerManager = watch('isOwnerManager');
  const ownerPerformsServices = watch('ownerPerformsServices');
  const selectedServices = watch('selectedServices') || [];
  const listingCategory = watch('listingCategory');
  const listingTitle = watch('listingTitle');
  const listingDescription = watch('listingDescription');
  const locationVal = watch('location');
  const academyId = watch('academyId');

  const setCustomValue = useCallback((id: string, value: any) => {
    setValue(id, value ?? '', {
      shouldDirty: true,
      shouldTouch: true,
      shouldValidate: true
    });
  }, [setValue]);

  // Calculate flow path based on user type and mode
  const getFlowPath = useCallback((): STEPS[] => {
    // Edit mode has a simplified flow: just update profile info. Customers
    // don't have a job title (they're booking, not providing), so skip
    // that step for them.
    if (isEditMode) {
      const isCustomerProfile = initialData?.userType === 'customer';
      return isCustomerProfile
        ? [STEPS.INTERESTS, STEPS.LOCATION, STEPS.IMAGES]
        : [STEPS.INTERESTS, STEPS.JOB_TITLE, STEPS.LOCATION, STEPS.IMAGES];
    }

    // INTERESTS is collected post-signup via the WelcomeModal, not as a step here.
    const basePath = [STEPS.ACCOUNT, STEPS.USER_TYPE];

    if (userType === 'customer') {
      return [...basePath, STEPS.LOCATION, STEPS.IMAGES];
    }

    if (userType === 'individual') {
      // Independents don't get a storefront listing — no LISTING_CATEGORY /
      // LISTING_INFO step. Services entered in SERVICES_LIST are submitted
      // post-registration via /api/employees/services, which lazy-creates the
      // hidden listing + employee record on first call.
      return [
        ...basePath,
        STEPS.JOB_TITLE,
        STEPS.SERVICES_LIST,
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

    if (userType === 'student') {
      // Students pick their academy + their role/title, then location + photo/bio.
      // Licensing + subscription steps are skipped entirely (handled in onSubmit).
      return [
        ...basePath,
        STEPS.STUDENT_ACADEMY,
        STEPS.JOB_TITLE,
        STEPS.LOCATION,
        STEPS.IMAGES,
      ];
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
        return Boolean(
          data.email?.trim() &&
          data.firstName?.trim() &&
          data.lastName?.trim() &&
          Object.values(p).every(Boolean) &&
          data.confirmPassword === data.password
        );
      case STEPS.INTERESTS:
        return true; // Optional
      case STEPS.USER_TYPE:
        return Boolean(data.userType);
      case STEPS.JOB_TITLE:
        // In edit mode the job title is optional — users may just be updating
        // other sections and don't need to fill this in again.
        if (isEditMode) return true;
        if (userType === 'team') {
          if (data.isOwnerManager) {
            if (data.ownerPerformsServices === false) return true;
            if (data.ownerPerformsServices === true) return Boolean(data.jobTitle?.trim());
            return false;
          }
          return Boolean(data.jobTitle?.trim());
        }
        return Boolean(data.jobTitle?.trim());
      case STEPS.STUDENT_ACADEMY:
        return Boolean(data.academyId?.trim());
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
      // Trigger react-hook-form validation to show inline errors
      const valid = await methods.trigger(['firstName', 'lastName', 'email', 'password', 'confirmPassword']);
      if (!valid) return;

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
      const fullName = `${data.firstName?.trim() || ''} ${data.lastName?.trim() || ''}`.trim();

      // Edit mode - update existing profile
      if (isEditMode && userId) {
        await axios.put(`/api/users/${userId}`, {
          name: fullName,
          location: data.location,
          bio: data.bio,
          image: data.image,
          backgroundImage: data.backgroundImage,
          interests: data.interests,
          jobTitle: data.jobTitle,
        });

        toast.success('Profile updated!');
        // Root-layout RefreshOnEditSave watches this flag and triggers a
        // route-scoped router.refresh() on the target page after back() —
        // that's what actually invalidates the popped-to page's Router Cache.
        if (typeof window !== 'undefined') {
          sessionStorage.setItem('editFlowJustSaved', '1');
        }
        router.back();
        return;
      }

      // Create mode - register new user
      const validServices = services.filter(s =>
        s.serviceName?.trim() &&
        s.category?.trim() &&
        Number(s.price) > 0
      );

      await axios.post('/api/register', {
        name: fullName,
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
        academyId: data.userType === 'student' ? data.academyId : undefined,
      });

      const signInRes = await signIn('credentials', {
        email: data.email,
        password: data.password,
        redirect: false
      });

      if (signInRes?.ok || signInRes?.status === 200) {
        await update();

        // Independents who entered services in SERVICES_LIST get their hidden
        // listing + employee + services lazy-created here. Failure is non-fatal
        // — they can re-add via the services management UI.
        if (data.userType === 'individual' && validServices.length > 0) {
          try {
            await axios.post('/api/employees/services', { services: validServices });
          } catch {
            // ignore — registration already succeeded
          }
        }

        router.refresh();

        // Smooth fade-out before navigating.
        // Students skip licensing AND subscription — they go straight to their profile.
        // Individual/team go through licensing → subscription.
        // Customers go straight to subscription.
        setIsExiting(true);
        let destination: string;
        if (data.userType === 'student') {
          destination = '/';
        } else if (data.userType === 'individual' || data.userType === 'team') {
          destination = '/licensing?onboarding=true';
        } else {
          destination = '/subscription?onboarding=true';
        }
        setTimeout(() => router.push(destination), 600);
        return;
      }

      toast.error(signInRes?.error || 'Login after registration failed.');
      setIsLoading(false);
      router.push('/');
    } catch (error: any) {
      safeToastError(error);
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
            ownerPerformsServices={ownerPerformsServices}
            onOwnerManagerChange={(value) => {
              setCustomValue('isOwnerManager', value);
              if (!value) {
                setValue('ownerPerformsServices', null, { shouldDirty: true, shouldTouch: true, shouldValidate: true });
              }
            }}
            onOwnerPerformsServicesChange={(value) => {
              setValue('ownerPerformsServices', value, { shouldDirty: true, shouldTouch: true, shouldValidate: true });
              if (value === false) setCustomValue('jobTitle', '');
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
        return <ImagesStep userType={userType} />;
      case STEPS.STUDENT_ACADEMY:
        return (
          <StudentAcademyStep
            academyId={academyId}
            onAcademyChange={(id) => setCustomValue('academyId', id)}
          />
        );
      default:
        return null;
    }
  };

  return (
    <FormProvider {...methods}>
      <motion.div
        className="min-h-screen flex flex-col"
        animate={{
          opacity: isExiting ? 0 : 1,
          scale: isExiting ? 0.98 : 1,
          y: isExiting ? -10 : 0,
        }}
        transition={{ duration: 0.5, ease: [0.25, 0.1, 0.25, 1] }}
      >
        {/* Progress bar */}
        <TypeformProgress
          currentStep={currentIndex + 1}
          totalSteps={totalSteps}
        />

        {/* Edit-mode step jumper — jump directly to any editable section. */}
        {isEditMode && (
          <EditStepJumper
            steps={(initialData?.userType === 'customer'
              ? [
                  { label: 'Interests', value: STEPS.INTERESTS },
                  { label: 'Location', value: STEPS.LOCATION },
                  { label: 'Images', value: STEPS.IMAGES },
                ]
              : [
                  { label: 'Interests', value: STEPS.INTERESTS },
                  { label: 'Job Title', value: STEPS.JOB_TITLE },
                  { label: 'Location', value: STEPS.LOCATION },
                  { label: 'Images', value: STEPS.IMAGES },
                ])}
            currentValue={step}
            onJump={(target) => {
              setDirection(target > step ? 1 : -1);
              setStep(target as STEPS);
            }}
          />
        )}

        {/* Main content */}
        <div className={`flex-1 flex justify-center px-6 ${step === STEPS.ACCOUNT ? 'items-start pt-16 pb-12' : 'items-center py-12'}`}>
          <div className="w-full max-w-xl">
            <AnimatePresence mode="wait" custom={direction}>
              <TypeformStep key={step} direction={direction}>
                {renderStep()}
              </TypeformStep>
            </AnimatePresence>
          </div>
        </div>

        {/* Navigation — X stays visible on every step; bottom bar hides on form sub-steps */}
        <TypeformNavigation
          canProceed={canProceed()}
          showBack={showBack}
          isLastStep={isLastStep}
          isLoading={isLoading}
          onNext={isLastStep ? handleSubmit(onSubmit) : handleNext}
          onBack={handleBack}
          submitLabel={isEditMode ? 'Save changes' : 'Create account'}
          termsNotice={!isEditMode}
          isEditMode={isEditMode}
          onSave={handleSubmit(onSubmit)}
          hideBottomBar={step === STEPS.SERVICES_FORM}
        />
      </motion.div>
    </FormProvider>
  );
}
