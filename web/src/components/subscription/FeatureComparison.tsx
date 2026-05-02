// app/subscription/FeatureComparison.tsx
'use client';

import React from 'react';
import { CheckmarkCircle02Icon, Cancel01Icon } from 'hugeicons-react';

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
    return <CheckmarkCircle02Icon size={16} color="#a8a29e" className="mx-auto" strokeWidth={1.5} />;
  }
  if (value === false) {
    return <Cancel01Icon size={14} className="mx-auto text-stone-200 dark:text-stone-700" strokeWidth={1.5} />;
  }
  return <span className="text-[12px] font-medium text-stone-700 dark:text-stone-200 tabular-nums">{value}</span>;
}

const FeatureComparison: React.FC = () => {
  return (
    <div>
      <div className="mb-6">
        <p className="text-[12px] text-stone-400 dark:text-stone-500 mb-1">Compare plans</p>
        <h2 className="text-xl font-semibold text-stone-900 dark:text-stone-100 tracking-tight">Everything in detail</h2>
      </div>

      <div className="rounded-2xl border border-stone-200/60 dark:border-stone-800 bg-white dark:bg-stone-900 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-[13px]">
            <thead>
              <tr className="border-b border-stone-100 dark:border-stone-800">
                <th className="text-left py-4 px-6 text-[11px] font-medium uppercase tracking-wide text-stone-400 dark:text-stone-500">Feature</th>
                <th className="py-4 px-4 min-w-[110px] text-center">
                  <p className="text-[11px] font-medium uppercase tracking-wide text-stone-400 dark:text-stone-500">Freemium</p>
                  <p className="text-[14px] font-semibold text-stone-900 dark:text-stone-100 tabular-nums mt-1">Free</p>
                </th>
                <th className="py-4 px-4 min-w-[110px] text-center bg-stone-50/60 dark:bg-stone-950/40">
                  <p className="text-[11px] font-medium uppercase tracking-wide text-stone-400 dark:text-stone-500">Gold</p>
                  <p className="text-[14px] font-semibold text-stone-900 dark:text-stone-100 tabular-nums mt-1">$30<span className="text-[11px] font-normal text-stone-400 dark:text-stone-500">/mo</span></p>
                </th>
                <th className="py-4 px-4 min-w-[110px] text-center">
                  <p className="text-[11px] font-medium uppercase tracking-wide text-stone-400 dark:text-stone-500">Platinum</p>
                  <p className="text-[14px] font-semibold text-stone-900 dark:text-stone-100 tabular-nums mt-1">$100<span className="text-[11px] font-normal text-stone-400 dark:text-stone-500">/mo</span></p>
                </th>
              </tr>
            </thead>
            <tbody>
              {features.map((category, catIdx) => (
                <React.Fragment key={category.category}>
                  {catIdx > 0 && (
                    <tr aria-hidden="true">
                      <td colSpan={4} className="py-2"></td>
                    </tr>
                  )}
                  {category.items.map((item, itemIdx) => {
                    const isLastInCategory = itemIdx === category.items.length - 1;
                    const isLastOverall = isLastInCategory && catIdx === features.length - 1;
                    const borderClass = isLastOverall ? '' : 'border-b border-stone-100 dark:border-stone-800';
                    return (
                      <tr key={item.name} className={borderClass}>
                        <td className="py-3.5 px-6 text-stone-600 dark:text-stone-300">{item.name}</td>
                        <td className="py-3.5 px-4 text-center">{renderCell(item.bronze)}</td>
                        <td className="py-3.5 px-4 text-center bg-stone-50/60 dark:bg-stone-950/40">{renderCell(item.gold)}</td>
                        <td className="py-3.5 px-4 text-center">{renderCell(item.platinum)}</td>
                      </tr>
                    );
                  })}
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <p className="text-[11px] text-stone-400 dark:text-stone-500 mt-4">
        Freemium tiered fees: $0–$100 → 7%, $101–$199 → 5%, $200+ → 3%. Gold and Platinum waive transaction fees.
      </p>
    </div>
  );
};

export default FeatureComparison;
