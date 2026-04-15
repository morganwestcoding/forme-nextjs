'use client';

import { useState, useCallback } from 'react';
import { CldUploadWidget, type CldUploadWidgetResults } from 'next-cloudinary';

import Image from 'next/image';
import TypeformHeading from '@/components/registration/TypeformHeading';
import { Cancel01Icon, PencilEdit01Icon, ArrowDown01Icon as ChevronDown, PlusSignIcon as Plus, Cancel01Icon as X, ArrowLeft01Icon as ArrowLeft } from 'hugeicons-react';
import Button from '@/components/ui/Button';

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
      {(props) => (
        <div
          onClick={() => props?.open?.()}
          className={`
            group cursor-pointer rounded-xl overflow-hidden relative transition-all duration-300
            ${value
              ? ''
              : 'border-2 border-dashed border-stone-200 dark:border-stone-800 bg-stone-50/50 hover:border-stone-900 hover:bg-stone-100 dark:hover:bg-stone-800 dark:bg-stone-800'
            }
          `}
          style={{ width: '175px', height: '175px' }}
        >
          {value ? (
            <>
              <Image src={value} alt={`Product ${index + 1}`} fill className="object-cover" />
              <div className="absolute inset-0 rounded-xl bg-black/0 group-hover:bg-black/30 transition-all duration-300 flex items-center justify-center opacity-0 group-hover:opacity-100">
                <PencilEdit01Icon className="w-5 h-5 text-white drop-shadow-sm" />
              </div>
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); onRemove(); }}
                className="absolute top-2 right-2 w-7 h-7 bg-black/50 hover:bg-black/70 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity z-10"
              >
                <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </>
          ) : (
            <div className="h-full flex flex-col items-center justify-center">
              <div className="w-10 h-10 rounded-full bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 flex items-center justify-center shadow-sm">
                <Plus className="w-5 h-5 text-stone-400 dark:text-stone-500" />
              </div>
            </div>
          )}
        </div>
      )}
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
          <label className="block text-sm font-medium text-stone-700 dark:text-stone-200 mb-2">
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
            <label className="block text-sm font-medium text-stone-700 dark:text-stone-200 mb-2">Product name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-3.5 bg-stone-50 dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-xl text-stone-900 dark:text-stone-100 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-stone-900 focus:border-transparent transition-all"
              placeholder="Product name"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-stone-700 dark:text-stone-200 mb-2">Price</label>
            <input
              type="number"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              className="w-full px-4 py-3.5 bg-stone-50 dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-xl text-stone-900 dark:text-stone-100 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-stone-900 focus:border-transparent transition-all"
              placeholder="0.00"
            />
          </div>
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-medium text-stone-700 dark:text-stone-200 mb-2">Description</label>
          <textarea
            rows={3}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full px-4 py-3.5 bg-stone-50 dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-xl text-stone-900 dark:text-stone-100 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-stone-900 focus:border-transparent transition-all resize-none"
            placeholder="Describe your product..."
          />
        </div>

        {/* Category */}
        <div>
          <label className="block text-sm font-medium text-stone-700 dark:text-stone-200 mb-2">Category</label>
          <div className="relative">
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full px-4 py-3.5 bg-stone-50 dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-xl text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-2 focus:ring-stone-900 focus:border-transparent transition-all appearance-none"
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
              <ChevronDown className="w-5 h-5 text-stone-400 dark:text-stone-500" />
            </div>
          </div>
        </div>

        {/* Sizes */}
        <div>
          <label className="block text-sm font-medium text-stone-700 dark:text-stone-200 mb-2">Sizes</label>
          <div className="relative">
            <input
              type="text"
              value={currentSize}
              onChange={(e) => setCurrentSize(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleAddSize(); } }}
              placeholder="Add size (e.g., S, M, L)"
              className="w-full px-4 pr-12 py-3.5 bg-stone-50 dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-xl text-stone-900 dark:text-stone-100 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-stone-900 focus:border-transparent transition-all"
            />
            <button
              type="button"
              onClick={handleAddSize}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 rounded-xl bg-stone-200 dark:bg-stone-700 hover:bg-stone-300 transition-colors"
            >
              <Plus className="w-4 h-4 text-stone-600 dark:text-stone-300" />
            </button>
          </div>
          {sizes.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-3">
              {sizes.map((size) => (
                <div key={size} className="bg-stone-100 dark:bg-stone-800 px-3 py-1 rounded-full flex items-center gap-1.5 text-sm">
                  <span>{size}</span>
                  <button type="button" onClick={() => setSizes(prev => prev.filter(s => s !== size))} className="text-stone-400  hover:text-stone-600 dark:text-stone-300">
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
        className="fixed top-6 right-6 z-50 w-10 h-10 rounded-full flex items-center justify-center text-stone-400  hover:text-stone-700 dark:hover:text-stone-300 dark:text-stone-200 hover:bg-stone-100 dark:hover:bg-stone-800 dark:bg-stone-800 transition-all"
      >
        <Cancel01Icon className="w-5 h-5" strokeWidth={1.5} />
      </button>

      {/* Bottom navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-white dark:bg-stone-900 border-t border-stone-100 dark:border-stone-800 px-6 py-4">
        <div className="max-w-xl mx-auto flex items-center justify-between">
          <button
            type="button"
            onClick={onBack}
            className="flex items-center gap-2 text-stone-500   hover:text-stone-900 dark:hover:text-stone-100 dark:text-stone-100 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="text-sm">Back</span>
          </button>
          <Button type="button" onClick={handleSave} disabled={!canSave}>
            Save product
          </Button>
        </div>
      </div>
    </div>
  );
}
