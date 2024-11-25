// components/modals/FilterModal.tsx
'use client';

import { useCallback, useState } from 'react';
import Modal from "./Modal";
import useFilterModal from '@/app/hooks/useFilterModal';
import { useFilter } from '@/FilterContext';
import Input from '../inputs/Input';
import FilterInput from '../inputs/FilterInput';
import { FieldValues, useForm } from 'react-hook-form';
import FilterLocationSelect from '../inputs/FilterLocationSelect';

const FilterModal = () => {
  const filterModal = useFilterModal();
  const { 
    filters,
    setLocationFilter,
    setPriceFilter,
    setSortFilter,
    clearAllFilters
  } = useFilter();

  const [isLoading, setIsLoading] = useState(false);

  const { 
    register, 
    handleSubmit,
    formState: {
      errors,
    },
    reset,
  } = useForm<FieldValues>({
    defaultValues: {
      minPrice: filters.price?.min,
      maxPrice: filters.price?.max,
    }
  });

  const handleLocationSelect = useCallback((location: {
    state: string;
    city: string;
  } | null) => {
    if (location) {
      setLocationFilter(location.state, location.city);
    } else {
      setLocationFilter(undefined, undefined);
    }
  }, [setLocationFilter]);

  const onSubmit = useCallback((data: FieldValues) => {
    setPriceFilter(
      data.minPrice ? parseInt(data.minPrice) : undefined,
      data.maxPrice ? parseInt(data.maxPrice) : undefined
    );
    filterModal.onClose();
  }, [setPriceFilter, filterModal]);

  const toggleSortOrder = useCallback(() => {
    const currentOrder = filters.sort.order;
    setSortFilter(
      currentOrder === 'asc' ? 'desc' : 'asc',
      'date'
    );
  }, [filters.sort, setSortFilter]);

  const clearFilters = useCallback(() => {
    clearAllFilters();
    reset();
  }, [clearAllFilters, reset]);

  const bodyContent = (
    <div className="flex flex-col gap-4">
      <div className="space-y-4">
        <h3 className="text-sm font-medium text-white">Location</h3>
        <FilterLocationSelect
          onLocationSubmit={handleLocationSelect}
        />
      </div>

      <div className="space-y-4">
        <h3 className="text-sm font-medium text-white">Price Range</h3>
        <div className="grid grid-cols-2 gap-4">
        <FilterInput
      id="minPrice"
      label="Min Price"
      type="number"
      disabled={isLoading}
      register={register}
      errors={errors}
    />
    <FilterInput
      id="maxPrice"
      label="Max Price"
      type="number"
      disabled={isLoading}
      register={register}
      errors={errors}
    />
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="text-sm font-medium text-white">Sort</h3>
        <div 
          onClick={toggleSortOrder}
          className="flex items-center gap-2 cursor-pointer p-2 hover:bg-gray-100 rounded"
        >
          <span className="text-sm text-gray-600">Sort by date:</span>
          {filters.sort.order === 'asc' ? (
            <div className="flex items-center gap-1">
              <span className="text-sm">Newest first</span>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
              </svg>
            </div>
          ) : (
            <div className="flex items-center gap-1">
              <span className="text-sm">Oldest first</span>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          )}
        </div>
      </div>

      <button
        onClick={clearFilters}
        className="text-sm text-gray-500 hover:text-gray-700 underline self-end mt-2"
      >
        Clear all filters
      </button>
    </div>
  );

  return (
    <Modal
      disabled={isLoading}
      isOpen={filterModal.isOpen}
      title="Filters"
      actionLabel="Apply Filters"
      onClose={filterModal.onClose}
      onSubmit={handleSubmit(onSubmit)}
      body={bodyContent}
    />
  );
};

export default FilterModal;