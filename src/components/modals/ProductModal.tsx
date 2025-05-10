'use client';

import React, { useState } from 'react';
import { Plus, X, ChevronDown, ChevronLeft, ChevronRight } from 'lucide-react';
import Modal from './Modal';
import { useForm, FieldValues } from 'react-hook-form';
import { CldUploadWidget } from "next-cloudinary";
import Image from "next/image";
import Input from '@/components/inputs/Input';

declare global {
  var cloudinary: any
}

const uploadPreset = "cs0am6m7";

interface ProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (product: {
    name: string;
    price: number;
    compareAtPrice?: number;
    description: string;
    category: string;
    inventory: number;
    lowStockThreshold: number;
    sizes: string[];
    images: string[];
    sku?: string;
    barcode?: string;
  }) => void;
}

// Custom Image Upload Component
const ProductImageUpload = ({ 
  value,
  onChange,
  index
}: { 
  value: string;
  onChange: (value: string) => void;
  index: number;
}) => {
  const handleUpload = (result: any) => {
    onChange(result.info.secure_url);
  };

  return (
    <CldUploadWidget 
      onUpload={handleUpload} 
      uploadPreset={uploadPreset}
      options={{
        maxFiles: 1
      }}
    >
      {({ open }) => {
        return (
          <div className="relative">
            <div 
              onClick={() => open?.()}
              className={`
                relative
                cursor-pointer
                hover:opacity-70
                border-2
                border-dashed
                border-neutral-300
                rounded-xl
                flex
                flex-col
                justify-center
                items-center
                transition
                p-8
                aspect-square
              `}
            >
              {!value && (
                <div className="flex flex-col items-center">
                  <div className="w-8 h-8 text-neutral-400 mb-2" >
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" color="currentColor" fill="none">
    <path d="M3 16L7.46967 11.5303C7.80923 11.1908 8.26978 11 8.75 11C9.23022 11 9.69077 11.1908 10.0303 11.5303L14 15.5M15.5 17L14 15.5M21 16L18.5303 13.5303C18.1908 13.1908 17.7302 13 17.25 13C16.7698 13 16.3092 13.1908 15.9697 13.5303L14 15.5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"></path>
    <path d="M15.5 8C15.7761 8 16 7.77614 16 7.5C16 7.22386 15.7761 7 15.5 7M15.5 8C15.2239 8 15 7.77614 15 7.5C15 7.22386 15.2239 7 15.5 7M15.5 8V7" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"></path>
    <path d="M3.69797 19.7472C2.5 18.3446 2.5 16.2297 2.5 12C2.5 7.77027 2.5 5.6554 3.69797 4.25276C3.86808 4.05358 4.05358 3.86808 4.25276 3.69797C5.6554 2.5 7.77027 2.5 12 2.5C16.2297 2.5 18.3446 2.5 19.7472 3.69797C19.9464 3.86808 20.1319 4.05358 20.302 4.25276C21.5 5.6554 21.5 7.77027 21.5 12C21.5 16.2297 21.5 18.3446 20.302 19.7472C20.1319 19.9464 19.9464 20.1319 19.7472 20.302C18.3446 21.5 16.2297 21.5 12 21.5C7.77027 21.5 5.6554 21.5 4.25276 20.302C4.05358 20.1319 3.86808 19.9464 3.69797 19.7472Z" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"></path>
</svg>
</div>
                  <div className="text-xs text-neutral-500">Add Product</div>
            
                </div>
              )}
              
              {value && (
                <div className="absolute inset-0 w-full h-full rounded-xl overflow-hidden">
                  <Image
                    fill 
                    style={{ objectFit: 'cover' }} 
                    src={value} 
                    alt={`Product image ${index + 1}`} 
                  />
                </div>
              )}
            </div>
            {value && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onChange('');
                }}
                className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 shadow-lg z-10 hover:bg-red-600"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        ) 
      }}
    </CldUploadWidget>
  );
};

