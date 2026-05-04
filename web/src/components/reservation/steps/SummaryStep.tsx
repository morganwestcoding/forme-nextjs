'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { format } from 'date-fns';
import { Tick02Icon, Add01Icon } from 'hugeicons-react';
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
  // Subtotal of services. The component computes total = subtotal + tip.
  subtotal: number;
  tipAmount: number;
  onTipChange: (next: number) => void;
  // Per-service notes, keyed by serviceId. Parent serializes these into the
  // single Reservation.note string at submit.
  serviceNotes: Record<string, string>;
  onServiceNotesChange: (next: Record<string, string>) => void;
  businessName: string;
}

const TIP_PRESETS = [18, 20, 22] as const;

export default function SummaryStep({
  selectedServices,
  selectedEmployee,
  date,
  time,
  subtotal,
  tipAmount,
  onTipChange,
  serviceNotes,
  onServiceNotesChange,
  businessName,
}: SummaryStepProps) {
  const formattedDate = date ? format(date, 'EEE, MMM d') : '';
  const formattedTime = time ? format(new Date(`2021-01-01T${time}`), 'h:mm a') : '';
  const total = subtotal + tipAmount;

  // Track which preset is selected vs custom mode. A "custom" pick means the
  // user typed a dollar amount; deselecting it returns to no tip.
  const matchedPreset = TIP_PRESETS.find(
    (pct) => Math.round(subtotal * (pct / 100)) === tipAmount && tipAmount > 0
  );
  const [tipMode, setTipMode] = useState<'preset' | 'custom' | 'none'>(
    tipAmount === 0 ? 'none' : matchedPreset ? 'preset' : 'custom'
  );
  const [customDraft, setCustomDraft] = useState<string>(
    tipMode === 'custom' && tipAmount > 0 ? String(tipAmount) : ''
  );

  // Per-service note editor — only one open at a time. Draft is held locally
  // so Cancel reverts cleanly.
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null);
  const [noteDraft, setNoteDraft] = useState('');

  const openNoteEditor = (serviceId: string) => {
    setNoteDraft(serviceNotes[serviceId] || '');
    setEditingNoteId(serviceId);
  };
  const saveNoteEditor = () => {
    if (!editingNoteId) return;
    const next = { ...serviceNotes };
    const trimmed = noteDraft.trim();
    if (trimmed) next[editingNoteId] = trimmed;
    else delete next[editingNoteId];
    onServiceNotesChange(next);
    setEditingNoteId(null);
    setNoteDraft('');
  };
  const cancelNoteEditor = () => {
    setEditingNoteId(null);
    setNoteDraft('');
  };

  const selectPreset = (pct: number) => {
    setTipMode('preset');
    onTipChange(Math.round(subtotal * (pct / 100)));
  };
  const selectNone = () => {
    setTipMode('none');
    setCustomDraft('');
    onTipChange(0);
  };
  const selectCustom = () => {
    setTipMode('custom');
    onTipChange(Math.max(0, Math.round(Number(customDraft) || 0)));
  };

  const serviceCount = selectedServices.length;

  return (
    <div>
      <TypeformHeading question="Review your booking" />

      <div className="grid grid-cols-2 gap-3 mb-6">
        {/* Date Card */}
        <motion.div
          variants={itemVariants}
          className="p-4 rounded-xl border border-stone-200 dark:border-stone-800 bg-stone-50 dark:bg-stone-900"
        >
          <p className="text-xs text-stone-500 dark:text-stone-500 mb-1">Date</p>
          <p className="text-sm font-medium text-stone-900 dark:text-stone-100">{formattedDate}</p>
        </motion.div>

        {/* Time Card */}
        <motion.div
          variants={itemVariants}
          className="p-4 rounded-xl border border-stone-200 dark:border-stone-800 bg-stone-50 dark:bg-stone-900"
        >
          <p className="text-xs text-stone-500 dark:text-stone-500 mb-1">Time</p>
          <p className="text-sm font-medium text-stone-900 dark:text-stone-100">{formattedTime}</p>
        </motion.div>

        {/* Professional Card */}
        <motion.div
          variants={itemVariants}
          className="p-4 rounded-xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900"
        >
          <p className="text-xs text-stone-500 dark:text-stone-500 mb-1">With</p>
          <p className="text-sm font-medium text-stone-900 dark:text-stone-100 truncate">
            {selectedEmployee?.label || 'Any available'}
          </p>
        </motion.div>

        {/* Location Card */}
        <motion.div
          variants={itemVariants}
          className="p-4 rounded-xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900"
        >
          <p className="text-xs text-stone-500 dark:text-stone-500 mb-1">At</p>
          <p className="text-sm font-medium text-stone-900 dark:text-stone-100 truncate">{businessName}</p>
        </motion.div>
      </div>

      {/* Services */}
      <motion.div variants={itemVariants} className="mb-6">
        <div className="flex items-center justify-between mb-3">
          <p className="text-xs text-stone-500 dark:text-stone-500">
            {serviceCount === 1 ? '1 service' : `${serviceCount} services`}
          </p>
          <p className="text-xs text-stone-400 dark:text-stone-500 tabular-nums">
            ${subtotal.toFixed(2)}
          </p>
        </div>
        <div className="space-y-3">
          {selectedServices.map((service) => {
            const sid = service.value;
            const isEditing = editingNoteId === sid;
            const hasNote = !!(serviceNotes[sid] || '').trim();
            return (
              <div key={sid}>
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="text-sm text-stone-900 dark:text-stone-100 truncate">
                      {service.label.split(' - ')[0]}
                    </span>
                    {!isEditing && (
                      <button
                        type="button"
                        onClick={() => openNoteEditor(sid)}
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium transition-colors ${
                          hasNote
                            ? 'bg-stone-900 text-white dark:bg-stone-100 dark:text-stone-900 hover:bg-stone-800 dark:hover:bg-stone-200'
                            : 'bg-stone-100 text-stone-500 dark:bg-stone-800 dark:text-stone-400 hover:bg-stone-200 hover:text-stone-700 dark:hover:bg-stone-700 dark:hover:text-stone-200'
                        }`}
                      >
                        {hasNote ? (
                          <Tick02Icon className="w-3 h-3" strokeWidth={2.5} />
                        ) : (
                          <Add01Icon className="w-3 h-3" strokeWidth={2.5} />
                        )}
                        Note
                      </button>
                    )}
                  </div>
                  <span className="text-sm text-stone-600 dark:text-stone-300 tabular-nums shrink-0">
                    ${service.price}
                  </span>
                </div>

                <AnimatePresence initial={false}>
                  {isEditing && (
                    <motion.div
                      key="note-editor"
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.18, ease: [0.22, 1, 0.36, 1] }}
                      className="overflow-hidden"
                    >
                      {/* Horizontal padding here — overflow-hidden on the
                          parent (needed for the height-collapse animation)
                          would otherwise clip the textarea border + focus
                          ring against the container edges. */}
                      <div className="mt-2 px-0.5">
                        <textarea
                          autoFocus
                          value={noteDraft}
                          onChange={(e) => setNoteDraft(e.target.value)}
                          onKeyDown={(e) => {
                            // Enter saves; Shift+Enter inserts newline.
                            if (e.key === 'Enter' && !e.shiftKey) {
                              e.preventDefault();
                              saveNoteEditor();
                            } else if (e.key === 'Escape') {
                              e.preventDefault();
                              cancelNoteEditor();
                            }
                            // Stop propagation so the flow's global Enter handler
                            // doesn't advance the step while editing a note.
                            e.stopPropagation();
                          }}
                          placeholder="Note for this service…"
                          rows={2}
                          className="w-full px-4 py-3 bg-stone-50 dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-xl text-sm text-stone-900 dark:text-stone-100 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-stone-900 focus:border-transparent transition-[box-shadow,border-color] duration-150 resize-none"
                        />
                        <div className="flex items-center justify-end gap-1 mt-1.5">
                          <button
                            type="button"
                            onClick={cancelNoteEditor}
                            className="px-3 py-1 rounded-full text-[12px] font-medium text-stone-500 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-100 transition-colors"
                          >
                            Cancel
                          </button>
                          <button
                            type="button"
                            onClick={saveNoteEditor}
                            className="px-3 py-1 rounded-full text-[12px] font-medium bg-stone-900 text-white dark:bg-stone-100 dark:text-stone-900 hover:bg-stone-800 dark:hover:bg-stone-200 transition-colors"
                          >
                            Save
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>
      </motion.div>

      {/* Tip */}
      <motion.div variants={itemVariants} className="mb-6">
        <p className="text-xs text-stone-500 dark:text-stone-500 mb-3">Add a tip</p>
        <div className="grid grid-cols-5 gap-2">
          {TIP_PRESETS.map((pct) => {
            const active = tipMode === 'preset' && matchedPreset === pct;
            const amount = Math.round(subtotal * (pct / 100));
            return (
              <button
                key={pct}
                type="button"
                onClick={() => selectPreset(pct)}
                className={`px-2 py-3 rounded-xl border text-center transition-all duration-200 ${
                  active
                    ? 'border-stone-300 dark:border-stone-700 bg-stone-100 dark:bg-stone-800 shadow-inset-pressed'
                    : 'border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-900 hover:border-stone-300 hover:bg-stone-50 dark:hover:bg-stone-800'
                }`}
              >
                <span className="block text-sm font-semibold text-stone-900 dark:text-stone-100">{pct}%</span>
                <span className="block text-[11px] text-stone-500 dark:text-stone-500 tabular-nums">
                  ${amount}
                </span>
              </button>
            );
          })}
          <button
            type="button"
            onClick={selectCustom}
            className={`px-2 py-3 rounded-xl border text-center transition-all duration-200 ${
              tipMode === 'custom'
                ? 'border-stone-300 dark:border-stone-700 bg-stone-100 dark:bg-stone-800 shadow-inset-pressed'
                : 'border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-900 hover:border-stone-300 hover:bg-stone-50 dark:hover:bg-stone-800'
            }`}
          >
            <span className="block text-sm font-semibold text-stone-900 dark:text-stone-100">Custom</span>
            <span className="block text-[11px] text-stone-500 dark:text-stone-500">$</span>
          </button>
          <button
            type="button"
            onClick={selectNone}
            className={`px-2 py-3 rounded-xl border text-center transition-all duration-200 ${
              tipMode === 'none'
                ? 'border-stone-300 dark:border-stone-700 bg-stone-100 dark:bg-stone-800 shadow-inset-pressed'
                : 'border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-900 hover:border-stone-300 hover:bg-stone-50 dark:hover:bg-stone-800'
            }`}
          >
            <span className="block text-sm font-semibold text-stone-900 dark:text-stone-100">No tip</span>
            <span className="block text-[11px] text-stone-500 dark:text-stone-500">—</span>
          </button>
        </div>

        {tipMode === 'custom' && (
          <div className="mt-3 relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm text-stone-400 dark:text-stone-500">$</span>
            <input
              type="number"
              inputMode="decimal"
              min={0}
              step={1}
              value={customDraft}
              onChange={(e) => {
                setCustomDraft(e.target.value);
                onTipChange(Math.max(0, Math.round(Number(e.target.value) || 0)));
              }}
              placeholder="0"
              className="w-full pl-8 pr-4 py-3 bg-stone-50 dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-xl text-sm text-stone-900 dark:text-stone-100 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-stone-900 focus:border-transparent transition-[box-shadow,border-color] duration-150 tabular-nums"
            />
          </div>
        )}
      </motion.div>

      {/* Total */}
      <motion.div
        variants={itemVariants}
        className="p-4 rounded-xl bg-stone-50 dark:bg-stone-900 border border-stone-100 dark:border-stone-800 space-y-2"
      >
        <div className="flex justify-between items-center text-sm text-stone-500 dark:text-stone-500">
          <span>Subtotal</span>
          <span className="tabular-nums">${subtotal.toFixed(2)}</span>
        </div>
        {tipAmount > 0 && (
          <div className="flex justify-between items-center text-sm text-stone-500 dark:text-stone-500">
            <span>Tip</span>
            <span className="tabular-nums">${tipAmount.toFixed(2)}</span>
          </div>
        )}
        <div className="flex justify-between items-center pt-2 border-t border-stone-100 dark:border-stone-800">
          <span className="text-sm font-medium text-stone-900 dark:text-stone-100">Total</span>
          <span className="text-base font-semibold text-stone-900 dark:text-stone-100 tabular-nums">
            ${total.toFixed(2)}
          </span>
        </div>
      </motion.div>
    </div>
  );
}
