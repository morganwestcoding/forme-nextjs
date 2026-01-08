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
  { short: 'Mon', full: 'Monday' },
  { short: 'Tue', full: 'Tuesday' },
  { short: 'Wed', full: 'Wednesday' },
  { short: 'Thu', full: 'Thursday' },
  { short: 'Fri', full: 'Friday' },
  { short: 'Sat', full: 'Saturday' },
  { short: 'Sun', full: 'Sunday' },
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
        className={[
          'relative rounded-xl border-2 transition-all duration-300',
          row.isClosed
            ? 'bg-neutral-50/50 border-neutral-200'
            : 'bg-white border-neutral-200 hover:border-neutral-300 hover:shadow-sm',
          sameEveryDay && index !== 0 ? 'opacity-60' : '',
        ].join(' ')}
      >
        <div className="p-4">
          {/* Header: Day + Toggle */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div
                id={`day-label-${index}`}
                className={[
                  'px-3 py-1.5 rounded-lg text-sm font-semibold transition-colors',
                  row.isClosed
                    ? 'bg-neutral-100 text-neutral-500'
                    : 'bg-[#60A5FA]/10 text-[#60A5FA]',
                ].join(' ')}
              >
                {DAYS_OF_WEEK[index].short}
              </div>
              <span className={[
                'text-sm font-medium transition-colors',
                row.isClosed ? 'text-neutral-400' : 'text-neutral-700'
              ].join(' ')}>
                {DAYS_OF_WEEK[index].full}
              </span>
            </div>

            {/* Closed Toggle Button */}
            <button
              id={`toggle-closed-${index}`}
              type="button"
              onClick={() => handleClosedToggle(index)}
              disabled={sameEveryDay && index !== 0}
              className={[
                'px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200',
                'disabled:opacity-40 disabled:cursor-not-allowed',
                'focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-1',
                row.isClosed
                  ? 'bg-rose-50 text-rose-600 border-2 border-rose-200 hover:bg-rose-100 focus-visible:ring-rose-300'
                  : 'bg-emerald-50 text-emerald-700 border-2 border-emerald-200 hover:bg-emerald-100 focus-visible:ring-emerald-300',
              ].join(' ')}
            >
              {row.isClosed ? 'Closed' : 'Open'}
            </button>
          </div>

          {/* Time Selectors */}
          {!row.isClosed && (
            <div className="flex items-center gap-3">
              {/* OPEN time */}
              <div className="flex-1">
                <FloatingLabelSelect
                  label="Opens at"
                  options={hourOptions}
                  value={{ label: row.openTime, value: row.openTime }}
                  onChange={(opt) => handleTimeChange(index, 'openTime', opt)}
                  isDisabled={disabled}
                  isLoading={false}
                />
              </div>

              <div className="text-neutral-400 font-medium pt-2">→</div>

              {/* CLOSE time */}
              <div className="flex-1">
                <FloatingLabelSelect
                  label="Closes at"
                  options={hourOptions}
                  value={{ label: row.closeTime, value: row.closeTime }}
                  onChange={(opt) => handleTimeChange(index, 'closeTime', opt)}
                  isDisabled={disabled}
                  isLoading={false}
                />
              </div>
            </div>
          )}

          {/* Closed State Message */}
          {row.isClosed && (
            <div className="flex items-center gap-2 text-sm text-neutral-500">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.28 7.22a.75.75 0 00-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 101.06 1.06L10 11.06l1.72 1.72a.75.75 0 101.06-1.06L11.06 10l1.72-1.72a.75.75 0 00-1.06-1.06L10 8.94 8.28 7.22z" clipRule="evenodd" />
              </svg>
              <span>Closed all day</span>
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div id={id} className="flex flex-col gap-5">
      {/* Same hours every day toggle */}
      <div
        id="same-hours-toggle"
        className="flex items-center justify-between p-4 rounded-xl border-2 border-neutral-200 bg-white hover:border-neutral-300 transition-colors"
      >
        <div className="flex flex-col gap-0.5">
          <span className="text-sm font-semibold text-neutral-800">Same hours every day</span>
          <span className="text-xs text-neutral-500">
            {sameEveryDay ? "All days use Monday's hours" : "Apply Monday's hours to all days"}
          </span>
        </div>
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
              'block overflow-hidden h-7 rounded-full cursor-pointer transition-all duration-300',
              sameEveryDay ? 'bg-[#60A5FA]' : 'bg-neutral-300',
            ].join(' ')}
          >
            <span
              className={[
                'block w-5 h-5 rounded-full bg-white shadow-md transform transition-transform duration-300 ease-out mt-1',
                sameEveryDay ? 'translate-x-[22px]' : 'translate-x-1',
              ].join(' ')}
            />
          </label>
        </div>
      </div>

      {/* Hours list */}
      {sameEveryDay ? (
        // Show only Monday when same hours every day
        <div id="hours-grid" className="flex flex-col gap-3">
          {renderHourRow(hours[0], 0)}
          <div className="text-center py-2 px-4 rounded-lg bg-[#60A5FA]/5 border border-[#60A5FA]/20">
            <p className="text-xs font-medium text-[#60A5FA]">
              These hours apply to all days of the week
            </p>
          </div>
        </div>
      ) : (
        // Scrollable list when different hours per day
        <div
          id="hours-grid"
          className="flex flex-col gap-3 max-h-[400px] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-neutral-300 scrollbar-track-transparent hover:scrollbar-thumb-neutral-400"
        >
          {hours.map((h, i) => renderHourRow(h, i))}
        </div>
      )}
    </div>
  );
};

export default StoreHours;
