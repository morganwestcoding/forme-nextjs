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
import ProductModal from "@/components/modals/ProductModal";
import Heading from '@/components/Heading';
import Input from '@/components/inputs/Input';
import ImageUpload from '@/components/inputs/ImageUpload';
import { SafeShop } from '@/app/types';
import SocialLinksInput from '@/components/inputs/SocialLinksInput';
import LocationSelect from '@/components/inputs/LocationSelect';
import ShopLocationInput from '@/components/inputs/ShopLocationInput';
import Toggle from '@/components/inputs/Toggle';
import TextArea from '@/components/inputs/TextArea';
import CategoryInput from '@/components/inputs/CategoryInput';
import { categories } from '@/components/Categories';
import { Plus, X } from 'lucide-react';

enum STEPS {
  CATEGORY = 0,
  BASIC_INFO = 1,
  IMAGES = 2,      // Added IMAGES step
  LOCATION = 3,    // Incremented from 2
  PRODUCTS = 4,    // Incremented from 3
  SOCIAL = 5,      // Incremented from 4
  SETTINGS = 6,    // Incremented from 5
}

// Define a fixed type for social links
const initialSocials: Record<string, string> = {
  instagram: '',
  facebook: '',
  twitter: '',
  tiktok: '',
  youtube: ''
};

interface ProductData {
  name: string;
  price: number;
  description: string;
  category: string;
  sizes: string[];
  images: string[]; // Changed from File[] to string[]
}

