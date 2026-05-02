'use client';

import { motion } from 'framer-motion';

import Image from 'next/image';
import TypeformHeading from '@/components/registration/TypeformHeading';
import { itemVariants } from '@/components/registration/TypeformStep';
import { placeholderDataUri } from '@/lib/placeholders';
import { PlusSignIcon as Plus } from 'hugeicons-react';

interface ProductData {
  name: string;
  price?: number;
  description?: string;
  category?: string;
  sizes?: string[];
  images?: string[];
  image?: string;
}

interface ShopProductsStepProps {
  products: ProductData[];
  onAddProduct: () => void;
  onRemoveProduct: (index: number) => void;
}

export default function ShopProductsStep({
  products,
  onAddProduct,
  onRemoveProduct,
}: ShopProductsStepProps) {
  return (
    <div>
      <TypeformHeading
        question="Add your products"
        subtitle="Showcase the items you offer (optional)"
      />

      <div className="flex flex-wrap gap-3">
        {products.map((product, index) => {
          const src =
            (product.images && product.images.length > 0 ? product.images[0] : product.image) ||
            placeholderDataUri(product.name || 'Product');
          return (
            <motion.div
              key={`${product.name}-${index}`}
              variants={itemVariants}
              className="relative rounded-xl overflow-hidden border border-stone-200 dark:border-stone-800 group"
              style={{ width: '175px', height: '175px' }}
            >
              <Image
                src={src}
                alt={product.name}
                fill
                className="object-cover"
              />
              <button
                type="button"
                onClick={() => onRemoveProduct(index)}
                className="absolute top-2 right-2 w-7 h-7 bg-black/50 hover:bg-black/70 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </motion.div>
          );
        })}

        {/* Add Product Button */}
        <motion.div
          onClick={onAddProduct}
          variants={itemVariants}
          className="cursor-pointer rounded-xl overflow-hidden border-2 border-dashed border-stone-200 dark:border-stone-800 bg-stone-50/50 hover:border-stone-900 hover:bg-stone-100 dark:hover:bg-stone-800 dark:bg-stone-800 transition-all duration-300 flex flex-col items-center justify-center"
          style={{ width: '175px', height: '175px' }}
        >
          <div className="w-10 h-10 rounded-full bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 flex items-center justify-center shadow-elevation-1">
            <Plus className="w-5 h-5 text-stone-400 dark:text-stone-500" />
          </div>
        </motion.div>
      </div>

      {products.length === 0 && (
        <p className="text-sm text-stone-400 dark:text-stone-500 text-center mt-6">
          You can skip this step or add products later
        </p>
      )}
    </div>
  );
}
