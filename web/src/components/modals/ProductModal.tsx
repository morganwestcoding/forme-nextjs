'use client';

import React, { useState } from 'react';
import { Plus, X, ChevronDown } from 'lucide-react';
import Modal from './Modal';
import { useForm, FieldValues, SubmitHandler } from 'react-hook-form';
import { CldUploadWidget } from "next-cloudinary";
import Image from "next/image";
import Input from '@/components/inputs/Input';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { useRouter } from 'next/navigation';

declare global {
  var cloudinary: any
}

const uploadPreset = "cs0am6m7";

// Product data interface
export interface ProductData {
  name: string;
  price?: number;
  description?: string;
  category?: string;
  sizes?: string[];
  images?: string[];
  image?: string;
}

interface ProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (product: ProductData) => void;
  shopId?: string | null;
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
              className="relative cursor-pointer hover:opacity-70 bg-gray-50 border-2 border-dashed border-gray-300 hover:border-gray-400 rounded-2xl flex flex-col justify-center items-center transition"
              style={{ width: '88px', height: '88px' }}
            >
              {!value && (
                <div className="flex flex-col items-center">
                  <svg className="w-6 h-6 text-gray-400 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
                  </svg>
                  <div className="text-xs text-center font-medium text-gray-500">Add photo</div>
                </div>
              )}
              
              {value && (
                <div className="absolute inset-0 w-full h-full rounded-2xl overflow-hidden">
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
  onSubmit,
  shopId
}) => {
  const router = useRouter();
  const [productImages, setProductImages] = useState<string[]>(['', '', '']);
  const [sizes, setSizes] = useState<string[]>([]);
  const [currentSize, setCurrentSize] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  
  const { 
    register, 
    handleSubmit,
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
      inventory: '0',
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

  const onFormSubmit: SubmitHandler<FieldValues> = (data) => {
    if (currentStep !== 2) {
      return handleNextStep();
    }
    
    // Check if at least one image is uploaded
    const uploadedImages = productImages.filter(img => img !== '');
    if (uploadedImages.length === 0) {
      toast.error('Please upload at least one product image');
      return;
    }

    // Create the product data
    const productData: ProductData = {
      name: data.name,
      description: data.description,
      price: parseFloat(data.price),
      category: data.category,
      sizes: sizes,
      images: uploadedImages,
      image: uploadedImages[0] // Set first image as the main image
    };

    // Call the onSubmit prop with the formatted product data
    onSubmit(productData);
    
    // Reset form
    reset();
    setProductImages(['', '', '']);
    setSizes([]);
    setCurrentSize('');
    setCurrentStep(1);
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
              rounded-lg
              px-4
              text-neutral-600
              py-4
              text-sm
              bg-neutral-50
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
        {errors.category && (
          <p className="text-rose-500 text-sm mt-1">Category is required</p>
        )}
      </div>
    </div>
  );

  // Step 2: Images and Inventory
  const imagesInventoryContent = (
    <div className="flex flex-col gap-6">
      {/* Image Upload Section */}
      <div>
        <label className="block text-sm font-medium text-neutral-600 mb-2">
          Product Images
        </label>
        <div className="flex flex-wrap gap-3">
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
          <div className="relative">
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
                w-full
                rounded-md 
                pl-6 
                pr-12
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
                absolute
                right-4
                top-1/2
                -translate-y-1/2
                p-2
                rounded-md
                shadow
                bg-neutral-100
                text-neutral-600
                hover:bg-blue-600 
                transition-colors
                flex 
                items-center 
                justify-center
                font-light
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
      onSubmit={handleSubmit(onFormSubmit)}
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