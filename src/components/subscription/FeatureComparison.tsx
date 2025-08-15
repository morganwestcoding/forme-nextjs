// app/subscription/FeatureComparison.tsx
'use client';

import React from 'react';
import { Check, X } from 'lucide-react';

type Tier = 'quartz' | 'pearl' | 'sapphire' | 'ruby' | 'emerald' | 'diamond';
type Cell = boolean | string | number | null;

interface Row {
  feature: string;
  values: Record<Tier, Cell>;
}

interface Section {
  title: string;
  rows: Row[];
}

const sections: Section[] = [
  {
    title: 'Tools',
    rows: [
      {
        feature: 'Cadence Scheduling',
        values: {
          quartz: false,
          pearl: true,
          sapphire: true,
          ruby: true,
          emerald: true,
          diamond: 'Custom',
        },
      },
      {
        feature: 'Store / Listing Creation',
        values: {
          quartz: false,
          pearl: false,
          sapphire: true,
          ruby: true,
          emerald: true,
          diamond: 'Custom',
        },
      },
    ],
  },
  {
    title: 'Features',
    rows: [
      {
        feature: 'Member Discounts',
        values: {
          quartz: false,
          pearl: true,
          sapphire: true,
          ruby: true,
          emerald: true,
          diamond: 'Custom',
        },
      },
      {
        feature: 'ForMe Cash (Monthly Credit)',
        values: {
          quartz: false,
          pearl: true,
          sapphire: true,
          ruby: true,
          emerald: true,
          diamond: 'Custom',
        },
      },
    ],
  },
  {
    title: 'Placement & Analytics',
    rows: [
      {
        feature: 'Analytics',
        values: {
          quartz: false,
          pearl: 'Basic',
          sapphire: 'Basic',
          ruby: 'Advanced',
          emerald: 'Advanced',
          diamond: 'Enterprise',
        },
      },
      {
        feature: 'Featured / Priority Placement',
        values: {
          quartz: false,
          pearl: false,
          sapphire: false,
          ruby: 'Featured',
          emerald: 'Priority',
          diamond: 'Custom',
        },
      },
    ],
  },
  {
    title: 'Support & Team',
    rows: [
      {
        feature: 'Support Level',
        values: {
          quartz: 'Standard',
          pearl: 'Priority',
          sapphire: 'Priority',
          ruby: 'Priority',
          emerald: 'Premium',
          diamond: '24/7',
        },
      },
      {
        feature: 'Team Seats',
        values: {
          quartz: 0,
          pearl: 1,
          sapphire: 2,
          ruby: 3,
          emerald: 5,
          diamond: 'Infinite',
        },
      },
    ],
  },
];

const tiers: { key: Tier; label: string }[] = [
  { key: 'quartz', label: 'Quartz' },
  { key: 'pearl', label: 'Pearl' },
  { key: 'sapphire', label: 'Sapphire' },
  { key: 'ruby', label: 'Ruby' },
  { key: 'emerald', label: 'Emerald' },
  { key: 'diamond', label: 'Diamond' },
];

const COL_W = 'w-[112px]';

function CellBadge({ value }: { value: Cell }) {
  return (
    <div className={`flex items-center justify-center h-8 ${COL_W}`}>
      {value === true && (
        <span
          className="flex items-center justify-center h-8 w-8 rounded-full bg-emerald-600/10 ring-1 ring-inset ring-emerald-600/20 text-emerald-600 dark:text-emerald-300"
          aria-label="Included"
        >
          <Check className="h-4 w-4" />
        </span>
      )}
      {(value === false || value === null) && (
        <span
          className="flex items-center justify-center h-8 w-8 rounded-full bg-rose-600/10 ring-1 ring-inset ring-rose-600/20 text-rose-600 dark:text-rose-300"
          aria-label="Not included"
        >
          <X className="h-4 w-4" />
        </span>
      )}
      {value !== true && value !== false && value !== null && (
        <span
          className={[
            'inline-flex items-center justify-center h-8 whitespace-nowrap rounded-full px-3 text-xs font-medium ring-1 ring-inset',
            /custom/i.test(String(value))
              ? 'bg-blue-500/10 text-blue-700 ring-blue-500/30 dark:text-blue-300'
              : 'bg-slate-500/5 text-slate-700 ring-slate-300 dark:text-slate-300 dark:ring-slate-600',
          ].join(' ')}
        >
          {String(value)}
        </span>
      )}
    </div>
  );
}

const FeatureComparison: React.FC = () => {
  return (
    <section className="mt-16 px-2 sm:px-4 md:px-6 lg:px-8">
      <h2 className="text-3xl font-semibold text-left text-black">
        Feature Comparison
      </h2>

      <div className="mt-6 rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden dark:bg-slate-900 dark:border-slate-800">
        <div className="overflow-x-auto">
          <table className="min-w-[960px] w-full table-fixed border-collapse">
            <colgroup>
              <col className="w-auto" />
              {tiers.map((t) => (
                <col key={t.key} className={COL_W} />
              ))}
            </colgroup>

            <thead>
              <tr className="bg-slate-50/80 dark:bg-slate-800/60">
                <th className="sticky left-0 z-10 bg-inherit pl-8 pr-6 py-4 text-sm font-semibold text-slate-700 dark:text-slate-200 text-left">
                  Features
                </th>
                {tiers.map(({ key, label }) => (
                  <th
                    key={key}
                    className={`py-4 text-sm font-semibold text-slate-700 dark:text-slate-200 text-center ${COL_W}`}
                  >
                    {label}
                  </th>
                ))}
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {sections.map((section) => (
                <React.Fragment key={section.title}>
                  <tr className="bg-slate-100/70 dark:bg-slate-800/50">
                    <td
                      className="sticky left-0 z-10 bg-inherit pl-8 pr-6 py-3 text-xs tracking-wide uppercase text-slate-500 dark:text-slate-400"
                      colSpan={1}
                    >
                      {section.title}
                    </td>
                    {tiers.map(({ key }) => (
                      <td key={key} className={`py-3 ${COL_W}`} />
                    ))}
                  </tr>

                  {section.rows.map((row, idx) => {
                    const zebra =
                      idx % 2 === 0
                        ? 'bg-white dark:bg-slate-900'
                        : 'bg-slate-50 dark:bg-slate-900/60';
                    return (
                      <tr key={row.feature} className={zebra}>
                        <th
                          scope="row"
                          className="sticky left-0 z-10 bg-inherit pl-8 pr-6 py-4 text-sm font-medium text-slate-900 dark:text-slate-100"
                        >
                          {row.feature}
                        </th>
                        {tiers.map(({ key }) => (
                          <td key={key} className={`py-4 text-center align-middle ${COL_W}`}>
                            <CellBadge value={row.values[key]} />
                          </td>
                        ))}
                      </tr>
                    );
                  })}
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </div>

        <div className="flex flex-wrap items-center gap-4 px-6 py-4 border-t border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300">
            <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-emerald-600/10 text-emerald-600 ring-1 ring-emerald-600/20 dark:text-emerald-300">
              <Check className="h-3.5 w-3.5" />
            </span>
            Included
          </div>
          <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300">
            <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-rose-600/10 text-rose-600 ring-1 ring-rose-600/20 dark:text-rose-300">
              <X className="h-3.5 w-3.5" />
            </span>
            Not included
          </div>
          <div className="text-sm text-slate-500 dark:text-slate-400">
            Labeled pills indicate the level or quantity for that tier.
          </div>
        </div>
      </div>
    </section>
  );
};

export default FeatureComparison;
