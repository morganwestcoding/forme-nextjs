'use client';

import { useEffect, useRef, useCallback } from 'react';

type SSEEventType =
  | 'MESSAGE_CREATED'
  | 'CONVERSATION_UPDATED'
  | 'NOTIFICATION_CREATED'
  | 'MESSAGES_READ'
  | 'TYPING';

type SSEListener = (data: any) => void;

const listeners = new Map<SSEEventType, Set<SSEListener>>();
let eventSource: EventSource | null = null;
let subscriberCount = 0;

function connectSSE() {
  if (eventSource) return;

  eventSource = new EventSource('/api/sse');

  eventSource.onerror = () => {
    // Auto-reconnect is built into EventSource
    // but if it closes, clean up and retry
    if (eventSource?.readyState === EventSource.CLOSED) {
      eventSource = null;
      // Reconnect after 3 seconds
      setTimeout(() => {
        if (subscriberCount > 0) connectSSE();
      }, 3000);
    }
  };

  // Register handlers for each event type
  const eventTypes: SSEEventType[] = [
    'MESSAGE_CREATED',
    'CONVERSATION_UPDATED',
    'NOTIFICATION_CREATED',
    'MESSAGES_READ',
    'TYPING',
  ];

  for (const type of eventTypes) {
    eventSource.addEventListener(type, (e: MessageEvent) => {
      try {
        const data = JSON.parse(e.data);
        const set = listeners.get(type);
        if (set) {
          for (const fn of set) fn(data);
        }
      } catch {
        // Invalid JSON, ignore
      }
    });
  }
}

function disconnectSSE() {
  if (eventSource) {
    eventSource.close();
    eventSource = null;
  }
}

/**
 * Subscribe to SSE events. The connection is shared across all hook instances.
 * When the last subscriber unmounts, the connection is closed.
 */
export function useSSE(type: SSEEventType, callback: SSEListener) {
  const callbackRef = useRef(callback);
  callbackRef.current = callback;

  const stableCallback = useCallback((data: any) => {
    callbackRef.current(data);
  }, []);

  useEffect(() => {
    // Add listener
    if (!listeners.has(type)) {
      listeners.set(type, new Set());
    }
    listeners.get(type)!.add(stableCallback);

    // Connect if first subscriber
    subscriberCount++;
    if (subscriberCount === 1) {
      connectSSE();
    }

    return () => {
      // Remove listener
      const set = listeners.get(type);
      if (set) {
        set.delete(stableCallback);
        if (set.size === 0) listeners.delete(type);
      }

      // Disconnect if last subscriber
      subscriberCount--;
      if (subscriberCount === 0) {
        disconnectSSE();
      }
    };
  }, [type, stableCallback]);
}
