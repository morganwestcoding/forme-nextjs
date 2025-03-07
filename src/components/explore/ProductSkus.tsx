'use client';

import { useState } from 'react';
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

interface ProductSkusProps {
  products: Product[];
}

const ProductSkus: React.FC<ProductSkusProps> = ({
  products = []
}) => {
  const router = useRouter();
  const [activeCategory, setActiveCategory] = useState('all');
  
  // Create categories array from product data
  const categorySet = new Set<string>();
  categorySet.add('all');
  products.forEach(product => {
    categorySet.add(product.category);
  });
  
  const categories = Array.from(categorySet);
  
  const filteredProducts = activeCategory === 'all' 
    ? products 
    : products.filter(product => product.category === activeCategory);
  
  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold">Shop Products</h2>
        <button 
          className="text-sm text-gray-500 hover:text-[#F08080] transition-colors"
          onClick={() => router.push('/products')}
        >
          View all
        </button>
      </div>
      
      <div className="flex gap-3 overflow-x-auto no-scrollbar mb-4 pb-2">
        {categories.map(category => (
          <button
            key={category}
            onClick={() => setActiveCategory(category)}
            className={`
              py-1.5 px-4 rounded-lg text-sm whitespace-nowrap
              ${activeCategory === category 
                ? 'bg-[#60A5FA] text-white' 
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}
            `}
          >
            {category === 'all' ? 'All Products' : category}
          </button>
        ))}
      </div>
      
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
        {filteredProducts.map(product => (
          <div 
            key={product.id}
            className="bg-white rounded-lg overflow-hidden shadow-sm border border-gray-100 hover:shadow-md transition cursor-pointer"
            onClick={() => router.push(`/products/${product.id}`)}
          >
            <div className="relative aspect-square w-full overflow-hidden">
            <img 
  src={product.imageSrc}
  alt={product.title}
  className="h-full w-full object-cover"
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
            </div>
            
            <div className="p-3">
              <p className="text-xs text-gray-500 mb-1">{product.brand}</p>
              <h3 className="font-medium text-sm mb-1 truncate">{product.title}</h3>
              <div className="flex items-center justify-between">
                <p className="font-semibold text-sm">${product.price.toFixed(2)}</p>
                <p className="text-xs text-gray-500 truncate">{product.vendorName}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ProductSkus;