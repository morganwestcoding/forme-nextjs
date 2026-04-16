'use client';

import { useEffect, useState } from 'react';
import Container from '@/components/Container';
import ProfileHead from '@/components/profile/ProfileHead';
import { SafeListing, SafePost, SafeUser, SafeReview } from '@/app/types';
import type { ProviderService } from '@/app/actions/getServicesByUserId';

interface ProfileClientProps {
  userId?: string;
  currentUser: SafeUser | null;
  user?: SafeUser;
  posts?: SafePost[];
  listings?: SafeListing[];
  services?: ProviderService[];
  reviews?: SafeReview[];
  reviewStats?: { totalCount: number; averageRating: number };
}

const ProfileClient: React.FC<ProfileClientProps> = ({
  userId,
  currentUser,
  user: serverUser,
  posts: serverPosts,
  listings: serverListings,
  services: serverServices,
  reviews: serverReviews,
  reviewStats: serverReviewStats,
}) => {
  const [data, setData] = useState(
    serverUser
      ? { user: serverUser, posts: serverPosts || [], listings: serverListings || [], services: serverServices || [], reviews: serverReviews || [], reviewStats: serverReviewStats }
      : null
  );
  const isLoading = !data;

  useEffect(() => {
    if (serverUser || !userId) return;
    fetch(`/api/users/${userId}/profile`)
      .then(r => r.ok ? r.json() : null)
      .then(d => { if (d) setData(d); })
      .catch(() => {});
  }, [serverUser, userId]);

  if (isLoading) {
    return (
      <Container>
        <div className="flex gap-6 -mx-6 md:-mx-24 px-6 md:px-24 -mt-2 md:-mt-8">
          {/* Left column — profile card skeleton */}
          <div className="w-[320px] flex-shrink-0 hidden md:flex flex-col gap-4 py-10">
            <div className="rounded-2xl overflow-hidden border border-stone-200/40 dark:border-stone-800 shadow-sm bg-white dark:bg-stone-900">
              <div className="relative pt-8 pb-5 px-6 text-center">
                <div className="h-8 w-8 rounded-full absolute top-3 left-3 animate-pulse bg-stone-200/60 dark:bg-stone-800/60" />
                <div className="h-8 w-8 rounded-full absolute top-3 right-3 animate-pulse bg-stone-200/60 dark:bg-stone-800/60" />
                <div className="h-24 w-24 rounded-full mx-auto animate-pulse bg-stone-200/60 dark:bg-stone-800/60" />
                <div className="mt-3 flex flex-col items-center">
                  <div className="h-5 w-36 mb-2 rounded-md animate-pulse bg-stone-200/60 dark:bg-stone-800/60" />
                  <div className="h-3 w-24 mb-2 rounded-md animate-pulse bg-stone-200/60 dark:bg-stone-800/60" />
                  <div className="h-3 w-32 rounded-md animate-pulse bg-stone-200/60 dark:bg-stone-800/60" />
                </div>
                <div className="flex items-center justify-center gap-1 mt-3">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <div key={i} className="h-3.5 w-3.5 rounded-sm animate-pulse bg-stone-200/60 dark:bg-stone-800/60" />
                  ))}
                </div>
              </div>
              <div className="px-6 py-5">
                <div className="flex items-center justify-between text-center">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <div key={i} className="flex-1 flex flex-col items-center">
                      <div className="h-5 w-8 mb-1 rounded-md animate-pulse bg-stone-200/60 dark:bg-stone-800/60" />
                      <div className="h-2.5 w-14 rounded-md animate-pulse bg-stone-200/60 dark:bg-stone-800/60" />
                    </div>
                  ))}
                </div>
              </div>
              <div className="px-6 py-5 space-y-2">
                <div className="h-3 w-full rounded-md animate-pulse bg-stone-200/60 dark:bg-stone-800/60" />
                <div className="h-3 w-full rounded-md animate-pulse bg-stone-200/60 dark:bg-stone-800/60" />
                <div className="h-3 w-5/6 rounded-md animate-pulse bg-stone-200/60 dark:bg-stone-800/60" />
              </div>
              <div className="px-6 py-5">
                <div className="flex gap-2.5">
                  <div className="flex-1 h-12 rounded-xl animate-pulse bg-stone-200/60 dark:bg-stone-800/60" />
                  <div className="flex-1 h-12 rounded-xl animate-pulse bg-stone-200/60 dark:bg-stone-800/60" />
                </div>
              </div>
            </div>
          </div>

          {/* Right column */}
          <div className="flex-1 min-w-0 md:py-14 md:px-2 md:-mx-2">
            <div className="md:hidden mb-6">
              <div className="flex items-center gap-4">
                <div className="h-16 w-16 rounded-xl shrink-0 animate-pulse bg-stone-200/60 dark:bg-stone-800/60" />
                <div className="flex-1">
                  <div className="h-5 w-36 mb-1.5 rounded-md animate-pulse bg-stone-200/60 dark:bg-stone-800/60" />
                  <div className="h-3 w-24 rounded-md animate-pulse bg-stone-200/60 dark:bg-stone-800/60" />
                </div>
              </div>
            </div>
            <div className="space-y-12">
              {/* Posts — grid-cols-6, 12 cells, aspect-[5/6] with PostCard bg + inset shadow */}
              <section>
                <div className="flex items-center justify-between mb-5">
                  <div className="flex items-center gap-4">
                    <div className="h-6 w-16 rounded-md animate-pulse bg-stone-200/60 dark:bg-stone-800/60" />
                    <div className="h-5 w-8 rounded-full animate-pulse bg-stone-100 dark:bg-stone-800" />
                  </div>
                  <div className="h-3 w-14 rounded animate-pulse bg-stone-200/60 dark:bg-stone-800/60" />
                </div>
                <div className="grid grid-cols-6 gap-0.5 overflow-hidden rounded-xl">
                  {Array.from({ length: 12 }).map((_, i) => (
                    <div
                      key={i}
                      className="w-full overflow-hidden bg-stone-100 dark:bg-stone-800 animate-pulse"
                      style={{ aspectRatio: '5 / 6', boxShadow: 'inset 0 0 30px rgba(0,0,0,0.08), inset 0 0 6px rgba(0,0,0,0.04)' }}
                    />
                  ))}
                </div>
              </section>

              {/* Services — ServiceCard solidBackground compact with price watermark */}
              <section>
                <div className="flex items-center justify-between mb-5">
                  <div className="flex items-center gap-4">
                    <div className="h-6 w-24 rounded-md animate-pulse bg-stone-200/60 dark:bg-stone-800/60" />
                    <div className="h-5 w-8 rounded-full animate-pulse bg-stone-100 dark:bg-stone-800" />
                  </div>
                </div>
                <div className="grid grid-cols-4 gap-4 -mx-1 px-1 py-1 mb-10">
                  {Array.from({ length: 8 }).map((_, i) => (
                    <div key={i} className="relative group rounded-2xl overflow-visible">
                      <div className="absolute inset-0 bg-gradient-to-br from-white to-stone-50/80 dark:from-stone-900 dark:to-stone-950 rounded-2xl" />
                      <div className="absolute inset-0 z-30 rounded-2xl border border-stone-200/80 dark:border-stone-800 pointer-events-none" />
                      <div className="relative z-10 h-[180px]">
                        <div className="absolute inset-0 flex flex-col overflow-hidden rounded-2xl">
                          <div className="absolute -right-2 -top-4 h-20 w-16 rounded animate-pulse bg-stone-100/60 dark:bg-stone-800/40" />
                          <div className="relative flex flex-col h-full p-5">
                            <div className="mb-2 h-8" />
                            <div className="h-4 w-4/5 rounded animate-pulse bg-stone-200/60 dark:bg-stone-800/60" style={{ marginBottom: '4px' }} />
                            <div className="h-4 w-3/5 rounded animate-pulse bg-stone-200/60 dark:bg-stone-800/60" />
                            <div className="h-2.5 w-14 rounded animate-pulse bg-stone-200/60 dark:bg-stone-800/60 mt-1.5" />
                            <div className="flex-1" />
                            <div className="flex items-end justify-between">
                              <div className="h-7 w-12 rounded animate-pulse bg-stone-200/60 dark:bg-stone-800/60" />
                              <div className="h-5 w-5 rounded animate-pulse bg-stone-200/60 dark:bg-stone-800/60 mb-1" />
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </section>

              {/* Businesses — ListingCard solidBackground compact with image */}
              <section>
                <div className="flex items-center justify-between mb-5">
                  <div className="flex items-center gap-4">
                    <div className="h-6 w-28 rounded-md animate-pulse bg-stone-200/60 dark:bg-stone-800/60" />
                    <div className="h-5 w-8 rounded-full animate-pulse bg-stone-100 dark:bg-stone-800" />
                  </div>
                  <div className="h-3 w-14 rounded animate-pulse bg-stone-200/60 dark:bg-stone-800/60" />
                </div>
                <div className="grid grid-cols-4 gap-4 -mx-1 px-1 py-1">
                  {Array.from({ length: 4 }).map((_, i) => (
                    <div key={i} className="relative group rounded-2xl overflow-visible">
                      <div className="absolute inset-0 bg-gradient-to-br from-white to-stone-50/80 dark:from-stone-900 dark:to-stone-950 rounded-2xl" />
                      <div className="absolute inset-0 z-30 rounded-2xl border border-stone-200/80 dark:border-stone-800 pointer-events-none" />
                      <div className="relative z-10 h-[180px]">
                        <div className="absolute inset-0 flex flex-col overflow-hidden rounded-2xl">
                          <div className="absolute -right-2 -top-4 h-20 w-16 rounded animate-pulse bg-stone-100/60 dark:bg-stone-800/40" />
                          <div className="relative flex flex-col h-full p-5">
                            {/* Listing image (rounded-xl) */}
                            <div className="mb-3">
                              <div className="w-12 h-12 rounded-xl animate-pulse bg-stone-200/60 dark:bg-stone-800/60" />
                            </div>
                            {/* Title */}
                            <div className="h-4 w-4/5 rounded animate-pulse bg-stone-200/60 dark:bg-stone-800/60" style={{ marginBottom: '6px' }} />
                            {/* Location */}
                            <div className="h-2.5 w-24 rounded animate-pulse bg-stone-200/60 dark:bg-stone-800/60" />
                            <div className="flex-1" />
                            <div className="flex items-end justify-between">
                              <div className="h-7 w-10 rounded animate-pulse bg-stone-200/60 dark:bg-stone-800/60" />
                              <div className="h-5 w-5 rounded animate-pulse bg-stone-200/60 dark:bg-stone-800/60 mb-1" />
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </section>

              {/* Gallery — aspect-square images */}
              <section>
                <div className="flex items-center justify-between mb-5">
                  <div className="flex items-center gap-4">
                    <div className="h-6 w-20 rounded-md animate-pulse bg-stone-200/60 dark:bg-stone-800/60" />
                    <div className="h-5 w-8 rounded-full animate-pulse bg-stone-100 dark:bg-stone-800" />
                  </div>
                  <div className="h-3 w-14 rounded animate-pulse bg-stone-200/60 dark:bg-stone-800/60" />
                </div>
                <div className="grid grid-cols-4 gap-4 -mx-1 px-1 py-1">
                  {Array.from({ length: 8 }).map((_, i) => (
                    <div key={i} className="relative rounded-xl overflow-hidden bg-stone-100 dark:bg-stone-800 aspect-square animate-pulse" />
                  ))}
                </div>
              </section>

              {/* Reviews — avatar + stars + text */}
              <section>
                <div className="flex items-center justify-between mb-5">
                  <div className="flex items-center gap-4">
                    <div className="h-6 w-20 rounded-md animate-pulse bg-stone-200/60 dark:bg-stone-800/60" />
                    <div className="h-5 w-8 rounded-full animate-pulse bg-stone-100 dark:bg-stone-800" />
                  </div>
                  <div className="h-3 w-14 rounded animate-pulse bg-stone-200/60 dark:bg-stone-800/60" />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {Array.from({ length: 6 }).map((_, i) => (
                    <div key={i} className="p-5 rounded-2xl border border-stone-200/60 dark:border-stone-800">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="h-10 w-10 rounded-full shrink-0 animate-pulse bg-stone-200/60 dark:bg-stone-800/60" />
                        <div className="flex-1 min-w-0">
                          <div className="h-4 w-28 mb-1.5 rounded animate-pulse bg-stone-200/60 dark:bg-stone-800/60" />
                          <div className="h-3 w-20 rounded animate-pulse bg-stone-200/60 dark:bg-stone-800/60" />
                        </div>
                      </div>
                      <div className="flex gap-1 mb-3">
                        {Array.from({ length: 5 }).map((_, j) => (
                          <div key={j} className="h-3.5 w-3.5 rounded-sm animate-pulse bg-stone-200/60 dark:bg-stone-800/60" />
                        ))}
                      </div>
                      <div className="h-3 w-full mb-2 rounded animate-pulse bg-stone-200/60 dark:bg-stone-800/60" />
                      <div className="h-3 w-full mb-2 rounded animate-pulse bg-stone-200/60 dark:bg-stone-800/60" />
                      <div className="h-3 w-3/4 rounded animate-pulse bg-stone-200/60 dark:bg-stone-800/60" />
                    </div>
                  ))}
                </div>
              </section>
            </div>
          </div>
        </div>
      </Container>
    );
  }

  if (!data.user) return null;

  return (
    <Container>
      <ProfileHead
        user={data.user}
        currentUser={currentUser}
        posts={data.posts}
        listings={data.listings}
        services={data.services}
        reviews={data.reviews}
        reviewStats={data.reviewStats}
      />
    </Container>
  );
};

export default ProfileClient;
