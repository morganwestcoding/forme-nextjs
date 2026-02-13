import { SignJWT, jwtVerify } from 'jose';
import prisma from '@/app/libs/prismadb';

const secret = new TextEncoder().encode(process.env.NEXTAUTH_SECRET);

export async function signMobileToken(userId: string, email: string): Promise<string> {
  return new SignJWT({ userId, email })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('30d')
    .sign(secret);
}

export async function verifyMobileToken(token: string) {
  try {
    const { payload } = await jwtVerify(token, secret);
    return payload as { userId: string; email: string };
  } catch {
    return null;
  }
}

/**
 * Get the current user from a request, checking Bearer token first,
 * then falling back to NextAuth session.
 */
export async function getUserFromRequest(request: Request) {
  const authHeader = request.headers.get('Authorization');
  if (authHeader?.startsWith('Bearer ')) {
    const token = authHeader.slice(7);
    const payload = await verifyMobileToken(token);
    if (payload?.userId) {
      const user = await prisma.user.findUnique({
        where: { id: payload.userId },
      });
      if (user) {
        return {
          ...user,
          createdAt: user.createdAt.toISOString(),
          updatedAt: user.updatedAt.toISOString(),
          emailVerified: user.emailVerified?.toISOString() || null,
          bio: user.bio || 'No Bio Provided Yet..',
          isSubscribed: user.isSubscribed,
          subscriptionTier: user.subscriptionTier,
          location: user.location,
          image: user.image,
          imageSrc: user.imageSrc,
          galleryImages: user.galleryImages || [],
          following: user.following || [],
          followers: user.followers || [],
          role: user.role || 'user',
        };
      }
    }
  }
  return null;
}