const ShopModal = () => {
  const router = useRouter();
  const shopModal = useShopModal();
  const shop = shopModal.shop;
  const isEditMode = !!shop;

  const [isLoading, setIsLoading] = useState(false);
  const [step, setStep] = useState(STEPS.CATEGORY);
  
  // Initialize socials as Record<string, string>
  const [socials, setSocials] = useState<Record<string, string>>(initialSocials);
  const [products, setProducts] = useState<ProductData[]>([]);
  const [showProductModal, setShowProductModal] = useState(false);

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
      category: '',  // Since SafeShop doesn't have category, initialize as empty
      name: shop?.name || '',
      description: shop?.description || '',
      location: shop?.location || null,
      address: shop?.address || '',
      zipCode: shop?.zipCode || '',
      isOnlineOnly: shop?.isOnlineOnly || false,
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
      
      // If we're editing a shop that doesn't have a category yet, 
      // make sure we don't break the form by providing a default empty string
      if (!shop.category) {
        setValue('category', '');
      }
      
      // Load existing products if available (temporarily removed until we update types)
      // if (shop.products) {
      //   setProducts(shop.products);
      // }
    }
  }, [shop, setValue]);

  const handleClose = useCallback(() => {
    // Reset form to initial values
    reset({
      category: '',
      name: '',
      description: '',
      location: null,
      address: '',
      zipCode: '',
      isOnlineOnly: false,
      logo: '',
      coverImage: '',
      storeUrl: '',
      galleryImages: [],
      shopEnabled: true,
      listingId: null,
    });
    
    // Reset all state to initial values
    setStep(STEPS.CATEGORY);
    setSocials(initialSocials);
    setProducts([]);

    // Close the modal
    shopModal.onClose();
  }, [reset, shopModal]);

  const category = watch('category');
  const name = watch('name');
  const description = watch('description');
  const address = watch('address');
  const zipCode = watch('zipCode');
  const isOnlineOnly = watch('isOnlineOnly');
  const shopEnabled = watch('shopEnabled');
  const location = watch('location');
  const logo = watch('logo');
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
    if (step === STEPS.CATEGORY && !category) {
      return toast.error('Please select a category.');
    }
    if (step === STEPS.BASIC_INFO && (!name || !description)) {
      return toast.error('Please fill in all required fields.');
    }
    if (step === STEPS.IMAGES && !logo) {
      return toast.error('Please upload a shop logo.');
    }
    if (step === STEPS.LOCATION && !isOnlineOnly && (!address || !zipCode)) {
      return toast.error('Please fill in all location fields or select online-only option.');
    }

    
    setStep((value) => value + 1);
  }

  // Ensure we work with properly typed socials
  const handleSocialsChange = useCallback((newSocials: Record<string, string>) => {
    setSocials(newSocials);
  }, []);

  const handleAddProduct = (product: ProductData) => {
    setProducts(prev => [...prev, product]);
    setShowProductModal(false);
  };

  const handleRemoveProduct = (index: number) => {
    setProducts(prev => prev.filter((_, i) => i !== index));
  };

  const handleLocationSubmit = (locationData: {
    state: string;
    city: string;
    address: string;
    zipCode: string;
    isOnlineOnly: boolean;
    coordinates?: {
      lat: number;
      lng: number;
    };
  } | null) => {
    if (locationData) {
      setValue('location', locationData.isOnlineOnly ? 'Online Shop' : `${locationData.city}, ${locationData.state}`, { shouldValidate: true });
      setValue('address', locationData.address, { shouldValidate: true });
      setValue('zipCode', locationData.zipCode, { shouldValidate: true });
      setValue('isOnlineOnly', locationData.isOnlineOnly, { shouldValidate: true });
      
      // If there are coordinates, we might want to save them too
      if (locationData.coordinates) {
        setValue('coordinates', locationData.coordinates, { shouldValidate: true });
      }
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

    // Make sure we're including the category in our payload
    const payload = { 
      ...data, 
      socials: cleanedSocials,
      category: category, // Explicitly include category from the watch variable
      products: products // Products now have string[] for images
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
      setStep(STEPS.CATEGORY);
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
    if (step === STEPS.CATEGORY) {
      return undefined
    }
    return 'Back'
  }, [step]);

  let bodyContent = (
    <div className="flex flex-col gap-3">
      <Heading
        title={isEditMode ? "Edit your establishment" : "Define your establishment"}
        subtitle="Pick a category"
      />
        <div className="grid grid-cols-4 gap-3">
          {categories.slice(0, 4).map((item) => (
            <CategoryInput
              key={item.label}
              onClick={(category) => setCustomValue('category', category)}
              selected={category === item.label}
              label={item.label}
              color={item.color}
            />
          ))}
        </div>
        
        <div className="grid grid-cols-4 gap-3">
          {categories.slice(4).map((item) => (
            <CategoryInput
              key={item.label}
              onClick={(category) => setCustomValue('category', category)}
              selected={category === item.label}
              label={item.label}
              color={item.color}
            />
          ))}
        </div>
    </div>
  );

  if (step === STEPS.BASIC_INFO) {
    bodyContent = (
      <div className="flex flex-col gap-3">
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
        <Input
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
       
        />
      </div>
    );
  }

  if (step === STEPS.IMAGES) {
    bodyContent = (
      <div className="flex flex-col gap-6">
        <Heading
          title="Add Your Shop Logo"
          subtitle="Upload a clear, professional logo that represents your brand"
        />
        <div className="flex flex-col items-center">
          <div className="w-full">
            <ImageUpload
              value={logo}
              onChange={(value) => setCustomValue('logo', value)}
              className="p-20 h-64"
            />
          </div>
        </div>
      </div>
    );
  }

  if (step === STEPS.LOCATION) {
    bodyContent = (
      <div className="flex flex-col gap-6">
        <Heading
          title="Where is your shop located?"
          subtitle="Help customers find you, or select online-only"
        />
        <ShopLocationInput
          id="shop-location"
          onLocationSubmit={handleLocationSubmit}
          register={register}
          errors={errors}
          isOnlineOnly={isOnlineOnly}
          onIsOnlineOnlyChange={(value) => setCustomValue('isOnlineOnly', value)}
        />   
      </div>
    );
  }

  if (step === STEPS.PRODUCTS) {
    bodyContent = (
      <div className="flex flex-col gap-6">
        <Heading
          title="Your Products"
          subtitle="Showcase the items you offer"
        />
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {products.map((product, index) => (
            <div key={index} className="relative h-40 rounded-lg overflow-hidden border border-neutral-200 group">
              <img 
                src={product.images[0] || '/api/placeholder/300/300'} 
                alt={product.name}
                className="object-cover w-full h-full"
              />
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/60 to-transparent p-4">
                <p className="text-white text-sm font-medium">{product.name}</p>
                <p className="text-white/80 text-xs">${product.price}</p>
              </div>
              <button
                onClick={() => handleRemoveProduct(index)}
                className="
                  absolute 
                  top-2 
                  right-2 
                  bg-red-500 
                  text-white 
                  rounded-full 
                  w-8 
                  h-8 
                  flex 
                  items-center 
                  justify-center
                  opacity-0
                  group-hover:opacity-100
                  transition-opacity
                "
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ))}
          
          {/* Add Product Button */}
          <div 
            onClick={() => setShowProductModal(true)}
            className="
              h-40
              rounded-lg 
              border-2 
           
              border-dashed 
              border-neutral-300 
              flex 
              flex-col 
              items-center 
              justify-center 
              cursor-pointer 
              hover:border-neutral-400 
              hover:bg-neutral-50 
              transition
            "
          >
            <Plus className="w-8 h-8 text-neutral-400 mb-2" />
            <span className="text-sm font-medium text-neutral-600">Add Product</span>
          </div>
        </div>
        {products.length === 0 && (
          <div className="text-center text-sm text-neutral-500 mt-4">
            Start by adding your first product
          </div>
        )}
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
    <>
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
        secondaryAction={step === STEPS.CATEGORY ? undefined : onBack}
        onClose={handleClose}
        body={bodyContent}
        className="w-full md:w-4/6 lg:w-3/6 xl:w-2/5"
      />
      
      <ProductModal
        isOpen={showProductModal}
        onClose={() => setShowProductModal(false)}
        onSubmit={handleAddProduct}
      />
    </>
  );
}

export default ShopModal;