'use client';

import { useState } from 'react';
import Select, { StylesConfig } from 'react-select';

interface StoreHoursProps {
 onChange: (hours: StoreHourType[]) => void;
 id?: string;
}

export type StoreHourType = {
 dayOfWeek: string;
 openTime: string;
 closeTime: string;
 isClosed: boolean;
};

interface TimeOption {
 label: string;
 value: string;
}

const DAYS_OF_WEEK = [
 { short: 'MN', full: 'Monday' },
 { short: 'TU', full: 'Tuesday' },
 { short: 'WD', full: 'Wednesday' },
 { short: 'TH', full: 'Thursday' },
 { short: 'FR', full: 'Friday' },
 { short: 'SA', full: 'Saturday' },
 { short: 'SU', full: 'Sunday' },
];

const HOURS: TimeOption[] = Array.from({ length: 12 }, (_, i) => {
 const hour = (i + 1).toString();
 return [
   { label: `${hour}:00 AM`, value: `${hour}:00 AM` },
   { label: `${hour}:30 AM`, value: `${hour}:30 AM` },
   { label: `${hour}:00 PM`, value: `${hour}:00 PM` },
   { label: `${hour}:30 PM`, value: `${hour}:30 PM` },
 ];
}).flat();

const selectClasses = {
 control: (state: any) => `
   !w-full 
   !p-3 
   !pt-3.5
   !bg-slate-50 
   !border 
   !border-neutral-500
   !rounded-sm
   !outline-none 
   !transition
   !h-[60px]
   ${state.isFocused ? '!border-black' : '!border-neutral-500'}
 `,
 option: (state: any) => `
   !py-4 !px-4 !cursor-pointer
   ${state.isFocused ? '!bg-neutral-100' : '!bg-white'}
   ${state.isSelected ? '!bg-neutral-200 !text-black' : ''}
   !text-black hover:!text-neutral-500
   !font-normal
 `,
 singleValue: () => '!text-black !text-left !m-0 !flex !items-center !h-full !pl-4',
 input: () => '!text-neutral-500 !font-normal !m-0',
 valueContainer: () => '!p-0 !h-full !items-center',
 indicatorsContainer: () => '!h-full !items-center',
 placeholder: () => '!text-neutral-500 !text-sm !font-normal', 
 menu: () => '!bg-white !rounded-sm !border !border-neutral-200 !shadow-md !mt-1',
 menuList: () => '!p-0',
 container: (state: any) => `
   !relative !w-full
   ${state.isFocused ? 'peer-focus:border-black' : ''}
 `
};

