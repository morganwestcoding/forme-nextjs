'use client';

import { useState, useEffect, useCallback } from 'react';
import { FieldValues, SubmitHandler, useForm } from 'react-hook-form';
import { useRouter, useSearchParams } from 'next/navigation';
import Modal from './Modal';
import Heading from '../Heading';
import Input from '../inputs/Input';
import CategoryInput from '../inputs/CategoryInput';
import { categories } from '../Categories';
import { MapPin, Search, X, Grid, Building, MessageCircle, ShoppingBag, Waves, Anchor, Rocket, Palette, Droplet, User } from 'lucide-react';
import useFilterModal from '@/app/hooks/useFilterModal';

export interface FilterValues {
  keywords?: string;
  category?: string;
  contentType?: 'all' | 'listings' | 'shops' | 'posts' | 'products';
  location?: string;
  radius?: number;
  priceMin?: number;
  priceMax?: number;
  openNow?: boolean;
  verified?: boolean;
  featured?: boolean;
}

const CONTENT_TYPES = [
  { value: 'all', label: 'All', icon: Grid },
  { value: 'listings', label: 'Services', icon: Building },
  { value: 'shops', label: 'Shops', icon: ShoppingBag },
  { value: 'posts', label: 'Posts', icon: MessageCircle },
];

const RADIUS_OPTIONS = [
  { value: 5, label: '5mi' },
  { value: 10, label: '10mi' },
  { value: 25, label: '25mi' },
  { value: 50, label: '50mi' },
  { value: 100, label: '100+mi' },
];

