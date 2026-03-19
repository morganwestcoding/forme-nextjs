'use client';

import { useMemo, useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import { SafeUser, SafeShop, SafeProduct, SafeProductCategory } from '@/app/types';
import ShopCard from '@/components/shop/ShopCard';
import ProductCard from '@/components/shop/ProductCard';
import PageSearch from '@/components/search/PageSearch';
import CategoryNav from '@/app/market/CategoryNav';
import SectionHeader from '@/app/market/SectionHeader';
import PageHeader from '@/components/PageHeader';
import { categories } from '@/components/Categories';
import { useSidebarState } from '@/app/hooks/useSidebarState';

// Shuffle array using Fisher-Yates algorithm (seeded for stability during session)
function shuffleArray<T>(array: T[], seed: number): T[] {
  const shuffled = [...array];
  let currentSeed = seed;
  const random = () => {
    currentSeed = (currentSeed * 9301 + 49297) % 233280;
    return currentSeed / 233280;
  };
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

interface ShopClientProps {
  initialShops: SafeShop[];
  featuredProducts: SafeProduct[];
  categories: SafeProductCategory[];
  currentUser: SafeUser | null;
}

const FADE_OUT_DURATION = 200;

const BANNERS = [
  {
    src: '/assets/people/banner-7.png',
    alt: 'Most Popular',
    tag: 'Trending',
    title: 'Most Popular',
    subtitle: 'What everyone is booking',
    href: '/shops?category=Barber',
  },
  {
    src: '/assets/people/banner-6.png',
    alt: 'New on Forme',
    tag: 'Curated',
    title: 'New on Forme',
    subtitle: 'Fresh brands joining our community',
    href: '/shops?category=Wellness',
  },
  {
    src: '/assets/people/banner-5.png',
    alt: 'Near You',
    tag: 'Local',
    title: 'Near You',
    subtitle: 'Top-rated in your area',
    href: '/maps',
  },
];

// ── Mock data so the page always has content ──
const MOCK_SHOPS: SafeShop[] = [
  {
    id: 'mock-shop-1', name: 'Studio Noir', description: 'Premium barber studio in the heart of Brooklyn',
    logo: '/assets/people/barber.png', coverImage: '/assets/people/barber.png',
    location: 'Brooklyn, NY', address: '142 Bedford Ave', zipCode: '11249',
    userId: 'mock-user', storeUrl: null, galleryImages: [], createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(), isVerified: true, shopEnabled: true,
    featuredProducts: [], followers: ['a','b','c'], listingId: null, category: 'Barber',
    user: { id: 'mock-user', name: 'Marcus J.', image: null },
    products: [{ name: 'Fade', image: '/assets/people/barber.png', price: 45 }],
    productCount: 6, followerCount: 312, rating: 4.9,
  },
  {
    id: 'mock-shop-2', name: 'Glow Aesthetics', description: 'Skincare & facial treatments',
    logo: '/assets/people/skincare.png', coverImage: '/assets/people/skincare.png',
    location: 'Manhattan, NY', address: '88 Spring St', zipCode: '10012',
    userId: 'mock-user-2', storeUrl: null, galleryImages: [], createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(), isVerified: true, shopEnabled: true,
    featuredProducts: [], followers: ['a','b'], listingId: null, category: 'Skincare',
    user: { id: 'mock-user-2', name: 'Ava Chen', image: null },
    products: [{ name: 'Hydrafacial', image: '/assets/people/skincare.png', price: 120 }],
    productCount: 12, followerCount: 587, rating: 4.8,
  },
  {
    id: 'mock-shop-3', name: 'Lash Lounge', description: 'Lash extensions & lifts',
    logo: '/assets/people/lashes.png', coverImage: '/assets/people/lashes.png',
    location: 'Queens, NY', address: '25-11 Broadway', zipCode: '11106',
    userId: 'mock-user-3', storeUrl: null, galleryImages: [], createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(), isVerified: false, shopEnabled: true,
    featuredProducts: [], followers: ['a'], listingId: null, category: 'Lash',
    user: { id: 'mock-user-3', name: 'Priya M.', image: null },
    products: [{ name: 'Classic Full Set', image: '/assets/people/lashes.png', price: 85 }],
    productCount: 8, followerCount: 204, rating: 4.7,
  },
  {
    id: 'mock-shop-4', name: 'Iron Temple', description: 'Personal training & fitness coaching',
    logo: '/assets/people/fitness.png', coverImage: '/assets/people/fitness.png',
    location: 'Bronx, NY', address: '900 Grand Concourse', zipCode: '10451',
    userId: 'mock-user-4', storeUrl: null, galleryImages: [], createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(), isVerified: true, shopEnabled: true,
    featuredProducts: [], followers: ['a','b','c','d'], listingId: null, category: 'Training',
    user: { id: 'mock-user-4', name: 'Derek W.', image: null },
    products: [{ name: '1-on-1 Session', image: '/assets/people/fitness.png', price: 75 }],
    productCount: 4, followerCount: 891, rating: 5.0,
  },
  {
    id: 'mock-shop-5', name: 'The Nail Bar', description: 'Luxury nail art & spa',
    logo: '/assets/people/nails.png', coverImage: '/assets/people/nails.png',
    location: 'Manhattan, NY', address: '401 W 14th St', zipCode: '10014',
    userId: 'mock-user-5', storeUrl: null, galleryImages: [], createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(), isVerified: true, shopEnabled: true,
    featuredProducts: [], followers: ['a','b','c'], listingId: null, category: 'Nails',
    user: { id: 'mock-user-5', name: 'Sofia R.', image: null },
    products: [{ name: 'Gel Manicure', image: '/assets/people/nails.png', price: 55 }],
    productCount: 10, followerCount: 445, rating: 4.9,
  },
  {
    id: 'mock-shop-6', name: 'Zen Wellness', description: 'Holistic wellness & meditation',
    logo: '/assets/people/wellness.png', coverImage: '/assets/people/wellness.png',
    location: 'Brooklyn, NY', address: '58 N 3rd St', zipCode: '11249',
    userId: 'mock-user-6', storeUrl: null, galleryImages: [], createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(), isVerified: false, shopEnabled: true,
    featuredProducts: [], followers: ['a','b'], listingId: null, category: 'Wellness',
    user: { id: 'mock-user-6', name: 'Luna K.', image: null },
    products: [{ name: 'Sound Bath', image: '/assets/people/wellness.png', price: 40 }],
    productCount: 5, followerCount: 178, rating: 4.6,
  },
];

const MOCK_PRODUCTS: SafeProduct[] = [
  {
    id: 'mock-prod-1', name: 'Signature Fade', description: 'Clean taper fade with hot towel finish',
    price: 45, mainImage: '/assets/people/barber.png', galleryImages: [], shopId: 'mock-shop-1',
    createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(),
    categoryId: 'cat-1', category: { id: 'cat-1', name: 'Haircuts' }, tags: ['barber', 'fade'],
    isPublished: true, isFeatured: true, inventory: 99, lowStockThreshold: 5,
    shop: { id: 'mock-shop-1', name: 'Studio Noir', logo: '/assets/people/barber.png' },
    favoritedBy: [],
  },
  {
    id: 'mock-prod-2', name: 'Hydra Glow Facial', description: 'Deep cleansing & hydration treatment',
    price: 120, mainImage: '/assets/people/skincare.png', galleryImages: [], shopId: 'mock-shop-2',
    createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(),
    categoryId: 'cat-2', category: { id: 'cat-2', name: 'Skincare' }, tags: ['facial', 'glow'],
    isPublished: true, isFeatured: true, inventory: 50, lowStockThreshold: 5,
    shop: { id: 'mock-shop-2', name: 'Glow Aesthetics', logo: '/assets/people/skincare.png' },
    favoritedBy: [],
  },
  {
    id: 'mock-prod-3', name: 'Volume Lash Set', description: 'Full volume lash extensions',
    price: 150, mainImage: '/assets/people/lashes.png', galleryImages: [], shopId: 'mock-shop-3',
    createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(),
    categoryId: 'cat-3', category: { id: 'cat-3', name: 'Lash' }, tags: ['lash', 'extensions'],
    isPublished: true, isFeatured: true, inventory: 30, lowStockThreshold: 5,
    shop: { id: 'mock-shop-3', name: 'Lash Lounge', logo: '/assets/people/lashes.png' },
    favoritedBy: [],
  },
  {
    id: 'mock-prod-4', name: 'Power Hour Training', description: '60-minute personalized training session',
    price: 75, mainImage: '/assets/people/fitness.png', galleryImages: [], shopId: 'mock-shop-4',
    createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(),
    categoryId: 'cat-4', category: { id: 'cat-4', name: 'Training' }, tags: ['fitness', 'personal'],
    isPublished: true, isFeatured: true, inventory: 99, lowStockThreshold: 5,
    shop: { id: 'mock-shop-4', name: 'Iron Temple', logo: '/assets/people/fitness.png' },
    favoritedBy: [],
  },
  {
    id: 'mock-prod-5', name: 'Gel Art Manicure', description: 'Custom nail art with gel polish',
    price: 65, mainImage: '/assets/people/nails.png', galleryImages: [], shopId: 'mock-shop-5',
    createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(),
    categoryId: 'cat-5', category: { id: 'cat-5', name: 'Nails' }, tags: ['nails', 'gel'],
    isPublished: true, isFeatured: true, inventory: 80, lowStockThreshold: 5,
    shop: { id: 'mock-shop-5', name: 'The Nail Bar', logo: '/assets/people/nails.png' },
    favoritedBy: [],
  },
  {
    id: 'mock-prod-6', name: 'Guided Sound Bath', description: 'Crystal bowl meditation session',
    price: 40, mainImage: '/assets/people/wellness.png', galleryImages: [], shopId: 'mock-shop-6',
    createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(),
    categoryId: 'cat-6', category: { id: 'cat-6', name: 'Wellness' }, tags: ['wellness', 'meditation'],
    isPublished: true, isFeatured: true, inventory: 25, lowStockThreshold: 5,
    shop: { id: 'mock-shop-6', name: 'Zen Wellness', logo: '/assets/people/wellness.png' },
    favoritedBy: [],
  },
  {
    id: 'mock-prod-7', name: 'Brow Lamination', description: 'Full brow lamination & tint',
    price: 85, mainImage: '/assets/people/brows.png', galleryImages: [], shopId: 'mock-shop-7',
    createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(),
    categoryId: 'cat-7', category: { id: 'cat-7', name: 'Brows' }, tags: ['brows', 'lamination'],
    isPublished: true, isFeatured: true, inventory: 40, lowStockThreshold: 5,
    shop: { id: 'mock-shop-7', name: 'Brow Studio', logo: '/assets/people/brows.png' },
    favoritedBy: [],
  },
  {
    id: 'mock-prod-8', name: 'Custom Tattoo Consult', description: 'Design consultation for custom ink',
    price: 100, mainImage: '/assets/people/ink.png', galleryImages: [], shopId: 'mock-shop-8',
    createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(),
    categoryId: 'cat-8', category: { id: 'cat-8', name: 'Ink' }, tags: ['tattoo', 'custom'],
    isPublished: true, isFeatured: true, inventory: 15, lowStockThreshold: 5,
    shop: { id: 'mock-shop-8', name: 'Ink Masters', logo: '/assets/people/ink.png' },
    favoritedBy: [],
  },
];

const ShopClient: React.FC<ShopClientProps> = ({
  initialShops = [],
  featuredProducts = [],
  currentUser,
}) => {
  const params = useSearchParams();
  const router = useRouter();
  const isSidebarCollapsed = useSidebarState();

  // Dynamic items per page: 12 when sidebar collapsed, 10 when expanded
  const ITEMS_PER_PAGE = isSidebarCollapsed ? 12 : 10;

  // Banner state
  const [activeBanner, setActiveBanner] = useState(0);

  // Pagination state
  const [shopsIndex, setShopsIndex] = useState(0);
  const [productsIndex, setProductsIndex] = useState(0);

  // Animation state
  const [isAnimating, setIsAnimating] = useState(false);
  const [shopsVisible, setShopsVisible] = useState(true);
  const [productsVisible, setProductsVisible] = useState(true);

  // View all mode
  const [viewAllMode, setViewAllMode] = useState<'shops' | 'products' | null>(null);

  // Seed for shuffling (stable during session, changes on page refresh)
  const [shuffleSeed] = useState(() => Date.now());

  // Get categories and search from URL params (support both legacy single and new multi-select)
  const currentCategories = params?.get('categories')?.split(',').filter(Boolean) ||
    (params?.get('category') ? [params.get('category')!] : []);
  const searchQuery = params?.get('q') || '';

  const headerSearchParams = {
    category: currentCategories[0] || undefined,
  };

  // Responsive grid - adds 1 column when sidebar is collapsed
  const gridColsClass = isSidebarCollapsed
    ? 'grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6'
    : 'grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5';

  // Reset pagination on sidebar change
  useEffect(() => {
    setShopsIndex(0);
    setProductsIndex(0);
  }, [isSidebarCollapsed]);


  // Filtering logic to determine when to show section headers
  const filterInfo = useMemo(() => {
    const categoryIsActive = currentCategories.length > 0;
    const hasSearchFilter = !!searchQuery?.trim();
    const isFiltered = categoryIsActive || hasSearchFilter;

    let resultsHeaderText = '';
    if (categoryIsActive) {
      if (currentCategories.length === 1) {
        resultsHeaderText = `${currentCategories[0]} Results`;
      } else {
        resultsHeaderText = `${currentCategories.length} Categories`;
      }
    } else if (hasSearchFilter) {
      resultsHeaderText = 'Search Results';
    }

    return {
      isFiltered,
      categoryIsActive,
      resultsHeaderText,
      currentCategories
    };
  }, [currentCategories, searchQuery]);

  const q = searchQuery.trim().toLowerCase();

  // Merge real data with mocks (real data first, mocks fill in if empty)
  const allShops = useMemo(() => {
    const realIds = new Set(initialShops.map(s => s.id));
    const mocks = MOCK_SHOPS.filter(s => !realIds.has(s.id));
    return [...initialShops, ...mocks];
  }, [initialShops]);

  const allProducts = useMemo(() => {
    const realIds = new Set(featuredProducts.map(p => p.id));
    const mocks = MOCK_PRODUCTS.filter(p => !realIds.has(p.id));
    return [...featuredProducts, ...mocks];
  }, [featuredProducts]);

  const filteredShops = useMemo(() => {
    let result = allShops;
    if (q) {
      result = result.filter(
        (s) =>
          s.name.toLowerCase().includes(q) ||
          (s.description || '').toLowerCase().includes(q)
      );
    }
    if (currentCategories.length > 0) {
      result = result.filter((s) => currentCategories.includes((s as any).category));
    }
    return result;
  }, [allShops, q, currentCategories]);

  const filteredProducts = useMemo(() => {
    let result = allProducts;
    if (q) {
      result = result.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          (p.description || '').toLowerCase().includes(q)
      );
    }
    if (currentCategories.length > 0) {
      result = result.filter((p) => currentCategories.includes((p as any).category));
    }
    return result;
  }, [allProducts, q, currentCategories]);

  // Shuffled arrays for randomized display
  const shops = useMemo(() => {
    return shuffleArray(filteredShops, shuffleSeed);
  }, [filteredShops, shuffleSeed]);

  const products = useMemo(() => {
    return shuffleArray(filteredProducts, shuffleSeed + 1);
  }, [filteredProducts, shuffleSeed]);

  const hasShops = shops.length > 0;
  const hasProducts = products.length > 0;
  const hasContent = hasShops || hasProducts;

  // Animated transition helper (matching market pattern)
  const animateTransition = (
    setVisible: (visible: boolean) => void,
    setIndex: (index: number) => void,
    currentIndex: number,
    totalPages: number,
    direction: 'left' | 'right'
  ) => {
    if (totalPages <= 1 || isAnimating) return;

    setIsAnimating(true);
    setVisible(false);

    setTimeout(() => {
      const newIndex = direction === 'right'
        ? (currentIndex + 1) % totalPages
        : currentIndex === 0 ? totalPages - 1 : currentIndex - 1;

      setIndex(newIndex);
      setTimeout(() => {
        setVisible(true);
        setIsAnimating(false);
      }, 50);
    }, FADE_OUT_DURATION);
  };

  // Paginated items
  const currentShops = useMemo(() => {
    if (shops.length <= ITEMS_PER_PAGE) return shops;
    const start = shopsIndex * ITEMS_PER_PAGE;
    return shops.slice(start, start + ITEMS_PER_PAGE);
  }, [shops, shopsIndex]);

  const currentProducts = useMemo(() => {
    if (products.length <= ITEMS_PER_PAGE) return products;
    const start = productsIndex * ITEMS_PER_PAGE;
    return products.slice(start, start + ITEMS_PER_PAGE);
  }, [products, productsIndex]);

  // Total pages
  const totalShopsPages = Math.max(1, Math.ceil(shops.length / ITEMS_PER_PAGE));
  const totalProductsPages = Math.max(1, Math.ceil(products.length / ITEMS_PER_PAGE));

  // Scroll handlers
  const scrollShops = (dir: 'left' | 'right') =>
    animateTransition(setShopsVisible, setShopsIndex, shopsIndex, totalShopsPages, dir);

  const scrollProducts = (dir: 'left' | 'right') =>
    animateTransition(setProductsVisible, setProductsIndex, productsIndex, totalProductsPages, dir);

  // View all handlers
  const handleViewAllShops = () => {
    setViewAllMode('shops');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleViewAllProducts = () => {
    setViewAllMode('products');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleBackToMain = () => {
    setViewAllMode(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <>
      <PageHeader currentUser={currentUser} />

      {/* Editorial Banner */}
      <div className="mt-8">
        <div
          className="relative group overflow-hidden rounded-2xl cursor-pointer"
          onClick={() => router.push(BANNERS[activeBanner].href)}
        >
          <div className="aspect-[4/1] bg-stone-900 relative">
            <Image
              key={activeBanner}
              src={BANNERS[activeBanner].src}
              alt={BANNERS[activeBanner].alt}
              fill
              className="object-contain group-hover:scale-[1.02] transition-all duration-700 ease-out"
            />
            <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-black/80 to-transparent" />
            {/* Forme wordmark icon — top right */}
            <div className="absolute top-4 right-4 text-white/75">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="30" height="30" color="currentColor" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M5.50586 16.9916L8.03146 10.0288C8.49073 9.06222 9.19305 8.26286 9.99777 10.18C10.7406 11.9497 11.8489 15.1903 12.5031 16.9954M6.65339 14.002H11.3215" />
                <path d="M3.46447 5.31802C2 6.63604 2 8.75736 2 13C2 17.2426 2 19.364 3.46447 20.682C4.92893 22 7.28596 22 12 22C16.714 22 19.0711 22 20.5355 20.682C22 19.364 22 17.2426 22 13C22 8.75736 22 6.63604 20.5355 5.31802C19.0711 4 16.714 4 12 4C7.28596 4 4.92893 4 3.46447 5.31802Z" />
                <path d="M18.4843 9.98682V12.9815M18.4843 12.9815V16.9252M18.4843 12.9815H16.466C16.2263 12.9815 15.9885 13.0261 15.7645 13.113C14.0707 13.7702 14.0707 16.2124 15.7645 16.8696C15.9885 16.9565 16.2263 17.0011 16.466 17.0011H18.4843" />
              </svg>
            </div>
            <div className="absolute bottom-0 left-0 p-5">
              <p className="text-xs tracking-wide text-white/80 mb-0.5" style={{ fontFamily: "'Georgia', 'Times New Roman', serif", fontStyle: 'italic' }}>{BANNERS[activeBanner].tag}</p>
              <h3 className="text-xl font-bold text-white leading-snug">{BANNERS[activeBanner].title}</h3>
              <p className="text-sm text-white/70 mt-0.5">{BANNERS[activeBanner].subtitle}</p>
            </div>
          </div>
        </div>
        <div className="flex gap-1.5 mt-3 justify-center items-center">
          {BANNERS.map((_, i) => (
            <button
              key={i}
              onClick={() => setActiveBanner(i)}
              className={`rounded-full transition-all duration-300 ${
                activeBanner === i
                  ? 'w-4 h-1.5 bg-stone-900 dark:bg-white'
                  : 'w-1.5 h-1.5 bg-stone-300 dark:bg-zinc-600 hover:bg-stone-400 dark:hover:bg-zinc-500'
              }`}
            />
          ))}
        </div>
      </div>

      {/* Shop By Category */}
      <div>
        <SectionHeader
          title="Shop By Category"
          onViewAll={() => {/* TODO: show more categories */}}
          viewAllLabel="View all"
        />
        <div className="flex gap-6 overflow-x-auto pb-2 pl-4 pr-4 -ml-4 scrollbar-hide">
          {(() => {
            const imageMap: Record<string, string> = {
              Wellness: '/assets/people/wellness.png',
              Training: '/assets/people/fitness.png',
              Barber: '/assets/people/barber.png',
              Salon: '/assets/people/salon.png',
              Nails: '/assets/people/nails.png',
              Skincare: '/assets/people/skincare.png',
              Lash: '/assets/people/lashes.png',
              Brows: '/assets/people/brows.png',
              Ink: '/assets/people/ink.png',
            };
            return categories.map((cat) => {
              const isSelected = currentCategories.includes(cat.label);
              const imageSrc = imageMap[cat.label];
              return (
                <button
                  key={cat.label}
                  onClick={() => {
                    const p = new URLSearchParams(params?.toString() || '');
                    if (isSelected) {
                      p.delete('category');
                    } else {
                      p.set('category', cat.label);
                    }
                    router.push(`/shops?${p.toString()}`);
                  }}
                  className="flex flex-col items-center gap-2 shrink-0 group"
                >
                  <div
                    className={`w-[100px] h-[100px] rounded-full overflow-hidden flex items-center justify-center bg-black transition-all duration-500 ease-out border-2 ${
                      isSelected
                        ? 'border-zinc-900 dark:border-white scale-105 shadow-lg'
                        : 'border-stone-200 dark:border-zinc-700 group-hover:border-stone-400 dark:group-hover:border-zinc-500 group-hover:scale-105 group-hover:shadow-md'
                    }`}
                  >
                    {imageSrc && (
                      <Image
                        src={imageSrc}
                        alt={cat.label}
                        width={100}
                        height={100}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                      />
                    )}
                  </div>
                  <span className={`text-sm transition-all duration-200 ${
                    isSelected
                      ? 'text-gray-900 dark:text-white font-medium'
                      : 'text-gray-500 dark:text-gray-400 group-hover:text-gray-700 dark:group-hover:text-gray-300'
                  }`}>{cat.label}</span>
                </button>
              );
            });
          })()}
        </div>
      </div>

      {/* Content */}
      <div className="relative mt-2">
        <div>
          {hasContent ? (
            <>
              {/* View All Shops Mode */}
              {viewAllMode === 'shops' && (
                <>
                  <SectionHeader
                    title="All Shops"
                    className="mb-6"
                    onViewAll={handleBackToMain}
                    viewAllLabel="← Back to Shops"
                  />
                  <div className={`grid ${gridColsClass} gap-4 transition-all duration-300`}>
                    {shops.map((shop, idx) => (
                      <div
                        key={shop.id}
                        style={{
                          opacity: 0,
                          animation: `fadeInUp 520ms ease-out both`,
                          animationDelay: `${Math.min(idx * 30, 300)}ms`,
                          willChange: 'transform, opacity',
                        }}
                      >
                        <ShopCard data={shop} currentUser={currentUser} />
                      </div>
                    ))}
                  </div>
                </>
              )}

              {/* View All Products Mode */}
              {viewAllMode === 'products' && (
                <>
                  <SectionHeader
                    title="All Products"
                    className="mb-6"
                    onViewAll={handleBackToMain}
                    viewAllLabel="← Back to Shops"
                  />
                  <div className={`grid ${gridColsClass} gap-4 transition-all duration-300`}>
                    {products.map((product, idx) => (
                      <div
                        key={product.id}
                        style={{
                          opacity: 0,
                          animation: `fadeInUp 520ms ease-out both`,
                          animationDelay: `${Math.min(idx * 30, 300)}ms`,
                          willChange: 'transform, opacity',
                        }}
                      >
                        <ProductCard data={product} currentUser={currentUser} />
                      </div>
                    ))}
                  </div>
                </>
              )}

              {/* Normal View - Show sections with pagination */}
              {!viewAllMode && (
                <>
                  {/* ===== Featured Shops Section ===== */}
                  {!filterInfo.isFiltered && hasShops && (
                    <>
                      <SectionHeader
                        title="Featured Shops"
                        onPrev={() => scrollShops('left')}
                        onNext={() => scrollShops('right')}
                        onViewAll={handleViewAllShops}
                      />
                      <div id="shops-rail">
                        <div className={`grid ${gridColsClass} gap-4 transition-all duration-300`}>
                          {currentShops.map((shop, idx) => (
                            <div
                              key={`${shop.id}-${shopsIndex}`}
                              style={{
                                opacity: shopsVisible ? 0 : 0,
                                animation: shopsVisible ? `fadeInUp 520ms ease-out both` : 'none',
                                animationDelay: shopsVisible ? `${140 + idx * 30}ms` : '0ms',
                                willChange: 'transform, opacity',
                                transition: !shopsVisible ? `opacity ${FADE_OUT_DURATION}ms ease-out` : 'none',
                              }}
                              className={!shopsVisible ? 'opacity-0' : ''}
                            >
                              <ShopCard data={shop} currentUser={currentUser} />
                            </div>
                          ))}
                        </div>
                      </div>
                    </>
                  )}

                  {/* ===== Featured Products Section ===== */}
                  {!filterInfo.isFiltered && hasProducts && (
                    <>
                      <SectionHeader
                        title="Featured Products"
                        onPrev={() => scrollProducts('left')}
                        onNext={() => scrollProducts('right')}
                        onViewAll={handleViewAllProducts}
                      />
                      <div id="products-rail">
                        <div className={`grid ${gridColsClass} gap-4 pb-8 transition-all duration-300`}>
                          {currentProducts.map((product, idx) => (
                            <div
                              key={`${product.id}-${productsIndex}`}
                              style={{
                                opacity: productsVisible ? 0 : 0,
                                animation: productsVisible ? `fadeInUp 520ms ease-out both` : 'none',
                                animationDelay: productsVisible ? `${160 + idx * 30}ms` : '0ms',
                                willChange: 'transform, opacity',
                                transition: !productsVisible ? `opacity ${FADE_OUT_DURATION}ms ease-out` : 'none',
                              }}
                              className={!productsVisible ? 'opacity-0' : ''}
                            >
                              <ProductCard data={product} currentUser={currentUser} />
                            </div>
                          ))}
                        </div>
                      </div>
                    </>
                  )}

                  {/* ===== Results Section Header (when filtered) ===== */}
                  {filterInfo.isFiltered && filterInfo.resultsHeaderText && (
                    <SectionHeader
                      title={filterInfo.resultsHeaderText}
                      onViewAll={handleBackToMain}
                      viewAllLabel="← Back to Shops"
                    />
                  )}

                  {/* ===== Filtered Results - Shops Grid ===== */}
                  {filterInfo.isFiltered && hasShops && (
                    <div className={`grid ${gridColsClass} gap-4 mb-8 transition-all duration-300`}>
                      {shops.map((shop, idx) => (
                        <div
                          key={shop.id}
                          style={{
                            opacity: 0,
                            animation: `fadeInUp 520ms ease-out both`,
                            animationDelay: `${Math.min(idx * 30, 300)}ms`,
                            willChange: 'transform, opacity',
                          }}
                        >
                          <ShopCard data={shop} currentUser={currentUser} />
                        </div>
                      ))}
                    </div>
                  )}

                  {/* ===== Filtered Results - Products Grid ===== */}
                  {filterInfo.isFiltered && hasProducts && (
                    <div className={`grid ${gridColsClass} gap-4 transition-all duration-300`}>
                      {products.map((product, idx) => (
                        <div
                          key={product.id}
                          style={{
                            opacity: 0,
                            animation: `fadeInUp 520ms ease-out both`,
                            animationDelay: `${Math.min(idx * 30, 300)}ms`,
                            willChange: 'transform, opacity',
                          }}
                        >
                          <ProductCard data={product} currentUser={currentUser} />
                        </div>
                      ))}
                    </div>
                  )}
                </>
              )}
            </>
          ) : (
            <div className="px-8 pt-32 text-center text-gray-500">
              No shops or products found. Try adjusting your search.
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default ShopClient;
