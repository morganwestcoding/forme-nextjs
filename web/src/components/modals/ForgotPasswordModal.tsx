'use client';

import { useCallback, useRef, useState } from "react";
import { FieldValues, SubmitHandler, useForm } from "react-hook-form";
import { toast } from "react-hot-toast";
import axios from "axios";
import useForgotPasswordModal from "@/app/hooks/useForgotPasswordModal";
import useLoginModal from "@/app/hooks/useLoginModal";
import Modal, { ModalHandle } from "./Modal";
import Input from "../inputs/Input";
import Heading from "../Heading";

const ForgotPasswordModal = () => {
  const forgotModal = useForgotPasswordModal();
  const loginModal = useLoginModal();
  const [isLoading, setIsLoading] = useState(false);
  const modalRef = useRef<ModalHandle>(null);

  const { register, handleSubmit, formState: { errors } } = useForm<FieldValues>({
    defaultValues: { email: '' },
  });

  const onSubmit: SubmitHandler<FieldValues> = async ({ email }) => {
    setIsLoading(true);
    try {
      await axios.post('/api/auth/forgot-password', { email });
      toast.success('Reset link sent (if email exists). Check your inbox.');
      // animate close then open login
      modalRef.current?.close();
      setTimeout(() => {
        loginModal.onOpen();
      }, 400);
    } catch {
      toast.error('Could not send reset link.');
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

  const bodyContent = (
    <div className="flex flex-col gap-4">
      <Heading title="Forgot your password?" subtitle="Enter your email to receive a reset link." />
      <Input id="email" label="Email" disabled={isLoading} register={register} errors={errors} required type="email" />
    </div>
  );

  const footerContent = (
    <div className="flex flex-col gap-4 mt-3">
      <hr />
      <div className="text-black text-center mt-4 font-light">
        <p>
          Remembered it?
          <span onClick={backToLogin} className="text-neutral-500 cursor-pointer hover:underline"> Back to login</span>
        </p>
      </div>
    </div>
  );

  return (
    <Modal
      ref={modalRef}
      disabled={isLoading}
      isOpen={forgotModal.isOpen}
      title="Reset your password"
      actionLabel="Send reset link"
      onClose={forgotModal.onClose}
      onSubmit={handleSubmit(onSubmit)}
      body={bodyContent}
      footer={footerContent}
    />
  );
};

export default ForgotPasswordModal;
