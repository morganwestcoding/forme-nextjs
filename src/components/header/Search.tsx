'use client';

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { SafeUser, SafeListing } from '@/app/types';
import { useRouter, useSearchParams } from 'next/navigation';

type SearchResult = SafeUser | SafeListing;

interface SearchProps {
  onResultClick?: (result: SearchResult) => void;
  activeButtonColor?: string; // Category color prop
}

const Search: React.FC<SearchProps> = ({ 
  onResultClick,
  activeButtonColor = '#60A5FA' // Default blue if no category selected
}) => {
  const router = useRouter();
  const params = useSearchParams();
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

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

  const handleSearch = () => {
    if (searchTerm) {
      router.push(`/search?q=${encodeURIComponent(searchTerm)}`);
    }
  };

  // Darken color for hover effect
  const darkenColor = (hex: string, factor: number = 0.15) => {
    hex = hex.replace('#', '');
    let r = parseInt(hex.substring(0, 2), 16);
    let g = parseInt(hex.substring(2, 4), 16);
    let b = parseInt(hex.substring(4, 6), 16);
    
    r = Math.max(0, Math.floor(r * (1 - factor)));
    g = Math.max(0, Math.floor(g * (1 - factor)));
    b = Math.max(0, Math.floor(b * (1 - factor)));
    
    return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
  };

  return (
    <div className="relative w-full">
      <div className="flex h-12 rounded-xl overflow-hidden shadow-md transition-all duration-500"
           style={{ 
             boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)'
           }}>
        {/* White input area */}
        <div className="flex-grow bg-white flex items-center">
          <input
            type="text"
            placeholder="Search here..."
            value={searchTerm}
            onChange={handleInputChange}
            onFocus={() => setIsSearchFocused(true)}
            onBlur={() => setTimeout(() => setIsSearchFocused(false), 200)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            className="w-full h-full px-5 outline-none text-gray-400 placeholder:text-gray-300 font-light text-base"
          />
        </div>
        
        {/* Colored search button */}
        <button
          className="px-5 flex items-center justify-center transition-all duration-300"
          style={{ 
            backgroundColor: isHovered ? darkenColor(activeButtonColor) : activeButtonColor,
          }}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          onClick={handleSearch}
        >
          <div className="w-6 h-6 flex items-center justify-center rounded-full text-white">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="#ffffff">
              <path d="M15 15L16.5 16.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"></path>
              <path d="M16.9333 19.0252C16.3556 18.4475 16.3556 17.5109 16.9333 16.9333C17.5109 16.3556 18.4475 16.3556 19.0252 16.9333L21.0667 18.9748C21.6444 19.5525 21.6444 20.4891 21.0667 21.0667C20.4891 21.6444 19.5525 21.6444 18.9748 21.0667L16.9333 19.0252Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"></path>
              <path d="M16.5 9.5C16.5 5.63401 13.366 2.5 9.5 2.5C5.63401 2.5 2.5 5.63401 2.5 9.5C2.5 13.366 5.63401 16.5 9.5 16.5C13.366 16.5 16.5 13.366 16.5 9.5Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"></path>
            </svg>
          </div>
        </button>
      </div>

      {searchResults.length > 0 && isSearchFocused && (
        <div className="absolute z-10 w-full mt-1 rounded-xl shadow-lg bg-white overflow-hidden">
          <div className="max-h-96 overflow-y-auto">
            {searchResults.map((result, index) => (
              <div 
                key={result.id} 
                className={`
                  p-4 
                  hover:bg-gray-50
                  cursor-pointer 
                  ${index !== searchResults.length - 1 ? 'border-b border-gray-100' : ''}
                  transition-all
                  duration-300
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
                      <img src={result.image} alt={result.name || 'User'} className="w-8 h-8 rounded-full mr-3" />
                    )}
                    <div>
                      <div className="font-medium text-gray-800">{result.name}</div>
                      <div className="text-sm text-gray-500">{result.email}</div>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center">
                    {result.imageSrc && (
                      <img src={result.imageSrc} alt={result.title} className="w-10 h-10 object-cover rounded-lg mr-3" />
                    )}
                    <div>
                      <div className="font-medium text-gray-800">{result.title}</div>
                      <div className="text-sm text-gray-500">{result.category}</div>
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