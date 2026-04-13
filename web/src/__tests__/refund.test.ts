import { describe, it, expect, vi, beforeEach } from 'vitest';
import prisma from '@/app/libs/prismadb';
import getCurrentUser from '@/app/actions/getCurrentUser';

const mockedPrisma = vi.mocked(prisma);
const mockedGetCurrentUser = vi.mocked(getCurrentUser);

vi.mock('stripe', () => {
  const StripeMock = function () {
    return {
      refunds: {
        create: vi.fn().mockResolvedValue({ id: 're_test_123', amount: 5000 }),
      },
    };
  };
  return { default: StripeMock };
});

// Must import after mocks are set up
import { POST } from '@/app/api/reservations/[reservationId]/refund/route';

function createRequest(url: string, options?: RequestInit) {
  return new Request(`http://localhost:3000${url}`, {
    headers: {
      'x-forwarded-for': `${Math.random()}`,
      'Content-Type': 'application/json',
    },
    ...options,
  });
}

const mockListing = {
  id: 'listing-1',
  userId: 'owner-1',
  title: 'Test Listing',
};

const mockReservation = {
  id: 'res-1',
  userId: 'customer-1',
  listingId: 'listing-1',
  listing: mockListing,
  paymentStatus: 'completed',
  paymentIntentId: 'pi_test_123',
  refundStatus: null,
  refundAmount: null,
  refundReason: null,
  refundId: null,
  refundedAt: null,
  status: 'confirmed',
  serviceName: 'Haircut',
};

const mockCustomer = { id: 'customer-1', name: 'Customer', email: 'c@test.com', role: 'user' };
const mockOwner = { id: 'owner-1', name: 'Owner', email: 'o@test.com', role: 'user' };
const mockAdmin = { id: 'admin-1', name: 'Admin', email: 'a@test.com', role: 'admin' };
const mockStranger = { id: 'stranger-1', name: 'Stranger', email: 's@test.com', role: 'user' };

