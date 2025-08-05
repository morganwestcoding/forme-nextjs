'use client';

import { useState, useCallback } from "react";
import { toast } from "react-hot-toast";
import { FieldValues, SubmitHandler, useForm } from "react-hook-form";
import Modal from "./Modal";
import Input from "../inputs/Input";
import Heading from "../Heading";
import useForgotPasswordModal from "@/app/hooks/useForgotPassword";
import useLoginModal from "@/app/hooks/useLoginModal";
import axios from "axios";

const ForgotPasswordModal = () => {
  const forgotPasswordModal = useForgotPasswordModal();
  const loginModal = useLoginModal();
  const [isLoading, setIsLoading] = useState(false);

  const { 
    register, 
    handleSubmit,
    formState: {
      errors,
    },
  } = useForm<FieldValues>({
    defaultValues: {
      email: ''
    },
  });

  const onSubmit: SubmitHandler<FieldValues> = async (data) => {
    setIsLoading(true);

    try {
      await axios.post('/api/auth/forgot-password', data);
      toast.success('Password reset email sent');
      forgotPasswordModal.onClose();
      // Wait for forgot password modal to slide out before opening login modal
      setTimeout(() => {
        loginModal.onOpen();
      }, 350);
    } catch (error) {
      toast.error('Something went wrong');
    } finally {
      setIsLoading(false);
    }
  };

  // Add back to login functionality
  const onBackToLogin = useCallback(() => {
    forgotPasswordModal.onClose();
    // Wait for forgot password modal to slide out before opening login modal
    setTimeout(() => {
      loginModal.onOpen();
    }, 350);
  }, [forgotPasswordModal, loginModal]);

  const bodyContent = (
    <div className="flex flex-col gap-4">
      <Heading
        title="Forgot Password"
        subtitle="Enter your email to reset your password"
      />
      <Input
        id="email"
        label="Email"
        disabled={isLoading}
        register={register}
        errors={errors}
        required
        type="email"
      />
    </div>
  );

  const footerContent = (
    <div className="flex flex-col gap-4 mt-3">
      <hr />
      <div 
        className="
          flex 
          flex-row 
          justify-center 
          gap-2
          text-black
          text-center 
          font-light
          text-sm
        "
      >
        <div>Remember your password?</div>
        <div 
          onClick={onBackToLogin} 
          className="
            text-neutral-500 
            cursor-pointer 
            hover:underline
          "
        >
          Back to login
        </div>
      </div>
    </div>
  );

  return (
    <Modal
      disabled={isLoading}
      isOpen={forgotPasswordModal.isOpen}
      title="Forgot Password"
      actionLabel="Send Reset Link"
      onClose={forgotPasswordModal.onClose}
      onSubmit={handleSubmit(onSubmit)}
      body={bodyContent}
      footer={footerContent}
    />
  );
}

export default ForgotPasswordModal;