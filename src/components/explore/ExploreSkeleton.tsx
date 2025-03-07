'use client';

import Container from '@/components/Container';

const ExploreSkeleton: React.FC = () => {
  return (
    <Container>
      <div className="py-6">
        {/* Header Skeleton */}
        <div className="w-full">
          <div className="flex items-center justify-between mb-6">
            <div className="h-8 w-32 bg-gray-200 rounded animate-pulse" />
            <div className="flex items-center gap-2">
              <div className="p-2 w-10 h-10 rounded-full bg-gray-200 animate-pulse" />
              <div className="p-2 w-10 h-10 rounded-full bg-gray-200 animate-pulse" />
            </div>
          </div>
          
          <div className="flex border-b border-gray-200 overflow-x-auto no-scrollbar mb-2">
            {[1, 2, 3, 4, 5].map(i => (
              <div key={i} className="py-3 px-6 h-8 w-24 bg-gray-200 rounded animate-pulse mx-1" />
            ))}
          </div>
        </div>
        
        <div className="mt-6 space-y-10">
          {/* Trending Stores Skeleton */}
          <div className="w-full">
            <div className="flex items-center justify-between mb-4">
              <div className="h-6 w-40 bg-gray-200 rounded animate-pulse" />
              <div className="h-4 w-20 bg-gray-200 rounded animate-pulse" />
            </div>
            
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="flex flex-col">
                  <div className="aspect-square w-full bg-gray-200 rounded-lg animate-pulse mb-2" />
                  <div className="h-4 w-3/4 bg-gray-200 rounded animate-pulse mb-1" />
                  <div className="h-3 w-1/2 bg-gray-200 rounded animate-pulse" />
                </div>
              ))}
            </div>
          </div>
          
          {/* Products Skeleton */}
          <div className="w-full">
            <div className="flex items-center justify-between mb-4">
              <div className="h-6 w-40 bg-gray-200 rounded animate-pulse" />
              <div className="h-4 w-20 bg-gray-200 rounded animate-pulse" />
            </div>
            
            <div className="flex gap-3 overflow-x-auto mb-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-8 w-32 bg-gray-200 rounded-full animate-pulse" />
              ))}
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="bg-white rounded-lg overflow-hidden shadow-sm border border-gray-100 p-3">
                  <div className="aspect-square w-full bg-gray-200 animate-pulse mb-3" />
                  <div className="h-3 w-1/3 bg-gray-200 rounded animate-pulse mb-2" />
                  <div className="h-4 w-3/4 bg-gray-200 rounded animate-pulse mb-2" />
                  <div className="flex items-center justify-between">
                    <div className="h-4 w-16 bg-gray-200 rounded animate-pulse" />
                    <div className="h-3 w-20 bg-gray-200 rounded animate-pulse" />
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          {/* Events Skeleton */}
          <div className="w-full">
            <div className="flex items-center justify-between mb-4">
              <div className="h-6 w-40 bg-gray-200 rounded animate-pulse" />
              <div className="h-4 w-20 bg-gray-200 rounded animate-pulse" />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="bg-white rounded-lg overflow-hidden shadow-sm border border-gray-100">
                  <div className="h-32 w-full bg-gray-200 animate-pulse" />
                  <div className="p-3">
                    <div className="flex items-center justify-between mb-2">
                      <div className="h-4 w-24 bg-gray-200 rounded animate-pulse" />
                      <div className="h-4 w-16 bg-gray-200 rounded animate-pulse" />
                    </div>
                    <div className="h-4 w-full bg-gray-200 rounded animate-pulse" />
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          {/* Trending Users Skeleton */}
          <div className="w-full">
            <div className="flex items-center justify-between mb-4">
              <div className="h-6 w-40 bg-gray-200 rounded animate-pulse" />
              <div className="h-4 w-20 bg-gray-200 rounded animate-pulse" />
            </div>
            
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="bg-white rounded-lg overflow-hidden shadow-sm border border-gray-100 p-4">
                  <div className="flex flex-col items-center">
                    <div className="h-20 w-20 rounded-full bg-gray-200 animate-pulse mb-2" />
                    <div className="h-4 w-20 bg-gray-200 rounded animate-pulse mb-1" />
                    <div className="h-3 w-16 bg-gray-200 rounded animate-pulse mb-2" />
                    
                    <div className="flex gap-4 mb-3">
                      <div className="flex flex-col items-center">
                        <div className="h-3 w-8 bg-gray-200 rounded animate-pulse mb-1" />
                        <div className="h-3 w-12 bg-gray-200 rounded animate-pulse" />
                      </div>
                      <div className="flex flex-col items-center">
                        <div className="h-3 w-8 bg-gray-200 rounded animate-pulse mb-1" />
                        <div className="h-3 w-12 bg-gray-200 rounded animate-pulse" />
                      </div>
                    </div>
                    
                    <div className="h-6 w-full bg-gray-200 rounded-full animate-pulse" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </Container>
  );
};

export default ExploreSkeleton;