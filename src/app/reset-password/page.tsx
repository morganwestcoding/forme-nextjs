'use client';

import { useState, useEffect } from "react";
import { toast } from "react-hot-toast";
import { FieldValues, SubmitHandler, useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import axios from "axios";
import Input from "@/components/inputs/Input";
import ClientOnly from "@/components/ClientOnly";

const ResetPasswordPage = () => {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [token, setToken] = useState<string | null>(null);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    const params = new URLSearchParams(window.location.search);
    setToken(params.get('token'));
  }, []);

  const { 
    register, 
    handleSubmit,
    watch,
    formState: {
      errors,
    },
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
        token,
        newPassword: data.newPassword
      });
      toast.success('Password reset successful');
      router.push('/');
    } catch (error) {
      toast.error('Error resetting password');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isClient) {
    return null;
  }

  if (!token) {
    return (
      <ClientOnly>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <h1 className="text-2xl font-bold">Invalid Reset Link</h1>
            <p className="mt-2">The password reset link is invalid or has expired.</p>
          </div>
        </div>
      </ClientOnly>
    );
  }

  return (
    <ClientOnly>
      <div className="flex items-center justify-center min-h-screen">
        <div className="max-w-md w-full mx-4">
          <h1 className="text-2xl font-bold text-center mb-6">Reset Your Password</h1>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
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
            <button
              disabled={isLoading}
              className={`
                w-full
                bg-rose-500
                text-white
                p-3
                rounded-lg
                transition
                hover:bg-rose-600
                disabled:opacity-70
                disabled:cursor-not-allowed
              `}
              type="submit"
            >
              {isLoading ? "Resetting..." : "Reset Password"}
            </button>
          </form>
        </div>
      </div>
    </ClientOnly>
  );
};

export default ResetPasswordPage;