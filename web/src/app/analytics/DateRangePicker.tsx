'use client';

// Brand-styled analytics date-range picker. Parallels the iOS sheet
// (Views/Analytics/AnalyticsDateRangePicker.swift) — preset chips, a
// month calendar with range-aware highlighting, From/To toggle, and an
// inclusive [start, end] range returned via onApply.
//
// Rendered as a popover anchored to the capsule trigger in AnalyticsClient.
// Click-outside / Escape dismiss; Apply commits, Cancel reverts. Stone
// palette + dark-mode variants match the rest of the app.

import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Calendar03Icon as CalendarIcon } from 'hugeicons-react';

export type AnalyticsPreset =
  | 'today'
  | 'last3Days'
  | 'last7Days'
  | 'last30Days'
  | 'last3Months'
  | 'last6Months'
  | 'last1Year';

export const PRESETS: { id: AnalyticsPreset; title: string; days: number }[] = [
  { id: 'today',        title: 'Today',          days: 1 },
  { id: 'last3Days',    title: 'Last 3 Days',    days: 3 },
  { id: 'last7Days',    title: 'Last 7 Days',    days: 7 },
  { id: 'last30Days',   title: 'Last 30 Days',   days: 30 },
  { id: 'last3Months',  title: 'Last 3 Months',  days: 90 },
  { id: 'last6Months',  title: 'Last 6 Months',  days: 180 },
  { id: 'last1Year',    title: 'Last 1 Year',    days: 365 },
];

export function startOfLocalDay(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}

export function presetRange(id: AnalyticsPreset, now: Date = new Date()): { start: Date; end: Date } {
  const p = PRESETS.find((x) => x.id === id)!;
  const end = startOfLocalDay(now);
  const start = new Date(end);
  start.setDate(start.getDate() - (p.days - 1));
  return { start, end };
}

export function matchingPreset(start: Date, end: Date, now: Date = new Date()): AnalyticsPreset | null {
  const s = startOfLocalDay(start).getTime();
  const e = startOfLocalDay(end).getTime();
  for (const p of PRESETS) {
    const r = presetRange(p.id, now);
    if (r.start.getTime() === s && r.end.getTime() === e) return p.id;
  }
  return null;
}

interface Props {
  start: Date;
  end: Date;
  preset: AnalyticsPreset | null;
  onApply: (start: Date, end: Date, preset: AnalyticsPreset | null) => void;
}

