/**
 * In-memory pub/sub for SSE (Server-Sent Events).
 *
 * API routes call `emit(userId, event)` after creating messages or
 * notifications.  The SSE endpoint subscribes each connected client
 * via `subscribe(userId, callback)` and streams events as they arrive.
 *
 * For multi-instance deployments swap this for Redis pub/sub.
 */

export interface SSEEvent {
  type:
    | 'MESSAGE_CREATED'
    | 'CONVERSATION_UPDATED'
    | 'NOTIFICATION_CREATED'
    | 'MESSAGES_READ'
    | 'TYPING';
  payload: Record<string, unknown>;
}

type Listener = (event: SSEEvent) => void;

const listeners = new Map<string, Set<Listener>>();

export function subscribe(userId: string, listener: Listener): () => void {
  if (!listeners.has(userId)) {
    listeners.set(userId, new Set());
  }
  listeners.get(userId)!.add(listener);

  // Return unsubscribe function
  return () => {
    const set = listeners.get(userId);
    if (set) {
      set.delete(listener);
      if (set.size === 0) listeners.delete(userId);
    }
  };
}

export function emit(userId: string, event: SSEEvent): void {
  const set = listeners.get(userId);
  if (!set) return;
  for (const listener of set) {
    listener(event);
  }
}

export function emitToMany(userIds: string[], event: SSEEvent): void {
  for (const id of userIds) {
    emit(id, event);
  }
}
