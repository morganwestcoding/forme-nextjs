'use client';
import ModalButton from "./ModalButton";
import axios from "axios";
import { AiFillGithub } from "react-icons/ai";
import { signIn } from "next-auth/react";
import { FcGoogle } from "react-icons/fc";
import { useCallback, useState } from "react";
import { toast } from "react-hot-toast";
import SubscriptionInput from "../inputs/SubscriptionInput";
import { 
  FieldValues, 
  SubmitHandler,
  useForm
} from "react-hook-form";
import useLoginModal from "@/app/hooks/useLoginModal";
import useRegisterModal from "@/app/hooks/useRegisterModal";
import ImageUpload from "../inputs/ImageUpload";
import Modal from "./Modal";
import Input from "../inputs/Input";
import Heading from "../Heading";
import ProfileLocationInput from "../inputs/ProfileLocationInput";
import Logo from "../header/Logo";

enum STEPS {
  ACCOUNT = 0,
  LOCATION = 1,
  BIOGRAPHY = 2,
  IMAGES = 3,
  SUBSCRIPTION = 4
}

const RegisterModal= () => {
  const [step, setStep] = useState(STEPS.ACCOUNT);
  const registerModal = useRegisterModal();
  const loginModal = useLoginModal();
  const [isLoading, setIsLoading] = useState(false);

  const { 
    register, 
    handleSubmit,
    setValue,
    watch,
    formState: {
      errors,
    },
  } = useForm<FieldValues>({
    defaultValues: {
      name: '',
      email: '',
      password: '',
      location: '',
      bio: '',
      image: '',
      imageSrc: '',
      subscription: ''
    },
  });

  const location = watch('location');
  const category = watch('category');
  const image = watch('image');
  const imageSrc = watch('imageSrc');

  const setCustomValue = (id: string, value: any) => {
    setValue(id, value, {
      shouldDirty: true,
      shouldTouch: true,
      shouldValidate: true
    })
  }

  const onNext = () => {
    setStep((currentStep) => currentStep + 1);
  };

  const onBack = () => {
    setStep((currentStep) => currentStep - 1);
  };

  const validatePassword = (password: string) => {
    return {
      hasMinLength: password.length >= 6,
      hasMaxLength: password.length <= 18,
      hasUpperCase: /[A-Z]/.test(password),
      hasLowerCase: /[a-z]/.test(password),
      hasNumber: /[0-9]/.test(password),
      hasSpecialChar: /[!@#$%^&*(),]/.test(password)
    };
  };

  const onSubmit: SubmitHandler<FieldValues> = async (data) => {
    if (step !== STEPS.SUBSCRIPTION) {
      if (step === STEPS.ACCOUNT) {
        // Validate password
        const passwordValidation = validatePassword(data.password);
        
        if (!Object.values(passwordValidation).every(Boolean)) {
          toast.error('Password does not meet requirements');
          return;
        }

        // Check if email exists
        try {
          const response = await axios.get(`/api/check-email?email=${data.email}`);
          
          if (response.data.exists) {
            toast.error('Email already exists');
            return;
          }
        } catch (error) {
          toast.error('Error checking email');
          return;
        }
      }
      
      return onNext();
    }
    
    setIsLoading(true);

    axios.post('/api/register', data)
    .then(() => {
      toast.success('Registered!');
      setStep(STEPS.ACCOUNT);
      registerModal.onClose();
      loginModal.onOpen();
    })
    .catch((error: any) => {
      let errorMessage = 'Something went wrong!';
      
      if (error.response?.data) {
        errorMessage = error.response.data;
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      toast.error(errorMessage);
    })
    .finally(() => {
      setIsLoading(false);
    });
  }

  const onToggle = useCallback(() => {
    registerModal.onClose();
    loginModal.onOpen();
  }, [registerModal, loginModal])

  let bodyContent = (
    <div className="flex flex-col gap-4">
      <Heading
        title="Welcome to ForMe"
        subtitle="Create an account!"
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
      <Input
        id="name"
        label="Name"
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
        showPasswordValidation={true}
        required
      />
    </div>
  );

  if (step === STEPS.LOCATION) {
    bodyContent = (
      <div className="flex flex-col gap-8">
        <Heading
          title="Where are you located?"
          subtitle="This helps us show you the best experiences near you."
        />
        <ProfileLocationInput
          onLocationSubmit={(value) => setValue('location', value)}
        />  
      </div>
    );
  }

  if (step === STEPS.BIOGRAPHY) {
    bodyContent = (
      <div className="flex flex-col gap-8">
        <Heading
          title="Tell us about yourself"
          subtitle="What makes you unique?"
        />
      <Input
        id="bio"
        label="Tell Us About You..."
        disabled={isLoading}
        register={register}
        errors={errors}
        required
        maxLength={200}
        type="textarea"
      />
      </div>
    )
  }

  if (step === STEPS.IMAGES) {
    bodyContent = (
      <div className="flex flex-col gap-8">
        <Heading
          title="Add your profile images"
          subtitle="Make your profile stand out!"
        />
        <div className="grid grid-cols-2">
          <div className="flex flex-col items-center gap-3">
            <div className="w-full flex flex-col items-center">
              <ImageUpload
                onChange={(value) => setCustomValue('image', value)}
                value={image}
                className="rounded-full bg-slate-50 w-56 h-32 overflow-hidden"
              />
              <label className="mt-4 text-neutral-500 text-sm font-light">
                Profile Picture
              </label>
            </div>
          </div>
          <div className="flex flex-col items-center gap-3">
            <div className="w-full flex flex-col items-center">
              <ImageUpload
                onChange={(value) => setCustomValue('imageSrc', value)}
                value={imageSrc}
                className="rounded-lg bg-slate-50 h-32 w-56 aspect-video overflow-hidden"
              />
              <label className="mt-4 text-neutral-500 font-light text-sm">
                Profile Background
              </label>
            </div>
          </div>
        </div>
      </div>
    )
  };

  if (step === STEPS.SUBSCRIPTION) {
    bodyContent = (
      <div className="flex flex-col">
        <Heading
          title="Choose your subscription"
          subtitle="Select the plan that best fits your needs"
        />
        <SubscriptionInput
          onChange={(value) => setCustomValue('subscription', value)}
          value={watch('subscription')}
        />
      </div>
    )
  }

  const footerContent = (
    <div className="flex flex-col gap-4 mt-3">
      <hr />
      <div 
        className="
          text-black
          text-center 
          mt-4 
          font-light
        "
      >
        <p>Already have an account?
          <span 
            onClick={onToggle} 
            className="
              text-neutral-500
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
     backdropVideo="/videos/modal-bg.mp4"
    disabled={isLoading}
    isOpen={registerModal.isOpen}
    title="Register"
    actionLabel={step === STEPS.SUBSCRIPTION ? "Create" : "Continue"}
    secondaryAction={step !== STEPS.ACCOUNT ? onBack : undefined}
    secondaryActionLabel={step !== STEPS.ACCOUNT ? "Back" : undefined}
    onClose={registerModal.onClose}
    onSubmit={handleSubmit(onSubmit)}
    body={bodyContent}
    footer={footerContent}
    />
  );
}

export default RegisterModal;