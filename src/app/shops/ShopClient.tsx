'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { SafeUser, SafeShop, SafeProduct, SafeProductCategory } from '@/app/types';
import ShopCard from '@/components/shop/ShopCard';
import ProductCard from '@/components/shop/ProductCard';
import ShopHeader from '@/components/shop/ShopHeader';
import Container from '@/components/Container';
import EmptyState from '@/components/EmptyState';

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
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [filters, setFilters] = useState({
    category: 'all',
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
    
  // Debug info - you can remove this in production
  console.log("All shops:", initialShops);
  console.log("Filtered shops:", filteredShops);
  console.log("Shop IDs:", initialShops.map(shop => shop.id).join(', '));

  // Handle manual refresh
  const handleRefresh = () => {
    router.refresh();
  };

  if (initialShops.length === 0 && featuredProducts.length === 0) {
    return (
      <EmptyState 
        title="No shops or products found"
        subtitle="Try changing your search criteria or create a new shop."
      />
    );
  }

  return (
    <div className="flex-1">

      
      {/* Shop Header */}
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
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold text-gray-800">
              {filters.searchQuery ? 'Shop Results' : 'Featured Shops'}
            </h2>
            <div className="flex items-center gap-2">
              <button 
                onClick={handleRefresh}
                className="text-blue-500 hover:text-blue-700"
                aria-label="Refresh"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" />
                </svg>
              </button>
              <a 
                href="/shop/stores"
                className="text-blue-500 hover:underline text-sm"
              >
                View All Shops
              </a>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredShops.map((shop) => (
              <ShopCard
                key={shop.id}
                data={shop}
                currentUser={currentUser}
              />
            ))}
            {filteredShops.length === 0 && (
              <div className="col-span-full py-8 text-center">
                <p className="text-gray-500">No shops found matching your criteria</p>
              </div>
            )}
          </div>
        </section>
        
        {/* Featured Products Section */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold text-gray-800">
              {filters.searchQuery ? 'Product Results' : 'Featured Products'}
            </h2>
            <a 
              href="/shop/products"
              className="text-blue-500 hover:underline text-sm"
            >
              View All Products
            </a>
          </div>
          
          <div className={
            viewMode === 'grid' 
            ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4"
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
              <div className="col-span-full py-8 text-center">
                <p className="text-gray-500">No products found matching your criteria</p>
              </div>
            )}
          </div>
        </section>
        
        {/* Categories Section - Only show if not searching */}
        {!filters.searchQuery && (
          <section>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold text-gray-800">Shop by Category</h2>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
              {categories.map((category) => (
                <a 
                  key={category.id} 
                  href={`/shop/categories/${category.id}`}
                  className="bg-white border rounded-xl overflow-hidden hover:shadow-md transition-shadow"
                >
                  <div className="p-4 flex flex-col items-center text-center">
                    <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center mb-3">
                      {category.image ? (
                        <img 
                          src={category.image} 
                          alt={category.name} 
                          className="w-6 h-6 object-contain" 
                        />
                      ) : (
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-blue-500">
                          <path d="M19.225 12.65L20.075 20.65C20.1833 21.3955 19.6377 22.07 18.8917 22.1783C18.8306 22.1833 18.7694 22.1883 18.7083 22.1783L5.29168 22.1783C4.54334 22.1783 3.93334 21.5683 3.93334 20.82C3.93334 20.7589 3.93834 20.6977 3.94334 20.6367L4.77834 12.65C4.88584 11.8933 5.52751 11.3333 6.29168 11.3333L17.7083 11.3333C18.4725 11.3333 19.1142 11.8933 19.2217 12.65Z" />
                          <path d="M8 11V8a4 4 0 014-4v0a4 4 0 014 4v3" />
                        </svg>
                      )}
                    </div>
                    <h3 className="font-medium text-gray-900">{category.name}</h3>
                    {category.productCount !== undefined && (
                      <p className="text-xs text-gray-500 mt-1">{category.productCount} products</p>
                    )}
                  </div>
                </a>
              ))}
              {categories.length === 0 && (
                <div className="col-span-full py-8 text-center">
                  <p className="text-gray-500">No categories found</p>
                </div>
              )}
            </div>
          </section>
        )}
      </div>
    </div>
  );
};

export default ShopClient;