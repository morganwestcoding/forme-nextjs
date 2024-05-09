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
  favoriteIds?: string[]; // Already exists in User model
  imageSrc?: string | null;
  bio: string;
  location?: string | null;

};


export type SafePost = Omit<
  Post,
  "createdAt" | "updatedAt" | "userId" | "categoryId"
> & {
  createdAt: string;
  userId: string; 
  category?: string;
  user: SafeUser;
  imageSrc: string | null;
};

export type SafeProfile = {
  id: string; // Profile ID
  bio?: string;
  email?: string; // Optional biography text
  userId: string; // User ID associated with this profile
  image?: string; // URL/path to the user's profile image, aligning with the User model's field
  name?: string; // User's name, marked as optional to match the User model
  imageSrc?: string; // URL/path to the profile's background image
  createdAt: string;
  galleryImages?: string[];
};



