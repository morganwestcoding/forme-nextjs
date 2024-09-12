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
  galleryImages: string[]; 
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
  galleryImages?: string[]; 
  following: string[];
  followers: string[];
  conversationIds?: string[]; 
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

export type SafeComment = {
  id: string;
  content: string;
  createdAt: string;
  userId: string;
  postId: string;
  user: {
    id: string;
    name: string | null;
    image: string | null;
    // Add other necessary user fields here
  };
};

export type SafeMessage = {
  id: string;
  content: string;
  createdAt: string;
  senderId: string;
  conversationId: string;
  sender: {
    id: string;
    name: string | null;
    image: string | null;
  };
};

export type SafeConversation = {
  id: string;
  otherUser: {
    id: string;
    name: string | null;
    image: string | null;
  };
  lastMessage?: {
    content: string;
    createdAt: string;
  };
};



