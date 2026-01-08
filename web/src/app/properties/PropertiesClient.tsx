'use client';

import { toast } from "react-hot-toast";
import axios from "axios";
import { useCallback, useState } from "react";
import { useRouter } from "next/navigation";
import { categories } from '@/components/Categories';
import { SafeListing, SafeUser } from "@/app/types";
import ClientProviders from "@/components/ClientProviders";

import Heading from "@/components/Heading";
import ListingCard from "@/components/listings/ListingCard";
import Container from "@/components/Container";
import PageSearch from "@/components/search/PageSearch";

interface PropertiesClientProps {
  listings: SafeListing[],
  currentUser?: SafeUser | null,
}

export const dynamic = 'force-dynamic';

const PropertiesClient: React.FC<PropertiesClientProps> = ({
  listings,
  currentUser
}) => {
  const router = useRouter();
  const [deletingId, setDeletingId] = useState('');

  const onEdit = useCallback((listing: SafeListing) => {
    router.push(`/listing/${listing.id}/edit`);
  }, [router]);

  const onDelete = useCallback((id: string) => {
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

  return (
    <Container>
      <ClientProviders>
        <div className="pt-2 flex-1 relative">
          {/* Search with action button */}
          <div className="max-w-3xl mx-auto mb-6">
            <PageSearch actionContext="properties" />
          </div>
          <div
            className="
              flex-1
              grid
              grid-cols-1
              lg:grid-cols-2
              xl:grid-cols-3
              2xl:grid-cols-3
              gap-4
              px-4
            "
          >
            {listings.map((listing: SafeListing) => (
              <ListingCard
                categories={categories}
                key={listing.id}
                data={listing}
                onAction={() => onEdit(listing)}
                actionLabel="Edit listing"
                currentUser={currentUser}
              />
            ))}
          </div>
        </div>
      </ClientProviders>
    </Container>
  );
}
 
export default PropertiesClient;