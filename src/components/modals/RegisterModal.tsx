// components/modals/RegisterModal.tsx
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

/** ---------------------------------------------
 * Utilities
 * --------------------------------------------- */
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
  LOCATION = 1,
  BIOGRAPHY = 2,
  IMAGES = 3,
}

const RegisterModal = () => {
  const router = useRouter();
  const { status } = useSession();
  const [step, setStep] = useState(STEPS.ACCOUNT);
  const registerModal = useRegisterModal();
  const loginModal = useLoginModal();
  const [isLoading, setIsLoading] = useState(false);
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
      location: '',
      bio: '',
      image: '',
      imageSrc: '',
    },
  });

  const image = watch('image');
  const imageSrc = watch('imageSrc');

  useEffect(() => {
    if (registerModal.isOpen && registerModal.prefill) {
      const p = registerModal.prefill;
      reset({
userId: p.id ?? '',
 id: p.id ?? '',
        name: p.name ?? '',
        email: p.email ?? '',
        password: '',
        location: p.location ?? '',
        bio: p.bio ?? '',
        image: p.image ?? '',
        imageSrc: p.imageSrc ?? '',
      });
      setStep(STEPS.ACCOUNT);
    }
  }, [registerModal.isOpen, registerModal.prefill, reset]);


  // Close this modal if session flips to authenticated during registration flow
  useEffect(() => {
    if (!isEdit && status === 'authenticated' && registerModal.isOpen) {
      if (modalRef.current?.close) {
        modalRef.current.close();
      } else {
        registerModal.onClose();
      }
      const t = setTimeout(() => router.refresh(), 320);
      return () => clearTimeout(t);
    }
  }, [status, registerModal.isOpen, router, registerModal, isEdit]);

  const setCustomValue = (id: string, value: any) => {
    setValue(id, value ?? '', {
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

  const handleClose = useCallback(() => {
    registerModal.onClose();
    registerModal.clear();
    setStep(STEPS.ACCOUNT);
  }, [registerModal]);

  const onSubmit: SubmitHandler<FieldValues> = async (data) => {
    // Stepper handling
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
      onNext();
      return;
    }

    // Final step:
    setIsLoading(true);
    try {
      if (isEdit) {
        // EDIT PROFILE: use dedicated update endpoint
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
          imageSrc: data.imageSrc,
        };

        await axios.put(`/api/users/${userId}`, payload);

        toast.success('Profile updated!');
        if (modalRef.current?.close) modalRef.current.close();
        handleClose();
        router.refresh();
        return;
      }

      // REGISTER FLOW (create)
      await axios.post('/api/register', {
        name: data.name,
        email: data.email,
        password: data.password,
        location: data.location,
        bio: data.bio,
        image: data.image,
        imageSrc: data.imageSrc,
        // If you pass subscription elsewhere, keep as-is; omitted here for clarity
      });
      toast.success('Registered! Logging you in…');

      const signInRes = await signIn('credentials', {
        email: data.email,
        password: data.password,
        redirect: false
      });

      if (signInRes?.ok || signInRes?.status === 200) {
        setStep(STEPS.ACCOUNT);
        if (modalRef.current?.close) modalRef.current.close();
        registerModal.onClose();
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
      safeToastError(error);
    } finally {
      setIsLoading(false);
    }
  };

  const onToggle = useCallback(() => {
    if (isEdit) return; // no toggle in edit mode
    modalRef.current?.close();
    setTimeout(() => {
      loginModal.onOpen();
    }, 400);
  }, [loginModal, isEdit]);

  /** ---------- BODY ---------- */
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

  if (step === STEPS.LOCATION) {
    bodyContent = (
      <div className="flex flex-col gap-8">
        <Heading
          title={isEdit ? "Update your location" : "Where are you located?"}
          subtitle={isEdit ? "Keep this current so people can find you." : "This helps us show you the best experiences near you."}
        />
        <ProfileLocationInput
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

// ...imports & component setup unchanged

  if (step === STEPS.IMAGES) {
    bodyContent = (
      <div className="flex flex-col gap-8">
        <Heading
          title={isEdit ? "Update your profile images" : "Add your profile images"}
          subtitle={isEdit ? "Freshen up your look." : "Make your profile stand out!"}
        />

        <div className="grid grid-cols-2 gap-8">
          {/* Profile picture — true circle */}
          <div className="flex flex-col items-center gap-3">
            <div className="w-full flex flex-col items-center">
              <ImageUpload
                onChange={(v) => setCustomValue('image', v)}
                value={image}
                ratio="square"
                rounded="full"
                className="w-40 h-40 rounded-full overflow-hidden"
                label="Image"
                hint="PNG, JPG, JPEG, WEBP, SVG • Max ~10MB"
              />
              <label className="mt-4 text-neutral-500 text-sm font-light">
                Profile Picture
              </label>
            </div>
          </div>

          {/* Background image */}
          <div className="flex flex-col items-center gap-3">
            <div className="w-full flex flex-col items-center">
              <ImageUpload
                onChange={(v) => setCustomValue('imageSrc', v)}
                value={imageSrc}
                // explicit size disables auto-aspect inside the component
                className="w-64 h-40 rounded-2xl overflow-hidden"
                label="Image"
                hint="PNG, JPG, JPEG, WEBP, SVG • Max ~10MB"
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

  /** ---------- FOOTER ---------- 
   * IMPORTANT: Modal.footer expects ReactElement | undefined (NOT null)
   */
  const footerContent = useMemo<React.ReactElement | undefined>(() => {
    if (isEdit) return undefined; // return undefined in edit mode
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

  const actionLabel =
    step === STEPS.IMAGES ? (isEdit ? "Save" : "Create") : "Continue";

  return (
    <Modal
      ref={modalRef}
      disabled={isLoading}
      isOpen={registerModal.isOpen}
      title={isEdit ? "Edit Profile" : "Register"}
      actionLabel={actionLabel}
      secondaryAction={step !== STEPS.ACCOUNT ? onBack : undefined}
      secondaryActionLabel={step !== STEPS.ACCOUNT ? "Back" : undefined}
      onClose={handleClose}
      onSubmit={handleSubmit(onSubmit)}
      body={bodyContent}
      footer={footerContent}
    />
  );
};

export default RegisterModal;