export default function DateRangePicker({ start, end, preset, onApply }: Props) {
  const [open, setOpen] = useState(false);
  const [draftStart, setDraftStart] = useState<Date>(start);
  const [draftEnd, setDraftEnd] = useState<Date>(end);
  const [draftPreset, setDraftPreset] = useState<AnalyticsPreset | null>(preset);
  const [endpoint, setEndpoint] = useState<'from' | 'to'>('from');
  const popRef = useRef<HTMLDivElement | null>(null);

  // Reset draft state when the sheet opens so an earlier cancel doesn't
  // persist stale dates into the next session.
  useEffect(() => {
    if (open) {
      setDraftStart(start);
      setDraftEnd(end);
      setDraftPreset(preset);
      setEndpoint('from');
    }
  }, [open, start, end, preset]);

  // Dismiss on outside click / escape.
  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (popRef.current && !popRef.current.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpen(false); };
    document.addEventListener('mousedown', onDown);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDown);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  const applyPreset = (id: AnalyticsPreset) => {
    const r = presetRange(id);
    setDraftStart(r.start);
    setDraftEnd(r.end);
    setDraftPreset(id);
  };

  const onPickDate = (d: Date) => {
    const day = startOfLocalDay(d);
    if (endpoint === 'from') {
      setDraftStart(day);
      if (day > draftEnd) setDraftEnd(day);
      setEndpoint('to');
    } else {
      setDraftEnd(day);
      if (day < draftStart) setDraftStart(day);
    }
    setDraftPreset(matchingPreset(endpoint === 'from' ? day : draftStart, endpoint === 'to' ? day : draftEnd));
  };

  const isValid = draftStart <= draftEnd;
  const dayCount = Math.max(
    1,
    Math.round((startOfLocalDay(draftEnd).getTime() - startOfLocalDay(draftStart).getTime()) / 86_400_000) + 1,
  );

  return (
    <div className="relative inline-block" ref={popRef}>
      <CapsuleTrigger label={compactLabel(start, end)} onClick={() => setOpen((v) => !v)} />

      {open && (
        <div
          role="dialog"
          aria-label="Select date range"
          className="absolute right-0 z-50 mt-2 w-[360px] max-w-[calc(100vw-2rem)] overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-elevation-3 dark:border-stone-800 dark:bg-stone-900"
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b border-stone-200/70 px-4 py-3 dark:border-stone-800">
            <button
              onClick={() => setOpen(false)}
              className="text-[13px] font-medium text-stone-600 hover:text-stone-900 dark:text-stone-400 dark:hover:text-stone-100"
            >
              Cancel
            </button>
            <span className="text-[13px] font-semibold text-stone-900 dark:text-stone-100">Select range</span>
            <button
              disabled={!isValid}
              onClick={() => {
                onApply(draftStart, draftEnd, draftPreset);
                setOpen(false);
              }}
              className={`rounded-full px-3 py-1 text-[12px] font-semibold transition-colors ${
                isValid
                  ? 'bg-gradient-to-br from-stone-800 to-black text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.12)] dark:from-stone-100 dark:to-white dark:text-stone-900'
                  : 'cursor-not-allowed bg-stone-200 text-stone-400 dark:bg-stone-800 dark:text-stone-600'
              }`}
            >
              Apply
            </button>
          </div>

          <div className="space-y-4 px-4 py-4">
            {/* Summary */}
            <div>
              <div className="text-[15px] font-semibold text-stone-900 dark:text-stone-100">
                {summaryLabel(draftStart, draftEnd)}
              </div>
              <div className="mt-0.5 text-[11px] text-stone-500 dark:text-stone-400">
                {dayCount} day{dayCount === 1 ? '' : 's'}
              </div>
            </div>

            {/* Preset chips */}
            <div className="-mx-1 flex gap-1.5 overflow-x-auto pb-0.5 scrollbar-hide">
              {PRESETS.map((p) => {
                const active = draftPreset === p.id;
                return (
                  <button
                    key={p.id}
                    onClick={() => applyPreset(p.id)}
                    className={`shrink-0 whitespace-nowrap rounded-full px-3 py-1.5 text-[11px] transition-all ${
                      active
                        ? 'bg-gradient-to-br from-stone-800 to-black font-semibold text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.12)] dark:from-stone-100 dark:to-white dark:text-stone-900'
                        : 'border border-stone-200 bg-stone-50 font-medium text-stone-600 hover:bg-stone-100 dark:border-stone-700 dark:bg-stone-800 dark:text-stone-300 dark:hover:bg-stone-700'
                    }`}
                  >
                    {p.title}
                  </button>
                );
              })}
            </div>

            {/* From / To toggle */}
            <div className="grid grid-cols-2 gap-2">
              {(['from', 'to'] as const).map((ep) => {
                const active = endpoint === ep;
                const d = ep === 'from' ? draftStart : draftEnd;
                return (
                  <button
                    key={ep}
                    onClick={() => setEndpoint(ep)}
                    className={`rounded-xl border px-3 py-2 text-left transition-all ${
                      active
                        ? 'border-stone-900 bg-white dark:border-stone-100 dark:bg-stone-900'
                        : 'border-stone-200 bg-stone-50 dark:border-stone-800 dark:bg-stone-800/60'
                    }`}
                  >
                    <div className="text-[10px] font-medium uppercase tracking-wider text-stone-500 dark:text-stone-400">
                      {ep === 'from' ? 'From' : 'To'}
                    </div>
                    <div className="text-[13px] font-semibold text-stone-900 dark:text-stone-100">
                      {formatFull(d)}
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Calendar */}
            <RangeCalendar
              rangeStart={draftStart}
              rangeEnd={draftEnd}
              focusedDate={endpoint === 'from' ? draftStart : draftEnd}
              onPick={onPickDate}
            />

            {/* Clear */}
            <button
              onClick={() => applyPreset('last1Year')}
              className="w-full rounded-xl border border-stone-200 bg-stone-50 px-3 py-2 text-[12px] font-medium text-stone-600 transition-colors hover:bg-stone-100 dark:border-stone-800 dark:bg-stone-800 dark:text-stone-300 dark:hover:bg-stone-700"
            >
              Reset to Last 1 Year
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// MARK: - Trigger

function CapsuleTrigger({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="inline-flex items-center gap-1.5 rounded-full border border-stone-200 bg-stone-50 px-3 py-1.5 text-[12px] font-semibold text-stone-900 transition-colors hover:bg-stone-100 dark:border-stone-700 dark:bg-stone-800 dark:text-stone-100 dark:hover:bg-stone-700"
    >
      <CalendarIcon size={13} className="text-stone-500 dark:text-stone-400" />
      <span>{label}</span>
      <svg width="10" height="10" viewBox="0 0 10 10" fill="none" className="text-stone-500 dark:text-stone-400">
        <path d="M2 4l3 3 3-3" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </button>
  );
}

// MARK: - Calendar

function RangeCalendar({
  rangeStart,
  rangeEnd,
  focusedDate,
  onPick,
}: {
  rangeStart: Date;
  rangeEnd: Date;
  focusedDate: Date;
  onPick: (d: Date) => void;
}) {
  const [displayed, setDisplayed] = useState<Date>(new Date(focusedDate.getFullYear(), focusedDate.getMonth(), 1));

  useEffect(() => {
    // Snap the visible month to the endpoint being edited so the user
    // never loses their place when toggling From/To.
    if (focusedDate.getMonth() !== displayed.getMonth() || focusedDate.getFullYear() !== displayed.getFullYear()) {
      setDisplayed(new Date(focusedDate.getFullYear(), focusedDate.getMonth(), 1));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [focusedDate.getTime()]);

  const cells = useMemo(() => buildMonthCells(displayed), [displayed]);
  const today = startOfLocalDay(new Date());
  const rStart = startOfLocalDay(rangeStart);
  const rEnd = startOfLocalDay(rangeEnd);

  return (
    <div className="rounded-2xl border border-stone-200 bg-white p-3 dark:border-stone-800 dark:bg-stone-900">
      {/* Header */}
      <div className="mb-2 flex items-center justify-between">
        <CircleNav
          direction="prev"
          onClick={() => setDisplayed((d) => new Date(d.getFullYear(), d.getMonth() - 1, 1))}
        />
        <div className="text-[13px] font-semibold text-stone-900 dark:text-stone-100">
          {displayed.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
        </div>
        <CircleNav
          direction="next"
          onClick={() => setDisplayed((d) => new Date(d.getFullYear(), d.getMonth() + 1, 1))}
        />
      </div>

      {/* Weekday labels */}
      <div className="grid grid-cols-7 pb-1">
        {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((l, i) => (
          <div
            key={i}
            className="text-center text-[10px] font-semibold text-stone-400 dark:text-stone-500"
          >
            {l}
          </div>
        ))}
      </div>

      {/* Day grid */}
      <div className="grid grid-cols-7 gap-y-0.5">
        {cells.map((cell, i) => {
          if (!cell) return <div key={i} className="h-9" />;
          const isStart = cell.getTime() === rStart.getTime();
          const isEnd = cell.getTime() === rEnd.getTime();
          const isEndpoint = isStart || isEnd;
          const inRange = cell.getTime() >= rStart.getTime() && cell.getTime() <= rEnd.getTime();
          const isToday = cell.getTime() === today.getTime();
          const isFuture = cell.getTime() > today.getTime();
          return (
            <button
              key={i}
              disabled={isFuture}
              onClick={() => onPick(cell)}
              className="relative flex h-9 items-center justify-center disabled:cursor-not-allowed"
            >
              {/* Range fill — rectangular so it tiles across week rows */}
              {inRange && !isEndpoint && (
                <span className="absolute inset-y-1 left-0 right-0 bg-stone-100 dark:bg-stone-800" />
              )}
              {inRange && isStart && rStart.getTime() !== rEnd.getTime() && (
                <span className="absolute inset-y-1 left-1/2 right-0 bg-stone-100 dark:bg-stone-800" />
              )}
              {inRange && isEnd && rStart.getTime() !== rEnd.getTime() && (
                <span className="absolute inset-y-1 right-1/2 left-0 bg-stone-100 dark:bg-stone-800" />
              )}

              {/* Endpoint disc */}
              {isEndpoint && (
                <span className="absolute h-8 w-8 rounded-full bg-gradient-to-br from-stone-800 to-black dark:from-stone-100 dark:to-white" />
              )}

              {/* Today ring when not already an endpoint */}
              {isToday && !isEndpoint && (
                <span className="absolute h-8 w-8 rounded-full ring-1 ring-stone-400 dark:ring-stone-500" />
              )}

              <span
                className={`relative text-[12px] tabular-nums ${
                  isEndpoint
                    ? 'font-semibold text-white dark:text-stone-900'
                    : isFuture
                    ? 'text-stone-300 dark:text-stone-700'
                    : 'text-stone-900 dark:text-stone-100'
                }`}
              >
                {cell.getDate()}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

function CircleNav({ direction, onClick }: { direction: 'prev' | 'next'; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="flex h-7 w-7 items-center justify-center rounded-full border border-stone-200 bg-stone-50 text-stone-600 hover:bg-stone-100 dark:border-stone-700 dark:bg-stone-800 dark:text-stone-300 dark:hover:bg-stone-700"
      aria-label={direction === 'prev' ? 'Previous month' : 'Next month'}
    >
      <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
        {direction === 'prev' ? (
          <path d="M6 2L3 5l3 3" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
        ) : (
          <path d="M4 2l3 3-3 3" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
        )}
      </svg>
    </button>
  );
}

// MARK: - Helpers

// Return 42 cells (6 weeks × 7 cols). Leading cells before the 1st are
// null so the grid height stays constant month-to-month.
function buildMonthCells(displayed: Date): (Date | null)[] {
  const first = new Date(displayed.getFullYear(), displayed.getMonth(), 1);
  const lead = first.getDay(); // 0 = Sunday
  const daysInMonth = new Date(displayed.getFullYear(), displayed.getMonth() + 1, 0).getDate();
  const cells: (Date | null)[] = Array(lead).fill(null);
  for (let d = 1; d <= daysInMonth; d++) {
    cells.push(new Date(displayed.getFullYear(), displayed.getMonth(), d));
  }
  while (cells.length < 42) cells.push(null);
  return cells;
}

function formatFull(d: Date): string {
  return d.toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' });
}

function summaryLabel(start: Date, end: Date): string {
  if (startOfLocalDay(start).getTime() === startOfLocalDay(end).getTime()) return formatFull(start);
  return `${formatFull(start)} – ${formatFull(end)}`;
}

// "Feb 10 – Mar 17" for same-year, "Feb 10, '23 – Mar 17, '24" when
// the range crosses a year boundary. Matches the iOS capsule label.
export function compactLabel(start: Date, end: Date): string {
  const s = startOfLocalDay(start);
  const e = startOfLocalDay(end);
  if (s.getTime() === e.getTime()) {
    return s.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  }
  const sameYear = s.getFullYear() === e.getFullYear();
  const fmt = (d: Date) =>
    sameYear
      ? d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
      : `${d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}, '${String(d.getFullYear()).slice(2)}`;
  return `${fmt(s)} – ${fmt(e)}`;
}
