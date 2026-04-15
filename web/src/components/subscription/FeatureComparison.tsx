// app/subscription/FeatureComparison.tsx
'use client';

import React from 'react';
import { Tick02Icon as Check, Cancel01Icon as X } from 'hugeicons-react';

// Pricing 2.0 — see /Pricing 2.0.pdf
type Cell = boolean | string;
type Item = { name: string; bronze: Cell; gold: Cell; platinum: Cell };

const features: { category: string; items: Item[] }[] = [
  {
    category: "Platform",
    items: [
      { name: "Full platform access", bronze: true, gold: true, platinum: true },
      { name: "Professional profile & storefront", bronze: true, gold: true, platinum: true },
      { name: "Marketing tools", bronze: true, gold: true, platinum: true },
      { name: "Video content posting", bronze: true, gold: true, platinum: true },
      { name: "Online booking", bronze: true, gold: true, platinum: true },
      { name: "Stripe payment processing", bronze: true, gold: true, platinum: true },
    ],
  },
  {
    category: "Growth",
    items: [
      { name: "SEO tools", bronze: false, gold: true, platinum: true },
      { name: "Business analytics dashboard", bronze: false, gold: true, platinum: true },
    ],
  },
  {
    category: "Marketing",
    items: [
      { name: "ForMe marketing credits", bronze: false, gold: false, platinum: "$200 credit" },
      { name: "Run promotions inside marketplace", bronze: false, gold: false, platinum: true },
    ],
  },
  {
    category: "Transaction fees",
    items: [
      {
        name: "Per-booking fee",
        bronze: "7% / 5% / 3% tiered",
        gold: "$0",
        platinum: "$0",
      },
    ],
  },
];

function renderCell(value: Cell) {
  if (value === true) {
    return <Check className="w-5 h-5 text-green-500 mx-auto" />;
  }
  if (value === false) {
    return <X className="w-5 h-5 text-stone-300 mx-auto" />;
  }
  return <span className="text-xs font-medium text-stone-700 dark:text-stone-200">{value}</span>;
}

const FeatureComparison: React.FC = () => {
  return (
    <div className="bg-stone-50 dark:bg-stone-900 rounded-2xl p-8">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-stone-900 dark:text-stone-100 mb-2">What&apos;s included</h2>
        <p className="text-stone-600 dark:text-stone-300">Feature comparison across all plans</p>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-stone-200 dark:border-stone-800">
              <th className="text-left py-4 pr-8 text-sm font-semibold text-stone-900 dark:text-stone-100">Features</th>
              <th className="text-center py-4 px-4 text-sm font-semibold text-stone-900 dark:text-stone-100 min-w-[120px]">Freemium</th>
              <th className="text-center py-4 px-4 text-sm font-semibold text-stone-900 dark:text-stone-100 min-w-[120px]">Gold</th>
              <th className="text-center py-4 px-4 text-sm font-semibold text-stone-900 dark:text-stone-100 min-w-[120px]">Platinum</th>
            </tr>
            <tr className="border-b border-stone-200 dark:border-stone-800">
              <th className="text-left py-2 pr-8 text-xs font-medium text-stone-400 dark:text-stone-500">Monthly price</th>
              <th className="text-center py-2 px-4 text-xs font-semibold text-stone-700 dark:text-stone-200">$0</th>
              <th className="text-center py-2 px-4 text-xs font-semibold text-stone-700 dark:text-stone-200">$30</th>
              <th className="text-center py-2 px-4 text-xs font-semibold text-stone-700 dark:text-stone-200">$100</th>
            </tr>
          </thead>
          <tbody>
            {features.map((category) => (
              <React.Fragment key={category.category}>
                <tr>
                  <td colSpan={4} className="py-4">
                    <div className="text-xs font-semibold text-stone-500 dark:text-stone-400 dark:text-stone-500 uppercase tracking-wide">
                      {category.category}
                    </div>
                  </td>
                </tr>
                {category.items.map((item) => (
                  <tr key={item.name} className="border-b border-stone-100 dark:border-stone-800">
                    <td className="py-3 pr-8 text-sm text-stone-700 dark:text-stone-200">{item.name}</td>
                    <td className="py-3 px-4 text-center">{renderCell(item.bronze)}</td>
                    <td className="py-3 px-4 text-center">{renderCell(item.gold)}</td>
                    <td className="py-3 px-4 text-center">{renderCell(item.platinum)}</td>
                  </tr>
                ))}
              </React.Fragment>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-6 text-center text-sm text-stone-500 dark:text-stone-400 dark:text-stone-500">
        Freemium tiered fees: $0–$100 → 7%, $101–$199 → 5%, $200+ → 3%. Gold and Platinum waive transaction fees.
      </div>
    </div>
  );
};

export default FeatureComparison;