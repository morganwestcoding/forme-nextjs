'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';
import { SafeUser, SafeShop, SafeProduct, SafeProductCategory } from '@/app/types';
import ShopCard from '@/components/shop/ShopCard';
import ProductCard from '@/components/shop/ProductCard';
import ShopHeader from '@/components/shop/ShopHeader';
import useShopModal from '@/app/hooks/useShopModal';
import useProductModal from '@/app/hooks/useProductModal';
import Link from 'next/link';

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
  const [isLoading, setIsLoading] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [filters, setFilters] = useState({
    category: 'all',
    searchQuery: ''
  });
  
  // If we don't have products or shops, use placeholder data
  const shops = initialShops.length > 0 ? initialShops : placeholderShops;
  const products = featuredProducts.length > 0 ? featuredProducts : placeholderProducts;
  const productCategories = categories.length > 0 ? categories : placeholderCategories;
  
  // Filter products based on search query
  const filteredProducts = filters.searchQuery 
    ? products.filter(product => 
        product.name.toLowerCase().includes(filters.searchQuery.toLowerCase()) ||
        product.description.toLowerCase().includes(filters.searchQuery.toLowerCase())
      )
    : products;
  
  if (isLoading) {
    return <div className="flex justify-center items-center py-20"><div className="spinner"></div></div>;
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
        {/* Featured Products Section */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold text-gray-800">
              {filters.searchQuery ? 'Search Results' : 'Featured Products'}
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
                <p className="text-gray-500">No products found</p>
              </div>
            )}
          </div>
        </section>
        
        {/* Shops Section - Only show if not searching */}
        {!filters.searchQuery && (
          <section>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold text-gray-800">Featured Shops</h2>
              <a 
                href="/shop/stores"
                className="text-blue-500 hover:underline text-sm"
              >
                View All Shops
              </a>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {shops.slice(0, 3).map((shop) => (
                <ShopCard
                  key={shop.id}
                  data={shop}
                  currentUser={currentUser}
                />
              ))}
            </div>
          </section>
        )}
        
        {/* Categories Section - Only show if not searching */}
        {!filters.searchQuery && (
          <section>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold text-gray-800">Shop by Category</h2>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
              {productCategories.map((category) => (
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
            </div>
          </section>
        )}
      </div>
    </div>
  );
};

// Placeholder data for development and preview
const placeholderShops: SafeShop[] = [
  {
    id: "shop1",
    name: "Barber's Delight",
    description: "Premium barber supplies and tools",
    logo: "https://images.unsplash.com/photo-1521490214993-bfb6f7dc096d?w=900&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NzJ8fGJhcmJlcnxlbnwwfHwwfHx8MA%3D%3D",
    coverImage: "https://images.unsplash.com/photo-1622288432450-277d0fef5ed6?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3",
    location: "Tempe, Arizona",
    userId: "user1",
    storeUrl: "https://example.com/barbersdelight",
    socials: {
      instagram: "https://instagram.com/example",
      facebook: "https://facebook.com/example"
    },
    galleryImages: [
      "https://images.unsplash.com/photo-1503951914875-452162b0f3f1?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3", 
      "https://images.unsplash.com/photo-1599351431613-18ef1fdd27e1?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3"
    ],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    isVerified: true,
    shopEnabled: true,
    featuredProducts: ["product1", "product2"],
    followers: ["user2", "user3", "user4"],
    listingId: "listing1",
    user: {
      id: "user1",
      name: "John Barber",
      image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3"
    },
    productCount: 24,
    followerCount: 156,
    featuredProductItems: [
      {
        id: "product1",
        name: "Professional Barber Scissors",
        price: 89.99,
        image: "https://images.unsplash.com/photo-1519500528352-2d1460418d41?w=900&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NDN8fGJhcmJlcnxlbnwwfHwwfHx8MA%3D%3D"
      },
      {
        id: "product2",
        name: "Premium Hair Pomade",
        price: 19.99,
        image: "https://images.unsplash.com/photo-1518002171953-a080ee817e1f?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3"
      }
    ]
  },
  {
    id: "shop2",
    name: "Wellness Haven",
    description: "Natural wellness products and spa essentials",
    logo: "https://images.unsplash.com/photo-1515377905703-c4788e51af15?w=900&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTB8fHdlbGxuZXNzfGVufDB8fDB8fHww",
    location: "Portland, Oregon",
    userId: "user5",
    storeUrl: "https://example.com/wellnesshaven",
    socials: {
      instagram: "https://instagram.com/example",
      twitter: "https://twitter.com/example"
    },
    galleryImages: [
      "https://images.unsplash.com/photo-1544161515-4ab6ce6db874?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3", 
      "https://images.unsplash.com/photo-1540555700478-4be289fbecef?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3"
    ],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    isVerified: true,
    shopEnabled: true,
    featuredProducts: ["product3", "product4"],
    followers: ["user6", "user7"],
    user: {
      id: "user5",
      name: "Emily Wellness",
      image: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3"
    },
    productCount: 42,
    followerCount: 278,
    featuredProductItems: [
      {
        id: "product3",
        name: "Aromatherapy Essential Oils Kit",
        price: 49.99,
        image: "https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3"
      },
      {
        id: "product4",
        name: "Zen Meditation Cushion",
        price: 34.99,
        image: "https://images.unsplash.com/photo-1545205597-3d9d02c29597?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3"
      }
    ]
  },
  {
    id: "shop3",
    name: "Fitness Boost",
    description: "Professional fitness equipment and supplements",
    logo: "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3",
    location: "Miami, Florida",
    userId: "user8",
    socials: {
      instagram: "https://instagram.com/example",
      youtube: "https://youtube.com/example"
    },
    galleryImages: [
      "https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3", 
      "https://images.unsplash.com/photo-1605296867304-46d5465a13f1?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3"
    ],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    isVerified: false,
    shopEnabled: true,
    featuredProducts: ["product5"],
    followers: ["user9", "user10", "user11", "user12"],
    user: {
      id: "user8",
      name: "Mike Fitness",
      image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3"
    },
    productCount: 17,
    followerCount: 421,
    featuredProductItems: [
      {
        id: "product5",
        name: "Premium Resistance Bands Set",
        price: 29.99,
        image: "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3"
      }
    ]
  }
];

const placeholderProducts: SafeProduct[] = [
  {
    id: "product1",
    name: "Professional Barber Scissors",
    description: "Premium stainless steel barber scissors for precise cutting",
    price: 89.99,
    compareAtPrice: 109.99,
    mainImage: "https://images.unsplash.com/photo-1585747860715-2ba37e788b70?w=900&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTV8fGJhcmJlcnxlbnwwfHwwfHx8MA%3D%3D",
    galleryImages: [
      "https://images.unsplash.com/photo-1656330153764-00aa56c9aac8?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3", 
      "https://images.unsplash.com/photo-1514846835573-c0692c6f6653?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3"
    ],
    shopId: "shop1",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    sku: "BAR-SCIS-001",
    categoryId: "category1",
    category: {
      id: "category1",
      name: "Barber Tools"
    },
    tags: ["barber", "scissors", "premium", "cutting"],
    isPublished: true,
    isFeatured: true,
    inventory: 24,
    lowStockThreshold: 5,
    shop: {
      id: "shop1",
      name: "Barber's Delight",
      logo: "https://images.unsplash.com/photo-1532710093739-9470acff878f?w=900&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTB8fGJhcmJlcnxlbnwwfHwwfHx8MA%3D%3D"
    },
    favoritedBy: ["user2", "user5"]
  },
  {
    id: "product3",
    name: "Aromatherapy Essential Oils Kit",
    description: "Set of 6 pure essential oils for aromatherapy and relaxation",
    price: 49.99,
    mainImage: "https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3",
    galleryImages: [
      "https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3", 
      "https://images.unsplash.com/photo-1608571423901-31babee48748?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3"
    ],
    shopId: "shop2",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    sku: "WELL-OIL-001",
    categoryId: "category2",
    category: {
      id: "category2",
      name: "Wellness Products"
    },
    tags: ["wellness", "aromatherapy", "essential oils", "relaxation"],
    isPublished: true,
    isFeatured: true,
    inventory: 42,
    lowStockThreshold: 10,
    shop: {
      id: "shop2",
      name: "Wellness Haven",
      logo: "https://images.unsplash.com/photo-1558021212-51b6ecfa0db9?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3"
    },
    favoritedBy: ["user1", "user6", "user7"],
    options: [
      {
        name: "Size",
        values: ["Small (10ml)", "Medium (15ml)", "Large (30ml)"]
      }
    ],
    variants: [
      {
        id: "var1",
        price: 49.99,
        inventory: 15,
        optionValues: {
          Size: "Small (10ml)"
        }
      },
      {
        id: "var2",
        price: 59.99,
        inventory: 20,
        optionValues: {
          Size: "Medium (15ml)"
        }
      },
      {
        id: "var3",
        price: 79.99,
        inventory: 7,
        optionValues: {
          Size: "Large (30ml)"
        }
      }
    ]
  },
  // Additional placeholder products (truncated for brevity)
];

const placeholderCategories: SafeProductCategory[] = [
  { 
    id: "category1", 
    name: "Barber Tools", 
    productCount: 18,
    image: "https://images.unsplash.com/photo-1590540179852-2110a54f813a?w=900&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NTh8fGJhcmJlcnxlbnwwfHwwfHx8MA%3D%3D"
  },
  { 
    id: "category2", 
    name: "Wellness Products", 
    productCount: 24,
    image: "https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3"
  },
  { 
    id: "category3", 
    name: "Fitness Equipment", 
    productCount: 15,
    image: "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3"
  },
  { 
    id: "category4", 
    name: "Hair Care", 
    productCount: 32,
    image: "https://images.unsplash.com/photo-1518002171953-a080ee817e1f?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3"
  },
  { 
    id: "category5", 
    name: "Skincare", 
    productCount: 27,
    image: "https://images.unsplash.com/photo-1570194065650-d99fb4a8e9fe?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3"
  },
  { 
    id: "category6", 
    name: "Spa Essentials", 
    productCount: 19,
    image: "https://images.unsplash.com/photo-1602528495711-f02079ae4f05?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3"
  }
];

export default ShopClient;