import React from 'react';

function Search() {
  return (
    <div className="hidden md:block ml-28 ">
      <div className="relative ">
        <span className="absolute inset-y-0 left-0 flex items-center pl-3 ">
          <svg className="w-4 h-4 text-white" viewBox="0 0 24 24" fill="none">
            <path d="M21 21L15 15M17 10C17 13.866 13.866 17 10 17C6.13401 17 3 13.866 3 10C3 6.13401 6.13401 3 10 3C13.866 3 17 6.13401 17 10Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"></path>
          </svg>
        </span>
        <input type="text" className="w-full text-sm p-2.5 pl-10 pr-12 backdrop-blur-full bg-[#e2e8f0] shadow-sm border border-[#FFFFFF] rounded-lg dark:bg-gray-800 dark:text-gray-300 dark:border-gray-600 focus:border-blue-400 dark:focus:border-blue-300 focus:outline-none focus:ring focus:ring-opacity-40 focus:ring-blue-300 placeholder-white" placeholder="Search" />
      </div>
    </div>
  );
}

export default Search;
