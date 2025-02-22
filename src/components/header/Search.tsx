// components/Search.tsx
'use client';

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { SafeUser, SafeListing } from '@/app/types';
import { useRouter } from 'next/navigation';

type SearchResult = SafeUser | SafeListing;

interface SearchProps {
  onResultClick?: (result: SearchResult) => void;
}

const Search: React.FC<SearchProps> = ({ onResultClick }) => {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [isSearchFocused, setIsSearchFocused] = useState(false);

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      if (searchTerm) {
        fetchSearchResults();
      } else {
        setSearchResults([]);
      }
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [searchTerm]);

  const fetchSearchResults = async () => {
    try {
      const response = await axios.get<SearchResult[]>(`/api/search?term=${searchTerm}`);
      setSearchResults(response.data);
    } catch (error) {
      console.error('Error fetching search results:', error);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const isUser = (result: SearchResult): result is SafeUser => {
    return 'email' in result;
  };

  return (
    <div className="flex-grow relative">
      <div className="ml-1 absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-500">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="21" height="21" color="#71717A" fill="none">
          <path d="M14 14L16.5 16.5" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
          <path d="M16.4333 18.5252C15.8556 17.9475 15.8556 17.0109 16.4333 16.4333C17.0109 15.8556 17.9475 15.8556 18.5252 16.4333L21.5667 19.4748C22.1444 20.0525 22.1444 20.9891 21.5667 21.5667C20.9891 22.1444 20.0525 22.1444 19.4748 21.5667L16.4333 18.5252Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          <path d="M16 9C16 5.13401 12.866 2 9 2C5.13401 2 2 5.13401 2 9C2 12.866 5.13401 16 9 16C12.866 16 16 12.866 16 9Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" fill='#ffffff' />
        </svg>
      </div>

      <input
        type="text"
        placeholder="Search"
        value={searchTerm}
        onChange={handleInputChange}
        onFocus={() => setIsSearchFocused(true)}
        onBlur={() => setTimeout(() => setIsSearchFocused(false), 200)}
        className="w-full text-[#71717A] placeholder:text-[#71717A] border bg-slate-50 border-neutral-500 rounded-lg p-3.5 pl-12 pr-24 text-sm shadow-sm"
      />

      <div className="absolute right-3 top-1/2 transform -translate-y-1/2 flex items-center gap-1">
        <div className="flex items-center gap-1 px-2 py-1 rounded-md bg-[#0CD498] shadow-sm">
          <span className="text-sm text-white">⌘</span>
          <span className="text-sm text-white">K</span>
        </div>
      </div>

      {searchResults.length > 0 && (
        <div className="absolute z-10 w-full mt-1 rounded-lg shadow-sm-lg bg-white bg-opacity-90 backdrop-blur-md border-none overflow-hidden">
          <div className="max-h-96 overflow-y-auto">
            {searchResults.map((result, index) => (
              <div 
                key={result.id} 
                className={`
                  p-4 
                  hover:bg-gray-500 
                  hover:bg-opacity-25 
                  cursor-pointer 
                  ${index !== searchResults.length - 1 ? 'border-b border-gray-500 border-opacity-25' : ''}
                  ${index === 0 ? 'rounded-t-lg' : ''}
                  ${index === searchResults.length - 1 ? 'rounded-b-lg' : ''}
                  transition
                  duration-200
                `}
                onClick={() => {
                  if (onResultClick) onResultClick(result);
                  setSearchTerm('');
                  setSearchResults([]);
                  router.push(`/search?q=${encodeURIComponent(result.id)}`);
                }}
              >
                {isUser(result) ? (
                  <div className="flex items-center">
                    {result.image && (
                      <img src={result.image} alt={result.name || 'User'} className="w-8 h-8 rounded-full mr-2" />
                    )}
                    <div>
                      <div className="font-semibold text-black">{result.name}</div>
                      <div className="text-sm text-gray-600">{result.email}</div>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center">
                    {result.imageSrc && (
                      <img src={result.imageSrc} alt={result.title} className="w-8 h-8 object-cover rounded-md mr-2" />
                    )}
                    <div>
                      <div className="font-semibold text-black">{result.title}</div>
                      <div className="text-sm text-gray-600">{result.category}</div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default Search;