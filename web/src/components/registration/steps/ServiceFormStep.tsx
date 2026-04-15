'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

import TypeformHeading from '../TypeformHeading';
import { Service } from '@/components/inputs/ServiceSelector';
import { categories } from '@/components/Categories';
import { ArrowLeft01Icon as ArrowLeft, Delete02Icon as Trash2 } from 'hugeicons-react';
import Button from '@/components/ui/Button';

interface ServiceFormStepProps {
  services: Service[];
  setServices: React.Dispatch<React.SetStateAction<Service[]>>;
  editingIndex: number | null;
  onBack: () => void;
}

export default function ServiceFormStep({ services, setServices, editingIndex, onBack }: ServiceFormStepProps) {
  const service = editingIndex !== null ? services[editingIndex] : null;

  const [name, setName] = useState(service?.serviceName || '');
  const [price, setPrice] = useState(service?.price?.toString() || '');
  const [duration, setDuration] = useState(service?.duration?.toString() || '');
  const [category, setCategory] = useState(service?.category || '');

  useEffect(() => {
    if (editingIndex !== null && services[editingIndex]) {
      const s = services[editingIndex];
      setName(s.serviceName || '');
      setPrice(s.price?.toString() || '');
      setDuration(s.duration?.toString() || '');
      setCategory(s.category || '');
    }
  }, [editingIndex, services]);

  const handleSave = () => {
    if (editingIndex === null) return;

    const updated = [...services];
    updated[editingIndex] = {
      ...updated[editingIndex],
      serviceName: name,
      price: parseFloat(price) || 0,
      duration: parseInt(duration) || undefined,
      category,
    };
    setServices(updated);
    onBack();
  };

  const handleDelete = () => {
    if (editingIndex === null) return;

    const updated = services.filter((_, i) => i !== editingIndex);
    setServices(updated);
    onBack();
  };

  const canSave = name.trim() && parseFloat(price) > 0 && category;

  return (
    <div>
      <button
        type="button"
        onClick={onBack}
        className="flex items-center gap-2 text-stone-500   hover:text-stone-900 dark:hover:text-stone-100 dark:text-stone-100 transition-colors mb-6"
      >
        <ArrowLeft className="w-4 h-4" />
        <span className="text-sm">Back to services</span>
      </button>

      <TypeformHeading
        question={service?.serviceName ? 'Edit service' : 'Add a service'}
        subtitle="Fill in the details for this service"
      />

      <div className="space-y-5">
        {/* Service name */}
        <div>
          <label htmlFor="serviceName" className="block text-sm font-medium text-stone-700 dark:text-stone-200 mb-2">
            Service name
          </label>
          <input
            id="serviceName"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            autoFocus
            className="w-full px-4 py-3.5 bg-stone-50 dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-xl text-stone-900 dark:text-stone-100 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-stone-900 focus:border-transparent transition-all"
            placeholder="e.g., Haircut, Manicure"
          />
        </div>

        {/* Price and Duration row */}
        <div className="flex gap-4">
          <div className="flex-1">
            <label htmlFor="servicePrice" className="block text-sm font-medium text-stone-700 dark:text-stone-200 mb-2">
              Price
            </label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400 dark:text-stone-500">$</span>
              <input
                id="servicePrice"
                type="number"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                min="0"
                step="0.01"
                className="w-full pl-8 pr-4 py-3.5 bg-stone-50 dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-xl text-stone-900 dark:text-stone-100 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-stone-900 focus:border-transparent transition-all"
                placeholder="0.00"
              />
            </div>
          </div>

          <div className="flex-1">
            <label htmlFor="serviceDuration" className="block text-sm font-medium text-stone-700 dark:text-stone-200 mb-2">
              Duration
            </label>
            <div className="relative">
              <input
                id="serviceDuration"
                type="number"
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
                min="0"
                step="5"
                className="w-full px-4 pr-12 py-3.5 bg-stone-50 dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-xl text-stone-900 dark:text-stone-100 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-stone-900 focus:border-transparent transition-all"
                placeholder="30"
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-stone-400 dark:text-stone-500 text-sm">min</span>
            </div>
          </div>
        </div>

        {/* Category */}
        <div>
          <label className="block text-sm font-medium text-stone-700 dark:text-stone-200 mb-2">
            Category
          </label>
          <div className="grid grid-cols-3 gap-2">
            {categories.slice(0, 9).map((cat) => (
              <button
                key={cat.label}
                type="button"
                onClick={() => setCategory(cat.label)}
                className={`
                  p-3 rounded-xl border text-sm font-medium transition-all duration-200
                  ${category === cat.label
                    ? 'border-stone-300 dark:border-stone-700 bg-stone-100 dark:bg-stone-800 text-stone-900 dark:text-stone-100 shadow-[inset_0_2px_4px_rgba(0,0,0,0.1)]'
                    : 'border-stone-200  bg-white dark:bg-stone-900 text-stone-700 dark:text-stone-200 hover:border-stone-300 dark:border-stone-700 hover:bg-stone-50 dark:hover:bg-stone-800 '
                  }
                `}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center justify-between mt-8 pt-6 border-t border-stone-100 dark:border-stone-800">
        {service?.serviceName ? (
          <button
            type="button"
            onClick={handleDelete}
            className="flex items-center gap-2 text-red-500 hover:text-red-600 transition-colors"
          >
            <Trash2 className="w-4 h-4" />
            <span className="text-sm">Delete</span>
          </button>
        ) : (
          <div />
        )}

        <Button type="button" onClick={handleSave} disabled={!canSave}>
          Save service
        </Button>
      </div>
    </div>
  );
}
