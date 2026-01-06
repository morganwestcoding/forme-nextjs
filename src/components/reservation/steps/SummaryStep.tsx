'use client';

import { format } from 'date-fns';
import TypeformHeading from '@/components/registration/TypeformHeading';

interface SelectedService {
  value: string;
  label: string;
  price: number;
}

interface SelectedEmployee {
  value: string;
  label: string;
}

interface SummaryStepProps {
  selectedServices: SelectedService[];
  selectedEmployee: SelectedEmployee | null;
  date: Date | null;
  time: string;
  totalPrice: number;
  note: string;
  onNoteChange: (note: string) => void;
  businessName: string;
}

export default function SummaryStep({
  selectedServices,
  selectedEmployee,
  date,
  time,
  totalPrice,
  note,
  onNoteChange,
  businessName,
}: SummaryStepProps) {
  return (
    <div>
      <TypeformHeading
        question="Review your booking"
        subtitle="Add any special requests below"
      />

      <div className="bg-gray-50 rounded-xl p-5 border border-gray-200">
        <h4 className="font-semibold text-gray-900 mb-4">Booking Summary</h4>
        <div className="space-y-3 text-sm">
          <div className="flex justify-between items-center pb-3 border-b border-gray-200">
            <span className="text-gray-500">Business</span>
            <span className="font-medium text-gray-900">{businessName}</span>
          </div>

          <div className="pb-3 border-b border-gray-200">
            <div className="flex justify-between items-start">
              <span className="text-gray-500">Services</span>
              <div className="text-right">
                {selectedServices.map((service) => (
                  <div key={service.value} className="flex justify-between gap-4 mb-1">
                    <span className="font-medium text-gray-900">{service.label.split(' - ')[0]}</span>
                    <span className="font-medium text-gray-900">${service.price}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="flex justify-between pb-3 border-b border-gray-200">
            <span className="text-gray-500">Professional</span>
            <span className="font-medium text-gray-900">{selectedEmployee?.label || 'Not selected'}</span>
          </div>

          <div className="flex justify-between pb-3 border-b border-gray-200">
            <span className="text-gray-500">Date</span>
            <span className="font-medium text-gray-900">{date ? format(date, 'MMM dd, yyyy') : 'Not selected'}</span>
          </div>

          <div className="flex justify-between pb-3 border-b border-gray-200">
            <span className="text-gray-500">Time</span>
            <span className="font-medium text-gray-900">{time ? format(new Date(`2021-01-01T${time}`), 'hh:mm a') : 'Not selected'}</span>
          </div>

          <div className="flex justify-between pt-2">
            <span className="font-semibold text-gray-900">Total</span>
            <span className="font-bold text-xl text-gray-900">${totalPrice}</span>
          </div>
        </div>
      </div>

      <div className="mt-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Add a note
          <span className="text-gray-400 font-normal ml-1">(optional)</span>
        </label>
        <textarea
          placeholder="Any special requests or notes..."
          value={note}
          onChange={(e) => onNoteChange(e.target.value)}
          className="w-full px-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-all resize-none"
          rows={3}
        />
      </div>
    </div>
  );
}
