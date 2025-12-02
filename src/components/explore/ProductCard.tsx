'use client';

import { useRouter } from 'next/navigation';
import Image from 'next/image';
import SmartBadgeProduct from './SmartBadgeProduct';

interface Product {
  id: string;
  title: string;
  brand: string;
  price: number;
  imageSrc: string;
  category: string;
  vendorId: string;
  vendorName: string;
  rating: number;
  inStock: boolean;
}

interface ProductCardProps {
  product: Product;
  onAddToCart?: (productId: string) => void;
}

const ProductCard: React.FC<ProductCardProps> = ({
  product,
  onAddToCart
}) => {
  const router = useRouter();

  return (
    <div
      onClick={() => router.push(`/products/${product.id}`)}
      className="
        group cursor-pointer relative overflow-hidden
        rounded-xl bg-white transition-all duration-300
        hover:-translate-y-1 hover:scale-[1.01] hover:shadow-md
        max-w-[250px]"
    >
      {/* Background image + product-specific gradient (more balanced) */}
      <div className="absolute inset-0 z-0">
        <Image
          src={product.imageSrc}
          alt={product.title}
          fill
          className="object-cover"
          sizes="(max-width:768px) 100vw, 33vw"
          priority={false}
        />
        {/* Product card has a more balanced gradient - darker at both top and bottom */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              'linear-gradient(to bottom,' +
              'rgba(0,0,0,0.50) 0%,' +
              'rgba(0,0,0,0.30) 15%,' +
              'rgba(0,0,0,0.10) 30%,' +
              'rgba(0,0,0,0.00) 45%,' +
              'rgba(0,0,0,0.00) 55%,' +
              'rgba(0,0,0,0.10) 70%,' +
              'rgba(0,0,0,0.40) 85%,' +
              'rgba(0,0,0,0.75) 100%)',
          }}
        />
      </div>

      <div className="relative z-10">
        <div className="relative h-[350px]">
          {/* Price tag - distinctive product card feature */}
          <div className="absolute top-4 left-4 z-20">
            <div className="bg-white/95 backdrop-blur-sm text-gray-900 font-semibold text-sm px-3 py-1.5 rounded-lg shadow-lg">
              ${product.price.toFixed(2)}
            </div>
          </div>

          {/* Out of stock badge */}
          {!product.inStock && (
            <div className="absolute top-4 right-4 z-20 bg-rose-500 text-white text-xs font-medium py-1.5 px-3 rounded-lg shadow-lg">
              Out of stock
            </div>
          )}

          {/* Bottom info */}
          <div className="absolute bottom-5 left-5 right-5 z-20">
            {/* Brand */}
            <div className="text-white/80 text-[10px] font-light mb-1 uppercase tracking-wide">
              {product.brand}
            </div>

            {/* Title */}
            <div className="mb-1">
              <h1 className="text-white text-md leading-6 font-semibold drop-shadow line-clamp-2">
                {product.title}
              </h1>
            </div>

            {/* Vendor */}
            <div className="text-white/90 text-[11px] leading-4 mb-4">
              <div className="flex items-center gap-1">
                <span className="truncate">by {product.vendorName}</span>
              </div>
            </div>

            {/* Smart Badge with Rating and Checkout */}
            <div className="flex items-center">
              <SmartBadgeProduct
                rating={product.rating}
                inStock={product.inStock}
                onRatingClick={() => {}}
                onCheckoutClick={onAddToCart ? () => onAddToCart(product.id) : undefined}
              />
            </div>
          </div>
        </div>

        <div className="pb-2" />
      </div>
    </div>
  );
};

export default ProductCard;