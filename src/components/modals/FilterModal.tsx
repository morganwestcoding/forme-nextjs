'use client';

import { useState, useEffect, useCallback } from 'react';
import { FieldValues, SubmitHandler, useForm } from 'react-hook-form';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  MapPin,
  DollarSign,
  Star,
  Grid3X3,
  ChevronLeft,
  ChevronRight,
  Check,
  RotateCcw
} from 'lucide-react';
import Modal from './Modal';
import useFilterModal from '@/app/hooks/useFilterModal';
import { categories } from '../Categories';

export interface FilterValues {
  location?: string;
  radius?: number;
  priceMin?: number;
  priceMax?: number;
  rating?: number;
  categories?: string[];
}

type FilterStep = 'main' | 'price' | 'location' | 'category' | 'rating';

const RADIUS_OPTIONS = [
  { value: 5, label: '5 miles' },
  { value: 10, label: '10 miles' },
  { value: 25, label: '25 miles' },
  { value: 50, label: '50 miles' },
  { value: 100, label: '100+ miles' },
];

const RATING_OPTIONS = [
  { value: 0, label: 'Any rating', description: 'Show all results' },
  { value: 4, label: '4+ stars', description: 'Excellent' },
  { value: 3, label: '3+ stars', description: 'Good and above' },
  { value: 2, label: '2+ stars', description: 'Fair and above' },
];

