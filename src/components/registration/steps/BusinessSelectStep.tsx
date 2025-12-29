'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Search, Building2, ArrowRight } from 'lucide-react';
import axios from 'axios';
import TypeformHeading from '../TypeformHeading';

interface BusinessSelectStepProps {
  selectedListing: string;
  onListingChange: (listingId: string) => void;
  onSkip: () => void;
}

interface Listing {
  id: string;
  title: string;
  imageSrc: string;
  category: string;
  location: string;
}

export default function BusinessSelectStep({ selectedListing, onListingChange, onSkip }: BusinessSelectStepProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [listings, setListings] = useState<Listing[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  useEffect(() => {
    if (searchQuery.length < 2) {
      setListings([]);
      setHasSearched(false);
      return;
    }

    const search = async () => {
      setIsLoading(true);
      try {
        const response = await axios.get(`/api/search?q=${encodeURIComponent(searchQuery)}`);
        // Filter for listings only from the combined search results
        const allResults = response.data?.results || [];
        const listingResults = allResults
          .filter((r: any) => r.type === 'listing')
          .map((r: any) => ({
            id: r.id,
            title: r.title,
            imageSrc: r.image || '',
            category: r.subtitle?.split(' • ')[0] || '',
            location: r.subtitle?.split(' • ')[1] || '',
          }));
        setListings(listingResults);
        setHasSearched(true);
      } catch (error) {
        console.error('Search failed:', error);
        setListings([]);
      }
      setIsLoading(false);
    };

    const debounce = setTimeout(search, 300);
    return () => clearTimeout(debounce);
  }, [searchQuery]);

  const selectedBusiness = listings.find(l => l.id === selectedListing);

  return (
    <div>
      <TypeformHeading
        question="Where do you work?"
        subtitle="Search for your business or salon"
      />

      <div className="space-y-4">
        {/* Search input */}
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            autoFocus
            className="w-full pl-12 pr-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-all"
            placeholder="Search for a business..."
          />
          {isLoading && (
            <div className="absolute right-4 top-1/2 -translate-y-1/2">
              <div className="w-5 h-5 border-2 border-gray-200 border-t-gray-600 rounded-full animate-spin" />
            </div>
          )}
        </div>

        {/* Results */}
        {listings.length > 0 && (
          <div className="space-y-2 max-h-[300px] overflow-y-auto">
            {listings.map((listing, index) => (
              <motion.button
                key={listing.id}
                type="button"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                onClick={() => onListingChange(listing.id)}
                className={`
                  w-full flex items-center gap-4 p-4 rounded-xl border-2 text-left transition-all duration-200
                  ${selectedListing === listing.id
                    ? 'border-gray-900 bg-gray-50'
                    : 'border-gray-200 bg-white hover:border-gray-300'
                  }
                `}
              >
                {listing.imageSrc ? (
                  <img
                    src={listing.imageSrc}
                    alt={listing.title}
                    className="w-12 h-12 rounded-lg object-cover"
                  />
                ) : (
                  <div className="w-12 h-12 rounded-lg bg-gray-100 flex items-center justify-center">
                    <Building2 className="w-5 h-5 text-gray-400" />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <h3 className="font-medium text-gray-900 truncate">{listing.title}</h3>
                  <p className="text-sm text-gray-500 truncate">{listing.location || listing.category}</p>
                </div>
              </motion.button>
            ))}
          </div>
        )}

        {/* No results */}
        {hasSearched && listings.length === 0 && searchQuery.length >= 2 && (
          <div className="text-center py-8">
            <p className="text-gray-500">No businesses found</p>
            <p className="text-sm text-gray-400 mt-1">Try a different search term</p>
          </div>
        )}

        {/* Skip option */}
        <motion.button
          type="button"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          onClick={onSkip}
          className="w-full flex items-center justify-center gap-2 py-3 text-gray-500 hover:text-gray-900 transition-colors"
        >
          <span className="text-sm">Skip for now</span>
          <ArrowRight className="w-4 h-4" />
        </motion.button>
      </div>
    </div>
  );
}