describe('POST /api/reservations/[reservationId]/refund', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns 401 if not authenticated', async () => {
    mockedGetCurrentUser.mockResolvedValue(null);

    const req = createRequest('/api/reservations/res-1/refund', {
      method: 'POST',
      body: JSON.stringify({}),
    });

    const res = await POST(req, { params: { reservationId: 'res-1' } });
    expect(res.status).toBe(401);
  });

  it('returns 404 if reservation not found', async () => {
    mockedGetCurrentUser.mockResolvedValue(mockCustomer as any);
    mockedPrisma.reservation.findUnique.mockResolvedValue(null);

    const req = createRequest('/api/reservations/nonexistent/refund', {
      method: 'POST',
      body: JSON.stringify({}),
    });

    const res = await POST(req, { params: { reservationId: 'nonexistent' } });
    expect(res.status).toBe(404);
  });

  it('returns 403 if user is not customer, owner, or admin', async () => {
    mockedGetCurrentUser.mockResolvedValue(mockStranger as any);
    mockedPrisma.reservation.findUnique.mockResolvedValue(mockReservation as any);

    const req = createRequest('/api/reservations/res-1/refund', {
      method: 'POST',
      body: JSON.stringify({}),
    });

    const res = await POST(req, { params: { reservationId: 'res-1' } });
    expect(res.status).toBe(403);
  });

  it('returns 400 if payment not completed', async () => {
    mockedGetCurrentUser.mockResolvedValue(mockCustomer as any);
    mockedPrisma.reservation.findUnique.mockResolvedValue({
      ...mockReservation,
      paymentStatus: 'pending',
    } as any);

    const req = createRequest('/api/reservations/res-1/refund', {
      method: 'POST',
      body: JSON.stringify({}),
    });

    const res = await POST(req, { params: { reservationId: 'res-1' } });
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error).toMatch(/not been completed/i);
  });

  it('returns 400 if already refunded', async () => {
    mockedGetCurrentUser.mockResolvedValue(mockCustomer as any);
    mockedPrisma.reservation.findUnique.mockResolvedValue({
      ...mockReservation,
      refundStatus: 'completed',
    } as any);

    const req = createRequest('/api/reservations/res-1/refund', {
      method: 'POST',
      body: JSON.stringify({}),
    });

    const res = await POST(req, { params: { reservationId: 'res-1' } });
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error).toMatch(/already been refunded/i);
  });

  it('returns 400 if no paymentIntentId', async () => {
    mockedGetCurrentUser.mockResolvedValue(mockCustomer as any);
    mockedPrisma.reservation.findUnique.mockResolvedValue({
      ...mockReservation,
      paymentIntentId: null,
    } as any);

    const req = createRequest('/api/reservations/res-1/refund', {
      method: 'POST',
      body: JSON.stringify({}),
    });

    const res = await POST(req, { params: { reservationId: 'res-1' } });
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error).toMatch(/no payment found/i);
  });

  it('customer request creates status "requested" and notifies owner', async () => {
    mockedGetCurrentUser.mockResolvedValue(mockCustomer as any);
    mockedPrisma.reservation.findUnique.mockResolvedValue(mockReservation as any);
    mockedPrisma.reservation.update.mockResolvedValue({} as any);
    mockedPrisma.notification.create.mockResolvedValue({} as any);

    const req = createRequest('/api/reservations/res-1/refund', {
      method: 'POST',
      body: JSON.stringify({ reason: 'Changed my mind' }),
    });

    const res = await POST(req, { params: { reservationId: 'res-1' } });
    expect(res.status).toBe(200);

    const body = await res.json();
    expect(body.status).toBe('requested');

    // Should update reservation with requested status
    expect(mockedPrisma.reservation.update).toHaveBeenCalledWith({
      where: { id: 'res-1' },
      data: {
        refundStatus: 'requested',
        refundReason: 'Changed my mind',
      },
    });

    // Should notify the listing owner
    expect(mockedPrisma.notification.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        type: 'REFUND_REQUESTED',
        userId: 'owner-1',
      }),
    });
  });

  it('owner processes refund immediately via Stripe and returns "completed"', async () => {
    mockedGetCurrentUser.mockResolvedValue(mockOwner as any);
    mockedPrisma.reservation.findUnique.mockResolvedValue(mockReservation as any);
    mockedPrisma.reservation.update.mockResolvedValue({} as any);
    mockedPrisma.notification.create.mockResolvedValue({} as any);

    const req = createRequest('/api/reservations/res-1/refund', {
      method: 'POST',
      body: JSON.stringify({ reason: 'Service issue' }),
    });

    const res = await POST(req, { params: { reservationId: 'res-1' } });
    expect(res.status).toBe(200);

    const body = await res.json();
    expect(body.status).toBe('completed');
    expect(body.refundId).toBe('re_test_123');
    expect(body.amount).toBe(5000);

    // Should update reservation with completed refund data
    expect(mockedPrisma.reservation.update).toHaveBeenCalledWith({
      where: { id: 'res-1' },
      data: expect.objectContaining({
        refundStatus: 'completed',
        refundAmount: 5000,
        refundId: 're_test_123',
        paymentStatus: 'refunded',
        status: 'cancelled',
      }),
    });

    // Should notify the customer (since owner is not the customer)
    expect(mockedPrisma.notification.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        type: 'REFUND_COMPLETED',
        userId: 'customer-1',
      }),
    });
  });

  it('admin processes refund immediately via Stripe and returns "completed"', async () => {
    mockedGetCurrentUser.mockResolvedValue(mockAdmin as any);
    mockedPrisma.reservation.findUnique.mockResolvedValue(mockReservation as any);
    mockedPrisma.reservation.update.mockResolvedValue({} as any);
    mockedPrisma.notification.create.mockResolvedValue({} as any);

    const req = createRequest('/api/reservations/res-1/refund', {
      method: 'POST',
      body: JSON.stringify({}),
    });

    const res = await POST(req, { params: { reservationId: 'res-1' } });
    expect(res.status).toBe(200);

    const body = await res.json();
    expect(body.status).toBe('completed');
    expect(body.refundId).toBe('re_test_123');
  });
});
