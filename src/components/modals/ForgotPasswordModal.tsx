'use client';

import { useState } from "react";
import { toast } from "react-hot-toast";
import { FieldValues, SubmitHandler, useForm } from "react-hook-form";
import Modal from "./Modal";
import Input from "../inputs/Input";
import Heading from "../Heading";
import useForgotPasswordModal from "@/app/hooks/useForgotPassword";
import axios from "axios";

const ForgotPasswordModal = () => {
  const forgotPasswordModal = useForgotPasswordModal();
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
    } catch (error) {
      toast.error('Something went wrong');
    } finally {
      setIsLoading(false);
    }
  };

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
      />
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
    />
  );
}

export default ForgotPasswordModal;