// components/inputs/StoreHours.tsx
'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Tick02Icon as Check, ArrowDown01Icon as ChevronDown } from 'hugeicons-react';

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

const DAYS_OF_WEEK = [
  { short: 'Mon', full: 'Monday' },
  { short: 'Tue', full: 'Tuesday' },
  { short: 'Wed', full: 'Wednesday' },
  { short: 'Thu', full: 'Thursday' },
  { short: 'Fri', full: 'Friday' },
  { short: 'Sat', full: 'Saturday' },
  { short: 'Sun', full: 'Sunday' },
];

const HOURS: string[] = Array.from({ length: 12 }, (_, i) => {
  const hour = (i + 1).toString();
  return [
    `${hour}:00 AM`,
    `${hour}:30 AM`,
    `${hour}:00 PM`,
    `${hour}:30 PM`,
  ];
}).flat();

function TimeDropdown({
  label,
  value,
  onChange,
  disabled,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div ref={ref} className="relative flex-1">
      <label className="block text-xs font-medium text-stone-500  dark:text-stone-500 mb-1.5">{label}</label>
      <button
        type="button"
        onClick={() => !disabled && setIsOpen(!isOpen)}
        disabled={disabled}
        className={`
          w-full flex items-center justify-between px-3 py-2.5 bg-stone-50 dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-xl text-sm text-left transition-all
          ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:border-stone-300 dark:border-stone-700 focus:outline-none focus:ring-2 focus:ring-stone-900 focus:border-transparent'}
          ${isOpen ? 'ring-2 ring-stone-900 border-transparent' : ''}
        `}
      >
        <span className="text-stone-900 dark:text-stone-100">{value}</span>
        <ChevronDown className={`w-4 h-4 text-stone-400 dark:text-stone-500 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.15 }}
            className="absolute z-50 mt-1.5 w-full bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-xl shadow-elevation-3 overflow-hidden"
          >
            <div className="max-h-[200px] overflow-y-auto overscroll-contain">
              {HOURS.map((time) => (
                <button
                  key={time}
                  type="button"
                  onClick={() => { onChange(time); setIsOpen(false); }}
                  className={`w-full flex items-center justify-between px-3 py-2 text-sm transition-colors cursor-pointer ${
                    value === time
                      ? 'bg-stone-50 dark:bg-stone-900 text-stone-900 dark:text-stone-100 font-medium'
                      : 'text-stone-700 dark:text-stone-200 hover:bg-stone-50 dark:hover:bg-stone-800 dark:bg-stone-900'
                  }`}
                >
                  <span>{time}</span>
                  {value === time && <Check className="w-3.5 h-3.5 text-stone-900 dark:text-stone-100" />}
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

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

  const applyAndEmit = useCallback((next: StoreHourType[]) => {
    setHours(next);
    onChange(next);
  }, [onChange]);

  const handleTimeChange = (index: number, type: 'openTime' | 'closeTime', value: string) => {
    const next = [...hours];
    next[index][type] = value;
    if (sameEveryDay) {
      for (let i = 0; i < next.length; i++) next[i][type] = value;
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
    const disabled = sameEveryDay && index !== 0;

    return (
      <div
        key={DAYS_OF_WEEK[index].full}
        className={`
          rounded-xl border border-stone-200 dark:border-stone-800 transition-all duration-200
          ${row.isClosed ? 'bg-stone-50/50' : 'bg-white dark:bg-stone-900 hover:border-stone-300 dark:border-stone-700'}
          ${disabled ? 'opacity-50' : ''}
        `}
      >
        <div className="p-4">
          {/* Header: Day + Toggle */}
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2.5">
              <span className="text-sm font-semibold text-stone-900 dark:text-stone-100">
                {DAYS_OF_WEEK[index].short}
              </span>
              <span className="text-sm text-stone-500  dark:text-stone-500">
                {DAYS_OF_WEEK[index].full}
              </span>
            </div>

            <button
              type="button"
              onClick={() => handleClosedToggle(index)}
              disabled={disabled}
              className={`
                px-3 py-1.5 rounded-xl text-xs font-medium transition-all duration-200
                ${row.isClosed
                  ? 'border border-stone-200  bg-white dark:bg-stone-900 text-stone-500  dark:text-stone-500 hover:border-stone-300 dark:border-stone-700 hover:bg-stone-50 dark:hover:bg-stone-800 '
                  : 'border border-stone-300 dark:border-stone-700 bg-stone-100 dark:bg-stone-800 text-stone-900 dark:text-stone-100 shadow-inset-pressed'
                }
                disabled:cursor-not-allowed
              `}
            >
              {row.isClosed ? 'Closed' : 'Open'}
            </button>
          </div>

          {/* Time Selectors */}
          {!row.isClosed && (
            <div className="flex items-end gap-3">
              <TimeDropdown
                label="Opens at"
                value={row.openTime}
                onChange={(val) => handleTimeChange(index, 'openTime', val)}
                disabled={disabled}
              />
              <span className="text-stone-300 pb-3">—</span>
              <TimeDropdown
                label="Closes at"
                value={row.closeTime}
                onChange={(val) => handleTimeChange(index, 'closeTime', val)}
                disabled={disabled}
              />
            </div>
          )}

          {row.isClosed && (
            <p className="text-sm text-stone-400 dark:text-stone-500">Closed all day</p>
          )}
        </div>
      </div>
    );
  };

  return (
    <div id={id} className="flex flex-col gap-3">
      {/* Same hours every day toggle */}
      <button
        type="button"
        onClick={toggleSameEveryDay}
        className={`
          w-full flex items-center gap-4 p-4 rounded-xl border text-left transition-all duration-200
          ${sameEveryDay
            ? 'border-stone-300 dark:border-stone-700 bg-stone-100 dark:bg-stone-800 shadow-inset-pressed'
            : 'border-stone-200  bg-white dark:bg-stone-900 hover:border-stone-300 dark:border-stone-700 hover:bg-stone-50 dark:hover:bg-stone-800 '
          }
        `}
      >
        <div className={`
          w-5 h-5 rounded-lg border-2 flex items-center justify-center transition-all
          ${sameEveryDay ? 'border-stone-900 bg-stone-900' : 'border-stone-300 dark:border-stone-700'}
        `}>
          {sameEveryDay && (
            <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          )}
        </div>
        <div>
          <span className="text-sm font-medium text-stone-900 dark:text-stone-100">Same hours every day</span>
          <p className="text-xs text-stone-500  dark:text-stone-500 mt-0.5">
            {sameEveryDay ? "All days use Monday's hours" : "Apply Monday's hours to all days"}
          </p>
        </div>
      </button>

      {/* Hours list */}
      {sameEveryDay ? (
        <div className="flex flex-col gap-3">
          {renderHourRow(hours[0], 0)}
          <p className="text-sm text-stone-400 dark:text-stone-500 text-center">
            These hours apply to all days
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-3 max-h-[400px] overflow-y-auto pr-1">
          {hours.map((h, i) => renderHourRow(h, i))}
        </div>
      )}
    </div>
  );
};

export default StoreHours;
