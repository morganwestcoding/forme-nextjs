'use client';

import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "react-hot-toast";
import { signIn } from "next-auth/react";
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

const ANIM_MS = 300;

const LoginModal = () => {
  const router = useRouter();
  const { status } = useSession();

  const loginModal = useLoginModal();
  const registerModal = useRegisterModal();
  const forgotPasswordModal = useForgotPasswordModal();

  const [isLoading, setIsLoading] = useState(false);
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
      registerModal.onOpen();
    }, ANIM_MS);
  }, [loginModal, registerModal]);

  const onForgotPassword = useCallback(() => {
    modalRef.current?.close?.();
    setTimeout(() => {
      loginModal.onClose();
      forgotPasswordModal.onOpen();
    }, ANIM_MS);
  }, [loginModal, forgotPasswordModal]);

  const bodyContent = (
    <div className="flex flex-col gap-4">
      <div className="flex justify-center mb-2">
        <Logo variant="horizontal" />
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
};

export default LoginModal;