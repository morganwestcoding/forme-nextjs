'use client';

import { useState, useCallback } from 'react';
import { CldUploadWidget, type CldUploadWidgetResults } from 'next-cloudinary';
import { ChevronDown, Plus, X, ArrowLeft } from 'lucide-react';
import { Cancel01Icon } from 'hugeicons-react';
import Image from 'next/image';
import TypeformHeading from '@/components/registration/TypeformHeading';

interface ProductData {
  name: string;
  price?: number;
  description?: string;
  category?: string;
  sizes?: string[];
  images?: string[];
  image?: string;
}

interface ShopProductFormStepProps {
  onSave: (product: ProductData) => void;
  onBack: () => void;
  initialData?: ProductData | null;
}

const UPLOAD_PRESET = 'cs0am6m7';

function ProductImageUpload({
  value,
  onUpload,
  onRemove,
  index,
}: {
  value: string;
  onUpload: (result: CldUploadWidgetResults) => void;
  onRemove: () => void;
  index: number;
}) {
  return (
    <CldUploadWidget
      onSuccess={onUpload}
      uploadPreset={UPLOAD_PRESET}
      options={{
        multiple: false,
        maxFiles: 1,
        sources: ['local', 'camera'],
        resourceType: 'image',
        clientAllowedFormats: ['png', 'jpg', 'jpeg', 'webp'],
        maxImageFileSize: 10_000_000,
        folder: 'uploads/shops/products',
      }}
    >
      {({ open }) => {
        return (
          <div className="relative">
            <div
              onClick={() => open?.()}
              className={`cursor-pointer rounded-2xl overflow-hidden relative transition-all duration-200 flex-shrink-0 ${
                value
                  ? 'hover:opacity-90'
                  : 'border-2 border-dashed border-gray-300 hover:border-gray-400 bg-gray-50'
              }`}
              style={{ width: '175px', height: '175px' }}
            >
              {value ? (
                <Image src={value} alt={`Product ${index + 1}`} fill className="object-cover" />
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-center p-2">
                  <svg className="w-6 h-6 text-gray-400 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
                  </svg>
                  <span className="text-xs font-medium text-gray-500">Add photo</span>
                </div>
              )}
            </div>
            {value && (
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); onRemove(); }}
                className="absolute top-2 right-2 w-7 h-7 bg-black/50 hover:bg-black/70 rounded-full flex items-center justify-center z-10"
              >
                <X className="w-4 h-4 text-white" />
              </button>
            )}
          </div>
        );
      }}
    </CldUploadWidget>
  );
}

