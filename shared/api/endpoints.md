# ForMe API Endpoints

Base URL: Your deployed API URL (e.g., `https://forme.vercel.app/api`)

## Authentication

### POST /api/register
Create a new user account.

### POST /api/auth/[...nextauth]
NextAuth.js authentication endpoints.

### GET /api/check-email
Check if email exists.
- Query: `?email=user@example.com`

## Users

### GET /api/users/[id]
Get user profile by ID.

### PUT /api/users/[id]
Update user profile.

## Listings

### GET /api/listings
Get all listings with optional filters.

### GET /api/listings/[id]
Get listing by ID.

### POST /api/listings
Create a new listing.

### PUT /api/listings/[id]
Update a listing.

### DELETE /api/listings/[id]
Delete a listing.

### GET /api/listings/[id]/services
Get services for a listing.

## Reservations

### GET /api/reservations
Get user's reservations.

### POST /api/reservations
Create a new reservation.

### PUT /api/reservations/[id]
Update a reservation.

### DELETE /api/reservations/[id]
Cancel a reservation.

## Search

### GET /api/search
Search listings, users, services.
- Query: `?q=search+term`

## Favorites

### GET /api/favorites
Get user's favorites.

### POST /api/favorites/[listingId]
Add to favorites.

### DELETE /api/favorites/[listingId]
Remove from favorites.
