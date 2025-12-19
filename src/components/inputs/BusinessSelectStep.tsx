import React, { useCallback, useEffect, useState } from 'react';
import { Search, Building2, ChevronRight, Clock } from 'lucide-react';
import { toast } from 'react-hot-toast';
import Heading from '../Heading';
import { useTheme } from '@/app/context/ThemeContext';

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
  onSkip?: () => void;
  isLoading?: boolean;
}

type Mode = 'choice' | 'search' | 'selected';

const BusinessSelectStep: React.FC<BusinessSelectStepProps> = ({
  selectedListing,
  onListingChange,
  onSkip,
  isLoading = false,
}) => {
  const { accentColor } = useTheme();
  const [mode, setMode] = useState<Mode>('choice');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<ListingResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedListingData, setSelectedListingData] = useState<ListingResult | null>(null);

  // Helper to convert hex to rgba
  const hexToRgba = (hex: string, alpha: number): string => {
    const num = parseInt(hex.replace('#', ''), 16);
    const r = (num >> 16) & 255;
    const g = (num >> 8) & 255;
    const b = num & 255;
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  };

  // Use existing global search API
  const searchListings = useCallback(async (query: string) => {
    setIsSearching(true);

    try {
      const response = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
      if (!response.ok) throw new Error('Search failed');

      const data = await response.json();
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

  useEffect(() => {
    if (selectedListing && searchResults.length > 0) {
      const found = searchResults.find(l => l.id === selectedListing);
      if (found) {
        setSelectedListingData(found);
        setMode('selected');
      }
    }
  }, [selectedListing, searchResults]);

  const handleListingSelect = (listing: ListingResult) => {
    onListingChange(listing.id);
    setSearchQuery(listing.title);
    setSelectedListingData(listing);
    setMode('selected');
  };

  const handleClearSelection = () => {
    onListingChange('');
    setSearchQuery('');
    setSelectedListingData(null);
    setMode('search');
  };

  const handleSkip = () => {
    setSearchQuery('');
    if (onSkip) {
      onSkip();
    } else {
      onListingChange('SKIP');
    }
  };

  // Choice Mode - Two card options
  if (mode === 'choice') {
    return (
      <div className="flex flex-col gap-4">
        <Heading
          title="Do you work at a business?"
          subtitle="Connect to an existing business or skip for now"
        />

        <div className="flex flex-col gap-3">
          {/* Search for business option */}
          <button
            type="button"
            onClick={() => setMode('search')}
            disabled={isLoading}
            className={`
              flex items-center gap-4 p-4 rounded-xl border border-gray-200/60
              bg-white hover:border-gray-300 hover:bg-gray-50/50
              transition-all duration-200 text-left group
              ${isLoading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
            `}
          >
            <div
              className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{ backgroundColor: hexToRgba(accentColor, 0.1) }}
            >
              <Building2 className="w-6 h-6" style={{ color: accentColor }} />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-sm font-medium text-gray-900">Find my business</h3>
              <p className="text-xs text-gray-500 mt-0.5">Search for an existing ForMe listing</p>
            </div>
            <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-gray-600 transition-colors" />
          </button>

          {/* Skip option */}
          <button
            type="button"
            onClick={handleSkip}
            disabled={isLoading}
            className={`
              flex items-center gap-4 p-4 rounded-xl border border-gray-200/60
              bg-white hover:border-gray-300 hover:bg-gray-50/50
              transition-all duration-200 text-left group
              ${isLoading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
            `}
          >
            <div className="w-12 h-12 rounded-xl bg-gray-100 flex items-center justify-center flex-shrink-0">
              <Clock className="w-6 h-6 text-gray-500" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-sm font-medium text-gray-900">Skip for now</h3>
              <p className="text-xs text-gray-500 mt-0.5">I&apos;ll add my business later</p>
            </div>
            <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-gray-600 transition-colors" />
          </button>
        </div>
      </div>
    );
  }

  // Search Mode
  if (mode === 'search') {
    return (
      <div className="flex flex-col gap-4">
        <Heading
          title="Find your business"
          subtitle="Search for the business you work at"
        />

        {/* Search Input */}
        <div className="relative">
          <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
            <Search className="w-5 h-5 text-gray-400" />
          </div>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder=" "
            disabled={isLoading}
            autoFocus
            className={`
              peer w-full h-[58px] pl-12 pr-4 pt-4 border border-gray-200/60 rounded-xl
              text-base bg-white outline-none transition-all duration-200
              hover:border-gray-300 focus:border-[var(--accent-color)] focus:ring-2 focus:ring-[var(--accent-color-light)]
              ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}
            `}
          />
          <label
            className={`
              absolute left-12 top-5 origin-[0] text-sm text-gray-500 pointer-events-none
              transition-transform duration-150
              -translate-y-3 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0
              peer-focus:scale-75 peer-focus:-translate-y-3
              ${searchQuery ? 'scale-75 -translate-y-3' : ''}
            `}
          >
            Business name
          </label>

          {/* Search Results Dropdown */}
          {searchQuery && (
            <div className="absolute z-50 mt-2 w-full max-h-64 overflow-auto rounded-xl border border-gray-200 bg-white shadow-lg">
              {isSearching && (
                <div className="px-4 py-3 text-sm text-gray-500">Searching...</div>
              )}

              {!isSearching && searchQuery.length >= 2 && searchResults.length === 0 && (
                <div className="px-4 py-3 text-sm text-gray-500">No businesses found</div>
              )}

              {!isSearching && searchResults.length > 0 && (
                <ul className="py-2">
                  {searchResults.map((listing) => (
                    <li
                      key={listing.id}
                      className="px-3 py-2.5 cursor-pointer flex items-center gap-3 hover:bg-gray-50 transition-colors"
                      onClick={() => handleListingSelect(listing)}
                    >
                      <div className="w-10 h-10 rounded-lg bg-gray-100 overflow-hidden shrink-0">
                        {listing.image ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={listing.image} alt="" className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <Building2 className="w-5 h-5 text-gray-400" />
                          </div>
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="text-sm font-medium text-gray-900 truncate">{listing.title}</div>
                        {listing.subtitle && (
                          <div className="text-xs text-gray-500 truncate">{listing.subtitle}</div>
                        )}
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}
        </div>

        {/* Back link */}
        <button
          type="button"
          onClick={() => setMode('choice')}
          className="text-sm text-gray-500 hover:text-gray-700 transition-colors self-start"
        >
          ← Back to options
        </button>
      </div>
    );
  }

  // Selected Mode
  return (
    <div className="flex flex-col gap-4">
      <Heading
        title="Your business"
        subtitle="You'll be connected to this listing"
      />

      {selectedListingData && (
        <div
          className="p-4 rounded-xl border-2"
          style={{
            borderColor: accentColor,
            backgroundColor: hexToRgba(accentColor, 0.05)
          }}
        >
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-xl bg-white overflow-hidden shrink-0 shadow-sm">
              {selectedListingData.image ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={selectedListingData.image} alt="" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gray-100">
                  <Building2 className="w-6 h-6 text-gray-400" />
                </div>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="font-medium text-gray-900 truncate">{selectedListingData.title}</h4>
              {selectedListingData.subtitle && (
                <p className="text-sm text-gray-600 truncate">{selectedListingData.subtitle}</p>
              )}
            </div>
          </div>
          <button
            type="button"
            onClick={handleClearSelection}
            disabled={isLoading}
            className="mt-3 text-sm text-gray-500 hover:text-gray-700 transition-colors"
          >
            Choose a different business
          </button>
        </div>
      )}
    </div>
  );
};

export default BusinessSelectStep;