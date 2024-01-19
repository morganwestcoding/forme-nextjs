import React from 'react'

import ClientProviders from '@/components/ClientProviders'
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/pages/api/auth/[...nextauth]"; 
import getCurrentUser from '@/app/actions/getCurrentUser';
import EmptyState from '@/components/EmptyState';
import ListingCard from '@/components/listings/ListingCard'
import { categories } from '@/components/Categories';
import { GetServerSidePropsContext } from 'next';
import { SafeListing, SafeUser } from '@/app/types'; 
import getListings, { 
  IListingsParams
} from "@/app/actions/getListings";

interface MarketProps {
  listings: SafeListing[]; // Use SafeListing for the listings
  currentUser: SafeUser;   // Use SafeUser for the currentUser
};

const Market = ({ listings, currentUser }: MarketProps) => {
  console.log('Received listings:', listings);
  console.log('Received currentUser:', currentUser);
  if (listings.length === 0) {
    return (
      <ClientProviders>
        <EmptyState showReset />
      </ClientProviders>
    );
  }

  return (
  <ClientProviders>
    <div className="pt-2 pl-20 mr-24 flex-1">
    <div 
    className="
      pt-6
      grid 
      grid-cols-4 
      sm:grid-cols-2 
      md:grid-cols-3 
      lg:grid-cols-4
      xl:grid-cols-5
      2xl:grid-cols-6
      gap-6
    "
  >
    {listings.map((listing: any) => (
      <ListingCard
        currentUser={currentUser}
        key={listing.id}
        data={listing}
        categories={categories}
        
      />
    ))}
  </div>
  </div>
  </ClientProviders>
  )
}

// getServerSideProps function to fetch data for each request
// getServerSideProps function to fetch data for each request
export async function getServerSideProps(context: GetServerSidePropsContext) {
  try {
    const searchParams: IListingsParams = {
      userId: context.query.userId as string,
      category: context.query.category as string,
      // ... other searchParams ...
    };

    const currentUser = await getCurrentUser();
    const listings = await getListings(searchParams);

    return { props: { listings, currentUser } };
  } catch (error) {
    console.error("Error in getServerSideProps:", error);
    return { props: { listings: [], currentUser: null } };
  }
}

export default Market;
