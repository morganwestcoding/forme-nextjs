// components/Search.tsx
'use client';

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { SafeUser, SafeListing } from '@/app/types';
import Filter from './Filter';

type SearchResult = SafeUser | SafeListing;

interface SearchProps {
 onResultClick: (result: SearchResult) => void;
}

const Search: React.FC<SearchProps> = ({ onResultClick }) => {
 const [searchTerm, setSearchTerm] = useState('');
 const [searchResults, setSearchResults] = useState<SearchResult[]>([]);

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

 const handleResultClick = (result: SearchResult) => {
   onResultClick(result);
   setSearchTerm('');
   setSearchResults([]);
 };

 const isUser = (result: SearchResult): result is SafeUser => {
   return 'email' in result;
 };

 return (
   <div className="relative ml-8 w-64">
     <div className="relative">
       <span className="absolute inset-y-0 left-0 flex items-center pl-4">
         <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width={18} height={18} color={"#ffffff"} fill={"none"}>
           <path d="M14 14L16.5 16.5" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
           <path d="M16.4333 18.5252C15.8556 17.9475 15.8556 17.0109 16.4333 16.4333C17.0109 15.8556 17.9475 15.8556 18.5252 16.4333L21.5667 19.4748C22.1444 20.0525 22.1444 20.9891 21.5667 21.5667C20.9891 22.1444 20.0525 22.1444 19.4748 21.5667L16.4333 18.5252Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
           <path d="M16 9C16 5.13401 12.866 2 9 2C5.13401 2 2 5.13401 2 9C2 12.866 5.13401 16 9 16C12.866 16 16 12.866 16 9Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
         </svg>
       </span>
       <input 
         type="text" 
         className="w-full text-sm p-3 pl-11 pr-12 bg-[#394041] shadow rounded-lg dark:bg-gray-800 dark:text-gray-300 dark:border-gray-600 focus:border-blue-400 dark:focus:border-blue-300 focus:outline-none focus:ring focus:ring-opacity-40 text-white focus:ring-blue-300 placeholder:text-white placeholder:font-light" 
         placeholder="Search"  
         value={searchTerm}
         onChange={handleInputChange}
         
       />
       <span className="absolute inset-y-0 right-0 flex items-center pr-4">
         <div className="w-px h-4 rounded-full bg-white mx-3"></div>
         <Filter />
       </span> 
     </div>
     {searchResults.length > 0 && (
       <div className="
         absolute 
         z-10 
         w-full 
         mt-1 
         rounded-lg
         shadow-lg 
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
               onClick={() => handleResultClick(result)}
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