'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Trash2 } from 'lucide-react';
import TypeformHeading from '../TypeformHeading';
import { Service } from '@/components/inputs/ServiceSelector';
import { categories } from '@/components/Categories';

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
  const [category, setCategory] = useState(service?.category || '');

  useEffect(() => {
    if (editingIndex !== null && services[editingIndex]) {
      const s = services[editingIndex];
      setName(s.serviceName || '');
      setPrice(s.price?.toString() || '');
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
        className="flex items-center gap-2 text-gray-500 hover:text-gray-900 transition-colors mb-6"
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
          <label htmlFor="serviceName" className="block text-sm font-medium text-gray-700 mb-2">
            Service name
          </label>
          <input
            id="serviceName"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            autoFocus
            className="w-full px-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-all"
            placeholder="e.g., Haircut, Manicure"
          />
        </div>

        {/* Price */}
        <div>
          <label htmlFor="servicePrice" className="block text-sm font-medium text-gray-700 mb-2">
            Price
          </label>
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">$</span>
            <input
              id="servicePrice"
              type="number"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              min="0"
              step="0.01"
              className="w-full pl-8 pr-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-all"
              placeholder="0.00"
            />
          </div>
        </div>

        {/* Category */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Category
          </label>
          <div className="grid grid-cols-3 gap-2">
            {categories.slice(0, 9).map((cat) => (
              <button
                key={cat.label}
                type="button"
                onClick={() => setCategory(cat.label)}
                className={`
                  p-3 rounded-xl border-2 text-sm font-medium transition-all duration-200
                  ${category === cat.label
                    ? 'border-gray-900 bg-gray-900 text-white'
                    : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300'
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
      <div className="flex items-center justify-between mt-8 pt-6 border-t border-gray-100">
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

        <button
          type="button"
          onClick={handleSave}
          disabled={!canSave}
          className={`
            px-6 py-2.5 rounded-lg font-medium text-sm transition-all duration-200
            ${canSave
              ? 'bg-gray-900 text-white hover:bg-gray-800 active:scale-[0.98]'
              : 'bg-gray-100 text-gray-400 cursor-not-allowed'
            }
          `}
        >
          Save service
        </button>
      </div>
    </div>
  );
}
