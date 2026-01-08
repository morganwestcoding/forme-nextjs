'use client';

import { useState, useCallback } from "react";
import { toast } from "react-hot-toast";
import { FieldValues, SubmitHandler, useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import axios from "axios";
import Modal from "./Modal";
import Input from "../inputs/Input";
import Heading from "../Heading";
import useResetPasswordModal from "@/app/hooks/useResetPasswordModal";

const ResetPasswordModal = () => {
  const router = useRouter();
  const resetPasswordModal = useResetPasswordModal();
  const [isLoading, setIsLoading] = useState(false);

  const { 
    register, 
    handleSubmit,
    watch,
    formState: {
      errors,
    },
    reset,
  } = useForm<FieldValues>({
    defaultValues: {
      newPassword: '',
      confirmPassword: ''
    },
  });

  const newPassword = watch('newPassword');
  const confirmPassword = watch('confirmPassword');

  const onSubmit: SubmitHandler<FieldValues> = async (data) => {
    if (newPassword !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    setIsLoading(true);

    try {
      await axios.post('/api/auth/reset-password', {
        token: resetPasswordModal.token,
        newPassword: data.newPassword
      });
      toast.success('Password reset successful');
      reset();
      resetPasswordModal.onClose();
      router.push('/');
    } catch (error) {
      toast.error('Error resetting password');
    } finally {
      setIsLoading(false);
    }
  };

  const onModalClose = useCallback(() => {
    reset();
    resetPasswordModal.onClose();
  }, [reset, resetPasswordModal]);

  const bodyContent = (
    <div className="flex flex-col gap-4">
      <Heading
        title="Reset Your Password"
        subtitle="Please enter your new password"
      />
      <Input
        id="newPassword"
        label="New Password"
        type="password"
        disabled={isLoading}
        register={register}
        errors={errors}
        required
      />
      <Input
        id="confirmPassword"
        label="Confirm Password"
        type="password"
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
      isOpen={resetPasswordModal.isOpen}
      title="Reset Password"
      actionLabel="Reset Password"
      onClose={onModalClose}
      onSubmit={handleSubmit(onSubmit)}
      body={bodyContent}
    />
  );
};

export default ResetPasswordModal;