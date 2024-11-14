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
          className={`px-4 py-2 mx-1 rounded-full ${
            currentPage === i
              ? 'border border-white bg-black bg-opacity-10 text-white'
              : 'border border-white text-white bg-black bg-opacity-5 hover:bg-gray-100'
          }`}
        >
          {i}
        </button>
      );
    }

    return pages;
  };

  return (
    <div className="flex items-center justify-between w-full max-w-2xl mx-auto">
      <button
        onClick={() => handlePageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="px-4 py-2 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        Previous
      </button>
      <div className="flex items-center">
        {renderPageNumbers()}
      </div>
      <button
        onClick={() => handlePageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="px-4 py-2 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        Next
      </button>
      <div className="ml-4 text-sm text-gray-500">
        Showing {totalResults} of {totalResults} results
      </div>
    </div>
  );
};

export default Pagination;