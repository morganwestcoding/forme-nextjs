// components/pagination/Pagination.tsx
'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import React from 'react';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  totalResults: number;
}

const Pagination = ({ currentPage, totalPages, totalResults }: PaginationProps) => {
  const router = useRouter();
  const searchParams = useSearchParams();

  const createPageURL = (pageNumber: number) => {
    const params = new URLSearchParams(searchParams?.toString() || '');
    params.set('page', pageNumber.toString());
    return `?${params.toString()}`;
  };

  const handlePageChange = (page: number) => {
    router.push(createPageURL(page));
  };

  const renderPageNumbers = () => {
    const pages = [];
    const maxVisiblePages = 5;
    let startPage = Math.max(1, currentPage - 2);
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(
        <button
          key={i}
          onClick={() => handlePageChange(i)}
          className={`flex items-center justify-center w-10 h-10 mx-1 rounded-full text-[#a2a2a2] bg-white border border-dashed transition-colors duration-250 ${
            currentPage === i
              ? 'bg-[#78C3FB] border text-white'
              : 'hover:bg-[#e2e8f0] hover:border hover:border-dashed hover:border-white'
          } shadow ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:rounded-full focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-25`}
        >
          {i}
        </button>
      );
    }

    return pages;
  };

  return (
    <div className="flex items-center justify-between w-full -ml-9">
      <button
        onClick={() => handlePageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="flex items-center justify-center w-10 h-10 rounded-full bg-white text-[#a2a2a2] border border-dashed disabled:opacity-25 disabled:cursor-not-allowed hover:bg-[#e2e8f0] shadow ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:rounded-full focus-visible:ring-ring focus-visible:ring-offset-2"
      >
        ←
      </button>
      <div className="flex items-center font-extralight">
        {renderPageNumbers()}
      </div>
      <button
        onClick={() => handlePageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="flex items-center justify-center w-10 h-10 rounded-full bg-white text-[#a2a2a2] border border-dashed disabled:opacity-25 disabled:cursor-not-allowed hover:bg-[#e2e8f0] shadow ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:rounded-full focus-visible:ring-ring focus-visible:ring-offset-2"
      >
        →
      </button>

    </div>
  );
};

export default Pagination;