const StoreHours: React.FC<StoreHoursProps> = ({ onChange, id }) => {
 const [sameEveryDay, setSameEveryDay] = useState(false);
 const [hours, setHours] = useState<StoreHourType[]>(
   DAYS_OF_WEEK.map(day => ({
     dayOfWeek: day.full,
     openTime: '8:00 AM',
     closeTime: '8:00 PM',
     isClosed: false
   }))
 );

 const handleTimeChange = (index: number, type: 'openTime' | 'closeTime', selectedOption: TimeOption | null) => {
   if (!selectedOption) return;
   
   const newHours = [...hours];
   newHours[index][type] = selectedOption.value;
   
   if (sameEveryDay) {
     newHours.forEach(hour => {
       hour[type] = selectedOption.value;
     });
   }
   
   setHours(newHours);
   onChange(newHours);
 };

 const handleClosedToggle = (index: number) => {
   const newHours = [...hours];
   newHours[index].isClosed = !newHours[index].isClosed;
   
   if (sameEveryDay) {
     newHours.forEach(hour => {
       hour.isClosed = newHours[index].isClosed;
     });
   }
   
   setHours(newHours);
   onChange(newHours);
 };

 const toggleSameEveryDay = () => {
   setSameEveryDay(!sameEveryDay);
   if (!sameEveryDay) {
     const firstHour = hours[0];
     const newHours = hours.map(hour => ({
       ...hour,
       openTime: firstHour.openTime,
       closeTime: firstHour.closeTime,
       isClosed: firstHour.isClosed
     }));
     setHours(newHours);
     onChange(newHours);
   }
 };
  const renderHourRow = (hour: StoreHourType, index: number) => (
    <div 
      key={DAYS_OF_WEEK[index].full} 
      id={`hours-row-${index}`} 
      className="flex items-center gap-3 w-full"
    >
      <div 
        id={`day-label-${index}`}
        className="
          w-[60px]
          h-[60px]
          rounded-sm
          border
          border-neutral-500
          bg-slate-50
          flex
          items-center
          justify-center
          text-black
          font-light
          text-sm
          shrink-0
        "
      >
        {DAYS_OF_WEEK[index].short}
      </div>
      
      <div className="flex-1 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <Select<TimeOption>
            id={`open-time-${index}`}
            value={{ label: hour.openTime, value: hour.openTime }}
            onChange={(option) => handleTimeChange(index, 'openTime', option)}
            options={HOURS}
            isDisabled={hour.isClosed || (sameEveryDay && index !== 0)}
            classNames={selectClasses}
            className="w-[140px] text-sm"
            components={{
              IndicatorSeparator: null
            }}
          />
          
          <span className="text-black text-sm flex items-center h-[60px]">—</span>
          
          <Select<TimeOption>
            id={`close-time-${index}`}
            value={{ label: hour.closeTime, value: hour.closeTime }}
            onChange={(option) => handleTimeChange(index, 'closeTime', option)}
            options={HOURS}
            isDisabled={hour.isClosed || (sameEveryDay && index !== 0)}
            classNames={selectClasses}
            className="w-[140px] text-sm"
            components={{
              IndicatorSeparator: null
            }}
          />
        </div>
  
        <button
          id={`toggle-closed-${index}`}
          type="button"
          onClick={() => handleClosedToggle(index)}
          disabled={sameEveryDay && index !== 0}
          className={`
            h-[60px]
            w-[100px]
            rounded-sm
            border
            text-sm
            font-light
            transition-colors
            duration-200
            disabled:opacity-50
            disabled:cursor-not-allowed
            ${hour.isClosed 
              ? 'border-red-500 bg-slate-50 text-red-500 hover:bg-red-50' 
              : 'border-neutral-500 bg-slate-50 text-black hover:bg-neutral-100'
            }
          `}
        >
          {hour.isClosed ? 'Closed' : 'Open'}
        </button>
      </div>
    </div>
  );

 return (
   <div id={id} className="flex flex-col gap-6 -mt-4 -mb-6">
     <div 
       id="same-hours-toggle"
       className="
         flex 
         items-center 
         justify-between 
         px-6 
         border 
         border-neutral-500 
         rounded-sm
         bg-slate-50
         h-[60px]
       "
     >
       <span className="text-sm font-light text-black">Same hours every day</span>
       <div className="relative inline-block w-12 select-none">
         <input
           type="checkbox"
           name="toggle"
           id="hours-toggle"
           className="hidden"
           checked={sameEveryDay}
           onChange={toggleSameEveryDay}
         />
         <label
           htmlFor="hours-toggle"
           className={`
             block 
             overflow-hidden 
             h-6 
             rounded-full 
             cursor-pointer
             transition-colors
             duration-200
             ${sameEveryDay ? 'bg-neutral-800' : 'bg-neutral-300'}
           `}
         >
           <span
             className={`
               block 
               w-4 
               h-4 
               rounded-full 
               bg-white 
               shadow 
               transform 
               transition-transform 
               duration-200 
               ease-in-out
               mt-1
               ${sameEveryDay ? 'translate-x-7' : 'translate-x-1'}
             `}
           />
         </label>
       </div>
     </div>

     <div id="hours-grid" className="flex flex-col gap-4 max-h-[60vh] overflow-y-auto pr-2">
       {hours.map((hour, index) => renderHourRow(hour, index))}
     </div>
   </div>
 );
};

export default StoreHours;