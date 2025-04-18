'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import ClientProviders from '@/components/ClientProviders';
import EmptyState from '@/components/EmptyState';
import ListingCard from '@/components/listings/ListingCard';
import { categories } from '@/components/Categories';
import Container from '@/components/Container';
import MarketHeader from './MarketHeader';
import { SafeListing, SafeUser } from '@/app/types';

interface MarketContentProps {
  searchParams: {
    userId?: string;
    locationValue?: string;
    category?: string;
    state?: string;
    city?: string;
    minPrice?: number;
    maxPrice?: number;
    order?: 'asc' | 'desc';
    page?: string;
  };
  listings: SafeListing[];
  currentUser: SafeUser | null;
}

interface ViewState {
  mode: 'grid' | 'list';
  filters: {
    category: string;
    minPrice?: number;
    maxPrice?: number;
    sortBy?: 'price' | 'date' | 'name';
    sortOrder?: 'asc' | 'desc';
    city?: string;
    state?: string;
  };
}

const MarketContent = ({ searchParams, listings, currentUser }: MarketContentProps) => {
  const router = useRouter();
  const [viewState, setViewState] = useState<ViewState>({
    mode: 'grid',
    filters: {
      category: 'all',
    }
  });

  const [expandedServices, setExpandedServices] = useState<{ [key: string]: boolean }>({});

  const toggleServices = (listingId: string) => {
    setExpandedServices(prev => ({
      ...prev,
      [listingId]: !prev[listingId]
    }));
  };

  const renderListView = () => (
    <div className="w-full">
      <table className="w-full bg-white rounded-lg shadow-gray-300 p-6">
        <thead>
          <tr className="border-b border-gray-100">
            <th className="py-6 px-6 text-left text-sm font-medium text-gray-600 w-[30%]">Listing</th>
            <th className="py-6 px-4 text-left text-sm font-medium text-gray-600 w-[15%]">Category</th>
            <th className="py-6 px-4 text-left text-sm font-medium text-gray-600 w-[20%]">Location</th>
            <th className="py-6 px-4 text-left text-sm font-medium text-gray-600 w-[20%]">Services</th>
            <th className="py-6 px-4 text-left text-sm font-medium text-gray-600 w-[15%]">Actions</th>
          </tr>
        </thead>
        <tbody>
          {listings.map((listing: SafeListing) => {
            const mainService = listing.services[0];
            const hasMoreServices = listing.services.length > 1;
            const isExpanded = expandedServices[listing.id] || false;

            return (
              <tr key={listing.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                <td className="py-4 px-6">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-md overflow-hidden">
                      <img 
                        src={listing.imageSrc} 
                        alt={listing.title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div>
                      <h3 className="font-medium text-sm">{listing.title}</h3>
                    </div>
                  </div>
                </td>
                <td className="py-4 px-4">
                  <span className="text-sm text-gray-600">{listing.category}</span>
                </td>
                <td className="py-4 px-4">
                  <span className="text-sm text-gray-600">{listing.location}</span>
                </td>
                <td className="py-4 px-4">
                  <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-2">
                      <div className="text-sm">
                        <span className="text-gray-600">{mainService.serviceName}</span>
                        <span className="text-gray-400 mx-2">·</span>
                        <span className="font-medium">${mainService.price}</span>
                      </div>
                      {hasMoreServices && (
                        <button 
                          onClick={() => toggleServices(listing.id)}
                          className="p-1 hover:bg-gray-100 rounded-full transition-colors"
                        >
                          <svg 
                            xmlns="http://www.w3.org/2000/svg" 
                            width="16" 
                            height="16" 
                            viewBox="0 0 24 24" 
                            fill="none" 
                            stroke="currentColor" 
                            className={`transform transition-transform ${isExpanded ? 'rotate-180' : ''}`}
                          >
                            <path d="M6 9l6 6 6-6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                        </button>
                      )}
                    </div>
                    {isExpanded && (
                      <div className="pl-2 space-y-1 mt-1 border-l-2 border-gray-100">
                        {listing.services.slice(1).map((service) => (
                          <div key={service.id} className="text-sm">
                            <span className="text-gray-600">{service.serviceName}</span>
                            <span className="text-gray-400 mx-2">·</span>
                            <span className="font-medium">${service.price}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </td>
                <td className="py-4 px-4">
                  <button 
                    onClick={() => router.push(`/listings/${listing.id}`)}
                    className="bg-[#F9AE8B] text-white px-4 py-1.5 rounded-md text-sm hover:opacity-90 transition-opacity"
                  >
                    View Details
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );

  return (
    <Container>
      <div className="px-4">
        <MarketHeader 
          viewMode={viewState.mode}
          onViewModeChange={(mode: ViewState['mode']) => setViewState(prev => ({ ...prev, mode }))}
          filters={viewState.filters}
          onFilterChange={(filters: ViewState['filters']) => setViewState(prev => ({ ...prev, filters }))}
        />
      </div>
      
      <div className="flex flex-col">
        {viewState.mode === 'grid' ? (
          <div className="
            flex-1
            grid 
            grid-cols-1
            lg:grid-cols-2
            xl:grid-cols-3
            2xl:grid-cols-3
            gap-4
            px-4
          ">
            {listings.map((listing: SafeListing) => (
              <ListingCard
                currentUser={currentUser}
                key={listing.id}
                data={listing}
                categories={categories}
              />
            ))}
          </div>
        ) : (
          renderListView()
        )}
      </div>
    </Container>
  );
};

export default MarketContent;