// components/inputs/StoreHours.tsx
'use client';

import { useState, useMemo } from 'react';
import FloatingLabelSelect, { FLSelectOption } from './FloatingLabelSelect';

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

// 12-hour clock at :00 and :30 in AM/PM
const HOURS: TimeOption[] = Array.from({ length: 12 }, (_, i) => {
  const hour = (i + 1).toString();
  return [
    { label: `${hour}:00 AM`, value: `${hour}:00 AM` },
    { label: `${hour}:30 AM`, value: `${hour}:30 AM` },
    { label: `${hour}:00 PM`, value: `${hour}:00 PM` },
    { label: `${hour}:30 PM`, value: `${hour}:30 PM` },
  ];
}).flat();

const h58 = 'h-[58px]';

const StoreHours: React.FC<StoreHoursProps> = ({ onChange, id }) => {
  const [sameEveryDay, setSameEveryDay] = useState(false);
  const [hours, setHours] = useState<StoreHourType[]>(
    DAYS_OF_WEEK.map((d) => ({
      dayOfWeek: d.full,
      openTime: '8:00 AM',
      closeTime: '8:00 PM',
      isClosed: false,
    }))
  );

  const hourOptions: FLSelectOption[] = useMemo(
    () => HOURS.map((h) => ({ label: h.label, value: h.value })),
    []
  );

  const applyAndEmit = (next: StoreHourType[]) => {
    setHours(next);
    onChange(next);
  };

  const handleTimeChange = (
    index: number,
    type: 'openTime' | 'closeTime',
    selected: FLSelectOption | null
  ) => {
    if (!selected) return;
    const next = [...hours];
    next[index][type] = selected.value;

    if (sameEveryDay) {
      for (let i = 0; i < next.length; i++) next[i][type] = selected.value;
    }

    applyAndEmit(next);
  };

  const handleClosedToggle = (index: number) => {
    const next = [...hours];
    next[index].isClosed = !next[index].isClosed;

    if (sameEveryDay) {
      for (let i = 0; i < next.length; i++) next[i].isClosed = next[index].isClosed;
    }

    applyAndEmit(next);
  };

  const toggleSameEveryDay = () => {
    const nextFlag = !sameEveryDay;
    setSameEveryDay(nextFlag);

    if (nextFlag) {
      const first = hours[0];
      const synced = hours.map((h) => ({
        ...h,
        openTime: first.openTime,
        closeTime: first.closeTime,
        isClosed: first.isClosed,
      }));
      applyAndEmit(synced);
    }
  };

  const renderHourRow = (row: StoreHourType, index: number) => {
    const disabled = row.isClosed || (sameEveryDay && index !== 0);

    return (
      <div
        key={DAYS_OF_WEEK[index].full}
        id={`hours-row-${index}`}
        className="flex items-center gap-3 w-full"
      >
        {/* Day chip */}
        <div
          id={`day-label-${index}`}
          className={[
            'w-[60px]',
            h58,
            'rounded-lg border bg-[#fafafa] border-neutral-300',
            'flex items-center justify-center text-black font-normal text-sm shrink-0',
          ].join(' ')}
        >
          {DAYS_OF_WEEK[index].short}
        </div>

        <div className="flex-1 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 ml-6">
            {/* OPEN time */}
            <div className="relative w-[130px]">
              <FloatingLabelSelect
                label="Open"
                options={hourOptions}
                value={{ label: row.openTime, value: row.openTime }}
                onChange={(opt) => handleTimeChange(index, 'openTime', opt)}
                isDisabled={disabled}
                isLoading={false}
              />
            </div>

            <span className={`text-black text-sm flex items-center ${h58}`}>—</span>

            {/* CLOSE time */}
            <div className="relative w-[130px]">
              <FloatingLabelSelect
                label="Close"
                options={hourOptions}
                value={{ label: row.closeTime, value: row.closeTime }}
                onChange={(opt) => handleTimeChange(index, 'closeTime', opt)}
                isDisabled={disabled}
                isLoading={false}
              />
            </div>
          </div>

          {/* OPEN/CLOSED toggle button */}
          <button
            id={`toggle-closed-${index}`}
            type="button"
            onClick={() => handleClosedToggle(index)}
            disabled={sameEveryDay && index !== 0}
            className={[
              'px-4',
              h58,
              'w-[110px] rounded-lg border text-sm font-medium transition-colors duration-150',
              'disabled:opacity-50 disabled:cursor-not-allowed',
              row.isClosed
                ? 'border-rose-500 bg-[#fafafa] text-rose-600 hover:bg-rose-50'
                : 'border-neutral-300 bg-[#fafafa] text-black hover:bg-neutral-100',
              'focus:outline-none focus-visible:ring-2 focus-visible:ring-black/20',
            ].join(' ')}
          >
            {row.isClosed ? 'Closed' : 'Open'}
          </button>
        </div>
      </div>
    );
  };

  return (
    <div id={id} className="flex flex-col gap-6 -mt-4 -mb-6">
      {/* Same hours every day */}
      <div
        id="same-hours-toggle"
        className={[
          'flex items-center justify-between px-4',
          'border border-neutral-300 rounded-lg bg-[#fafafa]',
          h58,
        ].join(' ')}
      >
        <span className="text-sm font-medium text-black">Same hours every day</span>
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
            className={[
              'block overflow-hidden h-6 rounded-full cursor-pointer transition-colors duration-200',
              sameEveryDay ? 'bg-neutral-800' : 'bg-neutral-300',
            ].join(' ')}
          >
            <span
              className={[
                'block w-4 h-4 rounded-full bg-white shadow transform transition-transform duration-200 ease-in-out mt-1',
                sameEveryDay ? 'translate-x-7' : 'translate-x-1',
              ].join(' ')}
            />
          </label>
        </div>
      </div>

      {/* Hours list */}
      <div id="hours-grid" className="flex flex-col gap-4 max-h-[60vh] overflow-y-auto pr-2">
        {hours.map((h, i) => renderHourRow(h, i))}
      </div>
    </div>
  );
};

export default StoreHours;
