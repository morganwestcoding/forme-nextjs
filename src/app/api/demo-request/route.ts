import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, email, source = 'coming_soon' } = body;

    // Validate name
    if (!name || typeof name !== 'string') {
      return NextResponse.json(
        { error: 'Name is required' },
        { status: 400 }
      );
    }

    // Validate email
    if (!email || typeof email !== 'string') {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      );
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      );
    }

    // Check if email already exists in demo requests
    const existingRequest = await prisma.demoRequest.findUnique({
      where: { email: email.toLowerCase() }
    });

    if (existingRequest) {
      // Update the existing record
      const updatedRequest = await prisma.demoRequest.update({
        where: { email: email.toLowerCase() },
        data: {
          name,
          source,
          isActive: true,
          updatedAt: new Date()
        }
      });

      return NextResponse.json({
        message: 'Demo request updated successfully',
        data: { id: updatedRequest.id, email: updatedRequest.email }
      });
    }

    // Create new demo request
    const demoRequest = await prisma.demoRequest.create({
      data: {
        name,
        email: email.toLowerCase(),
        source
      }
    });

    return NextResponse.json({
      message: 'Demo request submitted successfully',
      data: { id: demoRequest.id, email: demoRequest.email }
    });

  } catch (error) {
    console.error('Demo request error:', error);

    // Handle Prisma unique constraint error specifically
    if (error instanceof Error && error.message.includes('Unique constraint')) {
      return NextResponse.json(
        { error: 'Demo request already exists for this email' },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to submit demo request' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

export async function GET() {
  try {
    // Get demo request count
    const count = await prisma.demoRequest.count({
      where: { isActive: true }
    });

    return NextResponse.json({
      message: 'Demo request count retrieved',
      count
    });

  } catch (error) {
    console.error('Demo request count error:', error);
    return NextResponse.json(
      { error: 'Failed to get demo request count' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
