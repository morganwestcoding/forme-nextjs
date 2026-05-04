'use client';

import { useCallback, useEffect, useRef, useState } from "react";
import { FieldValues, SubmitHandler, useForm } from "react-hook-form";
import { toast } from "react-hot-toast";
import axios from "axios";
import { Tick02Icon as FiCheck } from 'hugeicons-react';
import useForgotPasswordModal from "@/app/hooks/useForgotPasswordModal";
import useLoginModal from "@/app/hooks/useLoginModal";
import Modal, { ModalHandle } from "./Modal";
import Input from "../inputs/Input";
import Heading from "../Heading";

const SUCCESS_HOLD_MS = 1800;

const ForgotPasswordModal = () => {
  const forgotModal = useForgotPasswordModal();
  const loginModal = useLoginModal();
  const [isLoading, setIsLoading] = useState(false);
  const [submittedEmail, setSubmittedEmail] = useState<string | null>(null);
  const modalRef = useRef<ModalHandle>(null);

  const { register, handleSubmit, reset, formState: { errors } } = useForm<FieldValues>({
    defaultValues: { email: '' },
  });

  // Reset internal state whenever the modal closes so it's clean on reopen
  useEffect(() => {
    if (!forgotModal.isOpen) {
      setSubmittedEmail(null);
      setIsLoading(false);
      reset({ email: '' });
    }
  }, [forgotModal.isOpen, reset]);

  const onSubmit: SubmitHandler<FieldValues> = async ({ email }) => {
    setIsLoading(true);
    try {
      await axios.post('/api/auth/forgot-password', { email });
      setSubmittedEmail(email);
      // Hold the success state briefly so the user reads it, then return to login
      setTimeout(() => {
        modalRef.current?.close();
        setTimeout(() => loginModal.onOpen(), 400);
      }, SUCCESS_HOLD_MS);
    } catch {
      toast.error('Couldn’t send reset link. Try again in a moment.');
    } finally {
      setIsLoading(false);
    }
  };

  const backToLogin = useCallback(() => {
    modalRef.current?.close();
    setTimeout(() => {
      loginModal.onOpen();
    }, 400);
  }, [loginModal]);

  const successContent = (
    <div className="flex flex-col items-center text-center gap-3 py-2">
      <div className="w-12 h-12 rounded-full bg-success-soft dark:bg-success/10 border border-success-soft/60 dark:border-success/20 flex items-center justify-center">
        <FiCheck size={22} className="text-success-soft-foreground dark:text-success/80" />
      </div>
      <h3 className="text-base font-semibold text-stone-900 dark:text-stone-100">Check your inbox</h3>
      <p className="text-sm text-stone-500 dark:text-stone-400 max-w-sm">
        If an account exists for{' '}
        <span className="font-medium text-stone-700 dark:text-stone-200">{submittedEmail}</span>,
        a reset link is on its way. The link expires in 1 hour.
      </p>
    </div>
  );

  const formContent = (
    <div className="flex flex-col gap-4">
      <Heading title="Forgot your password?" subtitle="Enter your email to receive a reset link." />
      <Input id="email" label="Email" disabled={isLoading} register={register} errors={errors} required type="email" />
    </div>
  );

  const footerContent = submittedEmail ? undefined : (
    <div className="flex flex-col gap-4 mt-3">
      <hr />
      <div className="text-black text-center mt-4 font-light">
        <p>
          Remembered it?
          <span onClick={backToLogin} className="text-stone-500  dark:text-stone-500 cursor-pointer hover:underline"> Back to login</span>
        </p>
      </div>
    </div>
  );

  return (
    <Modal
      ref={modalRef}
      disabled={isLoading || Boolean(submittedEmail)}
      isOpen={forgotModal.isOpen}
      title="Reset your password"
      actionLabel={submittedEmail ? undefined : "Send reset link"}
      onClose={forgotModal.onClose}
      onSubmit={handleSubmit(onSubmit)}
      body={submittedEmail ? successContent : formContent}
      footer={footerContent}
    />
  );
};

export default ForgotPasswordModal;
