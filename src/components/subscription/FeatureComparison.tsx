// app/subscription/FeatureComparison.tsx
'use client';

import React from 'react';
import { Check, X } from 'lucide-react';

const features = [
  {
    category: "Core",
    items: [
      { name: "App access & browsing", bronze: true, gold: true, platinum: true },
      { name: "Post content (photos, reels)", bronze: true, gold: true, platinum: true },
      { name: "Basic profile", bronze: true, gold: true, platinum: true },
    ]
  },
  {
    category: "Professional",
    items: [
      { name: "ForMe Cash credit", bronze: false, gold: true, platinum: true },
      { name: "Member discounts", bronze: false, gold: true, platinum: true },
      { name: "Lead access", bronze: false, gold: true, platinum: true },
      { name: "Professional scheduling", bronze: false, gold: true, platinum: true },
      { name: "Basic analytics", bronze: false, gold: true, platinum: true },
    ]
  },
  {
    category: "Enterprise", 
    items: [
      { name: "Multi-user management", bronze: false, gold: false, platinum: true },
      { name: "Advanced analytics", bronze: false, gold: false, platinum: true },
      { name: "Team scheduling", bronze: false, gold: false, platinum: true },
      { name: "Priority support", bronze: false, gold: false, platinum: true },
    ]
  }
];

const FeatureComparison: React.FC = () => {
  return (
    <div className="bg-gray-50 rounded-2xl p-8">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">What's included</h2>
        <p className="text-gray-600">Feature comparison across all plans</p>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-200">
              <th className="text-left py-4 pr-8 text-sm font-semibold text-gray-900">Features</th>
              <th className="text-center py-4 px-4 text-sm font-semibold text-gray-900 min-w-[100px]">Bronze</th>
              <th className="text-center py-4 px-4 text-sm font-semibold text-gray-900 min-w-[100px]">Gold</th>
              <th className="text-center py-4 px-4 text-sm font-semibold text-gray-900 min-w-[100px]">Platinum</th>
            </tr>
          </thead>
          <tbody>
            {features.map((category) => (
              <React.Fragment key={category.category}>
                <tr>
                  <td colSpan={4} className="py-4">
                    <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                      {category.category}
                    </div>
                  </td>
                </tr>
                {category.items.map((item) => (
                  <tr key={item.name} className="border-b border-gray-100">
                    <td className="py-3 pr-8 text-sm text-gray-700">{item.name}</td>
                    <td className="py-3 px-4 text-center">
                      {item.bronze ? (
                        <Check className="w-5 h-5 text-green-500 mx-auto" />
                      ) : (
                        <X className="w-5 h-5 text-gray-300 mx-auto" />
                      )}
                    </td>
                    <td className="py-3 px-4 text-center">
                      {item.gold ? (
                        <Check className="w-5 h-5 text-green-500 mx-auto" />
                      ) : (
                        <X className="w-5 h-5 text-gray-300 mx-auto" />
                      )}
                    </td>
                    <td className="py-3 px-4 text-center">
                      {item.platinum ? (
                        <Check className="w-5 h-5 text-green-500 mx-auto" />
                      ) : (
                        <X className="w-5 h-5 text-gray-300 mx-auto" />
                      )}
                    </td>
                  </tr>
                ))}
              </React.Fragment>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-6 text-center text-sm text-gray-500">
        All plans include standard email support. Platinum includes priority 24/7 support.
      </div>
    </div>
  );
};

export default FeatureComparison;