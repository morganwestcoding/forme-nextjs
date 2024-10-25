// components/listings/StoreHours.tsx
'use client';

import { SafeStoreHours } from "@/app/types";

interface StoreHoursProps {
  storeHours?: SafeStoreHours[];
}

const StoreHours: React.FC<StoreHoursProps> = ({ storeHours = [] }) => {
  if (!storeHours || storeHours.length === 0) {
    return null;
  }

  const formatTime = (time: string) => {
    return time.replace(':00', '');
  };

  return (
    <div className="w-full">
      <div className="bg-white rounded-2xl shadow-sm overflow-hidden relative px-6 pt-6 mt-4 pb-6">
        <h2 className="text-lg font-semibold mb-4">Store Hours</h2>
        <div className="flex flex-col space-y-4">
          <div className="flex justify-between items-center">
            {storeHours.map((hours) => (
              <div 
                key={hours.dayOfWeek} 
                className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white text-sm font-medium"
              >
                {hours.dayOfWeek.slice(0, 2).toUpperCase()}
              </div>
            ))}
          </div>
          <div className="flex justify-between items-center">
            {storeHours.map((hours) => (
              <div 
                key={hours.dayOfWeek}
                className="w-8 text-center"
              >
                {hours.isClosed ? (
                  <span className="text-red-500 text-xs">Closed</span>
                ) : (
                  <div className="text-xs text-gray-600">
                    {formatTime(hours.openTime)}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default StoreHours;