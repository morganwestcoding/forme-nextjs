'use client';

import axios from "axios";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { toast } from "react-hot-toast";
import { FieldValues, SubmitHandler, useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import { signIn, useSession } from "next-auth/react";

import useLoginModal from "@/app/hooks/useLoginModal";
import useRegisterModal from "@/app/hooks/useRegisterModal";
import Modal, { ModalHandle } from "./Modal";
import Input from "../inputs/Input";
import Heading from "../Heading";
import ProfileLocationInput from "../inputs/ProfileLocationInput";
import ImageUpload from "../inputs/ImageUpload";
import Image from "next/image";
import EditOverview from "./EditOverview";
import UserTypeStep from "../inputs/UserTypeStep";
import JobTitleStep from "../inputs/JobTitleStep";
import BusinessSelectStep from "../inputs/BusinessSelectStep";
import ServiceSelectStep from "../inputs/ServiceSelectStep";
import InterestsStep from "../inputs/InterestStep";
import ServiceSelector, { Service } from "../inputs/ServiceSelector";

type UserType = 'customer' | 'individual' | 'team';

function safeToastError(err: any, fallback = "Something went wrong!") {
  const data = err?.response?.data;
  const msg =
    (typeof data === "object" && (data?.error || data?.message)) ||
    (typeof err?.message === "string" && err.message) ||
    (typeof data === "string" && !/<[a-z][\s\S]*>/i.test(data) && data) ||
    null;

  const finalMsg =
    typeof msg === "string" && msg.length < 240 ? msg : fallback;

  toast.error(finalMsg);
}

enum STEPS {
  ACCOUNT = 0,
  INTERESTS = 1,
  USER_TYPE = 2,
  JOB_TITLE = 3,
  BUSINESS_SELECT = 4,
  SERVICE_SELECT = 5,
  SERVICES_FORM = 6,    // For individual providers
  SERVICES_LIST = 7,    // For individual providers
  LOCATION = 8,
  BIOGRAPHY = 9,
  IMAGES = 10,
}

const EDIT_HUB_STEP = -1;

const RegisterModal = () => {
  const router = useRouter();
  const { status, update } = useSession();
  const registerModal = useRegisterModal();
  const loginModal = useLoginModal();
  const modalRef = useRef<ModalHandle>(null);

  const isEdit = registerModal.mode === 'edit';

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<FieldValues>({
    defaultValues: {
      userId: '',
      id: '',
      name: '',
      email: '',
      password: '',
      interests: [],
      location: '',
      bio: '',
      image: '',
      backgroundImage: '',
      userType: '',
      selectedListing: '',
      jobTitle: '',
      isOwnerManager: false,
      selectedServices: [],
    },
  });

  const name = watch('name');
  const email = watch('email');
  const locationVal = watch('location');
  const bioVal = watch('bio');
  const image = watch('image');
  const backgroundImage = watch('backgroundImage');
  const userType = watch('userType') as UserType;
  const selectedListing = watch('selectedListing');
  const jobTitle = watch('jobTitle');
  const isOwnerManager = watch('isOwnerManager');
  const selectedServices = watch('selectedServices') || [];
  const interests = watch('interests') || [];

  const [step, setStep] = useState<number>(isEdit ? EDIT_HUB_STEP : STEPS.ACCOUNT);
  const [isLoading, setIsLoading] = useState(false);

  // Services management for individual providers
  const [services, setServices] = useState<Service[]>([]);
  const [editingServiceIndex, setEditingServiceIndex] = useState<number | null>(null);

  useEffect(() => {
    if (registerModal.isOpen && registerModal.prefill) {
      const p = registerModal.prefill;
      reset({
        userId: p.id ?? '',
        id: p.id ?? '',
        name: p.name ?? '',
        email: p.email ?? '',
        password: '',
        interests: [],
        location: p.location ?? '',
        bio: p.bio ?? '',
        image: p.image ?? '',
        backgroundImage: p.backgroundImage ?? '',
        userType: '',
        selectedListing: '',
        jobTitle: '',
        isOwnerManager: false,
        selectedServices: [],
      });
      setStep(isEdit ? EDIT_HUB_STEP : STEPS.ACCOUNT);
    }
  }, [registerModal.isOpen, registerModal.prefill, reset, isEdit]);

  // Auto-close on auth success (only when transitioning from unauthenticated to authenticated)
  const prevStatusRef = useRef(status);
  useEffect(() => {
    if (!isEdit && status === 'authenticated' && prevStatusRef.current !== 'authenticated' && registerModal.isOpen) {
      if (modalRef.current?.close) {
        modalRef.current.close();
      } else {
        registerModal.onClose();
      }
      const t = setTimeout(() => router.refresh(), 320);
      return () => clearTimeout(t);
    }
    prevStatusRef.current = status;
  }, [status, registerModal.isOpen, router, registerModal, isEdit]);

  const setCustomValue = (id: string, value: any) => {
    setValue(id, value ?? '', {
      shouldDirty: true,
      shouldTouch: true,
      shouldValidate: true
    });
  };

  const getNextStep = (currentStep: number, userType: UserType, listing?: string) => {
    if (currentStep === STEPS.INTERESTS) {
      return STEPS.USER_TYPE;
    }
    if (currentStep === STEPS.USER_TYPE) {
      if (userType === 'customer') {
        return STEPS.LOCATION;
      }
      if (userType === 'team') {
        return STEPS.BUSINESS_SELECT;
      }
      // Individual goes to job title
      return STEPS.JOB_TITLE;
    }
    if (currentStep === STEPS.BUSINESS_SELECT && userType === 'team') {
      return STEPS.JOB_TITLE;
    }
    if (currentStep === STEPS.JOB_TITLE) {
      if (userType === 'team') {
        const currentListing = listing ?? selectedListing;
        if (currentListing && currentListing !== 'SKIP' && currentListing.trim() !== '') {
          return STEPS.SERVICE_SELECT;
        }
        return STEPS.LOCATION;
      }
      // Individual goes to their own services list
      return STEPS.SERVICES_LIST;
    }
    if (currentStep === STEPS.SERVICE_SELECT) {
      return STEPS.LOCATION;
    }
    if (currentStep === STEPS.SERVICES_LIST && userType === 'individual') {
      return STEPS.LOCATION;
    }
    if (currentStep === STEPS.SERVICES_FORM && userType === 'individual') {
      return STEPS.SERVICES_LIST;
    }
    return currentStep + 1;
  };

  const getPreviousStep = (currentStep: number, userType: UserType) => {
    if (currentStep === STEPS.USER_TYPE) {
      return STEPS.INTERESTS;
    }
    if (currentStep === STEPS.BUSINESS_SELECT && userType === 'team') {
      return STEPS.USER_TYPE;
    }
    if (currentStep === STEPS.JOB_TITLE) {
      if (userType === 'team') {
        return STEPS.BUSINESS_SELECT;
      }
      return STEPS.USER_TYPE;
    }
    if (currentStep === STEPS.SERVICE_SELECT && userType === 'team') {
      return STEPS.JOB_TITLE;
    }
    if (currentStep === STEPS.SERVICES_LIST && userType === 'individual') {
      return STEPS.JOB_TITLE;
    }
    if (currentStep === STEPS.SERVICES_FORM && userType === 'individual') {
      return STEPS.SERVICES_LIST;
    }
    if (currentStep === STEPS.LOCATION) {
      if (userType === 'customer') {
        return STEPS.USER_TYPE;
      }
      if (userType === 'team') {
        const hasSelectedBusiness = selectedListing && selectedListing !== 'SKIP' && selectedListing.trim() !== '';
        if (hasSelectedBusiness) {
          return STEPS.SERVICE_SELECT;
        }
        return STEPS.JOB_TITLE;
      }
      return STEPS.SERVICES_LIST;
    }
    return currentStep - 1;
  };

  const onNext = (overrideListing?: string) => {
    const nextStep = getNextStep(step, userType, overrideListing);
    setStep(nextStep);
  };

  const onBack = () => {
    if (isEdit && step !== EDIT_HUB_STEP) {
      setStep(EDIT_HUB_STEP);
      return;
    }
    const previousStep = getPreviousStep(step, userType);
    setStep(previousStep);
  };

  // Service management helpers for individual providers
  const openEditForIndex = (idx: number) => {
    setEditingServiceIndex(idx);
    setStep(STEPS.SERVICES_FORM);
  };

  const addNewService = () => {
    const newService: Service = { serviceName: '', price: 0, category: '' };
    setServices((prev) => [...prev, newService]);
    setEditingServiceIndex(services.length);
    setStep(STEPS.SERVICES_FORM);
  };

  const validatePassword = (password: string) => ({
    hasMinLength: password.length >= 6,
    hasMaxLength: password.length <= 18,
    hasUpperCase: /[A-Z]/.test(password),
    hasLowerCase: /[a-z]/.test(password),
    hasNumber: /[0-9]/.test(password),
    hasSpecialChar: /[!@#$%^&*(),]/.test(password)
  });

  const handleClose = useCallback(() => {
    registerModal.onClose();
    registerModal.clear();
    setStep(isEdit ? EDIT_HUB_STEP : STEPS.ACCOUNT);
  }, [registerModal, isEdit]);

  const onToggle = useCallback(() => {
    if (isEdit) return;
    modalRef.current?.close();
    setTimeout(() => {
      loginModal.onOpen();
    }, 400);
  }, [loginModal, isEdit]);

  const onSubmit: SubmitHandler<FieldValues> = async (data) => {
    if (step === EDIT_HUB_STEP) return;

    // Stepper handling (non-final)
    if (step !== STEPS.IMAGES) {
      if (!isEdit && step === STEPS.ACCOUNT) {
        const p = validatePassword(data.password || '');
        if (!Object.values(p).every(Boolean)) {
          toast.error('Password must be 6–18 chars, include upper/lowercase, number & special char.');
          return;
        }
        try {
          const response = await axios.get(`/api/check-email?email=${encodeURIComponent(data.email)}`);
          if (response.data?.exists) {
            toast.error('Email already exists');
            return;
          }
        } catch (e) {
          safeToastError(e, "Could not validate email uniqueness.");
          return;
        }
      }
      
      if (step === STEPS.USER_TYPE) {
        if (!data.userType) {
          toast.error('Please select your user type');
          return;
        }
      }

      if (step === STEPS.JOB_TITLE) {
        if (data.userType === 'individual') {
          if (!data.jobTitle?.trim()) {
            toast.error('Please enter your job title');
            return;
          }
        } else if (data.userType === 'team') {
          if (!data.isOwnerManager && !data.jobTitle?.trim()) {
            toast.error('Please enter your job title or select owner/manager');
            return;
          }
        }
      }

      if (step === STEPS.BUSINESS_SELECT) {
        // Allow skipping business selection if they chose "SKIP"
        // No validation needed - they can proceed without a business
      }

      if (step === STEPS.SERVICE_SELECT) {
        // Only validate services if they selected an actual business (not SKIP)
        if (data.userType === 'team' && data.selectedListing && data.selectedListing !== 'SKIP') {
          if (!data.selectedServices || data.selectedServices.length === 0) {
            toast.error('Please select at least one service you provide');
            return;
          }
        }
      }
      
      onNext();
      return;
    }

    // Final step (IMAGES):
    setIsLoading(true);
    try {
      if (isEdit) {
        const userId = String(data.userId || '').trim();
        if (!userId) {
          toast.error("Missing user id for update.");
          return;
        }

        const payload = {
          name: data.name,
          location: data.location,
          bio: data.bio,
          image: data.image,
          backgroundImage: data.backgroundImage,
        };

        await axios.put(`/api/users/${userId}`, payload);

        toast.success('Profile updated!');
        if (modalRef.current?.close) modalRef.current.close();
        handleClose();
        router.refresh();
        return;
      }

      // REGISTER FLOW
      // Filter valid services for individual providers
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
        // Don't send listing ID if they skipped
        selectedListing: data.selectedListing === 'SKIP' ? null : data.selectedListing,
        jobTitle: data.jobTitle,
        isOwnerManager: data.isOwnerManager,
        // Don't send services if they skipped business selection
        selectedServices: data.selectedListing === 'SKIP' ? [] : data.selectedServices,
        // For individual providers, send their services
        individualServices: data.userType === 'individual' ? validServices : undefined,
      });
      toast.success('Registered! Logging you in…');

      const signInRes = await signIn('credentials', {
        email: data.email,
        password: data.password,
        redirect: false
      });

      if (signInRes?.ok || signInRes?.status === 200) {
        // Force session update to ensure client recognizes login immediately
        await update();

        setStep(STEPS.ACCOUNT);
        if (modalRef.current?.close) modalRef.current.close();
        registerModal.onClose();

        // Force router refresh to update server-side session
        router.refresh();

        // Route based on user type
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
      if (modalRef.current?.close) modalRef.current.close();
      setTimeout(() => {
        loginModal.onOpen();
      }, 320);

    } catch (error: any) {
      safeToastError(error);
    } finally {
      setIsLoading(false);
    }
  };

  // Body content (same as before but without LICENSING step)
  let bodyContent = (
    <div className="flex flex-col gap-4">
      {!isEdit && (
        <div className="flex justify-center pt-4 mb-2">
          <Image
            src="/logos/forme-long.png"
            alt="ForMe"
            width={140}
            height={32}
            className="object-contain"
          />
        </div>
      )}
      <Heading title={isEdit ? "Edit your profile" : "Welcome"} subtitle={isEdit ? "Update your info" : "Create an account!"} />
      <Input
        id="email"
        label="Email"
        disabled={isLoading || isEdit}
        register={register}
        errors={errors}
        required
        type="email"
      />
      <Input
        id="name"
        label="Name"
        disabled={isLoading}
        register={register}
        errors={errors}
        required
      />
      {!isEdit && (
        <Input
          id="password"
          label="Password"
          type="password"
          disabled={isLoading}
          register={register}
          errors={errors}
          showPasswordValidation={true}
          required
        />
      )}
    </div>
  );

  if (isEdit && step === EDIT_HUB_STEP) {
    bodyContent = (
      <div className="flex flex-col gap-6">
        <Heading
          title="Quick Edit"
          subtitle="Jump straight to the section you want to update."
        />
        <EditOverview
          items={[
            {
              key: STEPS.ACCOUNT,
              title: 'Account',
              description: 'Name & email',
              complete: Boolean(name && email),
            },
            {
              key: STEPS.INTERESTS,
              title: 'Interests',
              description: 'Categories you follow',
              complete: Boolean(interests && interests.length > 0),
            },
            {
              key: STEPS.USER_TYPE,
              title: 'Account Type',
              description: 'How you use Forme',
              complete: Boolean(userType),
            },
            ...(userType === 'team' ? [
              {
                key: STEPS.BUSINESS_SELECT,
                title: 'Business',
                description: 'Select your business',
                complete: Boolean(selectedListing),
              },
            ] : []),
            ...(userType === 'team' || userType === 'individual' ? [
              {
                key: STEPS.JOB_TITLE,
                title: 'Job Title',
                description: userType === 'team' ? 'Your role or position' : 'Your professional title',
                complete: Boolean(jobTitle || (userType === 'team' && isOwnerManager)),
              },
            ] : []),
            ...(userType === 'team' && selectedListing && selectedListing !== 'SKIP' ? [
              {
                key: STEPS.SERVICE_SELECT,
                title: 'Services',
                description: 'Services you provide',
                complete: Boolean(selectedServices && selectedServices.length > 0),
              }
            ] : []),
            ...(userType === 'individual' ? [
              {
                key: STEPS.SERVICES_LIST,
                title: 'Services',
                description: 'Services you provide',
                complete: Boolean(services && services.length > 0),
              }
            ] : []),
            {
              key: STEPS.LOCATION,
              title: 'Location',
              description: 'Where you are',
              complete: Boolean(locationVal),
            },
            {
              key: STEPS.BIOGRAPHY,
              title: 'Biography',
              description: 'Tell us about you',
              complete: Boolean((bioVal || '').trim().length > 0),
            },
            {
              key: STEPS.IMAGES,
              title: 'Photos',
              description: 'Profile & background images',
              complete: Boolean(image),
            },
          ]}
          onSelect={(k) => setStep(k)}
        />
      </div>
    );
  }

  if (step === STEPS.INTERESTS) {
    bodyContent = (
      <InterestsStep
        selectedInterests={interests}
        onInterestsChange={(selected) => setCustomValue('interests', selected)}
        isLoading={isLoading}
      />
    );
  }

  if (step === STEPS.USER_TYPE) {
    bodyContent = (
      <UserTypeStep
        userType={userType}
        onUserTypeChange={(type) => setCustomValue('userType', type)}
        isLoading={isLoading}
      />
    );
  }

  if (step === STEPS.JOB_TITLE) {
    bodyContent = (
      <JobTitleStep
        isOwnerManager={isOwnerManager}
        userType={userType}
        onOwnerManagerChange={(value) => {
          setCustomValue('isOwnerManager', value);
          if (value) {
            setCustomValue('jobTitle', '');
          }
        }}
        register={register}
        errors={errors}
        isLoading={isLoading}
      />
    );
  }

  if (step === STEPS.BUSINESS_SELECT) {
    bodyContent = (
      <BusinessSelectStep
        selectedListing={selectedListing}
        onListingChange={(listingId) => setCustomValue('selectedListing', listingId)}
        onSkip={() => {
          // Set the value to SKIP and advance to the next step
          setCustomValue('selectedListing', 'SKIP');
          setStep(STEPS.LOCATION);
        }}
        isLoading={isLoading}
      />
    );
  }

  if (step === STEPS.SERVICE_SELECT) {
    bodyContent = (
      <ServiceSelectStep
        selectedListingId={selectedListing}
        selectedServices={selectedServices}
        onServicesChange={(serviceIds) => setCustomValue('selectedServices', serviceIds)}
        isLoading={isLoading}
      />
    );
  }

  if (step === STEPS.SERVICES_LIST) {
    const validServices = (services || []).filter(
      s => (s.serviceName?.trim() || '') || s.category || s.price
    );

    bodyContent = (
      <div className="flex flex-col gap-4">
        <Heading
          title="Add your services"
          subtitle="List what you offer so clients can book with you"
        />

        <div className="grid grid-cols-2 gap-2">
          {validServices.map((s, i) => (
            <button
              key={`svc-${s.id ?? i}`}
              type="button"
              onClick={() => openEditForIndex(i)}
              className="flex flex-col p-3 rounded-lg border border-neutral-200 text-left hover:border-neutral-300 hover:bg-neutral-50 transition-all duration-100"
            >
              <span className="text-sm font-medium text-neutral-800 truncate">{s.serviceName || 'Untitled'}</span>
              <span className="text-xs text-neutral-500 truncate">{s.category || 'No category'}</span>
              <span className="text-sm font-semibold text-neutral-900 mt-2">${Number(s.price) || 0}</span>
            </button>
          ))}

          <button
            type="button"
            onClick={addNewService}
            className="flex flex-col items-center justify-center p-4 rounded-lg border-2 border-dashed border-neutral-200 text-center hover:border-blue-400 hover:bg-blue-50 transition-all duration-100 min-h-[88px]"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" className="text-neutral-400 mb-1">
              <path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
            <span className="text-sm text-neutral-500">Add service</span>
          </button>
        </div>

        <p className="text-xs text-neutral-400 text-center">
          Optional — you can add services later
        </p>
      </div>
    );
  }

  if (step === STEPS.SERVICES_FORM) {
    bodyContent = (
      <div className="flex flex-col gap-5">
        <div className="text-center">
          <h3 className="text-lg font-semibold text-gray-900">
            {editingServiceIndex !== null && services[editingServiceIndex]?.serviceName
              ? 'Edit service'
              : 'Add a service'}
          </h3>
          <p className="text-sm text-gray-500 mt-1">
            See a live preview as you build your service card
          </p>
        </div>
        <ServiceSelector
          key={`svc-${editingServiceIndex ?? 'all'}`}
          id="service-selector"
          onServicesChange={setServices}
          existingServices={services}
          singleIndex={editingServiceIndex ?? undefined}
        />
      </div>
    );
  }

  if (step === STEPS.LOCATION) {
    bodyContent = (
      <div className="flex flex-col gap-8">
        <Heading
          title={isEdit ? "Update your location" : "Where are you located?"}
          subtitle={isEdit ? "Keep this current so people can find you." : "This helps us show you the best experiences near you."}
        />
        <ProfileLocationInput
          initialLocation={isEdit ? (registerModal.prefill?.location ?? locationVal ?? null) : null}
          onLocationSubmit={(value) => setCustomValue('location', value)}
        />  
      </div>
    );
  }

  if (step === STEPS.BIOGRAPHY) {
    bodyContent = (
      <div className="flex flex-col gap-8">
        <Heading
          title={isEdit ? "Update your bio" : "Tell us about yourself"}
          subtitle={isEdit ? "Share a little about you." : "What makes you unique?"}
        />
        <Input
          id="bio"
          label="Biography"
          disabled={isLoading}
          register={register}
          errors={errors}
          required
          maxLength={1000}
          type="textarea"
          inputClassName="pt-8"
        />
      </div>
    );
  }

  if (step === STEPS.IMAGES) {
    // Get user initials for fallback
    const getInitials = (fullName?: string) => {
      if (!fullName) return 'U';
      const parts = fullName.trim().split(/\s+/).filter(Boolean);
      if (parts.length === 1) return (parts[0][0]?.toUpperCase() ?? 'U');
      return (parts[0][0]?.toUpperCase() ?? '') + (parts[parts.length - 1][0]?.toUpperCase() ?? '');
    };

    bodyContent = (
      <div className="flex flex-col gap-5">
        <div className="text-center">
          <h3 className="text-lg font-semibold text-gray-900">
            {isEdit ? 'Update your photos' : 'Add your photos'}
          </h3>
          <p className="text-sm text-gray-500 mt-1">
            See how your profile card will look
          </p>
        </div>

        <div className="flex gap-5 items-start">
          {/* Left: Worker Card Preview */}
          <div className="flex-shrink-0">
            {/* Card Preview - exact WorkerCard dimensions 250x280 */}
            <div
              className="rounded-xl overflow-hidden relative max-w-[250px]"
              style={{ width: '250px', height: '280px' }}
            >
              {/* Background */}
              <div className="absolute inset-0 z-0">
                {backgroundImage ? (
                  <>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={backgroundImage}
                      alt="Background"
                      className="w-full h-full object-cover grayscale"
                      style={{ opacity: 0.75 }}
                    />
                    <div className="absolute inset-0 bg-gray-600/15" style={{ mixBlendMode: 'multiply' }} />
                  </>
                ) : (
                  <div className="absolute inset-0 bg-gradient-to-br from-gray-200 to-gray-300" />
                )}

                {/* Radial gradient from avatar */}
                <div
                  className="absolute inset-0 opacity-12"
                  style={{ background: 'radial-gradient(circle at 50% 28%, rgba(96, 165, 250, 0.18) 0%, transparent 55%)' }}
                />

                {/* Top gradient */}
                <div
                  className="absolute inset-0 pointer-events-none"
                  style={{
                    background: 'linear-gradient(to bottom, rgba(0,0,0,0.35) 0%, rgba(0,0,0,0.20) 15%, rgba(0,0,0,0.10) 30%, rgba(0,0,0,0.00) 45%)',
                  }}
                />

                {/* Bottom gradient */}
                <div
                  className="absolute inset-0 pointer-events-none"
                  style={{
                    background: 'linear-gradient(to top, rgba(0,0,0,0.72) 0%, rgba(0,0,0,0.55) 18%, rgba(0,0,0,0.32) 38%, rgba(0,0,0,0.12) 55%, rgba(0,0,0,0.00) 70%)',
                  }}
                />
              </div>

              {/* Content */}
              <div className="relative z-10 h-full">
                {/* Avatar - Centered at 40% */}
                <div className="absolute top-[40%] left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                  {image ? (
                    <div className="w-24 h-24 rounded-full overflow-hidden shadow-lg border-2 border-white">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={image} alt="Profile" className="w-full h-full object-cover" />
                    </div>
                  ) : (
                    <div
                      className="w-24 h-24 rounded-full flex items-center justify-center text-white text-2xl font-semibold shadow-lg border-2 border-white"
                      style={{ backgroundColor: '#60A5FA' }}
                    >
                      {getInitials(name)}
                    </div>
                  )}
                </div>

                {/* Bottom info */}
                <div className="absolute bottom-4 left-4 right-4">
                  <h3 className="text-lg font-semibold text-white drop-shadow leading-tight mb-0.5">
                    {name || 'Your Name'}
                  </h3>
                  <div className="text-white/90 text-xs leading-tight mb-2.5">
                    {jobTitle || 'Your Title'}
                  </div>
                  <div className="flex items-center">
                    <span className="px-3 py-1.5 bg-white/20 backdrop-blur-md rounded-lg text-white text-xs font-medium">
                      Preview
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right: Upload Controls */}
          <div className="flex-1 min-w-0 space-y-4">
            {/* Profile Picture Upload */}
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-2">
                Profile picture
              </label>
              <ImageUpload
                uploadId="profile-picture"
                onChange={(v) => setCustomValue('image', v)}
                value={image}
                className="w-20 h-20"
                ratio="square"
                rounded="full"
                enableCrop={true}
                cropMode="fixed"
                label=""
                maxFileSizeMB={5}
                onRemove={() => setCustomValue('image', '')}
              />
              <p className="text-[11px] text-gray-400 mt-1.5">
                Displayed as a circle
              </p>
            </div>

            {/* Background Upload */}
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-2">
                Background image
              </label>
              <ImageUpload
                uploadId="background-image"
                onChange={(v) => setCustomValue('backgroundImage', v)}
                value={backgroundImage}
                className="w-full h-24"
                ratio="wide"
                rounded="xl"
                enableCrop={true}
                cropMode="fixed"
                customAspectRatio={250 / 280}
                label=""
                maxFileSizeMB={5}
                onRemove={() => setCustomValue('backgroundImage', '')}
              />
              <p className="text-[11px] text-gray-400 mt-1.5">
                Used on your profile and cards
              </p>
            </div>

            {/* Tip */}
            <div className="pt-2">
              <p className="text-xs text-gray-500">
                Your photos help clients recognize you and build trust.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const footerContent = useMemo<React.ReactElement | undefined>(() => {
    if (isEdit) return undefined;
    return (
      <div className="flex flex-col gap-4 mt-3">
        <hr />
        <div className="text-black text-center mt-4 font-light">
          <p>
            Already have an account?
            <span 
              onClick={onToggle} 
              className="text-neutral-500 cursor-pointer hover:underline"
            >
              {' '}Log in
            </span>
          </p>
        </div>
      </div>
    );
  }, [isEdit, onToggle]);

  const actionLabel: string | undefined =
    step === EDIT_HUB_STEP ? undefined
    : step === STEPS.IMAGES ? (isEdit ? "Save" : "Create")
    : "Continue";

  const showBack = isEdit ? step !== EDIT_HUB_STEP : step !== STEPS.ACCOUNT;

  return (
    <Modal
      ref={modalRef}
      disabled={isLoading}
      isOpen={registerModal.isOpen}
      title={isEdit ? "Edit Profile" : "Register"}
      actionLabel={actionLabel}
      secondaryAction={showBack ? onBack : undefined}
      secondaryActionLabel={showBack ? "Back" : undefined}
      onClose={handleClose}
      onSubmit={handleSubmit(onSubmit)}
      body={bodyContent}
      footer={footerContent}
    />
  );
};

export default RegisterModal;