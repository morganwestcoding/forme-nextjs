import {Listing , User, Reservation, Post} from '@prisma/client'

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
  date: Date;  // Convert Date to string for client-safe object
  time: string; 
  userId: string;
  totalPrice: number;
  listingId: string;
  listing: SafeListing;
};

export type SafeUser = Omit<
  User,
  'favoriteIds'|'hashedPassword'|"createdAt" | "updatedAt" | "emailVerified"
> & {
  id: string; 
  createdAt: string;
  updatedAt: string;
  image?: string | null; 
  emailVerified: string | null;
  favoriteIds?: string[]; 
  imageSrc?: string | null;
  bio: string;
  location?: string | null;
};


export type SafePost = Omit<
  Post,
  "createdAt" | "updatedAt" | "userId" | "categoryId"
> & {
  createdAt: string;
  category?: string;
  user: SafeUser;
  imageSrc: string | null;
  likes: string[]; 
  bookmarks: string[]; 
};