const ProductModal: React.FC<ProductModalProps> = ({
  isOpen,
  onClose,
  onSubmit
}) => {
  const [productImages, setProductImages] = useState<string[]>(['', '', '']);
  const [sizes, setSizes] = useState<string[]>([]);
  const [currentSize, setCurrentSize] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);

  const { 
    register, 
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
    reset,
    trigger
  } = useForm<FieldValues>({
    defaultValues: {
      name: '',
      price: '',
      compareAtPrice: '',
      description: '',
      category: '',
      inventory: '',
      lowStockThreshold: '5',
      sku: '',
      barcode: '',
    }
  });

  const handleImageChange = (value: string, index: number) => {
    const newImages = [...productImages];
    newImages[index] = value;
    setProductImages(newImages);
  };

  const handleAddSize = () => {
    if (currentSize.trim() && !sizes.includes(currentSize.trim())) {
      setSizes(prev => [...prev, currentSize.trim()]);
      setCurrentSize('');
    }
  };

  const handleRemoveSize = (sizeToRemove: string) => {
    setSizes(prev => prev.filter(size => size !== sizeToRemove));
  };

  const handleNextStep = async () => {
    // Validate the fields for step 1
    const isValid = await trigger(['name', 'price', 'description', 'category']);
    if (isValid) {
      setCurrentStep(2);
    }
  };

  const handlePreviousStep = () => {
    setCurrentStep(1);
  };

  const onFormSubmit = (data: FieldValues) => {
    // Check if at least one image is uploaded
    const uploadedImages = productImages.filter(img => img !== '');
    if (uploadedImages.length === 0) {
      alert('Please upload at least one product image');
      return;
    }

    onSubmit({
      name: data.name,
      price: parseFloat(data.price),
      compareAtPrice: data.compareAtPrice ? parseFloat(data.compareAtPrice) : undefined,
      description: data.description,
      category: data.category,
      inventory: parseInt(data.inventory || '0'),
      lowStockThreshold: parseInt(data.lowStockThreshold || '5'),
      sizes,
      images: uploadedImages,
      sku: data.sku || undefined,
      barcode: data.barcode || undefined,
    });

    // Reset form
    reset();
    setProductImages(['', '', '']);
    setSizes([]);
    setCurrentSize('');
    setCurrentStep(1);
    onClose();
  };

  const handleClose = () => {
    // Reset everything when closing
    reset();
    setProductImages(['', '', '']);
    setSizes([]);
    setCurrentSize('');
    setCurrentStep(1);
    onClose();
  };

  // Step 1: Basic Details
  const detailsContent = (
    <div className="flex flex-col gap-3">
      <Input
        id="name"
        label="Product Name"
        disabled={isLoading}
        register={register}
        errors={errors}
        required
      />

      <div className="grid grid-cols-2 gap-4">
        <Input
          id="price"
          label="Price"
          type="number"
          disabled={isLoading}
          register={register}
          errors={errors}
          required
        />

        <Input
          id="compareAtPrice"
          label="Compare at Price"
          type="number"
          disabled={isLoading}
          register={register}
          errors={errors}
        />
      </div>

      <Input
        id="description"
        label="Product Description"
        disabled={isLoading}
        register={register}
        errors={errors}
        required
      

      />

      <div className="space-y-2">
        <label className="block text-sm font-medium text-neutral-700">
          Category
        </label>
        <div className="relative">
          <select
            {...register('category', { required: true })}
            className={`
              w-full 
              rounded-md 
              px-6 
              py-4
              font-light 
              bg-white 
              border
              transition 
              disabled:opacity-70 
              disabled:cursor-not-allowed
              appearance-none
              ${errors.category ? 'border-rose-500 focus:border-rose-500' : 'border-neutral-300 focus:border-neutral-900'}
            `}
          >
            <option value="">Select Category</option>
            <option value="clothing">Clothing</option>
            <option value="accessories">Accessories</option>
            <option value="electronics">Electronics</option>
            <option value="home">Home & Garden</option>
            <option value="beauty">Beauty & Personal Care</option>
            <option value="sports">Sports & Outdoors</option>
            <option value="toys">Toys & Games</option>
            <option value="books">Books & Media</option>
          </select>
          <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
            <ChevronDown className="w-5 h-5 text-neutral-400" />
          </div>
        </div>
      </div>
    </div>
  );

  // Step 2: Images and Inventory
  const imagesInventoryContent = (
    <div className="flex flex-col gap-6">
      {/* Image Upload Section */}
      <div>
        <label className="block text-sm font-medium text-neutral-700 mb-2">
          Product Images*
        </label>
        <div className="grid grid-cols-3 gap-4">
          {productImages.map((image, index) => (
            <ProductImageUpload
              key={index}
              value={image}
              onChange={(value) => handleImageChange(value, index)}
              index={index}
            />
          ))}
        </div>
      </div>

      {/* Inventory Section */}
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <Input
            id="inventory"
            label="Inventory"
            type="number"
            disabled={isLoading}
            register={register}
            errors={errors}
          />

          <Input
            id="lowStockThreshold"
            label="Low Stock Alert"
            type="number"
            disabled={isLoading}
            register={register}
            errors={errors}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Input
            id="sku"
            label="SKU (optional)"
            disabled={isLoading}
            register={register}
            errors={errors}
          />

          <Input
            id="barcode"
            label="Barcode (optional)"
            disabled={isLoading}
            register={register}
            errors={errors}
          />
        </div>

        {/* Sizes Input */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-neutral-700">
            Sizes
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              value={currentSize}
              onChange={(e) => setCurrentSize(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleAddSize();
                }
              }}
              placeholder="Add Size (e.g., S, M, L)"
              className={`
                flex-1
                rounded-md 
                px-6 
                py-4
                font-light 
                bg-white 
                border
                transition 
                disabled:opacity-70 
                disabled:cursor-not-allowed
                border-neutral-300 focus:border-neutral-900
              `}
            />
            <button
              onClick={handleAddSize}
              type="button"
              className="
                px-6
                py-4
                rounded-md 
                bg-blue-500 
                text-white 
                hover:bg-blue-600 
                transition-colors
                flex 
                items-center 
                justify-center
              "
            >
              <Plus className="w-5 h-5" />
            </button>
          </div>

          {/* Sizes Display */}
          {sizes.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-3">
              {sizes.map((size) => (
                <div 
                  key={size} 
                  className="
                    bg-neutral-100 
                    px-3 
                    py-1 
                    rounded-full 
                    flex 
                    items-center 
                    space-x-2
                    text-sm
                  "
                >
                  <span>{size}</span>
                  <button 
                    onClick={() => handleRemoveSize(size)}
                    className="text-red-500 hover:text-red-600"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );

  const bodyContent = (
    <div className="flex flex-col gap-6">
      {/* Step Title */}
      <div>
        <h2 className="text-2xl font-bold text-neutral-800">
          {currentStep === 1 ? 'Product Details' : 'Images & Inventory'}
        </h2>
        <p className="font-light text-neutral-600 mt-2">
          {currentStep === 1 
            ? 'Enter basic information about your product' 
            : 'Add images and set inventory details'}
        </p>
      </div>

      {/* Step Content */}
      {currentStep === 1 ? detailsContent : imagesInventoryContent}
    </div>
  );

  // Determine action labels
  const actionLabel = currentStep === 2 ? 'Add Product' : 'Next';
  const secondaryActionLabel = currentStep === 2 ? 'Back' : undefined;

  return (
    <Modal
      id="product-modal"
      modalContentId="product-modal-content"
      isOpen={isOpen}
      onClose={handleClose}
      onSubmit={currentStep === 2 ? handleSubmit(onFormSubmit) : handleNextStep}
      actionLabel={actionLabel}
      actionId={currentStep === 2 ? "add-product-button" : "next-button"}
      secondaryActionLabel={secondaryActionLabel}
      secondaryAction={currentStep === 2 ? handlePreviousStep : undefined}
      body={bodyContent}
      className="w-full md:w-3/6 lg:w-2/6 xl:w-2/5"
      disabled={isLoading}
    />
  );
};

export default ProductModal;