const FilterModal = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const filterModal = useFilterModal();
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<FieldValues>({
    defaultValues: {
      keywords: '',
      category: '',
      contentType: 'all',
      location: '',
      radius: 25,
      priceMin: '',
      priceMax: '',
      openNow: false,
      verified: false,
      featured: false,
    }
  });

  // Load filters from URL params on open
  useEffect(() => {
    if (!filterModal.isOpen) return;
    
    const params = new URLSearchParams(searchParams?.toString() || '');
    reset({
      keywords: params.get('q') || '',
      category: params.get('category') || '',
      contentType: params.get('type') || 'all',
      location: params.get('location') || '',
      radius: Number(params.get('radius')) || 25,
      priceMin: params.get('minPrice') || '',
      priceMax: params.get('maxPrice') || '',
      openNow: params.get('openNow') === 'true',
      verified: params.get('verified') === 'true',
      featured: params.get('featured') === 'true',
    });
  }, [filterModal.isOpen, searchParams, reset]);

  const watchedValues = watch();

  const setCustomValue = (id: string, value: any) => {
    setValue(id, value, { shouldDirty: true, shouldTouch: true, shouldValidate: true });
  };

  const clearAllFilters = () => {
    reset({
      keywords: '',
      category: '',
      contentType: 'all',
      location: '',
      radius: 25,
      priceMin: '',
      priceMax: '',
      openNow: false,
      verified: false,
      featured: false,
    });
  };

  const onSubmit: SubmitHandler<FieldValues> = async (data) => {
    setIsLoading(true);
    
    // Get current URL params
    const current = new URLSearchParams(Array.from(searchParams?.entries() || []));
    
    // Clear existing filter params
    current.delete('q');
    current.delete('category');
    current.delete('type');
    current.delete('location');
    current.delete('radius');
    current.delete('minPrice');
    current.delete('maxPrice');
    current.delete('openNow');
    current.delete('verified');
    current.delete('featured');

    // Apply new filters (only if they have values)
    if (data.keywords?.trim()) current.set('q', data.keywords.trim());
    if (data.category && data.category !== '') current.set('category', data.category);
    if (data.contentType && data.contentType !== 'all') current.set('type', data.contentType);
    if (data.location?.trim()) current.set('location', data.location.trim());
    if (data.radius && data.radius !== 25) current.set('radius', data.radius.toString());
    if (data.priceMin) current.set('minPrice', data.priceMin.toString());
    if (data.priceMax) current.set('maxPrice', data.priceMax.toString());
    if (data.openNow) current.set('openNow', 'true');
    if (data.verified) current.set('verified', 'true');
    if (data.featured) current.set('featured', 'true');

    // Navigate with new params
    const search = current.toString();
    const query = search ? `?${search}` : '';
    
    // Determine current path - default to /market if not clear
    const currentPath = typeof window !== 'undefined' ? window.location.pathname : '/market';
    router.push(`${currentPath}${query}`);
    
    setIsLoading(false);
    filterModal.onClose();
  };

  const handleClose = useCallback(() => {
    filterModal.onClose();
  }, [filterModal]);

  const getActiveFilterCount = () => {
    let count = 0;
    if (watchedValues.keywords?.trim()) count++;
    if (watchedValues.category) count++;
    if (watchedValues.contentType !== 'all') count++;
    if (watchedValues.location?.trim()) count++;
    if (watchedValues.radius !== 25) count++;
    if (watchedValues.priceMin) count++;
    if (watchedValues.priceMax) count++;
    if (watchedValues.openNow) count++;
    if (watchedValues.verified) count++;
    if (watchedValues.featured) count++;
    return count;
  };

  const activeFilterCount = getActiveFilterCount();

  const bodyContent = (
    <div className="flex flex-col gap-4 max-h-[70vh] overflow-y-auto px-1">
      <div className="flex items-center justify-between">
        <Heading title="Filter Results" subtitle="Narrow down your search" />
        {activeFilterCount > 0 && (
          <button
            type="button"
            onClick={clearAllFilters}
            className="text-sm text-neutral-500 hover:text-neutral-700 flex items-center gap-1"
          >
            <X size={14} />
            Clear ({activeFilterCount})
          </button>
        )}
      </div>

      {/* Quick Filters */}
      <div className="space-y-3">
        <label className="text-sm font-medium text-neutral-700">Quick Filters</label>
        <div className="grid grid-cols-3 gap-2.5">
          {[
            { id: 'openNow', label: 'Open Now' },
            { id: 'verified', label: 'Verified' },
            { id: 'featured', label: 'Featured' },
          ].map((filter) => (
            <button
              key={filter.id}
              type="button"
              onClick={() => {
                const currentValue = watchedValues[filter.id];
                setCustomValue(filter.id, !currentValue);
              }}
              className={`
                rounded-xl shadow flex items-center justify-center p-3
                cursor-pointer select-none transition-all duration-200 text-xs font-medium
                ${watchedValues[filter.id]
                  ? 'bg-[#60A5FA] text-white'
                  : 'bg-neutral-100 text-neutral-700 hover:bg-blue-50'
                }
              `}
            >
              {filter.label}
            </button>
          ))}
        </div>
      </div>

      {/* Keywords */}
      <div className="space-y-2">
        <Input
          id="keywords"
          label="Keywords"
          disabled={isLoading}
          register={register}
          errors={errors}
        />
      </div>

      {/* Content Type */}
      <div className="space-y-3">
        <label className="text-sm font-medium text-neutral-700">Content Type</label>
        <div className="grid grid-cols-4 gap-2.5">
          {CONTENT_TYPES.map((type) => {
            const Icon = type.icon;
            return (
              <button
                key={type.value}
                type="button"
                onClick={() => setCustomValue('contentType', type.value)}
                className={`
                  rounded-xl shadow flex flex-col items-center justify-center p-3 space-y-1
                  cursor-pointer select-none transition-all duration-200
                  ${watchedValues.contentType === type.value 
                    ? 'bg-[#60A5FA] text-white' 
                    : 'bg-neutral-100 text-neutral-700 hover:bg-blue-50'
                  }
                `}
              >
                <Icon className="w-4 h-4" />
                <span className="text-xs">{type.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Category */}
      <div className="space-y-3">
        <label className="text-sm font-medium text-neutral-700">Category</label>
        <div className="grid grid-cols-4 gap-2.5">
          <button
            type="button"
            onClick={() => setCustomValue('category', '')}
            className={`
              rounded-xl shadow flex flex-col items-center justify-center p-3 space-y-1
              cursor-pointer select-none transition-all duration-200
              ${!watchedValues.category 
                ? 'bg-[#60A5FA] text-white' 
                : 'bg-neutral-100 text-neutral-700 hover:bg-blue-50'
              }
            `}
          >
            <Grid className="w-4 h-4" />
            <span className="text-xs">All</span>
          </button>
          {categories.slice(0, 7).map((cat) => {
            // Icon mapping like in CategoryInput
            const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
              Massage: Waves,
              Wellness: Anchor,
              Fitness: Rocket,
              Nails: Palette,
              Spa: Droplet,
              Barber: User,
              Beauty: Palette,
              Salon: Waves,
            };
            
            const Icon = iconMap[cat.label] || Waves;
            
            return (
              <button
                key={cat.label}
                type="button"
                onClick={() => setCustomValue('category', cat.label)}
                className={`
                  rounded-xl shadow flex flex-col items-center justify-center p-3 space-y-1
                  cursor-pointer select-none transition-all duration-200
                  ${watchedValues.category === cat.label 
                    ? 'bg-[#60A5FA] text-white' 
                    : 'bg-neutral-100 text-neutral-700 hover:bg-blue-50'
                  }
                `}
              >
                <Icon className="w-4 h-4" />
                <span className="text-xs">{cat.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Location & Radius */}
      <div className="space-y-3">
        <label className="text-sm font-medium text-neutral-700">Location & Distance</label>
        <div className="grid grid-cols-2 gap-2.5">
          <Input
            id="location"
            label="Location"
            disabled={isLoading}
            register={register}
            errors={errors}
          />
          <Input
            id="radius"
            label="Radius (miles)"
            type="number"
            disabled={isLoading}
            register={register}
            errors={errors}
          />
        </div>
      </div>

      {/* Price Range */}
      <div className="space-y-3">
        <label className="text-sm font-medium text-neutral-700">Price Range</label>
        <div className="grid grid-cols-2 gap-2.5">
          <Input
            id="priceMin"
            label="Min Price"
            type="number"
            disabled={isLoading}
            register={register}
            errors={errors}
          />
          <Input
            id="priceMax"
            label="Max Price"
            type="number"
            disabled={isLoading}
            register={register}
            errors={errors}
          />
        </div>
      </div>
    </div>
  );

  return (
    <Modal
      id="filter-modal"
      isOpen={filterModal.isOpen}
      title="Filter Results"
      actionLabel="Apply Filters"
      onSubmit={handleSubmit(onSubmit)}
      secondaryActionLabel="Cancel"
      secondaryAction={handleClose}
      onClose={handleClose}
      body={bodyContent}
      disabled={isLoading}
      className="w-full md:w-4/6 lg:w-3/6 xl:w-2/5"
    />
  );
};

export default FilterModal;