import {Listing , User, Reservation, Post, Service} from '@prisma/client'

export type SafeService = {
  id: string;
  serviceName: string;
  price: number;
  category: string;
  // listingId is omitted as it's a relational field to the Listing model
};

export type SafeListing = Omit<Listing, "createdAt"> & {
  createdAt: string;
  services: SafeService[];
};

export type SafeReservation = Omit<
  Reservation, 
  "createdAt" | "startDate" | "endDate" | "listing"
> & {
  id: string;
  createdAt: string;
  startDate: string;
  endDate: string;
  userId: string;
  totalPrice: number;
  listingId: string;
  listing: SafeListing;
};

export type SafeUser = Omit<
  User,
  'favoriteIds'|'hashedPassword'|"createdAt" | "updatedAt" | "emailVerified"
> & {
  createdAt: string;
  updatedAt: string;
  emailVerified: string | null;
  favoriteIds?: string[]; 
};

export interface SafeUserImage {
  id: string;
  image: string;
  name: string;
}

export type SafePost = Omit<
  Post,
  "createdAt" | "updatedAt" | "userId" | "categoryId"
> & {
  createdAt: string;
  userId: string; 
  category?: string;
  user: SafeUserImage; // Assuming the category is a string or adjust according to your model
  // Include any other relations or transformations here
};

