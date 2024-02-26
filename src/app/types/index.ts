import {Listing , User, Reservation, Post, Service, Profile} from '@prisma/client'

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
  favoriteIds?: string[]; // Already exists in User model
  imageSrc?: string | null;
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
  user: SafeUserImage;
  imageSrc: string | null;
   // Assuming the category is a string or adjust according to your model
  // Include any other relations or transformations here
};

export type SafeProfile = {
  id: string; // Profile ID
  bio?: string; // Optional biography text
  userId: string; // User ID associated with this profile
  image?: string; // URL/path to the user's profile image, aligning with the User model's field
  name?: string; // User's name, marked as optional to match the User model
  imageSrc?: string; // URL/path to the profile's background image
  createdAt: string;
  galleryImages?: string[];
};



