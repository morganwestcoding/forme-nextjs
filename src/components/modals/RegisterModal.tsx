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
import useStripeCheckoutModal, { SubscriptionData } from "@/app/hooks/useStripeCheckoutModal";
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
  const stripeCheckoutModal = useStripeCheckoutModal(); // Add this
  const [isLoading, setIsLoading] = useState(false);
  const [isInSubscriptionDetail, setIsInSubscriptionDetail] = useState(false);
  const [selectedTierName, setSelectedTierName] = useState<string>('');
  const [selectedTierData, setSelectedTierData] = useState<any>(null); // Add this to store tier details

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

  const handleSubscriptionDetailChange = (isInDetail: boolean, tierName?: string, tierData?: any) => {
    console.log('handleSubscriptionDetailChange called:', {
      isInDetail,
      tierName,
      tierData
    });
    setIsInSubscriptionDetail(isInDetail);
    setSelectedTierName(tierName || '');
    setSelectedTierData(tierData || null); // Store the full tier data
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
    
    // Handle subscription selection if in detail view
    if (isInSubscriptionDetail) {
      console.log('In subscription detail view, calling selectCurrentTier');
      // Call the tier select function from the subscription component
      if ((window as any).selectCurrentTier) {
        (window as any).selectCurrentTier();
      }
      return;
    }
    
    console.log('Final step - creating account and handling subscription');
    console.log('Selected tier data:', selectedTierData);
    console.log('Selected tier name:', selectedTierName);
    console.log('Form data:', data);
    
    setIsLoading(true);

    try {
      // First, create the user account
      console.log('Creating user account...');
      const userResponse = await axios.post('/api/register', data);
      const createdUser = userResponse.data;
      
      console.log('User created successfully:', createdUser);
      toast.success('Account created! Proceeding to payment...');

      // Check if a subscription tier was selected
      console.log('Checking subscription tier...');
      console.log('selectedTierData exists:', !!selectedTierData);
      console.log('selectedTierData.price:', selectedTierData?.price);
      
      if (selectedTierData && selectedTierData.price > 0) {
        console.log('Paid subscription detected, preparing Stripe data...');
        
        // Prepare data for Stripe checkout
        const stripeData: SubscriptionData = {
          userId: createdUser.id,
          subscriptionTier: selectedTierName,
          tierPrice: selectedTierData.price,
          tierDuration: selectedTierData.duration || 'monthly', // e.g., 'monthly', 'yearly'
          tierFeatures: selectedTierData.features || [],
          customerName: data.name || '',
          customerEmail: data.email || '',
          // Add any other subscription-related data your Stripe checkout needs
          subscriptionType: 'new_user',
          planId: selectedTierData.planId || selectedTierName.toLowerCase(),
        };

        console.log('Opening Stripe checkout with subscription data:', stripeData);

        // Close the registration modal first
        handleClose();

        // Small delay to ensure modal closes before opening Stripe
        setTimeout(() => {
          console.log('Calling stripeCheckoutModal.onOpen for subscription');
          stripeCheckoutModal.onOpen(stripeData, 'subscription');
        }, 100);

      } else {
        // No paid subscription selected, complete registration normally
        console.log('Free tier selected or no subscription, completing registration');
        setStep(STEPS.ACCOUNT);
        registerModal.onClose();
        loginModal.onOpen();
      }

    } catch (error: any) {
      console.error('Error during registration:', error);
      
      let errorMessage = 'Something went wrong!';
      
      if (error.response?.data) {
        errorMessage = error.response.data;
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }

  const onToggle = useCallback(() => {
    registerModal.onClose();
    loginModal.onOpen();
  }, [registerModal, loginModal])

  // Reset state when modal closes
  const handleClose = useCallback(() => {
    setStep(STEPS.ACCOUNT);
    setIsInSubscriptionDetail(false);
    setSelectedTierName('');
    setSelectedTierData(null);
    registerModal.onClose();
  }, [registerModal]);

  // Determine action label based on current state
  const getActionLabel = () => {
    if (step === STEPS.SUBSCRIPTION) {
      if (isInSubscriptionDetail) {
        // Show different labels based on whether it's a paid tier
        if (selectedTierData && selectedTierData.price > 0) {
          return `Subscribe to ${selectedTierName}`;
        }
        return `Choose ${selectedTierName}`;
      }
      return "Create Account";
    }
    return "Continue";
  };

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
        
        {/* Debug info - remove this in production */}
        {process.env.NODE_ENV === 'development' && (
          <div className="mb-4 p-3 bg-gray-100 rounded text-xs">
            <div>Debug Info:</div>
            <div>isInSubscriptionDetail: {isInSubscriptionDetail.toString()}</div>
            <div>selectedTierName: {selectedTierName}</div>
            <div>selectedTierData: {selectedTierData ? JSON.stringify(selectedTierData, null, 2) : 'null'}</div>
          </div>
        )}
        
        <SubscriptionInput
          onChange={(value) => setCustomValue('subscription', value)}
          value={watch('subscription')}
          onDetailStateChange={handleSubscriptionDetailChange}
        />
        
        {/* Show subscription summary if a tier is selected */}
        {selectedTierData && isInSubscriptionDetail && (
          <div className="bg-blue-50 rounded-xl p-4 border border-blue-200 mt-4">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm font-medium text-blue-900">
                  {selectedTierName} Plan
                </p>
                <p className="text-xs text-blue-700">
                  {selectedTierData.duration || 'Monthly'} billing
                </p>
              </div>
              <div className="text-right">
                <p className="text-lg font-bold text-blue-600">
                  ${selectedTierData.price}
                  <span className="text-xs font-normal">
                    /{selectedTierData.duration === 'yearly' ? 'year' : 'month'}
                  </span>
                </p>
              </div>
            </div>
            {selectedTierData.features && selectedTierData.features.length > 0 && (
              <div className="mt-3 pt-3 border-t border-blue-200">
                <p className="text-xs text-blue-700 mb-2">Included features:</p>
                <ul className="text-xs text-blue-600 space-y-1">
                  {selectedTierData.features.slice(0, 3).map((feature: string, index: number) => (
                    <li key={index} className="flex items-center gap-2">
                      <svg className="w-3 h-3 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                      {feature}
                    </li>
                  ))}
                  {selectedTierData.features.length > 3 && (
                    <li className="text-blue-500">
                      +{selectedTierData.features.length - 3} more features
                    </li>
                  )}
                </ul>
              </div>
            )}
          </div>
        )}
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
      actionLabel={getActionLabel()}
      secondaryAction={step !== STEPS.ACCOUNT ? onBack : undefined}
      secondaryActionLabel={step !== STEPS.ACCOUNT ? "Back" : undefined}
      onClose={handleClose} // Use the updated handleClose function
      onSubmit={handleSubmit(onSubmit)}
      body={bodyContent}
      footer={footerContent}
    />
  );
}

export default RegisterModal;