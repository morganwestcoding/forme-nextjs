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
  IMAGES = 2,
  LOCATION = 3,
  PRODUCTS = 4,
  SETTINGS = 5,
}

// Define initial empty product
const initialProducts: ProductData[] = [];

interface ProductData {
  name: string;
  price?: number; // Make price optional with ?
  description?: string; // Make optional
  category?: string; // Make optional
  sizes?: string[]; // Make optional
  images?: string[]; // Make optional
  image?: string; // Add this field from SafeShop
}

interface ProductInput {
  name: string;
  price?: number;
  description?: string;
  category?: string;
  sizes?: string[];
  images?: string[];
  image?: string;
}


const ShopModal = () => {
  const router = useRouter();
  const shopModal = useShopModal();
  const shop = shopModal.shop;
  const isEditMode = !!shop;

  const [isLoading, setIsLoading] = useState(false);
  const [step, setStep] = useState(STEPS.CATEGORY);
  
  const [products, setProducts] = useState<ProductData[]>(initialProducts);
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
      category: shop?.category || '',
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
        if (key !== 'products') {
          setValue(key, value);
        }
      });
      
      // Load existing products if available
      if (shop.products && Array.isArray(shop.products)) {
        // Convert the shop's products to match ProductData interface
        const shopProducts: ProductData[] = shop.products.map(product => ({
          name: product.name,
          price: product.price,
          image: product.image,
          // Add defaults for required fields
          description: '',
          category: '',
          sizes: [],
          images: product.image ? [product.image] : []
        }));
        
        setProducts(shopProducts);
      }
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
    setProducts(initialProducts);

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
    // Comprehensive validation for each step
    if (step === STEPS.CATEGORY && !category) {
      return toast.error('Please select a category.');
    }
    
    if (step === STEPS.BASIC_INFO) {
      if (!name) {
        return toast.error('Shop name is required.');
      }
      if (!description) {
        return toast.error('Shop description is required.');
      }
    }
    
    if (step === STEPS.IMAGES && !logo) {
      return toast.error('Please upload a shop logo.');
    }
    
    if (step === STEPS.LOCATION) {
      if (!isOnlineOnly) {
        if (!location) {
          return toast.error('Please select a location.');
        }
        if (!address) {
          return toast.error('Address is required for physical shops.');
        }
        if (!zipCode) {
          return toast.error('Zip code is required for physical shops.');
        }
      }
    }
    
    // No specific validation for products or settings as they're optional
    
    setStep((value) => value + 1);
  }

  const handleRemoveProduct = (index: number) => {
    setProducts(prev => prev.filter((_, i) => i !== index));
  };

  const handleLocationSubmit = (locationData: {
    state: string;
    city: string;
    address: string;
    zipCode: string;
    isOnlineOnly: boolean;
  } | null) => {
    if (locationData) {
      setValue('location', locationData.isOnlineOnly ? 'Online Shop' : `${locationData.city}, ${locationData.state}`, { shouldValidate: true });
      setValue('address', locationData.address, { shouldValidate: true });
      setValue('zipCode', locationData.zipCode, { shouldValidate: true });
      setValue('isOnlineOnly', locationData.isOnlineOnly, { shouldValidate: true });
    }
  };

const onSubmit: SubmitHandler<FieldValues> = async (data) => {
  if (step !== STEPS.SETTINGS) {
    return onNext();
  }
  
  setIsLoading(true);

  // Prepare payload with all necessary data
  const payload = { 
    ...data, 
    category: category,
    products: products
  };

  console.log("Submitting shop with products payload:", {
    ...payload,
    productsCount: products.length,
    productSample: products.length > 0 ? products[0] : null
  });

  try {
    if (isEditMode && shop) {
      console.log(`Updating existing shop with ID: ${shop.id}`);
      const response = await axios.put(`/api/shops/${shop.id}`, payload);
      console.log("Update shop response:", response.data);
      toast.success('Shop updated successfully!');
    } else {
      console.log("Creating new shop");
      const response = await axios.post('/api/shops', payload);
      console.log("Create shop response:", response.data);
      
      // Check if products were created
      if (response.data && products.length > 0) {
        if (response.data.products) {
          console.log(`Created ${response.data.products.length} products successfully`);
        } else {
          console.log("No products returned in response. Products might not have been created.");
        }
      }
      
      toast.success('Shop created successfully!');
    }
    
    router.refresh();
    reset();
    setStep(STEPS.CATEGORY);
    shopModal.onClose();
    // Redirect to shop dashboard
    router.push('/shops');
  } catch (error) {
    console.error("Error submitting shop:", error);
    
    if (axios.isAxiosError(error) && error.response) {
      console.error("API response error:", error.response.data);
      toast.error(`Error: ${error.response.data || 'Something went wrong'}`);
    } else {
      toast.error('Something went wrong.');
    }
  } finally {
    setIsLoading(false);
  }
};

const handleAddProduct = (product: ProductData) => {
  console.log("Adding product to shop:", product);
  setProducts(prev => [...prev, product]);
  setShowProductModal(false);
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
      src={(product.images && product.images.length > 0 ? product.images[0] : 
            product.image) || '/api/placeholder/300/300'} 
      alt={product.name}
      className="object-cover w-full h-full"
    />
    <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/60 to-transparent p-4">
      <p className="text-white text-sm font-medium">{product.name}</p>
      <p className="text-white/80 text-xs">${product.price || 0}</p>
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
              shadow
              flex 
              flex-col 
              items-center 
              justify-center 
              cursor-pointer 
              bg-neutral-100
              hover:bg-neutral-200
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