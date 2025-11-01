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
import Logo from "../header/Logo";
import EditOverview from "./EditOverview";
import UserTypeStep from "../inputs/UserTypeStep";
import JobTitleStep from "../inputs/JobTitleStep";
import BusinessSelectStep from "../inputs/BusinessSelectStep";
import ServiceSelectStep from "../inputs/ServiceSelectStep";
import InterestsStep from "../inputs/InterestStep";

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
  LOCATION = 6,
  BIOGRAPHY = 7,
  IMAGES = 8,
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
  const userType = watch('userType') as UserType;
  const selectedListing = watch('selectedListing');
  const jobTitle = watch('jobTitle');
  const isOwnerManager = watch('isOwnerManager');
  const selectedServices = watch('selectedServices') || [];
  const interests = watch('interests') || [];

  const [step, setStep] = useState<number>(isEdit ? EDIT_HUB_STEP : STEPS.ACCOUNT);
  const [isLoading, setIsLoading] = useState(false);

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

  const getNextStep = (currentStep: number, userType: UserType) => {
    if (currentStep === STEPS.INTERESTS) {
      return STEPS.USER_TYPE;
    }
    if (currentStep === STEPS.USER_TYPE) {
      if (userType === 'team' || userType === 'individual') {
        return STEPS.JOB_TITLE;
      } else {
        return STEPS.LOCATION;
      }
    }
    if (currentStep === STEPS.JOB_TITLE) {
      if (userType === 'team') {
        return STEPS.BUSINESS_SELECT;
      } else {
        return STEPS.LOCATION;
      }
    }
    if (currentStep === STEPS.BUSINESS_SELECT && userType === 'team') {
      return STEPS.SERVICE_SELECT;
    }
    if (currentStep === STEPS.SERVICE_SELECT) {
      return STEPS.LOCATION;
    }
    return currentStep + 1;
  };

  const getPreviousStep = (currentStep: number, userType: UserType) => {
    if (currentStep === STEPS.USER_TYPE) {
      return STEPS.INTERESTS;
    }
    if (currentStep === STEPS.LOCATION) {
      if (userType === 'team') {
        return STEPS.SERVICE_SELECT;
      } else if (userType === 'individual') {
        return STEPS.JOB_TITLE;
      } else {
        return STEPS.USER_TYPE;
      }
    }
    if (currentStep === STEPS.SERVICE_SELECT && userType === 'team') {
      return STEPS.BUSINESS_SELECT;
    }
    if (currentStep === STEPS.BUSINESS_SELECT && userType === 'team') {
      return STEPS.JOB_TITLE;
    }
    if (currentStep === STEPS.JOB_TITLE) {
      return STEPS.USER_TYPE;
    }
    return currentStep - 1;
  };

  const onNext = () => {
    const nextStep = getNextStep(step, userType);
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
        if (data.userType === 'team' && !data.selectedListing) {
          toast.error('Please select a business to join');
          return;
        }
      }

      if (step === STEPS.SERVICE_SELECT) {
        if (data.userType === 'team' && (!data.selectedServices || data.selectedServices.length === 0)) {
          toast.error('Please select at least one service you provide');
          return;
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
        };

        await axios.put(`/api/users/${userId}`, payload);

        toast.success('Profile updated!');
        if (modalRef.current?.close) modalRef.current.close();
        handleClose();
        router.refresh();
        return;
      }

      // REGISTER FLOW
      await axios.post('/api/register', {
        name: data.name,
        email: data.email,
        password: data.password,
        interests: data.interests,
        location: data.location,
        bio: data.bio,
        image: data.image,
        userType: data.userType,
        selectedListing: data.selectedListing,
        jobTitle: data.jobTitle,
        isOwnerManager: data.isOwnerManager,
        selectedServices: data.selectedServices,
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

        // UPDATED: Route based on user type
        setTimeout(() => {
          if (data.userType === 'individual' || data.userType === 'team') {
            // Professionals go to licensing first
            router.push('/licensing?onboarding=true');
          } else {
            // Customers go straight to subscription
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
        <div className="flex justify-center">
          <Logo variant="horizontal" />
        </div>
      )}
      <Heading title={isEdit ? "Edit your profile" : "Welcome to ForMe"} subtitle={isEdit ? "Update your info" : "Create an account!"} />
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
              title: 'User Type',
              description: 'Customer, individual, or team member',
              complete: Boolean(userType),
            },
            ...(userType === 'team' || userType === 'individual' ? [
              {
                key: STEPS.JOB_TITLE,
                title: 'Job Title',
                description: userType === 'team' ? 'Your role or position' : 'Your professional title',
                complete: Boolean(jobTitle || (userType === 'team' && isOwnerManager)),
              },
            ] : []),
            ...(userType === 'team' ? [
              {
                key: STEPS.BUSINESS_SELECT,
                title: 'Business',
                description: 'Select your business',
                complete: Boolean(selectedListing),
              },
              {
                key: STEPS.SERVICE_SELECT,
                title: 'Services',
                description: 'Services you provide',
                complete: Boolean(selectedServices && selectedServices.length > 0),
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
              title: 'Profile Picture',
              description: 'Your profile photo',
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
        jobTitle={jobTitle}
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
          maxLength={300}
          type="textarea"
          inputClassName="pt-8"
        />
      </div>
    );
  }

  if (step === STEPS.IMAGES) {
    bodyContent = (
      <div className="flex flex-col gap-8 py-6">
        <Heading
          title={isEdit ? "Update your photo" : "Add your photo"}
          subtitle={isEdit ? "Show the world your best self" : "Make a great first impression"}
        />

        <div className="flex justify-center py-8">
          <ImageUpload
            uploadId="profile-picture"
            onChange={(v) => setCustomValue('image', v)}
            value={image}
            className="w-48 h-48"
            ratio="square"
            rounded="full"
            enableCrop={true}
            cropMode="fixed"
            label="Profile Picture"
            maxFileSizeMB={5}
            onRemove={() => setCustomValue('image', '')}
          />
        </div>

        <p className="text-sm text-neutral-500 text-center max-w-sm mx-auto">
          Upload a photo that represents you. It&apos;ll be shown as a circle throughout the app.
        </p>
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