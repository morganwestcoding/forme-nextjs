'use client';

import { useRouter } from 'next/navigation';

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
  
  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onAddToCart && product.inStock) {
      onAddToCart(product.id);
    }
  };
  
  return (
    <div 
      className="bg-white rounded-lg overflow-hidden shadow-sm border border-gray-100 hover:shadow-md transition cursor-pointer"
      onClick={() => router.push(`/products/${product.id}`)}
    >
      <div className="relative aspect-square w-full overflow-hidden">
        <div
          className="h-full w-full"
          style={{ 
            backgroundImage: `url(${product.imageSrc})`, 
            backgroundSize: 'cover', 
            backgroundPosition: 'center'
          }}
        />
        {!product.inStock && (
          <div className="absolute top-2 right-2 bg-red-500 text-white text-xs font-medium py-0.5 px-2 rounded">
            Out of stock
          </div>
        )}
        <div className="absolute bottom-2 left-2 flex items-center bg-white bg-opacity-90 rounded-full px-2 py-0.5">
          <span className="text-amber-500 mr-1">★</span>
          <span className="text-xs font-medium">{product.rating.toFixed(1)}</span>
        </div>
        
        {onAddToCart && (
          <button
            onClick={handleAddToCart}
            disabled={!product.inStock}
            className={`
              absolute bottom-2 right-2 p-2 rounded-full
              ${product.inStock 
                ? 'bg-[#F08080] hover:bg-[#E57373] text-white' 
                : 'bg-gray-200 text-gray-400 cursor-not-allowed'}
              transition
            `}
          >
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              width="16" 
              height="16" 
              viewBox="0 0 24 24" 
              fill="none" 
              stroke="currentColor" 
              strokeWidth="2" 
              strokeLinecap="round" 
              strokeLinejoin="round"
            >
              <circle cx="9" cy="21" r="1"></circle>
              <circle cx="20" cy="21" r="1"></circle>
              <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
            </svg>
          </button>
        )}
      </div>
      
      <div className="p-3">
        <p className="text-xs text-gray-500 mb-1">{product.brand}</p>
        <h3 className="font-medium text-sm mb-1 truncate">{product.title}</h3>
        <div className="flex items-center justify-between">
          <p className="font-semibold text-sm">${product.price.toFixed(2)}</p>
          <p className="text-xs text-gray-500 truncate max-w-[100px]">{product.vendorName}</p>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;