// app/subscription/FeatureComparison.tsx
'use client';

import React from 'react';

const FeatureComparison: React.FC = () => {
  const rows = [
    {
      feature: 'Member Discounts',
      quartz: '—',
      pearl: '✓',
      sapphire: '✓',
      ruby: '✓',
      emerald: '✓',
      diamond: 'Custom',
    },
    {
      feature: 'ForMe Cash (Monthly Credit)',
      quartz: '—',
      pearl: '✓',
      sapphire: '✓',
      ruby: '✓',
      emerald: '✓',
      diamond: 'Custom',
    },
    {
      feature: 'Cadence Scheduling',
      quartz: '—',
      pearl: '✓',
      sapphire: '✓',
      ruby: '✓',
      emerald: '✓',
      diamond: 'Custom',
    },
    {
      feature: 'Store / Listing Creation',
      quartz: '—',
      pearl: '—',
      sapphire: '✓',
      ruby: '✓',
      emerald: '✓',
      diamond: 'Custom',
    },
    {
      feature: 'Analytics',
      quartz: '—',
      pearl: 'Basic',
      sapphire: 'Basic',
      ruby: 'Advanced',
      emerald: 'Advanced',
      diamond: 'Enterprise',
    },
    {
      feature: 'Featured/Priority Placement',
      quartz: '—',
      pearl: '—',
      sapphire: '—',
      ruby: 'Featured',
      emerald: 'Priority',
      diamond: 'Custom',
    },
    {
      feature: 'Support Level',
      quartz: 'Standard',
      pearl: 'Priority',
      sapphire: 'Priority',
      ruby: 'Priority',
      emerald: 'Premium',
      diamond: '24/7',
    },
    {
      feature: 'Team Seats',
      quartz: '0',
      pearl: '1',
      sapphire: '2',
      ruby: '3',
      emerald: '5',
      diamond: 'Infinite',
    },
  ] as const;

  return (
    <section className="mt-16">
      <h2 className="text-3xl font-semibold text-left bg-gradient-to-r from-[#60A5FA] to-[#1f82fa] bg-clip-text text-transparent">
        Feature Comparison
      </h2>
      <div className="mt-8 overflow-x-auto rounded-2xl shadow-lg bg-white">
        <table className="min-w-[880px] w-full text-left">
          <thead>
            <tr className="bg-slate-50 text-slate-700 text-sm">
              <th className="px-6 py-4 font-semibold">Feature</th>
              <th className="px-6 py-4 font-semibold">Quartz</th>
              <th className="px-6 py-4 font-semibold">Pearl</th>
              <th className="px-6 py-4 font-semibold">Sapphire</th>
              <th className="px-6 py-4 font-semibold">Ruby</th>
              <th className="px-6 py-4 font-semibold">Emerald</th>
              <th className="px-6 py-4 font-semibold">Diamond</th>
            </tr>
          </thead>
          <tbody className="text-slate-700">
            {rows.map((row) => (
              <tr key={row.feature} className="border-t border-slate-100">
                <td className="px-6 py-4">{row.feature}</td>
                <td className="px-6 py-4">{row.quartz}</td>
                <td className="px-6 py-4">{row.pearl}</td>
                <td className="px-6 py-4">{row.sapphire}</td>
                <td className="px-6 py-4">{row.ruby}</td>
                <td className="px-6 py-4">{row.emerald}</td>
                <td className="px-6 py-4">{row.diamond}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
};

export default FeatureComparison;
