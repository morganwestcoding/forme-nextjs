# ForMe Shared Types

Reference for data models used across web and iOS apps.

## User

```typescript
interface User {
  id: string;
  name: string | null;
  email: string;
  image: string | null;
  backgroundImage: string | null;
  location: string | null;
  bio: string | null;
  subscriptionTier: string | null;
  interests: string[];
  createdAt: Date;
  updatedAt: Date;
}
```

## Listing

```typescript
interface Listing {
  id: string;
  title: string;
  description: string;
  imageSrc: string;
  category: string;
  location: string;
  address: string | null;
  zipCode: string | null;
  phoneNumber: string | null;
  website: string | null;
  galleryImages: string[];
  userId: string;
  createdAt: Date;
  updatedAt: Date;

  // Relations
  user: User;
  services: Service[];
  employees: Employee[];
  storeHours: StoreHour[];
}
```

## Service

```typescript
interface Service {
  id: string;
  serviceName: string;
  price: number;
  category: string | null;
  listingId: string;
}
```

## Employee

```typescript
interface Employee {
  id: string;
  userId: string;
  listingId: string;
  jobTitle: string | null;
  serviceIds: string[];

  // Relations
  user: User;
}
```

## Reservation

```typescript
interface Reservation {
  id: string;
  userId: string;
  listingId: string;
  employeeId: string | null;
  date: Date;
  time: string;
  note: string | null;
  status: 'pending' | 'confirmed' | 'cancelled';
  totalPrice: number;
  createdAt: Date;

  // Relations
  user: User;
  listing: Listing;
  employee: Employee | null;
  services: Service[];
}
```

## StoreHour

```typescript
interface StoreHour {
  id: string;
  day: string;
  open: string;
  close: string;
  isClosed: boolean;
  listingId: string;
}
```

## Categories

Available listing categories:
- Hair
- Nails
- Skin
- Makeup
- Massage
- Fitness
- Wellness
- Barber
- Spa
- Other
