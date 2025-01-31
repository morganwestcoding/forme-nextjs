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
      background: 'https://images.unsplash.com/photo-1556740758-90de374c12ad?q=80&w=2940&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
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
      background: 'https://images.unsplash.com/photo-1573588546512-2ace898aa480?q=80&w=2940&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
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
      background: 'https://images.unsplash.com/photo-1517637633369-e4cc28755e01?q=80&w=2940&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
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
      background: 'https://images.unsplash.com/photo-1540496905036-5937c10647cc?q=80&w=2940&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
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
      background: 'https://media.istockphoto.com/id/532401256/photo/london-skyscrapers-skyline-view.jpg?s=612x612&w=0&k=20&c=-1K5D7v9-5srsEO8bwaYnBnRtO2iCKJ5ll2h8wFsiP0=',
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

  return (
    <div className="w-full max-h-[70vh] overflow-y-auto -mb-4 mt-2">
    <div className="grid grid-cols-2 gap-3">
      {subscriptionTiers.map((tier) => (
        <div
          key={tier.title}
          onClick={() => {
            if (expandedCard === tier.title) {
              setExpandedCard(null);
            } else {
              setExpandedCard(tier.title);
              onChange(tier.title.toLowerCase());
            }
          }}
          className={`
            relative 
            cursor-pointer 
            rounded-md 
            overflow-hidden
            transition-all 
            duration-700
            ease-in-out
            ${expandedCard === tier.title ? 
              'col-span-2 h-[400px] opacity-100' : 
              expandedCard ? 
                'opacity-0 pointer-events-none absolute' : // Changed to absolute positioning
                'h-[125px] hover:shadow-lg opacity-100'
            }
          `}
        >
        <div 
          className={`
            absolute 
            inset-0 
            bg-cover 
            bg-center
            transition-all 
            duration-700
            ease-in-out
            ${expandedCard === tier.title ? 'scale-100' : 'hover:scale-110'}
          `}
          style={{ backgroundImage: `url(${tier.background})` }}
        />
            <div 
              className="
                absolute 
                inset-0 
                bg-black/55
                transition-all 
                duration-300
                hover:bg-black/60
              "
            />
            
            {expandedCard === tier.title ? (
              <div className="absolute inset-0 p-6 flex flex-col text-white">
                <div className="flex justify-between items-start">
                  <div>
                    <span className="text-gray-300 text-sm uppercase tracking-wider">
                      {tier.category}
                    </span>
                    <h3 className="text-white text-sm font-bold mt-2 mb-1">
                      {tier.title}
                    </h3>
                    <p className="text-white/90 text-sm">
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
                
                <p className="text-white/90 text-sm mt-4">
                  {tier.fullDescription}
                </p>
                
                <div className="grid grid-cols-2 gap-4 mt-4">
                  <ul className="text-white/80 text-sm space-y-2">
                    <h4 className="font-semibold text-white mb-2">Features:</h4>
                    {tier.features.map((feature, index) => (
                      <li key={index} className="flex items-center">
                        <span className="mr-2">✓</span>
                        {feature}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ) : (
              <div className="
    absolute 
    inset-0 
    px-6 
    flex 
    flex-col 
    items-center 
    justify-center 
    text-center
              "
              >
                <span className="text-gray-300 text-sm font-extralight tracking-wider mb-1">
                  {tier.category}
                </span>
                <h3 className="text-white text-sm font-semibold mb-1">
                  {tier.title}
                </h3>
                <p className="text-white/90 text-sm font-thin">
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