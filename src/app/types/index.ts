import {Listing , User, Reservation, Post} from '@prisma/client'

// Add the new media types
export type MediaType = 'image' | 'video' | 'gif';

export interface MediaData {
  url: string;
  type: MediaType;
}

export interface PostMedia {
  mediaUrl?: string;
  mediaType?: MediaType;
}

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
  phoneNumber?: string | null;
  website?: string | null;
  address?: string | null; 
  employees: {
    id: string;
    fullName: string;
  }[];
  zipCode: string | null;
  storeHours: SafeStoreHours[];
  city?: string | null;  // Add this
  state?: string | null; // Add this
  
};

export type SafeReservation = Omit<
  Reservation, 
  "createdAt" | "startDate" | "endDate" | "listing"
> & {
  createdAt: string;
  date: Date;
  listing: {
    id: string;
    title: string;
    description: string;
    imageSrc: string;
    category: string;
    location: string | null;
    userId: string;
    createdAt: string;
    services: SafeService[];
    phoneNumber: string | null;
    website: string | null;
    address: string | null;
    zipCode: string | null;
    galleryImages: string[];
    employees: SafeEmployee[];
    storeHours: SafeStoreHours[];
  };
  user: SafeUser;
};

export type SafeUser = Omit<
  User,
  'favoriteIds'|'hashedPassword'|"createdAt" | "updatedAt" | "emailVerified"
> & {
  id: string; 
  createdAt: string;
  updatedAt: string;
  emailVerified: string | null;
  favoriteIds?: string[]; 
  imageSrc?: string | null;
  bio: string;
  location?: string | null;
  galleryImages?: string[]; 
  following: string[];
  followers: string[];
  conversationIds?: string[]; 
  isSubscribed: boolean;
  resetToken?: string | null;
  resetTokenExpiry: Date | null;
  subscriptionStartDate: Date | null;
  subscriptionEndDate: Date | null;
  
};


export type SafePost = Omit<
  Post,
  "createdAt" | "updatedAt" | "userId" | "categoryId"
> & {
  createdAt: string;
  category?: string;
  user: SafeUser;
  imageSrc: string | null;
  mediaType?: MediaType | null;
  likes: string[]; 
  bookmarks: string[]; 
  hiddenBy: string[]; // Add this line
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
  isRead: boolean;
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
    isRead: boolean;
  };
  lastMessageAt: string;  // Add this line
};

export type SafeEmployee = {
  id: string;
  fullName: string;
};


export type SafeStoreHours = {
  dayOfWeek: string;
  openTime: string;
  closeTime: string;
  isClosed: boolean;
};

