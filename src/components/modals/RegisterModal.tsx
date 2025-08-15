// components/modals/RegisterModal.tsx
'use client';

import axios from "axios";
import { useCallback, useEffect, useRef, useState } from "react";
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

enum STEPS {
  ACCOUNT = 0,
  LOCATION = 1,
  BIOGRAPHY = 2,
  IMAGES = 3,
}

const RegisterModal = () => {
  const router = useRouter();
  const { status } = useSession(); // watch auth flips
  const [step, setStep] = useState(STEPS.ACCOUNT);
  const registerModal = useRegisterModal();
  const loginModal = useLoginModal();
  const [isLoading, setIsLoading] = useState(false);
  const modalRef = useRef<ModalHandle>(null);

  const { 
    register, 
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<FieldValues>({
    defaultValues: {
      name: '',
      email: '',
      password: '',
      location: '',
      bio: '',
      image: '',
      imageSrc: '',
    },
  });

  const image = watch('image');
  const imageSrc = watch('imageSrc');

  const setCustomValue = (id: string, value: any) => {
    setValue(id, value, {
      shouldDirty: true,
      shouldTouch: true,
      shouldValidate: true
    });
  };

  const onNext = () => setStep((s) => s + 1);
  const onBack = () => setStep((s) => s - 1);

  const validatePassword = (password: string) => ({
    hasMinLength: password.length >= 6,
    hasMaxLength: password.length <= 18,
    hasUpperCase: /[A-Z]/.test(password),
    hasLowerCase: /[a-z]/.test(password),
    hasNumber: /[0-9]/.test(password),
    hasSpecialChar: /[!@#$%^&*(),]/.test(password)
  });

  // Close this modal if session flips to authenticated (rare race guard)
  useEffect(() => {
    if (status === 'authenticated' && registerModal.isOpen) {
      if (modalRef.current?.close) {
        modalRef.current.close();
      } else {
        registerModal.onClose();
      }
      const t = setTimeout(() => router.refresh(), 320);
      return () => clearTimeout(t);
    }
  }, [status, registerModal.isOpen, router, registerModal]);

  const onSubmit: SubmitHandler<FieldValues> = async (data) => {
    // For steps before final, advance
    if (step !== STEPS.IMAGES) {
      if (step === STEPS.ACCOUNT) {
        const p = validatePassword(data.password);
        if (!Object.values(p).every(Boolean)) {
          toast.error('Password does not meet requirements');
          return;
        }
        // Email exists check
        try {
          const response = await axios.get(`/api/check-email?email=${encodeURIComponent(data.email)}`);
          if (response.data?.exists) {
            toast.error('Email already exists');
            return;
          }
        } catch {
          toast.error('Error checking email');
          return;
        }
      }
      return onNext();
    }

    // Final step: create -> auto login -> close -> go to /subscription
    setIsLoading(true);
    try {
      await axios.post('/api/register', data);
      toast.success('Registered! Logging you in…');

      const signInRes = await signIn('credentials', {
        email: data.email,
        password: data.password,
        redirect: false
      });

      // After login, close modal and route to the Subscription page
      if (signInRes?.ok || signInRes?.status === 200) {
        setStep(STEPS.ACCOUNT);
        if (modalRef.current?.close) {
          modalRef.current.close();
        } else {
          registerModal.onClose();
        }
        // Navigate to subscription page
        setTimeout(() => {
          router.push('/subscription');
        }, 250);
        return;
      }

      toast.error(signInRes?.error || 'Login after registration failed.');
      if (modalRef.current?.close) modalRef.current.close();
      setTimeout(() => {
        loginModal.onOpen();
      }, 320);

    } catch (error: any) {
      let errorMessage = 'Something went wrong!';
      if (error?.response?.data) errorMessage = error.response.data;
      else if (error?.message) errorMessage = error.message;
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const onToggle = useCallback(() => {
    modalRef.current?.close();
    setTimeout(() => {
      loginModal.onOpen();
    }, 400);
  }, [loginModal]);

  let bodyContent = (
    <div className="flex flex-col gap-4">
      <div className="flex justify-center">
        <Logo variant="horizontal" />
      </div>
      <Heading title="Welcome to ForMe" subtitle="Create an account!" />
      <Input
        id="email"
        label="Email"
        disabled={isLoading}
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
    </div>
  );

  if (step === STEPS.LOCATION) {
    bodyContent = (
      <div className="flex flex-col gap-8">
        <Heading
          title="Where are you located?"
          subtitle="This helps us show you the best experiences near you."
        />
        <ProfileLocationInput
          onLocationSubmit={(value) => setValue('location', value)}
        />  
      </div>
    );
  }

  if (step === STEPS.BIOGRAPHY) {
    bodyContent = (
      <div className="flex flex-col gap-8">
        <Heading
          title="Tell us about yourself"
          subtitle="What makes you unique?"
        />
        <Input
          id="bio"
          label="Tell Us About You..."
          disabled={isLoading}
          register={register}
          errors={errors}
          required
          maxLength={200}
          type="textarea"
        />
      </div>
    );
  }

  if (step === STEPS.IMAGES) {
    bodyContent = (
      <div className="flex flex-col gap-8">
        <Heading
          title="Add your profile images"
          subtitle="Make your profile stand out!"
        />
        <div className="grid grid-cols-2">
          <div className="flex flex-col items-center gap-3">
            <div className="w-full flex flex-col items-center">
              <ImageUpload
                onChange={(value) => setCustomValue('image', value)}
                value={image}
                className="rounded-full bg-slate-50 w-56 h-32 overflow-hidden"
              />
              <label className="mt-4 text-neutral-500 text-sm font-light">
                Profile Picture
              </label>
            </div>
          </div>
          <div className="flex flex-col items-center gap-3">
            <div className="w-full flex flex-col items-center">
              <ImageUpload
                onChange={(value) => setCustomValue('imageSrc', value)}
                value={imageSrc}
                className="rounded-lg bg-slate-50 h-32 w-56 aspect-video overflow-hidden"
              />
              <label className="mt-4 text-neutral-500 font-light text-sm">
                Profile Background
              </label>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const footerContent = (
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

  // Primary button text
  const actionLabel = step === STEPS.IMAGES ? "Create" : "Continue";

  return (
    <Modal
      ref={modalRef}
      disabled={isLoading}
      isOpen={registerModal.isOpen}
      title="Register"
      actionLabel={actionLabel}
      secondaryAction={step !== STEPS.ACCOUNT ? onBack : undefined}
      secondaryActionLabel={step !== STEPS.ACCOUNT ? "Back" : undefined}
      onClose={registerModal.onClose}
      onSubmit={handleSubmit(onSubmit)}
      body={bodyContent}
      footer={footerContent}
    />
  );
}

export default RegisterModal;
