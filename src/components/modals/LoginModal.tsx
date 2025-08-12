// components/modals/LoginModal.tsx
'use client';

import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "react-hot-toast";
import { signIn } from 'next-auth/react';
import { FieldValues, SubmitHandler, useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";

import useRegisterModal from "@/app/hooks/useRegisterModal";
import useLoginModal from "@/app/hooks/useLoginModal";
import useForgotPasswordModal from "@/app/hooks/useForgotPasswordModal";
import Modal, { ModalHandle } from "./Modal";
import Input from "../inputs/Input";
import Heading from "../Heading";
import Logo from "../header/Logo";

const LoginModal = () => {
  const router = useRouter();
  const { status } = useSession(); // NEW: watch auth state
  const loginModal = useLoginModal();
  const registerModal = useRegisterModal();
  const forgotPasswordModal = useForgotPasswordModal();
  const [isLoading, setIsLoading] = useState(false);
  const modalRef = useRef<ModalHandle>(null);

  const { register, handleSubmit, formState: { errors } } = useForm<FieldValues>({
    defaultValues: { email: '', password: '' },
  });

  // NEW: Close the modal as soon as session is authenticated (covers race conditions)
  useEffect(() => {
    if (status === 'authenticated' && loginModal.isOpen) {
      if (modalRef.current?.close) {
        modalRef.current.close();
      } else {
        loginModal.onClose();
      }
      // optional: slight delay before refresh to let close animation finish
      const t = setTimeout(() => router.refresh(), 320);
      return () => clearTimeout(t);
    }
  }, [status, loginModal.isOpen, router, loginModal]);

  // UPDATED: await signIn and then close to avoid timing issues
  const onSubmit: SubmitHandler<FieldValues> = async (data) => {
    setIsLoading(true);
    try {
      const res = await signIn('credentials', { ...data, redirect: false });
      if (res?.ok || res?.status === 200) {
        toast.success('Logged in');
        if (modalRef.current?.close) {
          modalRef.current.close();
          setTimeout(() => {
            router.refresh();
          }, 320);
        } else {
          loginModal.onClose();
          router.refresh();
        }
        return;
      }
      if (res?.error) {
        toast.error(res.error);
      }
    } catch (err) {
      toast.error('Login failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const onToggleToRegister = useCallback(() => {
    modalRef.current?.close();
    setTimeout(() => {
      registerModal.onOpen();
    }, 300);
  }, [registerModal]);

  const onForgotPassword = useCallback(() => {
    modalRef.current?.close();
    setTimeout(() => {
      forgotPasswordModal.onOpen();
    }, 300);
  }, [forgotPasswordModal]);

  const bodyContent = (
    <div className="flex flex-col gap-4">
      <div className="flex justify-center mb-2">
        <Logo variant="vertical" />
      </div>
      <Heading title="Welcome back" subtitle="Login to your account!" />
      <Input
        id="email"
        label="Email"
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
        showPasswordValidation={false}
        required
      />
      <div
        className="text-center text-sm text-neutral-400 cursor-pointer hover:underline -mb-4"
        onClick={onForgotPassword}
      >
        Forgot password?
      </div>
    </div>
  );

  const footerContent = (
    <div className="flex flex-col gap-4 mt-3">
      <hr />
      <div className="flex flex-row justify-center gap-2 text-black text-center font-light text-sm">
        <div>First time using ForMe?</div>
        <div onClick={onToggleToRegister} className="text-neutral-500 cursor-pointer hover:underline">
          Create an account
        </div>
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
}

export default LoginModal;
