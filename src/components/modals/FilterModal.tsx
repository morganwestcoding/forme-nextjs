// components/modals/FilterModal.tsx
'use client';

import { useCallback, useState } from 'react';
import Modal from "./Modal";
import useFilterModal from '@/app/hooks/useFilterModal';
import { useFilter } from '@/FilterContext';
import Input from '../inputs/Input';
import { FieldValues, useForm } from 'react-hook-form';

const FilterModal = () => {
  const filterModal = useFilterModal();
  const { 
    state, 
    city, 
    priceRange, 
    sortOrder,
    setState,
    setCity,
    setPriceRange,
    setSortOrder
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
      state: state,
      city: city,
      priceRange: priceRange,
    }
  });

  const onSubmit = useCallback((data: FieldValues) => {
    if (data.state) setState(data.state);
    if (data.city) setCity(data.city);
    if (data.priceRange) setPriceRange(parseInt(data.priceRange));
    filterModal.onClose();
  }, [setState, setCity, setPriceRange]);

  const toggleSortOrder = useCallback(() => {
    setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
  }, [sortOrder, setSortOrder]);

  const clearFilters = useCallback(() => {
    setState(undefined);
    setCity(undefined);
    setPriceRange(undefined);
    setSortOrder(undefined);
    reset();
  }, [setState, setCity, setPriceRange, setSortOrder, reset]);

  const bodyContent = (
    <div className="flex flex-col gap-4">
      <Input
        id="state"
        label="State"
        disabled={isLoading}
        register={register}
        errors={errors}
      />
      <Input
        id="city"
        label="City"
        disabled={isLoading}
        register={register}
        errors={errors}
      />
      <Input
        id="priceRange"
        label="Max Price"
        type="number"
        disabled={isLoading}
        register={register}
        errors={errors}
      />
      <div 
        onClick={toggleSortOrder}
        className="flex items-center gap-2 cursor-pointer p-2 hover:bg-gray-100 rounded"
      >
        <span className="text-sm text-gray-600">Sort by date:</span>
        {sortOrder === 'asc' ? (
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