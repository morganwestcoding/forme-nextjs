'use client';

import React from 'react';

export interface EditItem {
  key: number;               // matches your STEPS enum value
  title: string;
  description?: string;
  complete?: boolean;        // kept for compatibility; not rendered
}

interface EditOverviewProps {
  items: EditItem[];
  onSelect: (stepKey: number) => void;
  updatedKey?: number;       // 👈 highlight a section that was just saved
}

const EditOverview: React.FC<EditOverviewProps> = ({ items, onSelect, updatedKey }) => {
  return (
    <div className="flex flex-col gap-4 mb-2">
      {/* Two rows: keep 2 columns so 4+ items render in grid */}
      <div className="grid grid-cols-2 gap-4">
        {items.map((it) => {
          const isUpdated = updatedKey === it.key;
          return (
            <button
              key={it.key}
              onClick={() => onSelect(it.key)}
              className={[
                // card shell
                'group relative rounded-2xl p-5 text-left',
                'bg-white border border-neutral-200 shadow-sm hover:shadow-md',
                'transition focus:outline-none focus:ring-2 focus:ring-neutral-300',
                // size & layout
                'h-28 flex flex-col justify-between',
                // updated highlight
                isUpdated ? 'ring-2 ring-green-400/60' : ''
              ].join(' ')}
            >
              {/* Updated badge */}
              {isUpdated && (
                <span className="absolute -top-2 -right-2 rounded-full bg-green-500 text-white text-[11px] px-2 py-1 shadow">
                  Updated
                </span>
              )}

              <div className="space-y-1">
                <div className="text-base font-semibold text-neutral-900">
                  {it.title}
                </div>
                <p className={`text-sm ${isUpdated ? 'text-green-700' : 'text-neutral-600'}`}>
                  {isUpdated ? 'Updated just now' : (it.description || 'Click to edit this section')}
                </p>
              </div>

              {/* subtle affordance */}
              <div className="flex items-center justify-end">
                <span className={`text-sm transition ${isUpdated ? 'text-green-700' : 'text-neutral-400 group-hover:text-neutral-700'}`}>
                  Edit →
                </span>
              </div>
            </button>
          );
        })}
      </div>

      <p className="text-xs text-neutral-500">
        Tip: You can always press <span className="font-semibold">Back</span> from a section to return here.
      </p>
    </div>
  );
};

export default EditOverview;
