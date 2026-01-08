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
import ShopLocationInput from '@/components/inputs/ShopLocationInput';
import Toggle from '@/components/inputs/Toggle';
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

interface ProductData {
  name: string;
  price?: number;
  description?: string;
  category?: string;
  sizes?: string[];
  images?: string[];
  image?: string;
}

const initialProducts: ProductData[] = [];

const ShopModal = () => {
  const router = useRouter();
  const shopModal = useShopModal();
  const shop = shopModal.shop as SafeShop | undefined;
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
    reset,
    trigger,
    getValues,
    formState: { errors }
  } = useForm<FieldValues>({
    mode: 'onChange',
    reValidateMode: 'onChange',
    /** IMPORTANT: keep values across steps */
    shouldUnregister: false,
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
    },
  });

  useEffect(() => {
    if (!shop) return;

    Object.entries(shop).forEach(([key, value]) => {
      if (key !== 'products') setValue(key, value);
    });

    if (Array.isArray((shop as any).products)) {
      const normalized: ProductData[] = (shop as any).products.map((p: any) => ({
        name: p.name,
        price: p.price,
        image: p.image,
        description: p.description ?? '',
        category: p.category ?? '',
        sizes: Array.isArray(p.sizes) ? p.sizes : [],
        images: p.image ? [p.image] : Array.isArray(p.images) ? p.images : []
      }));
      setProducts(normalized);
    }
  }, [shop, setValue]);

  const setCustomValue = useCallback((id: string, value: any) => {
    setValue(id, value, { shouldDirty: true, shouldTouch: true, shouldValidate: true });
  }, [setValue]);

  const handleClose = useCallback(() => {
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
    setStep(STEPS.CATEGORY);
    setProducts(initialProducts);
    shopModal.onClose();
  }, [reset, shopModal]);

  const category = watch('category');
  const isOnlineOnly = watch('isOnlineOnly');
  const shopEnabled = watch('shopEnabled');
  const logo = watch('logo');

  const onNext = useCallback(async () => {
    switch (step) {
      case STEPS.CATEGORY: {
        const c = getValues('category');
        if (!c) return toast.error('Please select a category.');
        break;
      }
      case STEPS.BASIC_INFO: {
        const ok = await trigger(['name', 'description']);
        if (!ok) return toast.error('Please fill out the required fields.');
        break;
      }
      case STEPS.IMAGES: {
        const logoVal = getValues('logo');
        if (!logoVal) return toast.error('Please upload a shop logo.');
        break;
      }
      case STEPS.LOCATION: {
        const online = getValues('isOnlineOnly') as boolean;
        if (!online) {
          const ok = await trigger(['location', 'address', 'zipCode']);
          if (!ok) return toast.error('Please complete location, address, and zip code.');
        }
        break;
      }
    }
    setStep((s) => s + 1);
  }, [step, trigger, getValues]);

  const onBack = useCallback(() => setStep((s) => s - 1), []);

  const handleLocationSubmit = (locationData: {
    state: string;
    city: string;
    address: string;
    zipCode: string;
    isOnlineOnly: boolean;
  } | null) => {
    if (!locationData) return;
    setValue('location', locationData.isOnlineOnly ? 'Online Shop' : `${locationData.city}, ${locationData.state}`, { shouldValidate: true });
    setValue('address', locationData.address, { shouldValidate: true });
    setValue('zipCode', locationData.zipCode, { shouldValidate: true });
    setValue('isOnlineOnly', locationData.isOnlineOnly, { shouldValidate: true });
  };

  const onSubmit: SubmitHandler<FieldValues> = async (data) => {
    if (step !== STEPS.SETTINGS) {
      await onNext();
      return;
    }

    setIsLoading(true);

    const payload = {
      ...data,
      category: getValues('category'),
      products,
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
      router.push('/shops');
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

  const handleAddProduct = (product: ProductData) => {
    setProducts((prev) => [...prev, product]);
    setShowProductModal(false);
  };

  const handleRemoveProduct = (index: number) => {
    setProducts((prev) => prev.filter((_, i) => i !== index));
  };

  const actionLabel = useMemo(
    () => (step === STEPS.SETTINGS ? (isEditMode ? 'Update Shop' : 'Create Shop') : 'Next'),
    [step, isEditMode]
  );
  const secondaryActionLabel = useMemo(
    () => (step === STEPS.CATEGORY ? undefined : 'Back'),
    [step]
  );

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
            onClick={(cat) => setCustomValue('category', cat)}
            selected={category === item.label}
            label={item.label}
          />
        ))}
      </div>
      <div className="grid grid-cols-4 gap-3">
        {categories.slice(4).map((item) => (
          <CategoryInput
            key={item.label}
            onClick={(cat) => setCustomValue('category', cat)}
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
        <Heading title="Your Products" subtitle="Showcase the items you offer" />
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {products.map((product, index) => {
            const src =
              (product.images && product.images.length > 0 ? product.images[0] : product.image) ||
              '/images/placeholder-300x300.png';
            return (
              <div key={`${product.name}-${index}`} className="relative h-40 rounded-lg overflow-hidden border border-neutral-200 group">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={src}
                  alt={product.name}
                  className="object-cover w-full h-full"
                  loading="lazy"
                />
                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/60 to-transparent p-4">
                  <p className="text-white text-sm font-medium">{product.name}</p>
                  <p className="text-white/80 text-xs">${product.price ?? 0}</p>
                </div>
                <button
                  type="button"
                  onClick={() => handleRemoveProduct(index)}
                  className="
                    absolute top-2 right-2 bg-red-500 text-white rounded-full w-8 h-8
                    flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity
                  "
                  aria-label={`Remove ${product.name}`}
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            );
          })}

          <button
            type="button"
            onClick={() => setShowProductModal(true)}
            className="
              h-40 rounded-lg shadow flex flex-col items-center justify-center cursor-pointer
              bg-neutral-100 hover:bg-neutral-200 transition-colors
            "
          >
            <Plus className="w-8 h-8 text-neutral-400 mb-2" />
            <span className="text-sm font-medium text-neutral-600">Add Product</span>
          </button>
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
        <Heading title="Shop settings" subtitle="Configure your shop preferences" />
        <div className="space-y-4">
          <Toggle
            label="Enable shop"
            description="Make your shop visible to customers"
            enabled={!!shopEnabled}
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
};

export default ShopModal;
