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
              <div className="col-span-full py-8 text-center">
                <p className="text-gray-500">No products found matching your criteria</p>
              </div>
            )}
          </div>
        </section>
        
      </div>
    </div>
  );
};

export default ShopClient;