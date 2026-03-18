'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';
import TypeformHeading from '@/components/registration/TypeformHeading';
import { itemVariants } from '@/components/registration/TypeformStep';

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

      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        {products.map((product, index) => {
          const src =
            (product.images && product.images.length > 0 ? product.images[0] : product.image) ||
            '/images/placeholder-300x300.png';
          return (
            <motion.div
              key={`${product.name}-${index}`}
              variants={itemVariants}
              className="relative aspect-square rounded-xl overflow-hidden border border-gray-200 group"
            >
              <Image
                src={src}
                alt={product.name}
                fill
                className="object-cover"
              />
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/60 to-transparent p-3">
                <p className="text-white text-sm font-medium">{product.name}</p>
                <p className="text-white/80 text-xs">${product.price ?? 0}</p>
              </div>
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
        <motion.button
          type="button"
          onClick={onAddProduct}
          variants={itemVariants}
          className="aspect-square rounded-xl border-2 border-dashed border-gray-300 bg-gray-50 hover:border-gray-400 hover:bg-gray-100 transition-all flex flex-col items-center justify-center gap-2"
        >
          <svg className="w-6 h-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
          <span className="text-sm text-gray-500">Add product</span>
        </motion.button>
      </div>

      {products.length === 0 && (
        <p className="text-sm text-gray-400 text-center mt-6">
          You can skip this step or add products later
        </p>
      )}
    </div>
  );
}
