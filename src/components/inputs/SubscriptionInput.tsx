'use client';
import { useState } from 'react';

interface SubscriptionInputProps {
  onChange: (value: string) => void;
  value: string;
}

const SubscriptionInput: React.FC<SubscriptionInputProps> = ({
  onChange,
  value
}) => {
  const [expandedCard, setExpandedCard] = useState<string | null>(null);

  const subscriptionTiers = [
    {
      title: 'Bronze (Customer)',
      price: 'Free',
      category: 'Basic Access',
      accent: 'bg-gray-100 text-gray-700',
      border: 'border-gray-200',
      features: [
        'Basic App Access',
        'Limited Profile Features',
        'View Professionals',
        'Basic Booking'
      ],
      fullDescription: 'Perfect for users who want to explore the platform and access basic features. Browse through professionals and make basic bookings.'
    },
    {
      title: 'Silver (Pro Tier 1)',
      price: '$29.99/month',
      category: 'Professional',
      accent: 'bg-slate-100 text-slate-700',
      border: 'border-slate-200',
      features: [
        'Everything in Customer, plus...',
        'Post Photos & Manage Profile',
        'See Potential Customers',
        'Scannable QR Code'
      ],
      fullDescription: 'Ideal for professionals starting their journey. Get essential tools to showcase your services and connect with potential customers.'
    },
    {
      title: 'Gold (Pro Tier 2)',
      price: '$59.99/month',
      category: 'Featured Professional',
      accent: 'bg-yellow-50 text-yellow-700',
      border: 'border-yellow-200',
      features: [
        'Includes Silver, plus...',
        'Be Seen by Customers',
        'Featured Placement',
        'Expanded Market Reach'
      ],
      fullDescription: 'Take your business to the next level with enhanced visibility and features. Get featured placement and reach more customers in your area.'
    },
    {
      title: 'Platinum (Pro Tier 3)',
      price: '$99.99/month',
      category: 'Premium Professional',
      accent: 'bg-purple-50 text-purple-700',
      border: 'border-purple-200',
      features: [
        'Includes Gold, plus...',
        'Guaranteed 8 Customers Monthly',
        'Priority Placement',
        'Premium Support'
      ],
      fullDescription: 'Our premium tier for serious professionals. Get guaranteed customers, priority placement, and exclusive features to maximize your success.'
    },
    {
      title: 'Diamond (Enterprise)',
      price: 'Custom Pricing',
      category: 'Business Solutions',
      accent: 'bg-blue-50 text-blue-700',
      border: 'border-blue-200',
      features: [
        'Everything in Platinum, plus...',
        'Multi-User Access',
        'Analytics & Insights',
        'Premium Support',
        'Advertising & Sponsored Listings'
      ],
      fullDescription: 'Tailored solutions for businesses and organizations. Get advanced features, multi-user access, and comprehensive analytics to scale your operations.'
    }
  ];

  const handleCardClick = (tierTitle: string) => {
    if (expandedCard === tierTitle) {
      setExpandedCard(null);
    } else {
      setExpandedCard(tierTitle);
    }
  };

  const handleSelect = (tierTitle: string, e: React.MouseEvent) => {
    e.stopPropagation();
    onChange(tierTitle.toLowerCase());
    setExpandedCard(null);
  };

  return (
    <div className="w-full max-h-[70vh] overflow-y-auto -mb-4 mt-4">
      <div className="grid grid-cols-2 gap-3">
        {subscriptionTiers.map((tier) => {
          const isSelected = value === tier.title.toLowerCase();
          const isExpanded = expandedCard === tier.title;
          
          return (
            <div
              key={tier.title}
              className={`
                bg-white rounded-xl border-2 transition-all duration-300 cursor-pointer
                ${isSelected 
                  ? 'border-[#60A5FA] shadow-lg shadow-blue-100' 
                  : 'border-gray-200 hover:border-gray-300 hover:shadow-md'
                }
                ${isExpanded ? 'col-span-2 shadow-xl' : ''}
              `}
              onClick={() => handleCardClick(tier.title)}
            >
              {/* Collapsed View */}
              {!isExpanded && (
                <div className="p-3">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <div className={`px-2 py-0.5 rounded-md text-xs font-medium ${tier.accent}`}>
                          {tier.category}
                        </div>
                        {isSelected && (
                          <div className="w-4 h-4 bg-[#60A5FA] rounded-full flex items-center justify-center">
                            <svg className="w-2.5 h-2.5 text-white" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                          </div>
                        )}
                      </div>
                      <h3 className="text-sm font-medium text-gray-900 leading-tight mb-1">
                        {tier.title}
                      </h3>
                      <p className="text-sm font-medium text-[#60A5FA]">
                        {tier.price}
                      </p>
                    </div>
                    <div className="text-gray-400">
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                  </div>
                </div>
              )}

              {/* Expanded View */}
              {isExpanded && (
                <div className="p-5">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <div className={`inline-block px-2 py-1 rounded-md text-xs font-medium ${tier.accent} mb-2`}>
                        {tier.category}
                      </div>
                      <h3 className="text-lg font-medium text-gray-900 mb-1">
                        {tier.title}
                      </h3>
                      <p className="text-lg font-medium text-[#60A5FA]">
                        {tier.price}
                      </p>
                    </div>
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        setExpandedCard(null);
                      }}
                      className="text-gray-400 hover:text-gray-600 p-1"
                    >
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                      </svg>
                    </button>
                  </div>
                  
                  <p className="text-sm text-gray-600 mb-4 leading-relaxed">
                    {tier.fullDescription}
                  </p>
                  
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <h4 className="font-medium text-gray-900 text-sm mb-2">Features included:</h4>
                      <ul className="space-y-1">
                        {tier.features.map((feature, index) => (
                          <li key={index} className="flex items-center text-gray-600">
                            <div className="w-3 h-3 bg-green-100 rounded-full flex items-center justify-center mr-2 flex-shrink-0">
                              <svg className="w-2 h-2 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                              </svg>
                            </div>
                            <span className="text-xs">{feature}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                    
                    <div className="flex justify-end items-end">
                      <button
                        onClick={(e) => handleSelect(tier.title, e)}
                        className={`
                          px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200
                          ${isSelected 
                            ? 'bg-[#60A5FA] text-white shadow-lg shadow-blue-200' 
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                          }
                        `}
                      >
                        {isSelected ? 'Selected' : 'Select Plan'}
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default SubscriptionInput;