export default function ShopProductFormStep({
  onSave,
  onBack,
  initialData,
}: ShopProductFormStepProps) {
  const [name, setName] = useState(initialData?.name || '');
  const [price, setPrice] = useState(initialData?.price?.toString() || '');
  const [description, setDescription] = useState(initialData?.description || '');
  const [category, setCategory] = useState(initialData?.category || '');
  const [images, setImages] = useState<string[]>(initialData?.images || ['', '', '']);
  const [sizes, setSizes] = useState<string[]>(initialData?.sizes || []);
  const [currentSize, setCurrentSize] = useState('');
  const [uploading, setUploading] = useState(false);

  const handleImageUpload = useCallback((result: CldUploadWidgetResults, index: number) => {
    const info = result?.info;
    if (info && typeof info === 'object' && 'secure_url' in info) {
      const publicId = info.public_id;
      let cloudName: string | null = null;
      if (typeof info.secure_url === 'string') {
        const urlMatch = info.secure_url.match(/res\.cloudinary\.com\/([^/]+)/);
        cloudName = urlMatch ? urlMatch[1] : null;
      }
      const finalUrl = publicId && cloudName
        ? `https://res.cloudinary.com/${cloudName}/image/upload/q_auto:good,f_auto,w_400,h_400,c_fill,g_auto/${publicId}`
        : (info.secure_url as string);

      setImages(prev => {
        const next = [...prev];
        next[index] = finalUrl;
        return next;
      });
    }
    setUploading(false);
  }, []);

  const removeImage = (index: number) => {
    setImages(prev => {
      const next = [...prev];
      next[index] = '';
      return next;
    });
  };

  const handleAddSize = () => {
    if (currentSize.trim() && !sizes.includes(currentSize.trim())) {
      setSizes(prev => [...prev, currentSize.trim()]);
      setCurrentSize('');
    }
  };

  const uploadedImages = images.filter(img => img !== '');
  const canSave = name.trim() && price && description.trim() && uploadedImages.length > 0;

  const handleSave = () => {
    if (!canSave) return;
    const product: ProductData = {
      name: name.trim(),
      price: parseFloat(price),
      description: description.trim(),
      category: category || undefined,
      sizes,
      images: uploadedImages,
      image: uploadedImages[0],
    };
    onSave(product);
  };

  return (
    <div className="pb-20">
      <TypeformHeading
        question="Add a product"
        subtitle="Enter your product details"
      />

      <div className="space-y-5">
        {/* Product Images */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Product images
          </label>
          <div className="flex flex-wrap gap-3">
            {images.map((image, index) => (
              <ProductImageUpload
                key={index}
                value={image}
                onUpload={(result) => handleImageUpload(result, index)}
                onRemove={() => removeImage(index)}
                index={index}
              />
            ))}
          </div>
        </div>

        {/* Name & Price */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Product name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-all"
              placeholder="Product name"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Price</label>
            <input
              type="number"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              className="w-full px-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-all"
              placeholder="0.00"
            />
          </div>
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
          <textarea
            rows={3}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full px-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-all resize-none"
            placeholder="Describe your product..."
          />
        </div>

        {/* Category */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
          <div className="relative">
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full px-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-all appearance-none"
            >
              <option value="">Select category</option>
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
              <ChevronDown className="w-5 h-5 text-gray-400" />
            </div>
          </div>
        </div>

        {/* Sizes */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Sizes</label>
          <div className="relative">
            <input
              type="text"
              value={currentSize}
              onChange={(e) => setCurrentSize(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleAddSize(); } }}
              placeholder="Add size (e.g., S, M, L)"
              className="w-full px-4 pr-12 py-3.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-all"
            />
            <button
              type="button"
              onClick={handleAddSize}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 rounded-lg bg-gray-200 hover:bg-gray-300 transition-colors"
            >
              <Plus className="w-4 h-4 text-gray-600" />
            </button>
          </div>
          {sizes.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-3">
              {sizes.map((size) => (
                <div key={size} className="bg-gray-100 px-3 py-1 rounded-full flex items-center gap-1.5 text-sm">
                  <span>{size}</span>
                  <button type="button" onClick={() => setSizes(prev => prev.filter(s => s !== size))} className="text-gray-400 hover:text-gray-600">
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>

      {/* Exit button — top right */}
      <button
        type="button"
        onClick={onBack}
        className="fixed top-6 right-6 z-50 w-10 h-10 rounded-full flex items-center justify-center text-stone-400 hover:text-stone-700 hover:bg-stone-100 transition-all"
      >
        <Cancel01Icon className="w-5 h-5" strokeWidth={1.5} />
      </button>

      {/* Bottom navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 px-6 py-4">
        <div className="max-w-xl mx-auto flex items-center justify-between">
          <button
            type="button"
            onClick={onBack}
            className="flex items-center gap-2 text-gray-500 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="text-sm">Back</span>
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={!canSave}
            className={`px-6 py-2.5 rounded-lg font-medium text-sm transition-transform duration-200 ${
              canSave
                ? 'bg-gray-900 text-white hover:bg-gray-800 active:scale-[0.98]'
                : 'bg-gray-100 text-gray-400 cursor-not-allowed'
            }`}
          >
            Save product
          </button>
        </div>
      </div>
    </div>
  );
}
