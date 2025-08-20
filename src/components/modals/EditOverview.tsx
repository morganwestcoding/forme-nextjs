// components/modals/EditOverview.tsx
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
}

const EditOverview: React.FC<EditOverviewProps> = ({ items, onSelect }) => {
  return (
    <div className="flex flex-col gap-4 mb-2">
      {/* Two rows: keep 2 columns so 4 items render as 2x2 */}
      <div className="grid grid-cols-2 gap-4">
        {items.map((it) => (
          <button
            key={it.key}
            onClick={() => onSelect(it.key)}
            className={[
              // card shell
              'group relative rounded-2xl p-5 text-left',
              'bg-white border border-neutral-200 shadow-sm hover:shadow-md',
              'transition focus:outline-none focus:ring-2 focus:ring-neutral-300',
              // size & layout
              'h-36 flex flex-col justify-between'
            ].join(' ')}
          >
            <div className="space-y-1">
              <div className="text-base font-semibold text-neutral-900">
                {it.title}
              </div>
              <p className="text-sm text-neutral-600">
                {it.description || 'Click to edit this section'}
              </p>
            </div>

            {/* subtle affordance */}
            <div className="flex items-center justify-end">
              <span className="text-neutral-400 group-hover:text-neutral-700 transition text-sm">
                Edit →
              </span>
            </div>
          </button>
        ))}
      </div>

      <p className="text-xs text-neutral-500">
        Tip: You can always press <span className="font-semibold">Back</span> from a section to return here.
      </p>
    </div>
  );
};

export default EditOverview;
