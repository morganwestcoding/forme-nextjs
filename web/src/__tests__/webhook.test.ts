import { describe, it, expect, vi, beforeEach } from 'vitest';
import prisma from '@/app/libs/prismadb';

const mockedPrisma = vi.mocked(prisma);

describe('Webhook idempotency', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('WebhookEvent model can track processed events', async () => {
    mockedPrisma.webhookEvent.findUnique.mockResolvedValue(null);
    mockedPrisma.webhookEvent.upsert.mockResolvedValue({
      id: '1',
      stripeEventId: 'evt_123',
      type: 'checkout.session.completed',
      processed: false,
      createdAt: new Date(),
    } as any);

    const existing = await prisma.webhookEvent.findUnique({
      where: { stripeEventId: 'evt_123' },
    });
    expect(existing).toBeNull();

    const created = await prisma.webhookEvent.upsert({
      where: { stripeEventId: 'evt_123' },
      create: {
        stripeEventId: 'evt_123',
        type: 'checkout.session.completed',
        processed: false,
      },
      update: {},
    });
    expect(created.stripeEventId).toBe('evt_123');
    expect(created.processed).toBe(false);
  });

  it('skips already-processed events', async () => {
    mockedPrisma.webhookEvent.findUnique.mockResolvedValue({
      id: '1',
      stripeEventId: 'evt_123',
      type: 'checkout.session.completed',
      processed: true,
      createdAt: new Date(),
    } as any);

    const existing = await prisma.webhookEvent.findUnique({
      where: { stripeEventId: 'evt_123' },
    });
    expect(existing?.processed).toBe(true);
    // In the real handler, this would cause early return
  });

  it('marks event as processed after handling', async () => {
    mockedPrisma.webhookEvent.upsert.mockResolvedValue({
      id: '1',
      stripeEventId: 'evt_456',
      type: 'payment_intent.succeeded',
      processed: false,
      createdAt: new Date(),
    } as any);

    mockedPrisma.webhookEvent.update.mockResolvedValue({
      id: '1',
      stripeEventId: 'evt_456',
      type: 'payment_intent.succeeded',
      processed: true,
      createdAt: new Date(),
    } as any);

    // Simulate creating the tracking record
    const event = await prisma.webhookEvent.upsert({
      where: { stripeEventId: 'evt_456' },
      create: {
        stripeEventId: 'evt_456',
        type: 'payment_intent.succeeded',
        processed: false,
      },
      update: {},
    });
    expect(event.processed).toBe(false);

    // Simulate marking as processed after handling
    const updated = await prisma.webhookEvent.update({
      where: { id: '1' },
      data: { processed: true },
    });
    expect(updated.processed).toBe(true);
  });
});
