'use client';

import { SafeStoreHours } from "@/app/types";

interface StoreHoursProps {
  storeHours?: SafeStoreHours[];
  category?: string;
}

const StoreHours: React.FC<StoreHoursProps> = ({ storeHours = [] }) => {
  if (!storeHours || storeHours.length === 0) {
    return null;
  }

  // Sort days to start with Monday
  const daysOrder = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const sortedHours = [...storeHours].sort((a, b) => 
    daysOrder.indexOf(a.dayOfWeek.slice(0, 3)) - daysOrder.indexOf(b.dayOfWeek.slice(0, 3))
  );

  return (
    <div className="w-full">
      <div className="bg-white rounded-2xl shadow-sm overflow-hidden relative px-6 py-4 mt-4">
        <h2 className="text-xl mb-4">Cafe Hours</h2>
        <div className="flex flex-col space-y-2">
          {sortedHours.map((day) => (
            <div key={day.dayOfWeek} className="flex justify-between">
              <div className="w-16 font-normal">
                {day.dayOfWeek.slice(0, 3)}
              </div>
              <div className="text-right">
                {day.isClosed ? (
                  'Closed'
                ) : (
                  `${day.openTime} - ${day.closeTime}`
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default StoreHours;