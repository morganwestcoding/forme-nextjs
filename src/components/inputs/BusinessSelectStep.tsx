import React, { useCallback, useEffect, useState } from 'react';
import { Search, Building2 } from 'lucide-react';
import { toast } from 'react-hot-toast';
import Heading from '../Heading';

interface ListingResult {
  id: string;
  type: string;
  title: string;
  subtitle?: string;
  image?: string | null;
  href: string;
}

interface BusinessSelectStepProps {
  selectedListing: string;
  onListingChange: (listingId: string) => void;
  isLoading?: boolean;
}

const BusinessSelectStep: React.FC<BusinessSelectStepProps> = ({
  selectedListing,
  onListingChange,
  isLoading = false,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<ListingResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedListingData, setSelectedListingData] = useState<ListingResult | null>(null);

  // Use existing global search API
  const searchListings = useCallback(async (query: string) => {
    setIsSearching(true);
    
    try {
      const response = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
      if (!response.ok) throw new Error('Search failed');
      
      const data = await response.json();
      // Filter only listings from the global search results
      const listings = (data.results || []).filter((item: any) => item.type === 'listing');
      setSearchResults(listings);
    } catch (error) {
      console.error('Listing search error:', error);
      setSearchResults([]);
      toast.error('Failed to search listings');
    } finally {
      setIsSearching(false);
    }
  }, []);

  useEffect(() => {
    if (searchQuery.trim().length > 0) {
      searchListings(searchQuery);
    } else {
      setSearchResults([]);
    }
  }, [searchQuery, searchListings]);

  // Find selected listing data when selectedListing changes
  useEffect(() => {
    if (selectedListing && searchResults.length > 0) {
      const found = searchResults.find(l => l.id === selectedListing);
      if (found) {
        setSelectedListingData(found);
      }
    }
  }, [selectedListing, searchResults]);

  const handleListingSelect = (listing: ListingResult) => {
    onListingChange(listing.id);
    setSearchQuery(listing.title);
    setSelectedListingData(listing);
  };

  const handleClearSelection = () => {
    onListingChange('');
    setSearchQuery('');
    setSelectedListingData(null);
  };

  return (
    <div className="flex flex-col gap-6">
      <Heading
        title="Find your business"
        subtitle="Search for the business you work at."
      />

      {/* Business Search */}
      <div className="relative">
        <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
          <Search className="w-5 h-5 text-gray-400" />
        </div>
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onFocus={() => searchResults.length && setSearchQuery(searchQuery)}
          placeholder="Search for your business..."
          disabled={isLoading}
          className={`
            w-full h-12 pl-12 pr-4 border text-sm border-gray-200 rounded-xl 
            outline-none focus:ring-2 focus:ring-[#60A5FA] bg-white
            ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}
          `}
        />

        {/* Search Results Dropdown */}
        {searchQuery && !selectedListingData && (
          <div className="absolute z-50 mt-2 w-full max-h-96 overflow-auto rounded-xl border border-gray-200 bg-white shadow-lg">
            {/* Loading */}
            {isSearching && (
              <div className="px-4 py-3 text-sm text-gray-500">Searching...</div>
            )}

            {/* Empty */}
            {!isSearching && searchQuery.length >= 2 && searchResults.length === 0 && (
              <div className="px-4 py-3 text-sm text-gray-500">No listings found</div>
            )}

            {/* Results */}
            {!isSearching && searchResults.length > 0 && (
              <div className="py-2">
                <div className="px-4 pt-2 pb-1 text-[11px] uppercase tracking-wide text-gray-400">
                  Listings
                </div>
                <ul className="mb-1">
                  {searchResults.map((listing) => {
                    const active = selectedListing === listing.id;
                    return (
                      <li
                        key={listing.id}
                        className={`px-3 py-2 cursor-pointer flex items-center gap-3 ${
                          active ? "bg-[#EBF4FE]" : "hover:bg-gray-50"
                        }`}
                        onClick={() => handleListingSelect(listing)}
                      >
                        {/* Thumbnail */}
                        <div className="w-8 h-8 rounded-md bg-gray-100 overflow-hidden shrink-0">
                          {listing.image ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              src={listing.image}
                              alt=""
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-[10px] text-gray-400">
                              <Building2 className="w-4 h-4" />
                            </div>
                          )}
                        </div>
                        {/* Text */}
                        <div className="min-w-0 flex-1">
                          <div className="text-sm text-gray-900 truncate">
                            {listing.title}
                          </div>
                          {listing.subtitle && (
                            <div className="text-xs text-gray-500 truncate">
                              {listing.subtitle}
                            </div>
                          )}
                        </div>
                        <div className="ml-auto text-[10px] uppercase tracking-wide text-gray-400">
                          listing
                        </div>
                      </li>
                    );
                  })}
                </ul>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Selected business display */}
      {selectedListingData && (
        <div className="mt-2 p-3 bg-green-50 border border-green-200 rounded-xl">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-md bg-gray-100 overflow-hidden shrink-0">
              {selectedListingData.image ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={selectedListingData.image}
                  alt=""
                  className="w-full h-full object-cover"
                />
              ) : (
                <Building2 className="w-5 h-5 text-green-600 m-1.5" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="font-medium text-green-900 truncate">{selectedListingData.title}</h4>
              {selectedListingData.subtitle && (
                <p className="text-sm text-green-600 truncate">{selectedListingData.subtitle}</p>
              )}
            </div>
            <button
              onClick={handleClearSelection}
              disabled={isLoading}
              className={`
                text-green-600 hover:text-green-800 text-sm
                ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}
              `}
            >
              Change
            </button>
          </div>
        </div>
      )}

      {/* Helper Text */}
      <div className="bg-neutral-50 rounded-lg p-4">
        <p className="text-sm text-neutral-600">
          Can&apos;t find your business? Contact your manager to make sure they&apos;ve set up their ForMe listing, 
          or ask them to add you manually through their business dashboard.
        </p>
      </div>
    </div>
  );
};

export default BusinessSelectStep;