import { z } from 'zod';

/**
 * Common validation schemas for API routes
 */

// User registration schema
export const registerSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  location: z.string().optional(),
  subscription: z.string().optional(),
  bio: z.string().optional(),
  image: z.string().optional(),
  imageSrc: z.string().optional(),
  backgroundImage: z.string().optional(),
  userType: z.enum(['customer', 'individual', 'team']).optional(),
  selectedListing: z.string().optional(),
  jobTitle: z.string().optional(),
  isOwnerManager: z.boolean().optional(),
  selectedServices: z.array(z.string()).optional(),
  individualServices: z.array(z.object({
    serviceName: z.string(),
    price: z.number().or(z.string()),
    category: z.string(),
    imageSrc: z.string().optional(),
  })).optional(),
  // Individual provider listing fields
  listingCategory: z.string().optional(),
  listingTitle: z.string().optional(),
  listingDescription: z.string().optional(),
  listingImage: z.string().optional(),
});

// Listing creation schema
export const createListingSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().min(1, 'Description is required'),
  imageSrc: z.string().min(1, 'Image is required'),
  category: z.string().min(1, 'Category is required'),
  location: z.string().min(1, 'Location is required'),
  address: z.string().min(1, 'Address is required'),
  zipCode: z.string().min(1, 'Zip code is required'),
  phoneNumber: z.string().optional(),
  website: z.string().url().optional().or(z.literal('')),
  galleryImages: z.array(z.string()).min(1, 'At least one gallery image required'),
  services: z.array(z.object({
    serviceName: z.string().min(1),
    price: z.number().positive(),
    category: z.string(),
    imageSrc: z.string().optional().nullable(),
  })),
  employees: z.array(z.object({
    userId: z.string().min(1),
    jobTitle: z.string().optional(),
    serviceIds: z.array(z.string()).optional(),
  })),
  storeHours: z.array(z.object({
    dayOfWeek: z.string(),
    openTime: z.string().optional(),
    closeTime: z.string().optional(),
    isClosed: z.boolean().optional(),
  })),
});

// Post creation schema
export const createPostSchema = z.object({
  content: z.string().min(1, 'Content is required').max(2000, 'Content too long'),
  imageSrc: z.string().optional(),
  mediaUrl: z.string().optional(),
  mediaType: z.enum(['image', 'video', 'reel']).optional(),
  overlayText: z.string().max(200).optional(),
  category: z.string().optional(),
  location: z.string().optional(),
  tag: z.string().optional(),
  mentions: z.array(z.object({
    entityId: z.string(),
    entityType: z.enum(['user', 'listing', 'shop']),
    title: z.string(),
    subtitle: z.string().optional(),
    image: z.string().optional(),
  })).optional(),
});

// Reservation creation schema
export const createReservationSchema = z.object({
  listingId: z.string().min(1, 'Listing ID is required'),
  employeeId: z.string().optional(),
  serviceId: z.string().optional(),
  date: z.string().min(1, 'Date is required'),
  time: z.string().min(1, 'Time is required'),
  totalPrice: z.number().positive(),
  notes: z.string().optional(),
});

// Review creation schema
export const createReviewSchema = z.object({
  rating: z.number().min(1).max(5),
  comment: z.string().min(1, 'Review comment is required').max(1000),
  targetUserId: z.string().optional(),
  targetListingId: z.string().optional(),
  reservationId: z.string().optional(),
}).refine(
  data => data.targetUserId || data.targetListingId,
  { message: 'Either targetUserId or targetListingId is required' }
);

// Shop creation schema
export const createShopSchema = z.object({
  name: z.string().min(1, 'Shop name is required'),
  description: z.string().optional(),
  logo: z.string().optional(),
  coverImage: z.string().optional(),
  location: z.string().optional(),
  address: z.string().optional(),
  isOnlineOnly: z.boolean().optional(),
  storeUrl: z.string().url().optional().or(z.literal('')),
  listingId: z.string().optional(),
});

// Product creation schema
export const createProductSchema = z.object({
  shopId: z.string().min(1, 'Shop ID is required'),
  name: z.string().min(1, 'Product name is required'),
  description: z.string().optional(),
  price: z.number().positive('Price must be positive'),
  compareAtPrice: z.number().positive().optional(),
  mainImage: z.string().min(1, 'Product image is required'),
  galleryImages: z.array(z.string()).optional(),
  sku: z.string().optional(),
  barcode: z.string().optional(),
  inventory: z.number().int().nonnegative().optional(),
  lowStockThreshold: z.number().int().nonnegative().optional(),
  categoryId: z.string().optional(),
  tags: z.array(z.string()).optional(),
  isPublished: z.boolean().optional(),
  isFeatured: z.boolean().optional(),
  options: z.any().optional(), // JSON field for variants
});

// Message schema
export const createMessageSchema = z.object({
  conversationId: z.string().optional(),
  recipientId: z.string().optional(),
  content: z.string().min(1, 'Message content is required').max(5000),
}).refine(
  data => data.conversationId || data.recipientId,
  { message: 'Either conversationId or recipientId is required' }
);

// Profile update schema
export const updateProfileSchema = z.object({
  name: z.string().min(1).optional(),
  bio: z.string().max(500).optional(),
  location: z.string().optional(),
  image: z.string().optional(),
  imageSrc: z.string().optional(),
  backgroundImage: z.string().optional(),
  galleryImages: z.array(z.string()).optional(),
});

/**
 * Validate request body against a schema
 * Returns { success: true, data } or { success: false, error }
 */
export function validateBody<T extends z.ZodTypeAny>(
  schema: T,
  data: unknown
): { success: true; data: z.infer<T> } | { success: false; error: string } {
  const result = schema.safeParse(data);

  if (result.success) {
    return { success: true, data: result.data };
  }

  // Format the first error message
  const firstError = result.error.errors[0];
  const path = firstError.path.join('.');
  const message = path ? `${path}: ${firstError.message}` : firstError.message;

  return { success: false, error: message };
}
