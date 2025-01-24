// components/Search.tsx
'use client';

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { SafeUser, SafeListing } from '@/app/types';
import Filter from './Filter';
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
    <div className="relative w-44">
  <div className={` group flex items-center justify-start mb-2 p-2 rounded-lg transition-colors duration-250 shadow-sm shadow-slate-300 ${
    isSearchFocused ? 'bg-gray-500' : 'bg-slate-50 hover:bg-gray-200'
  } w-44`}>
    <div className="group flex flex-col rounded-full p-1 cursor-pointer">
      <svg 
        xmlns="http://www.w3.org/2000/svg" 
        viewBox="0 0 24 24" 
        width={20} 
        height={20} 
        color={isSearchFocused ? "#ffffff" : "#6B7280"}
        fill="none"
        className="group-hover:text-white"    
      >
        <path d="M12.4014 8.29796L15.3213 7.32465C16.2075 7.02924 16.6507 6.88153 16.8846 7.11544C17.1185 7.34935 16.9708 7.79247 16.6753 8.67871L15.702 11.5986C15.1986 13.1088 14.9469 13.8639 14.4054 14.4054C13.8639 14.9469 13.1088 15.1986 11.5986 15.702L8.67871 16.6753C7.79247 16.9708 7.34935 17.1185 7.11544 16.8846C6.88153 16.6507 7.02924 16.2075 7.32465 15.3213L8.29796 12.4014C8.80136 10.8912 9.05306 10.1361 9.59457 9.59457C10.1361 9.05306 10.8912 8.80136 12.4014 8.29796Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M12 12L11.9936 12.0064" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M2.5 12C2.5 7.52166 2.5 5.28249 3.89124 3.89124C5.28249 2.5 7.52166 2.5 12 2.5C16.4783 2.5 18.7175 2.5 20.1088 3.89124C21.5 5.28249 21.5 7.52166 21.5 12C21.5 16.4783 21.5 18.7175 20.1088 20.1088C18.7175 21.5 16.4783 21.5 12 21.5C7.52166 21.5 5.28249 21.5 3.89124 20.1088C2.5 18.7175 2.5 16.4783 2.5 12Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </div>
    <input
      type="text"
      className={`ml-3 bg-transparent w-full text-[0.8rem] font-light focus:outline-none ${
        isSearchFocused ? 'text-white placeholder-white' : 'text-[#6B7280] placeholder-[#6B7280] group-hover:text-white group-hover:placeholder-white'
      }`}
      placeholder="Explore"
      value={searchTerm}
      onChange={handleInputChange}
      onFocus={() => setIsSearchFocused(true)}
      onBlur={() => setIsSearchFocused(false)}
    />
  </div>

      {searchResults.length > 0 && (
        <div className="
          absolute 
          z-10 
          w-full 
          mt-1 
          rounded-lg
          shadow-sm-lg 
          bg-white 
          bg-opacity-75
          backdrop-blur-md 
          border-none
          overflow-hidden
        ">
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
          
          <style jsx global>{`
            .max-h-96::-webkit-scrollbar {
              width: 6px;
            }
            .max-h-96::-webkit-scrollbar-track {
              background: transparent;
            }
            .max-h-96::-webkit-scrollbar-thumb {
              background: rgba(0, 0, 0, 0.2);
              border-radius: 3px;
            }
            .max-h-96::-webkit-scrollbar-thumb:hover {
              background: rgba(0, 0, 0, 0.3);
            }
          `}</style>
        </div>
      )}
    </div>
  );
}

export default Search;