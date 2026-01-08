'use client';

import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "react-hot-toast";
import { signIn } from "next-auth/react";
import { FieldValues, SubmitHandler, useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { FiEye, FiEyeOff } from "react-icons/fi";

import useLoginModal from "@/app/hooks/useLoginModal";
import useForgotPasswordModal from "@/app/hooks/useForgotPasswordModal";
import Modal, { ModalHandle } from "./Modal";

const ANIM_MS = 200; // Faster animation for snappier feel

const LoginModal = () => {
  const router = useRouter();
  const { status } = useSession();

  const loginModal = useLoginModal();
  const forgotPasswordModal = useForgotPasswordModal();

  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const modalRef = useRef<ModalHandle>(null);

  const { register, handleSubmit, formState: { errors } } = useForm<FieldValues>({
    defaultValues: { email: "", password: "" },
  });

  // Auto-close on auth success (only when transitioning from unauthenticated to authenticated)
  const prevStatusRef = useRef(status);
  useEffect(() => {
    if (status === "authenticated" && prevStatusRef.current !== "authenticated" && loginModal.isOpen) {
      modalRef.current?.close?.();
      const t = setTimeout(() => {
        if (loginModal.isOpen) loginModal.onClose();
        router.refresh();
      }, ANIM_MS + 20);
      return () => clearTimeout(t);
    }
    prevStatusRef.current = status;
  }, [status, loginModal, router]);

  const onSubmit: SubmitHandler<FieldValues> = async (data) => {
    setIsLoading(true);
    try {
      const res = await signIn("credentials", { ...data, redirect: false });
      if (res?.ok || res?.status === 200) {
        toast.success("Logged in");
        modalRef.current?.close?.();
        setTimeout(() => {
          loginModal.onClose();
          router.refresh();
        }, ANIM_MS + 20);
        return;
      }
      if (res?.error) {
        toast.error(res.error || "Login failed");
      } else {
        toast.error("Login failed");
      }
    } catch {
      toast.error("Login failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const onToggleToRegister = useCallback(() => {
    modalRef.current?.close?.();
    setTimeout(() => {
      loginModal.onClose();
      router.push('/register');
    }, ANIM_MS);
  }, [loginModal, router]);

  const onForgotPassword = useCallback(() => {
    modalRef.current?.close?.();
    setTimeout(() => {
      loginModal.onClose();
      forgotPasswordModal.onOpen();
    }, ANIM_MS);
  }, [loginModal, forgotPasswordModal]);

  const bodyContent = (
    <div>
      {/* Typeform-style heading */}
      <div className="mb-8 pt-2">
        <h1 className="text-2xl sm:text-3xl font-semibold text-gray-900 leading-tight">
          Welcome back
        </h1>
        <p className="text-base text-gray-500 mt-2">
          Login to your account
        </p>
      </div>

      {/* Typeform-style inputs */}
      <div className="space-y-5">
        {/* Email */}
        <div>
          <label htmlFor="login-email" className="block text-sm font-medium text-gray-700 mb-2">
            Email
          </label>
          <input
            id="login-email"
            type="email"
            autoComplete="email"
            autoFocus
            disabled={isLoading}
            {...register('email', { required: 'Email is required' })}
            className="w-full px-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            placeholder="you@example.com"
          />
          {errors.email && (
            <p className="mt-2 text-sm text-red-500">{errors.email.message as string}</p>
          )}
        </div>

        {/* Password */}
        <div>
          <label htmlFor="login-password" className="block text-sm font-medium text-gray-700 mb-2">
            Password
          </label>
          <div className="relative">
            <input
              id="login-password"
              type={showPassword ? 'text' : 'password'}
              autoComplete="current-password"
              disabled={isLoading}
              {...register('password', { required: 'Password is required' })}
              className="w-full px-4 py-3.5 pr-12 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              placeholder="Enter your password"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
            >
              {showPassword ? <FiEyeOff size={18} /> : <FiEye size={18} />}
            </button>
          </div>
          {errors.password && (
            <p className="mt-2 text-sm text-red-500">{errors.password.message as string}</p>
          )}
        </div>

        {/* Forgot password */}
        <div
          className="text-right text-sm text-gray-500 cursor-pointer hover:text-gray-900 transition-colors"
          onClick={onForgotPassword}
        >
          Forgot password?
        </div>
      </div>
    </div>
  );

  const footerContent = (
    <div className="flex flex-col gap-4 pt-2">
      <div className="h-px bg-gray-100" />
      <div className="flex flex-row justify-center items-center gap-1.5 text-sm">
        <span className="text-gray-500">First time using ForMe?</span>
        <button
          type="button"
          onClick={onToggleToRegister}
          className="text-gray-900 font-medium hover:underline transition-colors"
        >
          Create an account
        </button>
      </div>
    </div>
  );

  return (
    <Modal
      ref={modalRef}
      disabled={isLoading}
      isOpen={loginModal.isOpen}
      title="Login"
      actionLabel="Continue"
      onClose={loginModal.onClose}
      onSubmit={handleSubmit(onSubmit)}
      body={bodyContent}
      footer={footerContent}
    />
  );
};

export default LoginModal;