const FilterModal = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const filterModal = useFilterModal();
  const [isLoading, setIsLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState<FilterStep>('main');

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
  } = useForm<FieldValues>({
    defaultValues: {
      location: '',
      radius: 25,
      priceMin: '',
      priceMax: '',
      rating: 0,
      categories: [] as string[],
    }
  });

  useEffect(() => {
    if (!filterModal.isOpen) {
      // Reset to main step when modal closes
      setCurrentStep('main');
      return;
    }

    const params = new URLSearchParams(searchParams?.toString() || '');
    const categoryParam = params.get('category');
    const categoriesArray = categoryParam ? categoryParam.split(',').filter(Boolean) : [];

    reset({
      location: params.get('location') || '',
      radius: Number(params.get('radius')) || 25,
      priceMin: params.get('minPrice') || '',
      priceMax: params.get('maxPrice') || '',
      rating: Number(params.get('rating')) || 0,
      categories: categoriesArray,
    });
  }, [filterModal.isOpen, searchParams, reset]);

  const watchedValues = watch();

  const setCustomValue = (id: string, value: any) => {
    setValue(id, value, { shouldDirty: true, shouldTouch: true, shouldValidate: true });
  };

  const toggleCategory = (categoryLabel: string) => {
    const currentCategories = watchedValues.categories || [];
    const isSelected = currentCategories.includes(categoryLabel);

    if (isSelected) {
      setCustomValue('categories', currentCategories.filter((c: string) => c !== categoryLabel));
    } else {
      setCustomValue('categories', [...currentCategories, categoryLabel]);
    }
  };

  const clearAllFilters = () => {
    reset({
      location: '',
      radius: 25,
      priceMin: '',
      priceMax: '',
      rating: 0,
      categories: [],
    });
  };

  const onSubmit: SubmitHandler<FieldValues> = async (data) => {
    setIsLoading(true);

    const current = new URLSearchParams(Array.from(searchParams?.entries() || []));

    current.delete('location');
    current.delete('radius');
    current.delete('minPrice');
    current.delete('maxPrice');
    current.delete('rating');
    current.delete('category');

    if (data.location?.trim()) current.set('location', data.location.trim());
    if (data.radius && data.radius !== 25) current.set('radius', data.radius.toString());
    if (data.priceMin) current.set('minPrice', data.priceMin.toString());
    if (data.priceMax) current.set('maxPrice', data.priceMax.toString());
    if (data.rating && data.rating > 0) current.set('rating', data.rating.toString());
    if (data.categories && data.categories.length > 0) current.set('category', data.categories.join(','));

    const search = current.toString();
    const query = search ? `?${search}` : '';

    const currentPath = typeof window !== 'undefined' ? window.location.pathname : '/market';
    router.push(`${currentPath}${query}`);

    setIsLoading(false);
    filterModal.onClose();
  };

  const handleClose = useCallback(() => {
    filterModal.onClose();
  }, [filterModal]);

  // Check if each filter type has active values
  const hasPriceFilter = !!(watchedValues.priceMin || watchedValues.priceMax);
  const hasLocationFilter = !!(watchedValues.location?.trim() || watchedValues.radius !== 25);
  const hasCategoryFilter = watchedValues.categories?.length > 0;
  const hasRatingFilter = watchedValues.rating > 0;

  const getActiveFilterCount = () => {
    let count = 0;
    if (hasPriceFilter) count++;
    if (hasLocationFilter) count++;
    if (hasCategoryFilter) count++;
    if (hasRatingFilter) count++;
    return count;
  };

  const activeFilterCount = getActiveFilterCount();

  // Get summary text for each filter
  const getPriceSummary = () => {
    if (!hasPriceFilter) return null;
    if (watchedValues.priceMin && watchedValues.priceMax) return `$${watchedValues.priceMin} - $${watchedValues.priceMax}`;
    if (watchedValues.priceMin) return `From $${watchedValues.priceMin}`;
    if (watchedValues.priceMax) return `Up to $${watchedValues.priceMax}`;
    return null;
  };

  const getLocationSummary = () => {
    if (!hasLocationFilter) return null;
    if (watchedValues.location) return `${watchedValues.location} (${watchedValues.radius} mi)`;
    if (watchedValues.radius !== 25) return `Within ${watchedValues.radius} miles`;
    return null;
  };

  const getCategorySummary = () => {
    if (!hasCategoryFilter) return null;
    const count = watchedValues.categories.length;
    if (count === 1) return watchedValues.categories[0];
    return `${count} selected`;
  };

  const getRatingSummary = () => {
    if (!hasRatingFilter) return null;
    return `${watchedValues.rating}+ stars`;
  };

  // Filter option card for main step
  const FilterCard = ({
    icon: Icon,
    label,
    hasFilter,
    summary,
    onClick
  }: {
    icon: any;
    label: string;
    hasFilter: boolean;
    summary: string | null;
    onClick: () => void;
  }) => (
    <button
      type="button"
      onClick={onClick}
      className={`w-full flex items-center justify-between p-4 rounded-2xl border transition-all duration-200 text-left ${
        hasFilter
          ? 'border-[#60A5FA] bg-[#60A5FA]/5'
          : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-800/50'
      }`}
    >
      <div className="flex items-center gap-4">
        <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${
          hasFilter
            ? 'bg-[#60A5FA] text-white'
            : 'bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400'
        }`}>
          <Icon className="w-5 h-5" />
        </div>
        <div>
          <div className="font-medium text-gray-900 dark:text-white">{label}</div>
          {summary ? (
            <div className="text-sm text-[#60A5FA]">{summary}</div>
          ) : (
            <div className="text-sm text-gray-500 dark:text-gray-400">Any</div>
          )}
        </div>
      </div>
      <ChevronRight className={`w-5 h-5 ${hasFilter ? 'text-[#60A5FA]' : 'text-gray-400'}`} />
    </button>
  );

  // Main step content
  const MainContent = () => (
    <div className="flex flex-col gap-3">
      <FilterCard
        icon={DollarSign}
        label="Price"
        hasFilter={hasPriceFilter}
        summary={getPriceSummary()}
        onClick={() => setCurrentStep('price')}
      />
      <FilterCard
        icon={MapPin}
        label="Location"
        hasFilter={hasLocationFilter}
        summary={getLocationSummary()}
        onClick={() => setCurrentStep('location')}
      />
      <FilterCard
        icon={Grid3X3}
        label="Category"
        hasFilter={hasCategoryFilter}
        summary={getCategorySummary()}
        onClick={() => setCurrentStep('category')}
      />
      <FilterCard
        icon={Star}
        label="Rating"
        hasFilter={hasRatingFilter}
        summary={getRatingSummary()}
        onClick={() => setCurrentStep('rating')}
      />
    </div>
  );

  // Price step content
  const PriceContent = () => (
    <div className="flex flex-col gap-6">
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Minimum Price
        </label>
        <div className="relative">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-lg">$</span>
          <input
            {...register('priceMin')}
            type="number"
            placeholder="0"
            className="w-full bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl pl-10 pr-4 py-4 text-lg text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#60A5FA] focus:border-transparent transition-all"
          />
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Maximum Price
        </label>
        <div className="relative">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-lg">$</span>
          <input
            {...register('priceMax')}
            type="number"
            placeholder="No limit"
            className="w-full bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl pl-10 pr-4 py-4 text-lg text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#60A5FA] focus:border-transparent transition-all"
          />
        </div>
      </div>
    </div>
  );

  // Location step content
  const LocationContent = () => (
    <div className="flex flex-col gap-6">
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          City, state, or zip code
        </label>
        <div className="relative">
          <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            {...register('location')}
            type="text"
            placeholder="Enter location"
            className="w-full bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl pl-12 pr-4 py-4 text-lg text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#60A5FA] focus:border-transparent transition-all"
          />
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
          Distance
        </label>
        <div className="grid grid-cols-2 gap-2">
          {RADIUS_OPTIONS.map((option) => {
            const isActive = watchedValues.radius === option.value;
            return (
              <button
                key={option.value}
                type="button"
                onClick={() => setCustomValue('radius', option.value)}
                className={`py-3.5 px-4 rounded-xl text-sm font-medium transition-all duration-200 ${
                  isActive
                    ? 'bg-[#60A5FA] text-white'
                    : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                }`}
              >
                {option.label}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );

  // Category step content
  const CategoryContent = () => (
    <div className="flex flex-col gap-2">
      {categories.map((cat) => {
        const isActive = watchedValues.categories?.includes(cat.label);
        return (
          <button
            key={cat.label}
            type="button"
            onClick={() => toggleCategory(cat.label)}
            className={`w-full flex items-center justify-between p-4 rounded-xl transition-all duration-200 ${
              isActive
                ? 'bg-[#60A5FA] text-white'
                : 'bg-gray-50 dark:bg-gray-800/50 text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-800'
            }`}
          >
            <span className="font-medium">{cat.label}</span>
            {isActive && <Check className="w-5 h-5" />}
          </button>
        );
      })}
    </div>
  );

  // Rating step content
  const RatingContent = () => (
    <div className="flex flex-col gap-2">
      {RATING_OPTIONS.map((option) => {
        const isActive = watchedValues.rating === option.value;
        return (
          <button
            key={option.value}
            type="button"
            onClick={() => setCustomValue('rating', option.value)}
            className={`w-full flex items-center justify-between p-4 rounded-xl transition-all duration-200 ${
              isActive
                ? 'bg-[#60A5FA] text-white'
                : 'bg-gray-50 dark:bg-gray-800/50 text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-800'
            }`}
          >
            <div>
              <div className="font-medium">{option.label}</div>
              <div className={`text-sm ${isActive ? 'text-white/70' : 'text-gray-500 dark:text-gray-400'}`}>
                {option.description}
              </div>
            </div>
            {isActive && <Check className="w-5 h-5" />}
          </button>
        );
      })}
    </div>
  );

  // Get step title
  const getStepTitle = () => {
    switch (currentStep) {
      case 'price': return 'Price Range';
      case 'location': return 'Location';
      case 'category': return 'Category';
      case 'rating': return 'Rating';
      default: return 'Filters';
    }
  };

  const bodyContent = (
    <div className="flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          {currentStep !== 'main' && (
            <button
              type="button"
              onClick={() => setCurrentStep('main')}
              className="p-2 -ml-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            >
              <ChevronLeft className="w-5 h-5 text-gray-600 dark:text-gray-400" />
            </button>
          )}
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            {getStepTitle()}
          </h2>
        </div>
        {currentStep === 'main' && activeFilterCount > 0 && (
          <button
            type="button"
            onClick={clearAllFilters}
            className="flex items-center gap-1.5 text-sm text-[#60A5FA] hover:text-[#3B82F6] transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Clear all
          </button>
        )}
      </div>

      {/* Step Content */}
      <div className={currentStep === 'category' ? 'max-h-[50vh] overflow-y-auto -mx-8 px-8' : ''}>
        {currentStep === 'main' && <MainContent />}
        {currentStep === 'price' && <PriceContent />}
        {currentStep === 'location' && <LocationContent />}
        {currentStep === 'category' && <CategoryContent />}
        {currentStep === 'rating' && <RatingContent />}
      </div>
    </div>
  );

  return (
    <Modal
      id="filter-modal"
      isOpen={filterModal.isOpen}
      title="Filters"
      actionLabel={currentStep === 'main' ? `Show Results${activeFilterCount > 0 ? ` (${activeFilterCount})` : ''}` : 'Done'}
      onSubmit={currentStep === 'main' ? handleSubmit(onSubmit) : () => setCurrentStep('main')}
      secondaryActionLabel="Cancel"
      secondaryAction={handleClose}
      onClose={handleClose}
      body={bodyContent}
      disabled={isLoading}
      className="w-full md:w-[440px]"
    />
  );
};

export default FilterModal;
