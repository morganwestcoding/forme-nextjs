'use client';

import axios from 'axios';
import { toast } from 'react-hot-toast';
import { 
  FieldValues, 
  SubmitHandler, 
  useForm
} from 'react-hook-form';
import { useRouter } from 'next/navigation';
import { useMemo, useState, useCallback, useEffect } from "react";

import useShopModal from '@/app/hooks/useShopModal';
import Modal from "@/components/modals/Modal";
import Heading from '@/components/Heading';
import Input from '@/components/inputs/Input';
import ImageUploadGrid from '@/components/inputs/ImageUploadGrid';
import { SafeShop } from '@/app/types';
import SocialLinksInput from '@/components/inputs/SocialLinksInput';
import LocationSelect from '@/components/inputs/LocationSelect';
import Toggle from '@/components/inputs/Toggle';
import TextArea from '@/components/inputs/TextArea';

enum STEPS {
  BASIC_INFO = 0,
  LOCATION = 1,
  IMAGES = 2,
  SOCIAL = 3,
  SETTINGS = 4,
}

// Define a fixed type for social links
const initialSocials: Record<string, string> = {
  instagram: '',
  facebook: '',
  twitter: '',
  tiktok: '',
  youtube: ''
};

const ShopModal = () => {
  const router = useRouter();
  const shopModal = useShopModal();
  const shop = shopModal.shop;
  const isEditMode = !!shop;

  const [isLoading, setIsLoading] = useState(false);
  const [step, setStep] = useState(STEPS.BASIC_INFO);
  
  // Initialize socials as Record<string, string>
  const [socials, setSocials] = useState<Record<string, string>>(initialSocials);

  const { 
    register, 
    handleSubmit,
    setValue,
    watch,
    formState: {
      errors,
    },
    reset,
  } = useForm<FieldValues>({
    defaultValues: {
      name: shop?.name || '',
      description: shop?.description || '',
      location: shop?.location || null,
      logo: shop?.logo || '',
      coverImage: shop?.coverImage || '',
      storeUrl: shop?.storeUrl || '',
      galleryImages: shop?.galleryImages || [],
      shopEnabled: shop?.shopEnabled !== undefined ? shop.shopEnabled : true,
      listingId: shop?.listingId || null,
    }
  });

  useEffect(() => {
    if (shop) {
      Object.entries(shop).forEach(([key, value]) => {
        if (key !== 'socials') {
          setValue(key, value);
        }
      });
      
      // Handle socials separately to ensure proper typing
      if (shop.socials && typeof shop.socials === 'object') {
        // Create a clean copy with only string values
        const cleanSocials: Record<string, string> = {};
        Object.entries(shop.socials as Record<string, string>).forEach(([key, value]) => {
          cleanSocials[key] = value || '';
        });
        setSocials(cleanSocials);
      }
    }
  }, [shop, setValue]);

  const handleClose = useCallback(() => {
    // Reset form to initial values
    reset({
      name: '',
      description: '',
      location: null,
      logo: '',
      coverImage: '',
      storeUrl: '',
      galleryImages: [],
      shopEnabled: true,
      listingId: null,
    });
    
    // Reset all state to initial values
    setStep(STEPS.BASIC_INFO);
    setSocials(initialSocials);

    // Close the modal
    shopModal.onClose();
  }, [reset, shopModal]);

  const name = watch('name');
  const description = watch('description');
  const logo = watch('logo');
  const coverImage = watch('coverImage');
  const location = watch('location');
  const shopEnabled = watch('shopEnabled');
  const galleryImages = watch('galleryImages') || [];

  const setCustomValue = (id: string, value: any) => {
    setValue(id, value, {
      shouldDirty: true,
      shouldTouch: true,
      shouldValidate: true
    });
  }

  const onBack = () => {
    setStep((value) => value - 1);
  }

  const onNext = () => {
    // Validation for each step
    if (step === STEPS.BASIC_INFO && (!name || !description)) {
      return toast.error('Please fill in all required fields.');
    }
    if (step === STEPS.IMAGES && !logo) {
      return toast.error('Shop logo is required.');
    }
    
    setStep((value) => value + 1);
  }

  // Ensure we work with properly typed socials
  const handleSocialsChange = useCallback((newSocials: Record<string, string>) => {
    setSocials(newSocials);
  }, []);

  const handleLocationSubmit = (locationData: {
    state: string;
    city: string;
  } | null) => {
    if (locationData) {
      setValue('location', `${locationData.city}, ${locationData.state}`, { shouldValidate: true });
    }
  };

  const onSubmit: SubmitHandler<FieldValues> = async (data) => {
    if (step !== STEPS.SETTINGS) {
      return onNext();
    }
    
    setIsLoading(true);
    
    // Ensure socials is a valid Record<string, string>
    const cleanedSocials: Record<string, string> = {};
    Object.entries(socials).forEach(([key, value]) => {
      cleanedSocials[key] = value || '';
    });

    const payload = { 
      ...data, 
      socials: cleanedSocials
    };

    try {
      if (isEditMode && shop) {
        await axios.put(`/api/shops/${shop.id}`, payload);
        toast.success('Shop updated successfully!');
      } else {
        await axios.post('/api/shops', payload);
        toast.success('Shop created successfully!');
      }
      
      router.refresh();
      reset();
      setStep(STEPS.BASIC_INFO);
      shopModal.onClose();
      // Redirect to shop dashboard
      router.push('/shop/dashboard');
    } catch (error) {
      toast.error('Something went wrong.');
    } finally {
      setIsLoading(false);
    }
  };

  const actionLabel = useMemo(() => {
    if (step === STEPS.SETTINGS) {
      return isEditMode ? 'Update Shop' : 'Create Shop'
    }
    return 'Next'
  }, [step, isEditMode]);

  const secondaryActionLabel = useMemo(() => {
    if (step === STEPS.BASIC_INFO) {
      return undefined
    }
    return 'Back'
  }, [step]);

  let bodyContent = (
    <div className="flex flex-col gap-6">
      <Heading
        title={isEditMode ? "Edit your shop" : "Create your shop"}
        subtitle="Tell us about your business"
      />
      <Input
        id="name"
        label="Shop Name"
        disabled={isLoading}
        register={register}
        errors={errors}
        required
      />
      <TextArea
        id="description"
        label="Description"
        disabled={isLoading}
        register={register}
        errors={errors}
        required
      />
      <Input
        id="storeUrl"
        label="Store URL (optional)"
        disabled={isLoading}
        register={register}
        errors={errors}
        placeholder="https://example.com"
      />
    </div>
  );

  if (step === STEPS.LOCATION) {
    bodyContent = (
      <div className="flex flex-col gap-6">
        <Heading
          title="Where is your shop located?"
          subtitle="Help customers find you!"
        />
        <LocationSelect
          id="location"
          onLocationSubmit={handleLocationSubmit}
          register={register}
          errors={errors}
        />   
      </div>
    );
  }

  if (step === STEPS.IMAGES) {
    bodyContent = (
      <div className="flex flex-col gap-6">
        <Heading
          title={isEditMode ? "Update your shop images" : "Add photos of your shop"}
          subtitle="Visual branding is important!"
        />
        <div className="space-y-4">
          <ImageUploadGrid
            id="shop-images"
            onChange={(value) => setCustomValue('logo', value)}
            onGalleryChange={(values) => setCustomValue('galleryImages', values)}
            value={logo}
            galleryImages={galleryImages}
          />
        </div>
      </div>
    );
  }

  if (step === STEPS.SOCIAL) {
    bodyContent = (
      <div className="flex flex-col gap-6">
        <Heading
          title="Connect your social media"
          subtitle="Share your online presence"
        />
        <SocialLinksInput 
          value={socials}
          onChange={handleSocialsChange}
        />
      </div>
    );
  }

  if (step === STEPS.SETTINGS) {
    bodyContent = (
      <div className="flex flex-col gap-6">
        <Heading
          title="Shop settings"
          subtitle="Configure your shop preferences"
        />
        <div className="space-y-4">
          <Toggle
            label="Enable shop"
            description="Make your shop visible to customers"
            enabled={shopEnabled}
            onChange={(value) => setCustomValue('shopEnabled', value)}
          />
          
          {isEditMode && shop?.listingId && (
            <div className="p-4 bg-blue-50 rounded-lg">
              <p className="text-sm text-blue-700">
                This shop is connected to a business listing. Changes here may affect your business profile.
              </p>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <Modal
      id="shop-modal"
      modalContentId="modal-content-with-actions"
      disabled={isLoading}
      isOpen={shopModal.isOpen}
      title={isEditMode ? "Edit Shop" : "Create Shop"}
      actionLabel={actionLabel}
      actionId="submit-button"
      onSubmit={handleSubmit(onSubmit)}
      secondaryActionLabel={secondaryActionLabel}
      secondaryAction={step === STEPS.BASIC_INFO ? undefined : onBack}
      onClose={handleClose}
      body={bodyContent}
      className="w-full md:w-4/6 lg:w-3/6 xl:w-2/5"
    />
  );
}

export default ShopModal;