import { NextResponse } from 'next/server';

/**
 * Standard API error response utility.
 * Ensures consistent error response format across all API routes.
 */
export function apiError(message: string, status: number = 400) {
  return NextResponse.json({ error: message }, { status });
}

/**
 * Standard API success response utility.
 */
export function apiSuccess<T>(data: T, status: number = 200) {
  return NextResponse.json(data, { status });
}

/**
 * Standard error codes with their HTTP status codes
 */
export const ApiErrors = {
  // Authentication errors (401)
  UNAUTHORIZED: { message: 'Unauthorized', status: 401 },
  INVALID_CREDENTIALS: { message: 'Invalid credentials', status: 401 },
  SESSION_EXPIRED: { message: 'Session expired', status: 401 },

  // Authorization errors (403)
  FORBIDDEN: { message: 'Forbidden', status: 403 },
  NOT_OWNER: { message: 'You do not have permission to perform this action', status: 403 },

  // Client errors (400)
  BAD_REQUEST: { message: 'Bad request', status: 400 },
  VALIDATION_ERROR: { message: 'Validation error', status: 400 },
  MISSING_FIELDS: { message: 'Missing required fields', status: 400 },
  INVALID_INPUT: { message: 'Invalid input', status: 400 },

  // Not found errors (404)
  NOT_FOUND: { message: 'Resource not found', status: 404 },
  USER_NOT_FOUND: { message: 'User not found', status: 404 },
  LISTING_NOT_FOUND: { message: 'Listing not found', status: 404 },
  POST_NOT_FOUND: { message: 'Post not found', status: 404 },
  RESERVATION_NOT_FOUND: { message: 'Reservation not found', status: 404 },

  // Conflict errors (409)
  ALREADY_EXISTS: { message: 'Resource already exists', status: 409 },
  EMAIL_EXISTS: { message: 'Email already exists', status: 409 },

  // Server errors (500)
  INTERNAL_ERROR: { message: 'Internal server error', status: 500 },
  DATABASE_ERROR: { message: 'Database error', status: 500 },
} as const;

/**
 * Helper to return a predefined error
 */
export function apiErrorCode(errorCode: keyof typeof ApiErrors) {
  const error = ApiErrors[errorCode];
  return apiError(error.message, error.status);
}

/**
 * Safely parse JSON request body with error handling
 */
export async function parseBody<T>(request: Request): Promise<T | null> {
  try {
    return await request.json() as T;
  } catch {
    return null;
  }
}

/**
 * Wrap async route handlers with error handling
 */
export function withErrorHandler(
  handler: (request: Request, context?: any) => Promise<NextResponse>
) {
  return async (request: Request, context?: any) => {
    try {
      return await handler(request, context);
    } catch (error) {
      console.error('API Error:', error);

      if (error instanceof Error) {
        // Don't expose internal error messages in production
        const message = process.env.NODE_ENV === 'development'
          ? error.message
          : 'Internal server error';
        return apiError(message, 500);
      }

      return apiErrorCode('INTERNAL_ERROR');
    }
  };
}
