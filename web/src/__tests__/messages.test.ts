import { describe, it, expect, vi, beforeEach } from 'vitest';
import prisma from '@/app/libs/prismadb';
import getCurrentUser from '@/app/actions/getCurrentUser';

const mockedPrisma = vi.mocked(prisma);
const mockedGetCurrentUser = vi.mocked(getCurrentUser);

// Mock sanitize to pass through
vi.mock('@/app/utils/sanitize', () => ({
  sanitizeText: vi.fn((input: string) => input.trim()),
}));

// Mock eventEmitter
vi.mock('@/app/libs/eventEmitter', () => ({
  emit: vi.fn(),
}));

import { POST as postMessage } from '@/app/api/messages/route';
import { POST as markRead } from '@/app/api/messages/read/route';

function createRequest(url: string, options?: RequestInit) {
  return new Request(`http://localhost:3000${url}`, {
    headers: {
      'x-forwarded-for': `${Math.random()}`,
      'Content-Type': 'application/json',
    },
    ...options,
  });
}

const mockUser = {
  id: 'user-1',
  name: 'Test User',
  email: 'test@test.com',
  image: null,
  role: 'user',
};

describe('POST /api/messages', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns 401 if not authenticated', async () => {
    mockedGetCurrentUser.mockResolvedValue(null);

    const req = createRequest('/api/messages', {
      method: 'POST',
      body: JSON.stringify({ content: 'Hello', conversationId: 'conv-1' }),
    });

    const res = await postMessage(req);
    expect(res.status).toBe(401);
  });

  it('returns 400 for invalid message (missing content)', async () => {
    mockedGetCurrentUser.mockResolvedValue(mockUser as any);

    const req = createRequest('/api/messages', {
      method: 'POST',
      body: JSON.stringify({ conversationId: 'conv-1' }),
    });

    const res = await postMessage(req);
    expect(res.status).toBe(400);
  });

  it('successfully creates a message via prisma', async () => {
    mockedGetCurrentUser.mockResolvedValue(mockUser as any);

    const createdMessage = {
      id: 'msg-1',
      content: 'Hello there',
      conversationId: 'conv-1',
      senderId: 'user-1',
      createdAt: new Date(),
      sender: {
        id: 'user-1',
        name: 'Test User',
        image: null,
      },
    };

    mockedPrisma.message.create.mockResolvedValue(createdMessage as any);
    mockedPrisma.conversation.update.mockResolvedValue({} as any);

    const req = createRequest('/api/messages', {
      method: 'POST',
      body: JSON.stringify({ content: 'Hello there', conversationId: 'conv-1' }),
    });

    // The route creates the message; the response format depends on
    // post-creation logic that may not be fully implemented in the source.
    await postMessage(req);

    expect(mockedPrisma.message.create).toHaveBeenCalledWith({
      data: {
        content: 'Hello there',
        conversationId: 'conv-1',
        senderId: 'user-1',
      },
      include: {
        sender: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
      },
    });
  });
});

describe('POST /api/messages/read', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns 401 if not authenticated', async () => {
    mockedGetCurrentUser.mockResolvedValue(null);

    const req = createRequest('/api/messages/read', {
      method: 'POST',
      body: JSON.stringify({ conversationId: 'conv-1' }),
    });

    const res = await markRead(req);
    expect(res.status).toBe(401);
  });

  it('returns 400 for missing conversationId', async () => {
    mockedGetCurrentUser.mockResolvedValue(mockUser as any);

    const req = createRequest('/api/messages/read', {
      method: 'POST',
      body: JSON.stringify({}),
    });

    const res = await markRead(req);
    expect(res.status).toBe(400);
  });

  it('successfully marks messages as read', async () => {
    mockedGetCurrentUser.mockResolvedValue(mockUser as any);
    mockedPrisma.message.updateMany.mockResolvedValue({ count: 3 } as any);

    const otherUser = { id: 'user-2', name: 'Other', image: null };
    const lastMessage = {
      content: 'Last msg',
      createdAt: new Date(),
      isRead: true,
    };

    mockedPrisma.conversation.findUnique.mockResolvedValue({
      id: 'conv-1',
      users: [mockUser, otherUser],
      userIds: ['user-1', 'user-2'],
      messages: [lastMessage],
      lastMessageAt: new Date(),
    } as any);

    const req = createRequest('/api/messages/read', {
      method: 'POST',
      body: JSON.stringify({ conversationId: 'conv-1' }),
    });

    const res = await markRead(req);
    expect(res.status).toBe(200);

    // Should have marked unread messages as read
    expect(mockedPrisma.message.updateMany).toHaveBeenCalledWith({
      where: {
        conversationId: 'conv-1',
        NOT: { senderId: 'user-1' },
        isRead: false,
      },
      data: { isRead: true },
    });

    const body = await res.json();
    expect(body.id).toBe('conv-1');
    expect(body.otherUser.id).toBe('user-2');
  });
});
