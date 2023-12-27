'use client';

import axios from "axios";
import { AiFillGithub } from "react-icons/ai";
import { signIn } from "next-auth/react";
import { FcGoogle } from "react-icons/fc";
import { useCallback, useState } from "react";

import { 
  FieldValues, 
  SubmitHandler,
  useForm
} from "react-hook-form";

import useRegisterModal from "@/app/hooks/useRegisterModal";

import Modal from "./modals/Modal";
import ModalButton from "./modals/ModalButton";
import Heading from "./Heading";
import Input from "./inputs/Input";
import toast from "react-hot-toast";

const RegisterModal= () => {
  const registerModal = useRegisterModal();
  const [isLoading, setIsLoading] = useState(false);

  const { 
    register, 
    handleSubmit,
    formState: {
      errors,
    },
  } = useForm<FieldValues>({
    defaultValues: {
      name: '',
      email: '',
      password: ''
    },
  });

  const onSubmit: SubmitHandler<FieldValues> = (data) => {
    setIsLoading(true);

    axios.post('/api/register', data)
    .then(() => {
      
      registerModal.onClose();
      
    })
    .catch((error) => {
      toast.error('oops!');
    })
    .finally(() => {
      setIsLoading(false);
    })
  }

  const bodyContent = (
    <div className="flex flex-col gap-4">
        <Heading
        title="Welcome to ForMe"
        subtitle="Enter the community Today"/>
        <Input
        id="email"
        label="Email"
        disabled={isLoading}
        register={register}
        errors={errors}
        required/>
        <Input
        id="name"
        label="Name"
        disabled={isLoading}
        register={register}
        errors={errors}
        required/>
        <Input
        id="password"
        type="password"
        label="Password"
        disabled={isLoading}
        register={register}
        errors={errors}
        required/>
    </div>
  )

  const footerContent = (
    <div className="flex flex-col gap-4 mt-3">
      <hr />
      <ModalButton 
        outline 
        label="Continue with Google"
        icon={FcGoogle}
        onClick={() => signIn('google')} 
      />
      <ModalButton 
        outline 
        label="Continue with Github"
        icon={AiFillGithub}
        onClick={() => signIn('github')}
      />
      <div 
        className="
          text-neutral-500 
          text-center 
          mt-4 
          font-light
        "
      >
        <p>Already have an account?
          <span 
            onClick={registerModal.onClose} 
            className="
              text-neutral-800
              cursor-pointer 
              hover:underline
            "
            > Log in</span>
        </p>
      </div>
    </div>
  )

  return (
    <Modal
      disabled={isLoading}
      isOpen={registerModal.isOpen}
      title="Register"
      actionLabel="Continue"
      onClose={registerModal.onClose}
      onSubmit={handleSubmit(onSubmit)}
      body={bodyContent}
      footer={footerContent}
    />
  );
}

export default RegisterModal;