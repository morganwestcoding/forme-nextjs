// components/newsfeed/NewsfeedHeader.tsx
'use client';

import React, { useState } from 'react';
import { Grid, List, Sparkles, TrendingUp, Layers, User, Scissors, Droplet, SprayCan, Waves, Palette, Flower, Dumbbell } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import { categories } from '@/components/Categories';
import useRentModal from '@/app/hooks/useRentModal';
import useCreatePostModal from '@/app/hooks/useCreatePostModal';
import GlobalSearch from '../search/GlobalSearch';

interface ViewState {
  mode: 'horizontal' | 'vertical';
  filters: {
    category: string;
    minPrice?: number;
    maxPrice?: number;
    sortBy?: 'price' | 'date' | 'name';
    sortOrder?: 'asc' | 'desc';
    city?: string;
    state?: string;
  };
}

interface NewsfeedHeaderProps {
  searchParams: {
    userId?: string;
    locationValue?: string;
    category?: string;
    state?: string;
    city?: string;
    minPrice?: number;
    maxPrice?: number;
    order?: 'asc' | 'desc';
    page?: string;
  };
  viewState: ViewState;
  setViewState: React.Dispatch<React.SetStateAction<ViewState>>;
}

const NewsfeedHeader: React.FC<NewsfeedHeaderProps> = ({
  searchParams,
  viewState,
  setViewState
}) => {
  const router = useRouter();
  const params = useSearchParams();
  const rentModal = useRentModal(); // kept if you use it somewhere else
  const createPostModal = useCreatePostModal();

  const [showCategories, setShowCategories] = useState(false);
  const currentCategory = searchParams.category || '';

  const categoryIcons: Record<string, any> = {
    Massage: Waves,
    Wellness: Flower,
    Fitness: Dumbbell,
    Nails: Palette,
    Spa: Droplet,
    Barber: Scissors,
    Default: User,
    Salon: SprayCan,
  };

  const handleViewModeChange = (mode: 'horizontal' | 'vertical') => {
    setViewState(prev => ({
      ...prev,
      mode,
    }));
  };

  const handleCreatePost = () => {
    createPostModal.onOpen();
  };

  const handleFilterChange = (category: string) => {
    if (category === 'categories') {
      setShowCategories(prev => !prev);
    } else {
      setShowCategories(false);
    }

    setViewState(prev => ({
      ...prev,
      filters: {
        ...prev.filters,
        category,
      },
    }));
  };

  const handleCategorySelect = (categoryLabel: string) => {
    const current = new URLSearchParams(Array.from(params?.entries() || []));

    if (categoryLabel === 'All') {
      current.delete('category');
    } else {
      current.set('category', categoryLabel);
    }

    const search = current.toString();
    const query = search ? `?${search}` : '';
    router.push(`/newsfeed${query}`);
    setShowCategories(false);
  };

  const getCategoryStyle = (categoryLabel: string) => {
    const category = categories.find(cat => cat.label === categoryLabel);
    if (!category) return { color: '#60A5FA', bgColor: 'bg-[#60A5FA]' };

    // Extract hex color from bg-[#xxxxxx] classes
    const hexMatch = category.color.match(/#[A-Fa-f0-9]{6}/);
    const hexColor = hexMatch ? hexMatch[0] : '#60A5FA';

    return { color: hexColor, bgColor: category.color };
  };

  return (
    <div className="min-h-0">
      {/* Search and Controls */}
      <div className="flex mt-4 mb-8 gap-2">
        {/* Global Search (dropdown) */}
        <div className="relative flex-grow">
          <GlobalSearch placeholder="Search posts, users, listings, shops, products…" />
        </div>

        {/* View Toggle */}
        <div className="bg-[#EBF4FE] rounded-xl flex items-center p-1 shadow-sm px-2">
          <button
            onClick={() => handleViewModeChange('horizontal')}
            className={`p-2 rounded-lg ${
              viewState.mode === 'horizontal' ? 'bg-white shadow-sm text-[#60A5FA]' : 'text-gray-400'
            }`}
            title="Grid View"
            aria-label="Grid View"
          >
            <Grid className="w-5 h-5" />
          </button>
          <button
            onClick={() => handleViewModeChange('vertical')}
            className={`p-2 rounded-lg ${
              viewState.mode === 'vertical' ? 'bg-white text-[#60A5FA]' : 'text-gray-400'
            }`}
            title="Vertical Feed"
            aria-label="Vertical Feed"
          >
            <List className="w-5 h-5" />
          </button>
        </div>

        {/* Filters Button (placeholder trigger; wire to your filters modal/drawer) */}
        <button className="shadow-sm bg-white text-gray-500 py-3 px-4 rounded-xl hover:bg-neutral-100 transition-colors flex items-center space-x-2 text-sm">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            width="22"
            height="22"
            color="currentColor"
            fill="none"
            aria-hidden="true"
          >
            <path
              d="M14.5405 2V4.48622C14.5405 6.23417 14.5405 7.10814 14.7545 7.94715C14.9685 8.78616 15.3879 9.55654 16.2267 11.0973L17.3633 13.1852C19.5008 17.1115 20.5696 19.0747 19.6928 20.53L19.6792 20.5522C18.7896 22 16.5264 22 12 22C7.47357 22 5.21036 22 4.3208 20.5522L4.30725 20.53C3.43045 19.0747 4.49918 17.1115 6.63666 13.1852L7.7733 11.0973C8.61209 9.55654 9.03149 8.78616 9.24548 7.94715C9.45947 7.10814 9.45947 6.23417 9.45947 4.48622V2"
              stroke="currentColor"
              strokeWidth="1.5"
            ></path>
            <path
              d="M9 16.002L9.00868 15.9996"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            ></path>
            <path
              d="M15 18.002L15.0087 17.9996"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            ></path>
            <path
              d="M8 2L16 2"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            ></path>
            <path
              d="M7.5 11.5563C8.5 10.4029 10.0994 11.2343 12 12.3182C14.5 13.7439 16 12.65 16.5 11.6152"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
            ></path>
          </svg>
          <span>Filters</span>
        </button>

        {/* Create Button */}
        <button
          onClick={handleCreatePost}
          className="flex items-center justify-center py-3 space-x-2 px-4 shadow-sm rounded-xl transition-all bg-white text-gray-500 hover:bg-neutral-200"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            width="22"
            height="22"
            color="currentColor"
            fill="none"
            aria-hidden="true"
          >
            <path
              d="M16.4249 4.60509L17.4149 3.6151C18.2351 2.79497 19.5648 2.79497 20.3849 3.6151C21.205 4.43524 21.205 5.76493 20.3849 6.58507L19.3949 7.57506M16.4249 4.60509L9.76558 11.2644C9.25807 11.772 8.89804 12.4078 8.72397 13.1041L8 16L10.8959 15.276C11.5922 15.102 12.228 14.7419 12.7356 14.2344L19.3949 7.57506M16.4249 4.60509L19.3949 7.57506"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinejoin="round"
            ></path>
            <path
              d="M18.9999 13.5C18.9999 16.7875 18.9999 18.4312 18.092 19.5376C17.9258 19.7401 17.7401 19.9258 17.5375 20.092C16.4312 21 14.7874 21 11.4999 21H11C7.22876 21 5.34316 21 4.17159 19.8284C3.00003 18.6569 3 16.7712 3 13V12.5C3 9.21252 3 7.56879 3.90794 6.46244C4.07417 6.2599 4.2599 6.07417 4.46244 5.90794C5.56879 5 7.21252 5 10.5 5"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            ></path>
          </svg>
          <span className="text-sm">Create</span>
        </button>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-200 relative justify-center mb-6">
        <div className="flex gap-8">
          {[
            { key: 'featured', label: 'Featured', Icon: Sparkles },
            { key: 'trending', label: 'Trending', Icon: TrendingUp },
            { key: 'categories', label: 'Categories', Icon: Layers },
          ].map(({ key, label, Icon }) => {
            const isActive =
              key === 'categories'
                ? viewState.filters.category === 'categories' || showCategories
                : viewState.filters.category === key;

            const activeColor =
              currentCategory ? getCategoryStyle(currentCategory).color : '#60A5FA';

            return (
              <button
                key={key}
                onClick={() =>
                  handleFilterChange(key === 'categories' ? 'categories' : key)
                }
                className={`
                  relative flex items-center justify-center gap-2
                  px-4 pt-2 pb-4 h-10
                  text-sm font-medium whitespace-nowrap
                  transition-colors duration-150
                  ${isActive ? '' : 'text-gray-500 hover:text-gray-700'}
                  after:absolute after:inset-x-0 after:bottom-0
                  after:h-0.5 after:rounded
                  after:transition-colors after:duration-150
                  after:${isActive ? '' : 'bg-transparent'}
                `}
                style={{
                  color: isActive ? activeColor : undefined,
                  ['--underline' as any]: activeColor,
                }}
                aria-pressed={isActive}
              >
                <Icon height={22} width={22} strokeWidth={1.75} />
                <span>{label}</span>
                <span
                  aria-hidden
                  className="pointer-events-none absolute inset-x-0 bottom-0 h-0.5 rounded"
                  style={{ backgroundColor: isActive ? activeColor : 'transparent' }}
                />
              </button>
            );
          })}
        </div>
      </div>

      {/* Category Pills - visible when Categories tab is active */}
      {(showCategories || viewState.filters.category === 'categories') && (
        <div className="pb-6">
          <div className="flex flex-wrap gap-3">
            {/* All Categories */}
            <button
              onClick={() => handleCategorySelect('All')}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                !currentCategory
                  ? 'bg-[#60A5FA] text-white shadow-md'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              All Categories
            </button>

            {/* Individual Category Pills */}
            {categories.map((category) => {
              const isSelected = currentCategory === category.label;
              const categoryStyle = getCategoryStyle(category.label);
              const IconComponent =
                categoryIcons[category.label] || categoryIcons['Default'];
              return (
                <button
                  key={category.label}
                  onClick={() => handleCategorySelect(category.label)}
                  className={`w-24 py-2 rounded-xl text-sm font-medium transition-all flex items-center justify-center gap-2 ${
                    isSelected
                      ? `text-white shadow-md`
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                  style={
                    isSelected
                      ? {
                          backgroundColor: categoryStyle.color,
                          color: 'white',
                        }
                      : {}
                  }
                >
                  <IconComponent className="w-4 h-4" />
                  {category.label}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default NewsfeedHeader;
