'use client';

import { useEffect, useState } from "react";
import { SafeListing, SafeUser, SafeService, SafePost, SafeReview } from "@/app/types";

import Container from "@/components/Container";
import ListingHead from "@/components/listings/ListingHead";

interface ListingClientProps {
  listingId?: string;
  listing?: SafeListing & {
    user: SafeUser;
    services: SafeService[];
  };
  currentUser?: SafeUser | null;
  posts?: SafePost[];
  reviews?: SafeReview[];
  reviewStats?: {
    totalCount: number;
    averageRating: number;
  };
}

const ListingClient: React.FC<ListingClientProps> = ({
  listingId,
  listing: serverListing,
  currentUser,
  posts: serverPosts,
  reviews: serverReviews,
  reviewStats: serverReviewStats,
}) => {
  const [listing, setListing] = useState(serverListing ?? null);
  const [posts, setPosts] = useState(serverPosts ?? []);
  const [reviews, setReviews] = useState(serverReviews ?? []);
  const [reviewStats, setReviewStats] = useState(serverReviewStats ?? undefined);
  const isLoading = !listing;

  useEffect(() => {
    if (serverListing || !listingId) return;
    Promise.all([
      fetch(`/api/listings/${listingId}`).then(r => r.ok ? r.json() : null),
      fetch(`/api/post/list?listingId=${listingId}`).then(r => r.json()).catch(() => []),
      fetch(`/api/reviews?targetType=listing&targetListingId=${listingId}`).then(r => r.json()).catch(() => ({ reviews: [], totalCount: 0, averageRating: 0 })),
    ]).then(([listingData, postsData, reviewsData]) => {
      if (listingData) setListing(listingData);
      setPosts(postsData || []);
      setReviews(reviewsData?.reviews || []);
      setReviewStats({ totalCount: reviewsData?.totalCount || 0, averageRating: reviewsData?.averageRating || 0 });
    });
  }, [serverListing, listingId]);

  return (
    <Container>
      {isLoading ? (
        /* Inline skeleton — exact two-column ListingHead layout */
        <div className="flex gap-6 -mx-6 md:-mx-24 px-6 md:px-24 -mt-2 md:-mt-8">
          {/* Left column card */}
          <div className="w-[320px] flex-shrink-0 hidden md:flex flex-col gap-4 py-10">
            <div className="rounded-2xl overflow-hidden border border-stone-200/40 dark:border-stone-800 shadow-sm bg-white dark:bg-stone-900">
              <div className="relative pt-8 pb-5 px-6 text-center">
                <div className="h-8 w-8 rounded-full absolute top-3 left-3 animate-pulse bg-stone-200/60 dark:bg-stone-800/60" />
                <div className="h-8 w-8 rounded-full absolute top-3 right-3 animate-pulse bg-stone-200/60 dark:bg-stone-800/60" />
                <div className="h-24 w-24 rounded-2xl mx-auto animate-pulse bg-stone-200/60 dark:bg-stone-800/60" />
                <div className="mt-3 flex flex-col items-center">
                  <div className="h-5 w-40 mb-2 rounded-md animate-pulse bg-stone-200/60 dark:bg-stone-800/60" />
                  <div className="h-3 w-32 mb-2 rounded-md animate-pulse bg-stone-200/60 dark:bg-stone-800/60" />
                  <div className="h-3 w-48 rounded-md animate-pulse bg-stone-200/60 dark:bg-stone-800/60" />
                </div>
                <div className="flex items-center justify-center gap-1 mt-3">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <div key={i} className="h-3.5 w-3.5 rounded-sm animate-pulse bg-stone-200/60 dark:bg-stone-800/60" />
                  ))}
                  <div className="h-3 w-6 ml-1.5 rounded-md animate-pulse bg-stone-200/60 dark:bg-stone-800/60" />
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
                <div className="h-3 w-2/3 rounded-md animate-pulse bg-stone-200/60 dark:bg-stone-800/60" />
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
                  <div className="h-5 w-40 mb-1.5 rounded-md animate-pulse bg-stone-200/60 dark:bg-stone-800/60" />
                  <div className="h-3 w-28 rounded-md animate-pulse bg-stone-200/60 dark:bg-stone-800/60" />
                </div>
              </div>
            </div>
            <div className="space-y-12">
              {/* Services — matches ServiceCard solidBackground compact: h-[180px] rounded-2xl with price watermark + spacer + name + duration + bottom price/arrow */}
              <section>
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div className="h-6 w-20 rounded-md animate-pulse bg-stone-200/60 dark:bg-stone-800/60" />
                    <div className="h-5 w-8 rounded-full animate-pulse bg-stone-100 dark:bg-stone-800" />
                  </div>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 -mx-1 px-1 py-1">
                  {Array.from({ length: 8 }).map((_, i) => (
                    <div key={i} className="relative group rounded-2xl overflow-visible">
                      <div className="absolute inset-0 bg-gradient-to-br from-white to-stone-50/80 dark:from-stone-900 dark:to-stone-950 rounded-2xl" />
                      <div className="absolute inset-0 z-30 rounded-2xl border border-stone-200/80 dark:border-stone-800 pointer-events-none" />
                      <div className="relative z-10 h-[180px]">
                        <div className="absolute inset-0 flex flex-col overflow-hidden rounded-2xl">
                          {/* Price watermark */}
                          <div className="absolute -right-2 -top-4 h-20 w-16 rounded animate-pulse bg-stone-100/60 dark:bg-stone-800/40" />
                          <div className="relative flex flex-col h-full p-5">
                            {/* Spacer matching avatar height */}
                            <div className="mb-2 h-8" />
                            {/* Service name (17px bold, 2 lines) */}
                            <div className="h-4 w-4/5 rounded animate-pulse bg-stone-200/60 dark:bg-stone-800/60" style={{ marginBottom: '4px' }} />
                            <div className="h-4 w-3/5 rounded animate-pulse bg-stone-200/60 dark:bg-stone-800/60" />
                            {/* Duration (11px) */}
                            <div className="h-2.5 w-14 rounded animate-pulse bg-stone-200/60 dark:bg-stone-800/60 mt-1.5" />
                            <div className="flex-1" />
                            {/* Bottom: price + arrow */}
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

              {/* Professionals — same card shape as services (WorkerCard solidBackground compact) but with avatar */}
              <section>
                <div className="flex items-center justify-between mb-5">
                  <div className="flex items-center gap-4">
                    <div className="h-6 w-36 rounded-md animate-pulse bg-stone-200/60 dark:bg-stone-800/60" />
                    <div className="h-5 w-8 rounded-full animate-pulse bg-stone-100 dark:bg-stone-800" />
                  </div>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 -mx-1 px-1 py-1">
                  {Array.from({ length: 4 }).map((_, i) => (
                    <div key={i} className="relative group rounded-2xl overflow-visible">
                      <div className="absolute inset-0 bg-gradient-to-br from-white to-stone-50/80 dark:from-stone-900 dark:to-stone-950 rounded-2xl" />
                      <div className="absolute inset-0 z-30 rounded-2xl border border-stone-200/80 dark:border-stone-800 pointer-events-none" />
                      <div className="relative z-10 h-[180px]">
                        <div className="absolute inset-0 flex flex-col overflow-hidden rounded-2xl">
                          <div className="absolute -right-2 -top-4 h-20 w-16 rounded animate-pulse bg-stone-100/60 dark:bg-stone-800/40" />
                          <div className="relative flex flex-col h-full p-5">
                            {/* Avatar circle */}
                            <div className="mb-3">
                              <div className="w-12 h-12 rounded-full animate-pulse bg-stone-200/60 dark:bg-stone-800/60" />
                            </div>
                            {/* Name (17px bold) */}
                            <div className="h-4 w-3/4 rounded animate-pulse bg-stone-200/60 dark:bg-stone-800/60" style={{ marginBottom: '6px' }} />
                            {/* Job title (11px) */}
                            <div className="h-2.5 w-20 rounded animate-pulse bg-stone-200/60 dark:bg-stone-800/60" />
                            <div className="flex-1" />
                            {/* Rating + arrow */}
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

              {/* Gallery — grid-cols-2 sm:3 lg:4, mix of aspect-square images + aspect-[5/6] PostCards */}
              <section>
                <div className="flex items-center justify-between mb-5">
                  <div className="flex items-center gap-4">
                    <div className="h-6 w-20 rounded-md animate-pulse bg-stone-200/60 dark:bg-stone-800/60" />
                    <div className="h-5 w-8 rounded-full animate-pulse bg-stone-100 dark:bg-stone-800" />
                  </div>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                  {/* Gallery images — aspect-square */}
                  {Array.from({ length: 4 }).map((_, i) => (
                    <div key={`img-${i}`} className="rounded-xl overflow-hidden bg-stone-100 dark:bg-stone-800 animate-pulse aspect-square" />
                  ))}
                  {/* PostCards — aspect-[5/6] with inset shadow */}
                  {Array.from({ length: 4 }).map((_, i) => (
                    <div
                      key={`post-${i}`}
                      className="overflow-hidden bg-stone-100 dark:bg-stone-800 animate-pulse"
                      style={{ aspectRatio: '5 / 6', boxShadow: 'inset 0 0 30px rgba(0,0,0,0.08), inset 0 0 6px rgba(0,0,0,0.04)' }}
                    />
                  ))}
                </div>
              </section>

              {/* Reviews — grid-cols-1 sm:2 lg:3, review card with avatar + stars + text */}
              <section>
                <div className="flex items-center justify-between mb-5">
                  <div className="flex items-center gap-4">
                    <div className="h-6 w-20 rounded-md animate-pulse bg-stone-200/60 dark:bg-stone-800/60" />
                    <div className="h-5 w-8 rounded-full animate-pulse bg-stone-100 dark:bg-stone-800" />
                  </div>
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
      ) : (
        <ListingHead
          key={`${listing.id}-${listing.imageSrc}-${(listing.galleryImages || []).join('|')}`}
          listing={listing}
          currentUser={currentUser}
          Services={listing.services}
          posts={posts}
          reviews={reviews}
          reviewStats={reviewStats}
        />
      )}
    </Container>
  );
}

export default ListingClient;
