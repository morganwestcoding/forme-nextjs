'use client';

import { toast } from "react-hot-toast";
import axios from "axios";
import { useCallback, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { categories } from '@/components/Categories';
import { SafeListing, SafeUser } from "@/app/types";
import ClientProviders from "@/components/ClientProviders";
import ListingCard from "@/components/listings/ListingCard";
import Button from "@/components/ui/Button";
import Container from "@/components/Container";
import PageHeader from "@/components/PageHeader";
import Skeleton, { PageHeaderSkeleton, ContainerSkeleton, ListingCardSkeleton } from "@/components/ui/Skeleton";
import { PencilEdit01Icon, Delete02Icon } from 'hugeicons-react';

interface PropertiesClientProps {
  currentUser?: SafeUser | null,
}

export const dynamic = 'force-dynamic';

const PropertiesClient: React.FC<PropertiesClientProps> = ({
  currentUser
}) => {
  const router = useRouter();
  const [deletingId, setDeletingId] = useState('');

  // Client-side fetch listings
  const [listings, setListings] = useState<SafeListing[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!currentUser) return;
    fetch(`/api/listings?userId=${currentUser.id}&limit=100`)
      .then((r) => r.json())
      .then((data) => {
        setListings(data.listings || []);
        setIsLoading(false);
      })
      .catch(() => {
        setListings([]);
        setIsLoading(false);
      });
  }, [currentUser]);

  const onEdit = useCallback((listing: SafeListing) => {
    router.push(`/listing/${listing.id}/edit`);
  }, [router]);

  const onDelete = useCallback((id: string) => {
    if (!confirm('Are you sure you want to delete this listing?')) return;
    setDeletingId(id);
    axios.delete(`/api/listings/${id}`)
    .then(() => {
      toast.success('Listing deleted');
      router.refresh();
    })
    .catch((error) => {
      toast.error(error?.response?.data?.error)
    })
    .finally(() => {
      setDeletingId('');
    })
  }, [router]);

  if (isLoading) {
    return (
      <ContainerSkeleton>
        <PageHeaderSkeleton />
        <div className="mt-8">
          <div className="mb-8">
            <Skeleton className="h-8 w-36 mb-2" />
            <Skeleton className="h-3.5 w-20" />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-x-6 gap-y-2">
            {Array.from({ length: 6 }).map((_, i) => (
              <ListingCardSkeleton key={i} />
            ))}
          </div>
        </div>
      </ContainerSkeleton>
    );
  }

  return (
    <Container>
      <ClientProviders>
        <PageHeader currentUser={currentUser} currentPage="My Listings" />

        <div className="mt-8">
          {/* Page title */}
          <div className="mb-8">
            <h1 className="text-2xl font-semibold text-stone-900 dark:text-stone-100 tracking-tight">My Listings</h1>
            <p className="text-[14px] text-stone-400 dark:text-stone-500 mt-1">{listings.length} {listings.length === 1 ? 'listing' : 'listings'}</p>
          </div>

          {listings.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-x-6 gap-y-2">
              {listings.map((listing: SafeListing, idx: number) => (
                <div
                  key={listing.id}
                  className="group/card relative"
                  style={{
                    opacity: 0,
                    animation: 'fadeInUp 520ms ease-out both',
                    animationDelay: `${Math.min(60 + idx * 30, 360)}ms`,
                  }}
                >
                  <ListingCard
                    categories={categories}
                    data={listing}
                    currentUser={currentUser}
                    customActions={
                      <div
                        className="flex flex-col items-center justify-center gap-3 flex-shrink-0 mr-1"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <button
                          onClick={(e) => { e.stopPropagation(); onEdit(listing); }}
                          className="transition-colors duration-200"
                          style={{ color: '#78716c' }}
                          title="Edit"
                          onMouseEnter={(e) => e.currentTarget.style.color = '#292524'}
                          onMouseLeave={(e) => e.currentTarget.style.color = '#78716c'}
                        >
                          <PencilEdit01Icon className="w-[20px] h-[20px]" strokeWidth={1.5} />
                        </button>
                        <button
                          onClick={(e) => { e.stopPropagation(); onDelete(listing.id); }}
                          disabled={deletingId === listing.id}
                          className="transition-colors duration-200 disabled:opacity-50"
                          style={{ color: '#78716c' }}
                          title="Delete"
                          onMouseEnter={(e) => e.currentTarget.style.color = '#78716c'}
                          onMouseLeave={(e) => e.currentTarget.style.color = '#78716c'}
                        >
                          {deletingId === listing.id ? (
                            <div className="w-4 h-4 border-[1.5px] border-stone-300 dark:border-stone-700 border-t-stone-600 rounded-full animate-spin" />
                          ) : (
                            <Delete02Icon className="w-[20px] h-[20px]" strokeWidth={1.5} />
                          )}
                        </button>
                      </div>
                    }
                  />
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-24 text-center">
              <div className="w-16 h-16 rounded-2xl bg-stone-100 dark:bg-stone-800 flex items-center justify-center mb-5">
                <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-stone-400 dark:text-stone-500">
                  <path d="M12 5v14M5 12h14" />
                </svg>
              </div>
              <p className="text-[15px] font-medium text-stone-700 dark:text-stone-200 mb-1">No listings yet</p>
              <p className="text-[13px] text-stone-400 dark:text-stone-500 max-w-xs">Create your first listing to start showcasing your services.</p>
              <div className="mt-5">
                <Button onClick={() => router.push('/listing/new')}>
                  Create Listing
                </Button>
              </div>
            </div>
          )}
        </div>
      </ClientProviders>
    </Container>
  );
}

export default PropertiesClient;
