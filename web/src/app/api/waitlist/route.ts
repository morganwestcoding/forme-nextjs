// app/api/waitlist/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { apiError, apiErrorCode } from '@/app/utils/api';

const prisma = new PrismaClient();

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, source = 'coming_soon' } = body;

    // Validate email
    if (!email || typeof email !== 'string') {
      return apiError('Email is required', 400);
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return apiError('Invalid email format', 400);
    }

    // Check if email already exists
    const existingEmail = await prisma.waitlist.findUnique({
      where: { email: email.toLowerCase() }
    });

    if (existingEmail) {
      // Update the existing record instead of creating duplicate
      const updatedEntry = await prisma.waitlist.update({
        where: { email: email.toLowerCase() },
        data: {
          source,
          isActive: true,
          updatedAt: new Date()
        }
      });

      return NextResponse.json({
        message: 'Email updated successfully',
        data: { id: updatedEntry.id, email: updatedEntry.email }
      });
    }

    // Create new waitlist entry
    const waitlistEntry = await prisma.waitlist.create({
      data: {
        email: email.toLowerCase(),
        source
      }
    });

    return NextResponse.json({
      message: 'Email added to waitlist successfully',
      data: { id: waitlistEntry.id, email: waitlistEntry.email }
    });

  } catch (error) {
    console.error('Waitlist signup error:', error);
    
    // Handle Prisma unique constraint error specifically
    if (error instanceof Error && error.message.includes('Unique constraint')) {
      return apiError('Email already exists in waitlist', 409);
    }

    return apiError('Failed to add email to waitlist', 500);
  } finally {
    await prisma.$disconnect();
  }
}

export async function GET() {
  try {
    // Get waitlist count for admin purposes
    const count = await prisma.waitlist.count({
      where: { isActive: true }
    });

    return NextResponse.json({
      message: 'Waitlist count retrieved',
      count
    });

  } catch (error) {
    console.error('Waitlist count error:', error);
    return apiError('Failed to get waitlist count', 500);
  } finally {
    await prisma.$disconnect();
  }
}