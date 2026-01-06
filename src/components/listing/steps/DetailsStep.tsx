'use client';

import { useFormContext } from 'react-hook-form';
import TypeformHeading from '@/components/registration/TypeformHeading';

export default function DetailsStep() {
  const { register, formState: { errors } } = useFormContext();

  return (
    <div>
      <TypeformHeading
        question="Tell us about your business"
        subtitle="A great description helps customers find you"
      />

      <div className="space-y-5">
        {/* Title */}
        <div>
          <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
            Business name
          </label>
          <input
            id="title"
            type="text"
            autoFocus
            {...register('title', { required: 'Business name is required' })}
            className="w-full px-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-all"
            placeholder="Your business name"
          />
          {errors.title && (
            <p className="mt-2 text-sm text-red-500">{errors.title.message as string}</p>
          )}
        </div>

        {/* Description */}
        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
            Description
          </label>
          <textarea
            id="description"
            rows={4}
            {...register('description', { required: 'Description is required' })}
            className="w-full px-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-all resize-none"
            placeholder="Describe what makes your business special..."
          />
          {errors.description && (
            <p className="mt-2 text-sm text-red-500">{errors.description.message as string}</p>
          )}
        </div>

        {/* Phone Number */}
        <div>
          <label htmlFor="phoneNumber" className="block text-sm font-medium text-gray-700 mb-2">
            Phone number
            <span className="text-gray-400 font-normal ml-1">(optional)</span>
          </label>
          <input
            id="phoneNumber"
            type="tel"
            {...register('phoneNumber')}
            className="w-full px-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-all"
            placeholder="(555) 123-4567"
          />
        </div>

        {/* Website */}
        <div>
          <label htmlFor="website" className="block text-sm font-medium text-gray-700 mb-2">
            Website
            <span className="text-gray-400 font-normal ml-1">(optional)</span>
          </label>
          <input
            id="website"
            type="url"
            {...register('website')}
            className="w-full px-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-all"
            placeholder="https://yourbusiness.com"
          />
        </div>
      </div>
    </div>
  );
}
