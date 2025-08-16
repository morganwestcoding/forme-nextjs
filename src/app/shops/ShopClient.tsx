'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { SafeUser, SafeShop, SafeProduct, SafeProductCategory } from '@/app/types';
import ShopCard from '@/components/shop/ShopCard';
import ProductCard from '@/components/shop/ProductCard';
import ShopHeader from '@/components/shop/ShopHeader';
import Container from '@/components/Container';
import useShopModal from '@/app/hooks/useShopModal';

interface ShopClientProps {
  initialShops: SafeShop[];
  featuredProducts: SafeProduct[];
  categories: SafeProductCategory[];
  currentUser: SafeUser | null;
}

const ShopClient: React.FC<ShopClientProps> = ({ 
  initialShops = [],
  featuredProducts = [],
  categories = [],
  currentUser
}) => {
  const router = useRouter();
  const shopModal = useShopModal();

  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [filters, setFilters] = useState({
    category: 'featured',
    searchQuery: ''
  });
  
  // Filter products based on search query
  const filteredProducts = filters.searchQuery 
    ? featuredProducts.filter(product => 
        product.name.toLowerCase().includes(filters.searchQuery.toLowerCase()) ||
        product.description.toLowerCase().includes(filters.searchQuery.toLowerCase())
      )
    : featuredProducts;
  
  // Filter shops based on search query
  const filteredShops = filters.searchQuery
    ? initialShops.filter(shop =>
        shop.name.toLowerCase().includes(filters.searchQuery.toLowerCase()) ||
        shop.description.toLowerCase().includes(filters.searchQuery.toLowerCase())
      )
    : initialShops;

  // Manual refresh (if you keep it)
  const handleRefresh = () => router.refresh();

  return (
    <div className="flex-1">
      {/* Shop Header — always visible */}
      <div className="mb-6">
        <ShopHeader 
          currentUser={currentUser}
          viewMode={viewMode}
          onViewModeChange={setViewMode}
          filters={filters}
          onFilterChange={setFilters}
        />
      </div>
      
      <div className="space-y-8">
        {/* Shops Section */}
        <section>
          {filteredShops.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredShops.map((shop) => (
                <ShopCard
                  key={shop.id}
                  data={shop}
                  currentUser={currentUser}
                />
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-24 text-center border border-dashed border-gray-200 rounded-2xl bg-white">
              <h3 className="text-xl font-semibold text-gray-900">No shops found</h3>
              <p className="mt-1 text-gray-500">Be the first one to create a shop!</p>
              {currentUser && (
                <button
                  onClick={() => shopModal.onOpen()}
                  className="mt-4 inline-flex items-center justify-center px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#60A5FA] to-[#1f82fa] text-white font-semibold hover:opacity-95"
                >
                  Create Shop
                </button>
              )}
            </div>
          )}
        </section>
        
        {/* Featured Products Section */}
        <section>
          <div className={
            viewMode === 'grid' 
              ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
              : "space-y-4"
          }>
            {filteredProducts.length > 0 ? (
              filteredProducts.slice(0, 8).map((product) => (
                <ProductCard
                  key={product.id}
                  data={product}
                  currentUser={currentUser}
                />
              ))
            ) : (
              <div className="col-span-full py-16 text-center text-gray-500">
                No products found matching your criteria
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
};

export default ShopClient;
