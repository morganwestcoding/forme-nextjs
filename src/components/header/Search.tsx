'use client';

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { SafeUser } from '@/app/types'; // Adjust the import path as needed

interface SearchProps {
  onResultClick: (user: SafeUser) => void;
}

const Search: React.FC<SearchProps> = ({ onResultClick }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState<SafeUser[]>([]);

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
      const response = await axios.get<SafeUser[]>(`/api/search?term=${searchTerm}`);
      setSearchResults(response.data);
    } catch (error) {
      console.error('Error fetching search results:', error);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const handleResultClick = (user: SafeUser) => {
    onResultClick(user);
    setSearchTerm('');
    setSearchResults([]);
  };

  return (
    <div className="relative">
      <div className="relative">
        <span className="absolute inset-y-0 left-0 flex items-center pl-3">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width={18} height={18} color={"#ffffff"} fill={"none"}>
            <path d="M14 14L16.5 16.5" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
            <path d="M16.4333 18.5252C15.8556 17.9475 15.8556 17.0109 16.4333 16.4333C17.0109 15.8556 17.9475 15.8556 18.5252 16.4333L21.5667 19.4748C22.1444 20.0525 22.1444 20.9891 21.5667 21.5667C20.9891 22.1444 20.0525 22.1444 19.4748 21.5667L16.4333 18.5252Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            <path d="M16 9C16 5.13401 12.866 2 9 2C5.13401 2 2 5.13401 2 9C2 12.866 5.13401 16 9 16C12.866 16 16 12.866 16 9Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
          </svg>
        </span>
        <input 
          type="text" 
          className="w-full text-sm p-2.5 pl-10 pr-12 bg-transparent shadow-sm border border-[#FFFFFF] rounded-lg dark:bg-gray-800 dark:text-gray-300 dark:border-gray-600 focus:border-blue-400 dark:focus:border-blue-300 focus:outline-none focus:ring focus:ring-opacity-40 text-white focus:ring-blue-300 placeholder-white" 
          placeholder="Search users" 
          value={searchTerm}
          onChange={handleInputChange}
        />
      </div>
      {searchResults.length > 0 && (
        <div className="absolute z-10 w-full mt-1 bg-gray-800 rounded-md shadow-lg">
          {searchResults.map((user) => (
            <div 
              key={user.id} 
              className="p-2 hover:bg-gray-700 cursor-pointer flex items-center"
              onClick={() => handleResultClick(user)}
            >
              {user.image && (
                <img src={user.image} alt={user.name || 'User'} className="w-8 h-8 rounded-full mr-2" />
              )}
              <div>
                <div className="font-semibold text-white">{user.name}</div>
                <div className="text-sm text-gray-400">{user.email}</div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default Search;