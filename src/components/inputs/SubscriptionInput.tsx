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
      title: 'Customer',
      price: 'Free',
      category: 'Basic Access',
      background: 'https://images.unsplash.com/photo-1557177324-56c542165309?ixlib=rb-1.2.1&auto=format&fit=crop&w=1950&q=80',
      features: [
        'Basic App Access',
        'Limited Profile Features',
        'View Professionals',
        'Basic Booking'
      ],
      fullDescription: 'Perfect for users who want to explore the platform and access basic features. Browse through professionals and make basic bookings.'
    },
    {
      title: 'Silver',
      price: '$29.99/month',
      category: 'Professional',
      background: 'https://images.unsplash.com/photo-1557187666-4fd70cf76254?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=60',
      features: [
        'Everything in Customer, plus...',
        'Post Photos & Manage Profile',
        'See Potential Customers',
        'Scannable QR Code'
      ],
      fullDescription: 'Ideal for professionals starting their journey. Get essential tools to showcase your services and connect with potential customers.'
    },
    {
      title: 'Gold',
      price: '$59.99/month',
      category: 'Featured Professional',
      background: 'https://images.unsplash.com/photo-1556680262-9990363a3e6d?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=60',
      features: [
        'Includes Silver, plus...',
        'Be Seen by Customers',
        'Featured Placement',
        'Expanded Market Reach'
      ],
      fullDescription: 'Take your business to the next level with enhanced visibility and features. Get featured placement and reach more customers in your area.'
    },
    {
      title: 'Platinum',
      price: '$99.99/month',
      category: 'Premium Professional',
      background: 'https://images.unsplash.com/photo-1557004396-66e4174d7bf6?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=60',
      features: [
        'Includes Gold, plus...',
        'Guaranteed 8 Customers Monthly',
        'Priority Placement',
        'Premium Support'
      ],
      fullDescription: 'Our premium tier for serious professionals. Get guaranteed customers, priority placement, and exclusive features to maximize your success.'
    },
    {
      title: 'Enterprise',
      price: 'Custom Pricing',
      category: 'Business Solutions',
      background: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=60',
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

  const handleCardClick = (title: string) => {
    if (expandedCard === title) {
      setExpandedCard(null);
    } else {
      setExpandedCard(title);
      onChange(title.toLowerCase());
    }
  };

  return (
    <div className="w-full max-h-[50vh]">
      <div className="grid grid-cols-2 gap-4 pt-2">
        {subscriptionTiers.map((tier) => (
          <div
            key={tier.title}
            onClick={() => handleCardClick(tier.title)}
            className={`
              relative cursor-pointer 
              rounded-lg transition-all duration-300
              ${expandedCard === tier.title ? 'col-span-2 h-[400px]' : 'h-[125px]'}
              ${value === tier.title.toLowerCase() 
                ? 'border-2 border-black' 
                : 'border border-neutral-200'}
            `}
          >
            <div 
              className="absolute inset-0 rounded-lg bg-cover bg-center
                transition-all duration-300 
                brightness-75 saturate-120 contrast-85"
              style={{ backgroundImage: `url(${tier.background})` }}
            />
            <div className="absolute inset-0 bg-black/40 rounded-lg hover:bg-black/30 transition-all duration-300" />
            
            {expandedCard === tier.title ? (
              // Expanded view
              <div className="absolute inset-0 p-6 flex flex-col text-white">
                <div className="flex justify-between items-start">
                  <div>
                    <span className="text-gray-300 text-xs uppercase tracking-wider">
                      {tier.category}
                    </span>
                    <h3 className="text-white text-sm font-bold mt-2 mb-1">
                      {tier.title}
                    </h3>
                    <p className="text-white/90 text-sm mb-4">
                      {tier.price}
                    </p>
                  </div>
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      setExpandedCard(null);
                    }}
                    className="text-white/80 hover:text-white"
                  >
                    ✕
                  </button>
                </div>
                
                <p className="text-white/90 text-sm mb-6">
                  {tier.fullDescription}
                </p>
                
                <div className="grid grid-cols-2 gap-4">
                  <ul className="text-white/80 text-sm space-y-2">
                    <h4 className="font-semibold text-white mb-2">Features:</h4>
                    {tier.features.map((feature, index) => (
                      <li key={index} className="flex items-center">
                        <span className="mr-2">✓</span>
                        {feature}
                      </li>
                    ))}
                  </ul>
                  
                  <div className="flex flex-col justify-end">
                    <button 
                      className="bg-white text-black rounded-lg py-3 px-6 hover:bg-gray-100 transition"
                      onClick={(e) => {
                        e.stopPropagation();
                        onChange(tier.title.toLowerCase());
                      }}
                    >
                      Select Plan
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              // Collapsed view - simplified
              <div className="absolute inset-0 p-6 flex flex-col items-center justify-center text-center">
                <span className="text-gray-300 text-sm uppercase tracking-wider">
                  {tier.category}
                </span>
                <h3 className="text-white text-base font-bold mt-2 mb-1">
                  {tier.title}
                </h3>
                <p className="text-white/90 text-sm">
                  {tier.price}
                </p>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default SubscriptionInput;