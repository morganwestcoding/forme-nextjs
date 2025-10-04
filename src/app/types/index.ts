import {Listing , User, Reservation, Post} from '@prisma/client'

export type MediaType = 'image' | 'video' | 'gif';

export type VerificationStatus = 'none' | 'pending' | 'verified' | 'rejected';

export interface MediaData {
  url: string;
  type: MediaType;
    width?: number | null;
  height?: number | null;
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
};

export type SafeListing = Omit<Listing, "createdAt"> & {
  createdAt: string;
  services: SafeService[];
  galleryImages: string[]; 
    followers?: string[]; 
  followerCount?: number;   
  phoneNumber?: string | null;
  favoriteIds: string[];
  website?: string | null;
  address?: string | null; 
 employees: SafeEmployee[]; 
  zipCode: string | null;
  storeHours: SafeStoreHours[];
  city?: string | null;  
  state?: string | null;
    rating?: number;
  isTrending?: boolean;
  
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
  paymentIntentId?: string | null;
  paymentStatus?: string | null;
};

export type SafeUser = Omit<
  User,
  'favoriteIds'|'hashedPassword'|"createdAt" | "updatedAt" | "emailVerified"
> & {
  id: string; 
  createdAt: string;
  updatedAt: string;
  emailVerified: string | null;

  // Basic profile
  name: string | null;
   email: string | null; 
  image: string | null;
  imageSrc?: string | null;
  bio: string;
  location?: string | null;
  galleryImages?: string[]; 
  favoriteIds?: string[]; 

  // Licensing/Verification fields
  licensingImage?: string | null;
  verificationStatus?: string | null; // "none" | "pending" | "verified" | "rejected"
  verifiedAt?: Date | null;
  verificationRejectedAt?: Date | null;
  rejectionReason?: string | null;

  // Subscription fields
  isSubscribed: boolean;
  subscriptionStartDate: Date | null;
  subscriptionEndDate: Date | null;
  subscriptionTier?: string | null;

  // Stripe fields
  stripeCustomerId?: string | null;
  stripeSubscriptionId?: string | null;
  subscriptionPriceId?: string | null;
  subscriptionStatus?: string | null;
  subscriptionBillingInterval?: string | null;
  currentPeriodEnd?: Date | null;

  // Social/Network fields
  following: string[];
  followers: string[];
  conversationIds?: string[];

  // Professional/Business fields
  managedListings: string[]; 

  // Reset password fields
  resetToken?: string | null;
  resetTokenExpiry: Date | null;

  

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
  postType?: 'ad' | 'text' | 'reel';
  listing?: SafeListing;
  shop?: SafeShop;
  bookmarks: string[]; 
  hiddenBy: string[];
  comments: SafeComment[];
};

export interface SafeComment {
  id: string;
  content: string;
  createdAt: string;
  userId: string;
  postId: string;
  user: {
    id: string;
    name: string | null;
    image: string | null;
  };
}


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
  lastMessageAt: string;  
};

export type SafeEmployee = {
  id: string;
  fullName: string;
  jobTitle?: string | null;
  listingId: string;
  userId: string; 
  serviceIds: string[];
  isActive: boolean;
  createdAt: string;
  listingTitle: string;
  listingCategory: string;
  user: {
    id: string;
    name: string | null;
    image: string | null;
    imageSrc: string | null;
  };
};

export type SafeStoreHours = {
  dayOfWeek: string;
  openTime: string;
  closeTime: string;
  isClosed: boolean;
};

export type SafeShop = {
  id: string;
  name: string;
  description: string;
  logo: string;
  coverImage?: string | null;
  location?: string | null;
  address?: string | null;
  zipCode?: string | null;
  isOnlineOnly?: boolean;
  userId: string;
  storeUrl?: string | null;
  galleryImages: string[];
  createdAt: string;
  updatedAt: string;
  isVerified: boolean;
  shopEnabled: boolean;
  featuredProducts: string[];
  followers: string[];
  listingId?: string | null;
  category?: string;
  user: {
    id: string;
    name: string | null;
    image: string | null;
  };
  products?: Array<{ name: string; image: string; price?: number }>;
  productCount?: number;
  followerCount?: number;
  featuredProductItems?: {
    id: string;
    name: string;
    price: number;
    image: string;
  }[];
};

export interface ProductReview {
  userId: string;
  userName?: string;
  userImage?: string;
  rating: number;
  comment?: string;
  date: string;
}

export interface ProductVariant {
  id?: string;
  sku?: string;
  price: number;
  compareAtPrice?: number;
  inventory: number;
  optionValues: {
    [optionName: string]: string;
  };
}

export interface ProductOption {
  name: string;
  values: string[];
}

export type SafeProduct = {
  id: string;
  name: string;
  description: string;
  price: number;
  compareAtPrice?: number | null;
  mainImage: string;
  galleryImages: string[];
  shopId: string;
  createdAt: string;
  updatedAt: string;
  sku?: string | null;
  barcode?: string | null;
  categoryId: string;
  category: {
    id: string;
    name: string;
  };
  tags: string[];
  isPublished: boolean;
  isFeatured: boolean;
  inventory: number;
  lowStockThreshold: number;
  weight?: number | null;
  shop: {
    id: string;
    name: string;
    logo: string;
  };
  favoritedBy: string[];
  reviews?: ProductReview[] | null;
  options?: ProductOption[] | null;
  variants?: ProductVariant[] | null;
};

export type SafeProductCategory = {
  id: string;
  name: string;
  description?: string | null;
  image?: string | null;
  parentId?: string | null;
  productCount?: number;
};