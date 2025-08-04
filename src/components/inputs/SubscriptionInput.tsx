'use client';
import { useState, useEffect } from 'react';

interface SubscriptionInputProps {
  onChange: (value: string) => void;
  value: string;
  onDetailStateChange?: (isInDetail: boolean, tierName?: string) => void;
  onTierSelect?: () => void;
}

const SubscriptionInput: React.FC<SubscriptionInputProps> = ({
  onChange,
  value,
  onDetailStateChange,
  onTierSelect
}) => {
  const [showDetailView, setShowDetailView] = useState(false);
  const [selectedTierForDetail, setSelectedTierForDetail] = useState<any>(null);

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

  // Notify parent component when detail state changes
  useEffect(() => {
    if (onDetailStateChange) {
      onDetailStateChange(showDetailView, selectedTierForDetail?.title);
    }
  }, [showDetailView, selectedTierForDetail, onDetailStateChange]);

  const handleTierClick = (tier: any) => {
    setSelectedTierForDetail(tier);
    setShowDetailView(true);
  };

  const handleSelectTier = () => {
    if (selectedTierForDetail) {
      onChange(selectedTierForDetail.title.toLowerCase());
      setShowDetailView(false);
      setSelectedTierForDetail(null);
      if (onTierSelect) {
        onTierSelect();
      }
    }
  };

  const handleBackToGrid = () => {
    setShowDetailView(false);
    setSelectedTierForDetail(null);
  };

  // Expose the select function to parent
  useEffect(() => {
    if (window) {
      (window as any).selectCurrentTier = handleSelectTier;
    }
  }, [selectedTierForDetail]);

  // DETAIL VIEW - Full modal step
  if (showDetailView && selectedTierForDetail) {
    return (
      <div className="flex flex-col gap-6">
        {/* Header with back button */}
        <div className="flex items-center gap-3">
          <button
            onClick={handleBackToGrid}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-800 transition-colors"
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
            <span className="text-sm">Back to all plans</span>
          </button>
        </div>

        {/* Tier Header */}
        <div className="text-center">
          <span className={`inline-flex items-center px-4 py-2 rounded-lg text-sm font-medium border ${selectedTierForDetail.accent} ${selectedTierForDetail.border} mb-4`}>
            {selectedTierForDetail.category}
          </span>
          <h2 className="text-xl text-gray-900 mb-2">{selectedTierForDetail.title}</h2>
          <p className="text-lg text-[#60A5FA] mb-4">{selectedTierForDetail.price}</p>
          <p className="text-gray-600 text-sm leading-relaxed max-w-2xl mx-auto">{selectedTierForDetail.fullDescription}</p>
        </div>

        {/* Features List */}
        <div>
          <h3 className="text-lg text-gray-900 mb-4">Features included:</h3>
          <div className="grid gap-2">
            {selectedTierForDetail.features.map((feature: string, index: number) => (
              <div key={index} className="flex items-start gap-3">
                <div className="w-4 h-4 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                  <svg className="w-2.5 h-2.5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
                <span className="text-sm text-gray-700">{feature}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // GRID VIEW - Selection step
  return (
    <div className="flex flex-col gap-6">
      <div className="grid grid-cols-2 gap-4">
        {subscriptionTiers.map((tier) => {
          const isSelected = value === tier.title.toLowerCase();
          
          return (
            <div
              key={tier.title}
              className={`
                bg-white rounded-xl border-2 transition-all duration-300 cursor-pointer
                ${isSelected 
                  ? 'border-[#60A5FA] shadow-lg shadow-blue-100 bg-blue-50' 
                  : 'border-gray-200 hover:border-gray-300 hover:shadow-md'
                }
              `}
              onClick={() => handleTierClick(tier)}
            >
              <div className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-3">
                      <span className={`inline-flex items-center px-3 py-1.5 rounded-lg text-xs font-medium border ${tier.accent} ${tier.border}`}>
                        {tier.category}
                      </span>
                      {isSelected && (
                        <div className="w-5 h-5 bg-[#60A5FA] rounded-full flex items-center justify-center">
                          <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        </div>
                      )}
                    </div>
                    <h3 className="text-sm text-gray-900 leading-tight mb-2">
                      {tier.title}
                    </h3>
                    <p className="text-sm text-[#60A5FA] mb-2">
                      {tier.price}
                    </p>
                  </div>
                  <div className="text-gray-400 ml-2">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default SubscriptionInput;