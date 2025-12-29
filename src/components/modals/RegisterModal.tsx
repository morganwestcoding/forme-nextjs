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
import CategoryInput from "../inputs/CategoryInput";
import { categories } from "../Categories";
import { CldUploadWidget, type CldUploadWidgetResults } from 'next-cloudinary';
import { Check } from 'lucide-react';

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
  SERVICES_FORM = 6,      // For individual providers
  SERVICES_LIST = 7,      // For individual providers
  LISTING_CATEGORY = 8,   // For individual providers - category selection
  LISTING_INFO = 9,       // For individual providers - title & description
  LISTING_IMAGE = 10,     // For individual providers - cover image
  LOCATION = 11,
  BIOGRAPHY = 12,
  IMAGES = 13,
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
      // Individual provider listing fields
      listingCategory: '',
      listingTitle: '',
      listingDescription: '',
      listingImage: '',
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
  const listingCategory = watch('listingCategory');
  const listingTitle = watch('listingTitle');
  const listingDescription = watch('listingDescription');
  const listingImage = watch('listingImage');

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
        listingCategory: '',
        listingTitle: '',
        listingDescription: '',
        listingImage: '',
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
      return STEPS.LISTING_CATEGORY;
    }
    if (currentStep === STEPS.LISTING_CATEGORY && userType === 'individual') {
      return STEPS.LISTING_INFO;
    }
    if (currentStep === STEPS.LISTING_INFO && userType === 'individual') {
      return STEPS.LOCATION;
    }
    if (currentStep === STEPS.LOCATION && userType === 'individual') {
      return STEPS.IMAGES;
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
    if (currentStep === STEPS.LISTING_CATEGORY && userType === 'individual') {
      return STEPS.SERVICES_LIST;
    }
    if (currentStep === STEPS.LISTING_INFO && userType === 'individual') {
      return STEPS.LISTING_CATEGORY;
    }
    if (currentStep === STEPS.IMAGES && userType === 'individual') {
      return STEPS.LOCATION;
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
      // Individual goes back to listing info
      return STEPS.LISTING_INFO;
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

      if (step === STEPS.LISTING_CATEGORY) {
        if (data.userType === 'individual') {
          if (!data.listingCategory?.trim()) {
            toast.error('Please select a category for your listing');
            return;
          }
        }
      }

      if (step === STEPS.LISTING_INFO) {
        if (data.userType === 'individual') {
          if (!data.listingTitle?.trim()) {
            toast.error('Please enter a title for your listing');
            return;
          }
          if (!data.listingDescription?.trim()) {
            toast.error('Please enter a description for your listing');
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
        // For individual providers, send their services and listing details
        individualServices: data.userType === 'individual' ? validServices : undefined,
        listingCategory: data.userType === 'individual' ? data.listingCategory : undefined,
        listingTitle: data.userType === 'individual' ? data.listingTitle : undefined,
        listingDescription: data.userType === 'individual' ? data.listingDescription : undefined,
        listingImage: data.userType === 'individual' ? data.listingImage : undefined,
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
              description: 'How you use ForMe',
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
      <div className="flex flex-col gap-5">
        <Heading
          title="Add your services"
          subtitle="List what you offer so clients can book with you"
        />

        <div className="grid grid-cols-2 gap-3">
          {validServices.map((s, i) => (
            <button
              key={`svc-${s.id ?? i}`}
              type="button"
              onClick={() => openEditForIndex(i)}
              className="group flex flex-col p-4 rounded-xl bg-white border border-gray-200/60 text-left hover:border-gray-300 hover:shadow-sm transition-all duration-200"
            >
              <span className="text-sm font-semibold text-gray-900 truncate">{s.serviceName || 'Untitled'}</span>
              <span className="text-xs text-gray-500 truncate mt-0.5">{s.category || 'No category'}</span>
              <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100">
                <span className="text-base font-semibold text-gray-900">${Number(s.price) || 0}</span>
                <span className="text-xs text-gray-400 group-hover:text-[var(--accent-color)] transition-colors">Edit</span>
              </div>
            </button>
          ))}

          <button
            type="button"
            onClick={addNewService}
            className="flex flex-col items-center justify-center p-4 rounded-xl border-2 border-dashed border-gray-200 bg-gray-50/50 text-center hover:border-[var(--accent-color)] hover:bg-[var(--accent-color-light)] transition-all duration-200 min-h-[106px]"
          >
            <div className="w-10 h-10 rounded-full bg-white border border-gray-200 flex items-center justify-center mb-2 shadow-sm">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" className="text-gray-400">
                <path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              </svg>
            </div>
            <span className="text-sm font-medium text-gray-600">Add service</span>
          </button>
        </div>

        <p className="text-xs text-gray-400 text-center">
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

  if (step === STEPS.LISTING_CATEGORY) {
    bodyContent = (
      <div className="flex flex-col gap-6">
        <Heading
          title="What type of services do you offer?"
          subtitle="Choose a category that best describes your work"
        />

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {categories.map((item) => (
            <CategoryInput
              key={item.label}
              onClick={(category) => setCustomValue('listingCategory', category)}
              selected={listingCategory === item.label}
              label={item.label}
            />
          ))}
        </div>
      </div>
    );
  }

  if (step === STEPS.LISTING_INFO) {
    // Listing card aspect ratio: 250/280
    const LISTING_CARD_ASPECT = 250 / 280;
    const UPLOAD_PRESET = 'cs0am6m7';

    const handleListingImageUpload = (result: CldUploadWidgetResults) => {
      const info = result?.info;
      if (info && typeof info === 'object' && 'secure_url' in info) {
        const publicId = info.public_id;
        let cloudName: string | null = null;

        if (typeof info.secure_url === 'string') {
          const urlMatch = info.secure_url.match(/res\.cloudinary\.com\/([^/]+)/);
          cloudName = urlMatch ? urlMatch[1] : null;
        }

        if (publicId && cloudName) {
          const width = 500;
          const height = Math.round(width / LISTING_CARD_ASPECT);
          const transformations = `q_auto:good,f_auto,w_${width},h_${height},c_fill,g_auto`;
          const finalUrl = `https://res.cloudinary.com/${cloudName}/image/upload/${transformations}/${publicId}`;
          setCustomValue('listingImage', finalUrl);
        } else {
          setCustomValue('listingImage', info.secure_url as string);
        }
      }
    };

    bodyContent = (
      <div className="flex flex-col gap-5">
        <Heading
          title="Tell clients about your listing"
          subtitle="This helps clients find and choose you"
        />

        <div className="flex gap-5 items-start">
          {/* Left: Listing Card Preview with integrated upload */}
          <div className="flex-shrink-0">
            <CldUploadWidget
              uploadPreset={UPLOAD_PRESET}
              onUpload={handleListingImageUpload}
              options={{
                multiple: false,
                maxFiles: 1,
                sources: ['local', 'camera'],
                resourceType: 'image',
                clientAllowedFormats: ['png', 'jpg', 'jpeg', 'webp'],
                maxImageFileSize: 10_000_000,
                cropping: true,
                croppingAspectRatio: LISTING_CARD_ASPECT,
                croppingShowBackButton: true,
                showSkipCropButton: false,
                folder: 'uploads/listings',
              }}
            >
              {(props) => (
                <div
                  onClick={() => props?.open?.()}
                  className={`group cursor-pointer rounded-xl overflow-hidden relative transition-all duration-300 hover:-translate-y-1 max-w-[250px] ${listingImage ? 'hover:shadow-lg' : 'border-2 border-dashed border-neutral-200 hover:border-neutral-300 bg-neutral-50'}`}
                  style={{ width: '250px', height: '280px' }}
                >
                  {listingImage ? (
                    <>
                      {/* Image state */}
                      <div className="absolute inset-0 z-0">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={listingImage}
                          alt="Listing preview"
                          className="w-full h-full object-cover"
                        />
                        {/* Top gradient */}
                        <div
                          className="absolute inset-0 pointer-events-none"
                          style={{
                            background:
                              'linear-gradient(to bottom,' +
                              'rgba(0,0,0,0.35) 0%,' +
                              'rgba(0,0,0,0.20) 15%,' +
                              'rgba(0,0,0,0.10) 30%,' +
                              'rgba(0,0,0,0.00) 45%)',
                          }}
                        />
                        {/* Bottom gradient */}
                        <div
                          className="absolute inset-0 pointer-events-none"
                          style={{
                            background:
                              'linear-gradient(to top,' +
                              'rgba(0,0,0,0.72) 0%,' +
                              'rgba(0,0,0,0.55) 18%,' +
                              'rgba(0,0,0,0.32) 38%,' +
                              'rgba(0,0,0,0.12) 55%,' +
                              'rgba(0,0,0,0.00) 70%)',
                          }}
                        />
                      </div>

                      {/* Content overlay */}
                      <div className="absolute bottom-4 left-4 right-4 z-10">
                        <h3 className="text-white text-lg leading-tight font-semibold drop-shadow mb-0.5 truncate">
                          {listingTitle || `${name}'s Services`}
                        </h3>
                        <div className="text-white/90 text-xs leading-tight mb-2.5">
                          <span className="line-clamp-1">{locationVal || 'Your location'}</span>
                        </div>
                        <div className="flex items-center">
                          <span className="px-3 py-1.5 bg-white/20 backdrop-blur-md rounded-lg text-white text-sm font-semibold">
                            Preview
                          </span>
                        </div>
                      </div>

                      {/* Hover overlay */}
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-all duration-200 flex items-center justify-center opacity-0 group-hover:opacity-100 z-20">
                        <span className="text-white text-sm font-medium px-4 py-2 bg-white/20 backdrop-blur-sm rounded-lg">
                          Change photo
                        </span>
                      </div>
                    </>
                  ) : (
                    /* Empty state - clean upload prompt */
                    <div className="h-full flex flex-col items-center justify-center text-center p-4">
                      <div className="w-12 h-12 rounded-full bg-neutral-100 flex items-center justify-center mb-3 group-hover:bg-neutral-200 transition-colors">
                        <svg
                          className="w-6 h-6 text-neutral-400"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                          strokeWidth="1.5"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                        </svg>
                      </div>
                      <span className="text-sm font-medium text-neutral-500 group-hover:text-neutral-600 transition-colors">Add photo</span>
                      <span className="text-xs text-neutral-400 mt-1">Click to upload</span>
                    </div>
                  )}
                </div>
              )}
            </CldUploadWidget>

            {/* Success indicator */}
            {listingImage && (
              <div className="flex items-center justify-center gap-1.5 mt-3">
                <div className="w-4 h-4 rounded-full bg-emerald-100 flex items-center justify-center">
                  <Check className="w-2.5 h-2.5 text-emerald-600" />
                </div>
                <span className="text-xs text-emerald-600 font-medium">Photo added</span>
              </div>
            )}
          </div>

          {/* Right: Form inputs */}
          <div className="flex-1 min-w-0 flex flex-col gap-4">
            <Input
              id="listingTitle"
              label="Listing Title"
              disabled={isLoading}
              register={register}
              errors={errors}
              required
            />

            <Input
              id="listingDescription"
              label="Description"
              disabled={isLoading}
              register={register}
              errors={errors}
              required
              maxLength={500}
            />
          </div>
        </div>
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
    const UPLOAD_PRESET = 'cs0am6m7';

    bodyContent = (
      <div className="flex flex-col gap-5">
        <Heading
          title={isEdit ? 'Update your profile' : 'Almost done!'}
          subtitle="Add your photos and bio"
        />

        <div className="flex gap-5 items-start">
          {/* Left: Background Card with Profile Photo centered */}
          <div className="flex-shrink-0">
            <div
              onClick={() => {}}
              className={`group rounded-xl overflow-hidden relative transition-all duration-300 ${backgroundImage ? '' : 'border-2 border-dashed border-neutral-200 bg-neutral-50'}`}
              style={{ width: '250px', height: '280px' }}
            >
              {/* Background upload area */}
              <CldUploadWidget
                uploadPreset={UPLOAD_PRESET}
                onSuccess={(result: CldUploadWidgetResults) => {
                  const info = result?.info;
                  if (info && typeof info === 'object' && 'secure_url' in info) {
                    const publicId = (info as any).public_id;
                    let cloudName: string | null = null;
                    if (typeof info.secure_url === 'string') {
                      const urlMatch = info.secure_url.match(/res\.cloudinary\.com\/([^/]+)/);
                      cloudName = urlMatch ? urlMatch[1] : null;
                    }
                    if (publicId && cloudName) {
                      const finalUrl = `https://res.cloudinary.com/${cloudName}/image/upload/q_auto:good,f_auto,w_500,h_560,c_fill,g_auto/${publicId}`;
                      setCustomValue('backgroundImage', finalUrl);
                    } else {
                      setCustomValue('backgroundImage', info.secure_url as string);
                    }
                  }
                }}
                options={{
                  multiple: false,
                  maxFiles: 1,
                  sources: ['local', 'camera'],
                  resourceType: 'image',
                  clientAllowedFormats: ['png', 'jpg', 'jpeg', 'webp'],
                  maxImageFileSize: 10_000_000,
                  cropping: true,
                  croppingAspectRatio: 250 / 280,
                  croppingShowBackButton: true,
                  showSkipCropButton: false,
                  folder: 'uploads/backgrounds',
                }}
              >
                {(bgProps) => (
                  <>
                    {backgroundImage ? (
                      <div
                        onClick={() => bgProps?.open?.()}
                        className="absolute inset-0 z-0 cursor-pointer"
                      >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={backgroundImage} alt="Background" className="w-full h-full object-cover" />
                        <div className="absolute inset-0 pointer-events-none" style={{ background: 'linear-gradient(to bottom, rgba(0,0,0,0.35) 0%, rgba(0,0,0,0.20) 15%, rgba(0,0,0,0.10) 30%, rgba(0,0,0,0.00) 45%)' }} />
                        <div className="absolute inset-0 pointer-events-none" style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.72) 0%, rgba(0,0,0,0.55) 18%, rgba(0,0,0,0.32) 38%, rgba(0,0,0,0.12) 55%, rgba(0,0,0,0.00) 70%)' }} />
                        <div className="absolute inset-0 bg-black/0 hover:bg-black/20 transition-all duration-200 z-10" />
                      </div>
                    ) : (
                      <div
                        onClick={() => bgProps?.open?.()}
                        className="absolute inset-0 z-0 cursor-pointer flex flex-col items-center justify-center text-center hover:bg-neutral-100 transition-colors"
                      >
                        <div className="mt-20">
                          <svg className="w-8 h-8 text-neutral-300 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.5">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
                          </svg>
                          <span className="text-xs text-neutral-400 font-medium">Background Photo</span>
                          <p className="text-[10px] text-neutral-300 mt-0.5">Click to upload</p>
                        </div>
                      </div>
                    )}
                  </>
                )}
              </CldUploadWidget>

              {/* Profile photo - centered at 40% like WorkerCard */}
              <div className="absolute top-[40%] left-1/2 -translate-x-1/2 -translate-y-1/2 z-20">
                <CldUploadWidget
                  uploadPreset={UPLOAD_PRESET}
                  onSuccess={(result: CldUploadWidgetResults) => {
                    const info = result?.info;
                    if (info && typeof info === 'object' && 'secure_url' in info) {
                      const publicId = (info as any).public_id;
                      let cloudName: string | null = null;
                      if (typeof info.secure_url === 'string') {
                        const urlMatch = info.secure_url.match(/res\.cloudinary\.com\/([^/]+)/);
                        cloudName = urlMatch ? urlMatch[1] : null;
                      }
                      if (publicId && cloudName) {
                        const finalUrl = `https://res.cloudinary.com/${cloudName}/image/upload/q_auto:good,f_auto,w_400,h_400,c_fill,g_face/${publicId}`;
                        setCustomValue('image', finalUrl);
                      } else {
                        setCustomValue('image', info.secure_url as string);
                      }
                    }
                  }}
                  options={{
                    multiple: false,
                    maxFiles: 1,
                    sources: ['local', 'camera'],
                    resourceType: 'image',
                    clientAllowedFormats: ['png', 'jpg', 'jpeg', 'webp'],
                    maxImageFileSize: 5_000_000,
                    cropping: true,
                    croppingAspectRatio: 1,
                    croppingShowBackButton: true,
                    showSkipCropButton: false,
                    folder: 'uploads/profiles',
                  }}
                >
                  {(profileProps) => (
                    <div
                      onClick={(e) => { e.stopPropagation(); profileProps?.open?.(); }}
                      className={`group/profile cursor-pointer rounded-full overflow-hidden relative transition-all duration-300 hover:scale-105 border-2 border-white shadow-lg ${image ? '' : 'bg-neutral-100'}`}
                      style={{ width: '96px', height: '96px' }}
                    >
                      {image ? (
                        <>
                          <div className="absolute inset-0 z-0">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img src={image} alt="Profile" className="w-full h-full object-cover" />
                          </div>
                          <div className="absolute inset-0 bg-black/0 group-hover/profile:bg-black/30 transition-all duration-200 flex items-center justify-center opacity-0 group-hover/profile:opacity-100 z-20">
                            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                              <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" strokeLinecap="round" strokeLinejoin="round" />
                              <circle cx="12" cy="13" r="4" />
                            </svg>
                          </div>
                        </>
                      ) : (
                        <div className="h-full flex flex-col items-center justify-center group-hover/profile:bg-neutral-200 transition-colors">
                          <svg className="w-8 h-8 text-neutral-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.5">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                          </svg>
                        </div>
                      )}
                    </div>
                  )}
                </CldUploadWidget>
              </div>

              {/* Bottom info overlay - only show when background is uploaded */}
              {backgroundImage && (
                <div className="absolute bottom-4 left-4 right-4 z-10">
                  <h3 className="text-white text-lg leading-tight font-semibold drop-shadow mb-0.5 truncate">{name || 'Your Name'}</h3>
                  <div className="text-white/90 text-xs leading-tight"><span className="line-clamp-1">{jobTitle || 'Your Title'}</span></div>
                </div>
              )}
            </div>
          </div>

          {/* Right: Steps */}
          <div className="flex-1 min-w-0 flex flex-col gap-4">
            {/* Step indicators */}
            <div className="flex flex-col gap-3">
              <div className="flex items-center gap-3">
                <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-semibold transition-colors ${backgroundImage && image ? 'bg-emerald-100 text-emerald-600' : 'bg-neutral-100 text-neutral-500'}`}>
                  {backgroundImage && image ? <Check className="w-3.5 h-3.5" /> : '1'}
                </div>
                <span className={`text-sm ${backgroundImage && image ? 'text-emerald-600 font-medium' : 'text-neutral-600'}`}>
                  Upload profile & background photos
                </span>
              </div>
              <div className="flex items-center gap-3">
                <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-semibold transition-colors ${bioVal?.trim() ? 'bg-emerald-100 text-emerald-600' : 'bg-neutral-100 text-neutral-500'}`}>
                  {bioVal?.trim() ? <Check className="w-3.5 h-3.5" /> : '2'}
                </div>
                <span className={`text-sm ${bioVal?.trim() ? 'text-emerald-600 font-medium' : 'text-neutral-600'}`}>
                  Write your bio
                </span>
              </div>
            </div>

            <Input
              id="bio"
              label="Biography"
              disabled={isLoading}
              register={register}
              errors={errors}
              maxLength={500}
            />
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