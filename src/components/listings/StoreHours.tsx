// components/listings/StoreHours.tsx
'use client';

import { SafeStoreHours } from "@/app/types";
import { categories } from "../Categories"; 

interface StoreHoursProps {
  storeHours?: SafeStoreHours[];
  category?: string;
}

const StoreHours: React.FC<StoreHoursProps> = ({ storeHours = [],   category  }) => {
  if (!storeHours || storeHours.length === 0) {
    return null;
  }

  const categoryColor = categories.find(cat => cat.label === category)?.color || 'bg-gray-200';

  const formatTime = (time: string) => {
    return time.replace(':00', '');
  };

  // Function to group consecutive days with same hours
  const groupDays = (hours: SafeStoreHours[]) => {
    const groups: { days: SafeStoreHours[]; openTime: string; closeTime: string }[] = [];
    let currentGroup: SafeStoreHours[] = [];

    hours.forEach((day, index) => {
      if (index === 0) {
        currentGroup.push(day);
      } else {
        const prevDay = hours[index - 1];
        if (prevDay.openTime === day.openTime && 
            prevDay.closeTime === day.closeTime &&
            prevDay.isClosed === day.isClosed) {
          currentGroup.push(day);
        } else {
          if (currentGroup.length > 0) {
            groups.push({
              days: [...currentGroup],
              openTime: currentGroup[0].openTime,
              closeTime: currentGroup[0].closeTime
            });
          }
          currentGroup = [day];
        }
      }
    });

    if (currentGroup.length > 0) {
      groups.push({
        days: [...currentGroup],
        openTime: currentGroup[0].openTime,
        closeTime: currentGroup[0].closeTime
      });
    }

    return groups;
  };

  const groups = groupDays(storeHours);

  return (
    <div className="w-full">
      <div className="bg-white rounded-2xl shadow-sm overflow-hidden relative px-6 pt-6 mt-4 pb-6">
        <h2 className="text-lg font-semibold mb-4">Store Hours</h2>
        <div className="flex flex-col space-y-4">
          <div className="grid grid-cols-7 gap-4">
            {groups.map((group, index) => (
              <div key={index} 
                   className="flex flex-col items-center"
                   style={{
                     gridColumn: `span ${group.days.length}`
                   }}>
                <div className="flex space-x-2 mb-2">
                  {group.days.map((day) => (
                    <div 
                      key={day.dayOfWeek}
                      className={`w-12 h-12 rounded-full ${categoryColor} flex items-center justify-center text-white text-xs font-medium shadow-sm`}
                    >
                      {day.dayOfWeek.slice(0, 2).toUpperCase()}
                    </div>
                  ))}
                </div>
                <div className="text-center whitespace-nowrap text-xs text-gray-600">
                  {group.days[0].isClosed ? (
                    <span className="text-black">Closed</span>
                  ) : (
                    `${formatTime(group.openTime)} — ${formatTime(group.closeTime)}`
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default StoreHours;