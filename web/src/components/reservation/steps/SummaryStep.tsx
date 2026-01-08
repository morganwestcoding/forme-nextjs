'use client';

import { motion } from 'framer-motion';
import { format } from 'date-fns';
import TypeformHeading from '@/components/registration/TypeformHeading';
import { itemVariants } from '@/components/registration/TypeformStep';

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
  const formattedDate = date ? format(date, 'EEE, MMM d') : '';
  const formattedTime = time ? format(new Date(`2021-01-01T${time}`), 'h:mm a') : '';

  return (
    <div>
      <TypeformHeading
        question="Review your booking"
      />

      <div className="grid grid-cols-2 gap-3 mb-6">
        {/* Date Card */}
        <motion.div
          variants={itemVariants}
          className="p-4 rounded-xl border border-gray-200 bg-gray-50"
        >
          <p className="text-xs text-gray-500 mb-1">Date</p>
          <p className="text-sm font-medium text-gray-900">{formattedDate}</p>
        </motion.div>

        {/* Time Card */}
        <motion.div
          variants={itemVariants}
          className="p-4 rounded-xl border border-gray-200 bg-gray-50"
        >
          <p className="text-xs text-gray-500 mb-1">Time</p>
          <p className="text-sm font-medium text-gray-900">{formattedTime}</p>
        </motion.div>

        {/* Professional Card */}
        <motion.div
          variants={itemVariants}
          className="p-4 rounded-xl border border-gray-200 bg-white"
        >
          <p className="text-xs text-gray-500 mb-1">With</p>
          <p className="text-sm font-medium text-gray-900 truncate">
            {selectedEmployee?.label || 'Any available'}
          </p>
        </motion.div>

        {/* Location Card */}
        <motion.div
          variants={itemVariants}
          className="p-4 rounded-xl border border-gray-200 bg-white"
        >
          <p className="text-xs text-gray-500 mb-1">At</p>
          <p className="text-sm font-medium text-gray-900 truncate">{businessName}</p>
        </motion.div>
      </div>

      {/* Services */}
      <motion.div
        variants={itemVariants}
        className="mb-6"
      >
        <p className="text-xs text-gray-500 mb-3">Services</p>
        <div className="space-y-2">
          {selectedServices.map((service) => (
            <div key={service.value} className="flex justify-between items-center">
              <span className="text-sm text-gray-900">{service.label.split(' - ')[0]}</span>
              <span className="text-sm text-gray-600">${service.price}</span>
            </div>
          ))}
        </div>
        <div className="flex justify-between items-center pt-3 mt-3 border-t border-gray-100">
          <span className="text-sm font-medium text-gray-900">Total</span>
          <span className="text-base font-semibold text-gray-900">${totalPrice}</span>
        </div>
      </motion.div>

      {/* Note */}
      <motion.div variants={itemVariants}>
        <textarea
          placeholder="Add a note for the professional (optional)"
          value={note}
          onChange={(e) => onNoteChange(e.target.value)}
          className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-300 focus:border-transparent transition-all resize-none text-sm"
          rows={2}
        />
      </motion.div>
    </div>
  );
}
