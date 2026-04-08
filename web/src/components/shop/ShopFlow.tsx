'use client';

import { useState, useCallback, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { FieldValues, FormProvider, SubmitHandler, useForm } from 'react-hook-form';
import { toast } from 'react-hot-toast';
import axios from 'axios';
import { AnimatePresence } from 'framer-motion';

import TypeformStep from '../registration/TypeformStep';
import TypeformProgress from '../registration/TypeformProgress';
import TypeformNavigation from '../registration/TypeformNavigation';

import CategoryStep from '../listing/steps/CategoryStep';
import ShopDetailsStep from './steps/ShopDetailsStep';
import ShopLocationStep from './steps/ShopLocationStep';
import ShopProductsStep from './steps/ShopProductsStep';
import ShopProductFormStep from './steps/ShopProductFormStep';
import ShopSettingsStep from './steps/ShopSettingsStep';

import { SafeShop } from '@/app/types';

interface ProductData {
  name: string;
  price?: number;
  description?: string;
  category?: string;
  sizes?: string[];
  images?: string[];
  image?: string;
}

enum STEPS {
  CATEGORY = 0,
  DETAILS = 1,
  LOCATION = 2,
  PRODUCTS = 3,
  PRODUCT_FORM = 4,
  SETTINGS = 5,
}

interface ShopFlowProps {
  mode?: 'create' | 'edit';
  shopId?: string;
  initialData?: SafeShop;
}

export default function ShopFlow({ mode = 'create', shopId, initialData }: ShopFlowProps) {
  const isEditMode = mode === 'edit' && !!initialData;
  const router = useRouter();

  const [step, setStep] = useState<STEPS>(STEPS.CATEGORY);
  const [direction, setDirection] = useState<1 | -1>(1);
  const [isLoading, setIsLoading] = useState(false);
  const [products, setProducts] = useState<ProductData[]>(() => {
    if (isEditMode && Array.isArray((initialData as any)?.products)) {
      return (initialData as any).products.map((p: any) => {
        const img = p.mainImage || p.image || '';
        const categoryName = typeof p.category === 'object' ? p.category?.name : (p.category ?? '');
        return {
          name: p.name,
          price: p.price,
          image: img,
          description: p.description ?? '',
          category: categoryName,
          sizes: Array.isArray(p.sizes) ? p.sizes : [],
          images: img ? [img, ...(p.galleryImages || [])] : Array.isArray(p.images) ? p.images : [],
        };
      });
    }
    return [];
  });
  const [editingProductIndex, setEditingProductIndex] = useState<number | null>(null);

  const methods = useForm<FieldValues>({
    defaultValues: {
      category: initialData?.category || '',
      name: initialData?.name || '',
      description: initialData?.description || '',
      logo: initialData?.logo || '',
      coverImage: initialData?.coverImage || '',
      storeUrl: initialData?.storeUrl || '',
      location: initialData?.location || '',
      address: initialData?.address || '',
      zipCode: initialData?.zipCode || '',
      isOnlineOnly: initialData?.isOnlineOnly || false,
      galleryImages: initialData?.galleryImages || [],
      shopEnabled: initialData?.shopEnabled !== undefined ? initialData.shopEnabled : true,
      listingId: initialData?.listingId || null,
    },
  });

  const { watch, setValue, handleSubmit, setError, clearErrors, formState: { errors } } = methods;

  const category = watch('category');
  const logo = watch('logo');
  const name = watch('name');
  const description = watch('description');
  const location = watch('location');
  const address = watch('address');
  const zipCode = watch('zipCode');
  const isOnlineOnly = watch('isOnlineOnly');
  const shopEnabled = watch('shopEnabled');

  const setCustomValue = useCallback((id: string, value: any) => {
    setValue(id, value ?? '', {
      shouldDirty: true,
      shouldTouch: true,
      shouldValidate: true,
    });
  }, [setValue]);

  // Location handlers
  const handleLocationChange = useCallback((loc: string) => {
    setValue('location', loc);
    if (loc) clearErrors('location');
  }, [setValue, clearErrors]);

  const handleAddressSelect = useCallback((data: { address: string; zipCode: string; city: string; state: string }) => {
    setValue('address', data.address);
    setValue('zipCode', data.zipCode);
    if (data.city && data.state) {
      setValue('location', `${data.city}, ${data.state}`);
    }
    clearErrors(['address', 'zipCode', 'location']);
  }, [setValue, clearErrors]);

  const handleFieldChange = useCallback((fieldId: string) => {
    clearErrors(fieldId);
  }, [clearErrors]);

  const flowSteps = [STEPS.CATEGORY, STEPS.DETAILS, STEPS.LOCATION, STEPS.PRODUCTS, STEPS.SETTINGS];
  const totalSteps = flowSteps.length;
  const isLastStep = step === STEPS.SETTINGS;
  const isFormStep = step === STEPS.PRODUCT_FORM;
  const currentIndex = flowSteps.indexOf(step);

  const canProceed = useCallback((): boolean => {
    switch (step) {
      case STEPS.CATEGORY:
        return Boolean(category);
      case STEPS.DETAILS:
        return Boolean(logo && name?.trim() && description?.trim());
      case STEPS.LOCATION:
        return isOnlineOnly || Boolean(location && address && zipCode);
      case STEPS.PRODUCTS:
        return true; // Optional
      case STEPS.SETTINGS:
        return true;
      default:
        return true;
    }
  }, [step, category, logo, name, description, isOnlineOnly, location, address, zipCode]);

  const handleNext = useCallback(async () => {
    if (step === STEPS.DETAILS) {
      if (!logo) return toast.error('Please upload a shop logo.');
      if (!name?.trim()) return toast.error('Please enter a shop name.');
      if (!description?.trim()) return toast.error('Please enter a description.');
    }

    if (step === STEPS.LOCATION && !isOnlineOnly) {
      let invalid = false;
      if (!location) { setError('location', { type: 'required', message: 'Location is required' }); invalid = true; }
      if (!address) { setError('address', { type: 'required', message: 'Address is required' }); invalid = true; }
      if (!zipCode) { setError('zipCode', { type: 'required', message: 'ZIP is required' }); invalid = true; }
      if (invalid) return;
    }

    const idx = flowSteps.indexOf(step);
    if (idx < flowSteps.length - 1) {
      setDirection(1);
      setStep(flowSteps[idx + 1]);
    }
  }, [step, logo, name, description, isOnlineOnly, location, address, zipCode, setError, flowSteps]);

  const handleBack = useCallback(() => {
    if (step === STEPS.PRODUCT_FORM) {
      setEditingProductIndex(null);
      setDirection(-1);
      setStep(STEPS.PRODUCTS);
      return;
    }
    const idx = flowSteps.indexOf(step);
    if (idx > 0) {
      setDirection(-1);
      setStep(flowSteps[idx - 1]);
    } else {
      router.push('/shops');
    }
  }, [step, router, flowSteps]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      const isInput = target.tagName === 'INPUT' || target.tagName === 'TEXTAREA';

      // Disable keyboard nav on product form step
      if (step === STEPS.PRODUCT_FORM) return;

      if (e.key === 'Enter' && !e.shiftKey) {
        if (isInput && target.tagName === 'TEXTAREA') return;
        if (canProceed() && !isLoading) {
          e.preventDefault();
          if (isLastStep) {
            handleSubmit(onSubmit)();
          } else {
            handleNext();
          }
        }
      }

      if (e.key === 'Escape') {
        e.preventDefault();
        handleBack();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [canProceed, isLoading, isLastStep, handleNext, handleBack, handleSubmit]);

  const onSubmit: SubmitHandler<FieldValues> = async (data) => {
    if (!isLastStep) {
      handleNext();
      return;
    }

    setIsLoading(true);

    const payload = {
      ...data,
      products,
    };

    try {
      if (isEditMode && shopId) {
        await axios.put(`/api/shops/${shopId}`, payload);
        toast.success('Shop updated successfully!');
      } else {
        await axios.post('/api/shops', payload);
        toast.success('Shop created successfully!');
      }

      router.refresh();
      router.push(isEditMode && shopId ? `/shops/${shopId}` : '/shops');
    } catch (error: any) {
      if (axios.isAxiosError(error) && error.response) {
        toast.error(`Error: ${error.response.data || 'Something went wrong'}`);
      } else {
        toast.error('Something went wrong.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddProduct = () => {
    setEditingProductIndex(null);
    setDirection(1);
    setStep(STEPS.PRODUCT_FORM);
  };

  const handleSaveProduct = (product: ProductData) => {
    if (editingProductIndex !== null) {
      setProducts(prev => prev.map((p, i) => i === editingProductIndex ? product : p));
    } else {
      setProducts(prev => [...prev, product]);
    }
    setEditingProductIndex(null);
    setDirection(-1);
    setStep(STEPS.PRODUCTS);
  };

  const handleExitProductForm = () => {
    setEditingProductIndex(null);
    setDirection(-1);
    setStep(STEPS.PRODUCTS);
  };

  const handleRemoveProduct = (index: number) => {
    setProducts(prev => prev.filter((_, i) => i !== index));
  };

  const renderStep = () => {
    switch (step) {
      case STEPS.CATEGORY:
        return (
          <CategoryStep
            selectedCategory={category}
            onCategoryChange={(cat) => setCustomValue('category', cat)}
          />
        );
      case STEPS.DETAILS:
        return (
          <ShopDetailsStep
            logo={logo}
            onLogoChange={(url) => setCustomValue('logo', url)}
          />
        );
      case STEPS.LOCATION:
        return (
          <ShopLocationStep
            onLocationChange={handleLocationChange}
            onAddressSelect={handleAddressSelect}
            onFieldChange={handleFieldChange}
            onIsOnlineOnlyChange={(val) => setCustomValue('isOnlineOnly', val)}
            isOnlineOnly={isOnlineOnly}
            errors={errors}
          />
        );
      case STEPS.PRODUCTS:
        return (
          <ShopProductsStep
            products={products}
            onAddProduct={handleAddProduct}
            onRemoveProduct={handleRemoveProduct}
          />
        );
      case STEPS.PRODUCT_FORM:
        return (
          <ShopProductFormStep
            onSave={handleSaveProduct}
            onBack={handleExitProductForm}
            initialData={editingProductIndex !== null ? products[editingProductIndex] : null}
          />
        );
      case STEPS.SETTINGS:
        return (
          <ShopSettingsStep
            shopEnabled={shopEnabled}
            onShopEnabledChange={(val) => setCustomValue('shopEnabled', val)}
          />
        );
      default:
        return null;
    }
  };

  return (
    <FormProvider {...methods}>
      <div className="min-h-screen flex flex-col">
        {/* Progress bar */}
        {!isFormStep && (
          <TypeformProgress
            currentStep={currentIndex + 1}
            totalSteps={totalSteps}
          />
        )}

        {/* Main content */}
        <div className="flex-1 flex items-center justify-center px-6 py-12">
          <div className="w-full max-w-2xl">
            <AnimatePresence mode="wait" custom={direction}>
              <TypeformStep key={step} direction={direction}>
                {renderStep()}
              </TypeformStep>
            </AnimatePresence>
          </div>
        </div>

        {/* Navigation */}
        {!isFormStep && (
          <TypeformNavigation
            canProceed={canProceed()}
            showBack={step !== STEPS.CATEGORY}
            isLastStep={isLastStep}
            isLoading={isLoading}
            onNext={isLastStep ? handleSubmit(onSubmit) : handleNext}
            onBack={handleBack}
            submitLabel={isEditMode ? 'Save changes' : 'Create shop'}
            termsNotice={!isEditMode}
          />
        )}
      </div>
    </FormProvider>
  );
}
