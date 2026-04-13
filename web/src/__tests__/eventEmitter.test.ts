import { describe, it, expect, vi } from 'vitest';
import { subscribe, emit, emitToMany, type SSEEvent } from '@/app/libs/eventEmitter';

const makeEvent = (type: SSEEvent['type'] = 'MESSAGE_CREATED'): SSEEvent => ({
  type,
  payload: { text: 'hello' },
});

describe('eventEmitter', () => {
  it('subscribe registers a listener and returns an unsubscribe function', () => {
    const listener = vi.fn();
    const unsub = subscribe('user-a', listener);
    expect(typeof unsub).toBe('function');

    emit('user-a', makeEvent());
    expect(listener).toHaveBeenCalledTimes(1);

    unsub();
  });

  it('emit calls registered listeners with the event', () => {
    const listener = vi.fn();
    const unsub = subscribe('user-b', listener);

    const event = makeEvent('NOTIFICATION_CREATED');
    emit('user-b', event);

    expect(listener).toHaveBeenCalledWith(event);
    unsub();
  });

  it('emit does nothing if no listeners for that userId', () => {
    // Should not throw
    expect(() => emit('nonexistent-user', makeEvent())).not.toThrow();
  });

  it('emitToMany emits to multiple userIds', () => {
    const listenerC = vi.fn();
    const listenerD = vi.fn();
    const unsubC = subscribe('user-c', listenerC);
    const unsubD = subscribe('user-d', listenerD);

    const event = makeEvent('TYPING');
    emitToMany(['user-c', 'user-d'], event);

    expect(listenerC).toHaveBeenCalledWith(event);
    expect(listenerD).toHaveBeenCalledWith(event);

    unsubC();
    unsubD();
  });

  it('unsubscribe removes the listener', () => {
    const listener = vi.fn();
    const unsub = subscribe('user-e', listener);

    unsub();

    emit('user-e', makeEvent());
    expect(listener).not.toHaveBeenCalled();
  });

  it('multiple subscribers for same userId all receive events', () => {
    const listener1 = vi.fn();
    const listener2 = vi.fn();
    const unsub1 = subscribe('user-f', listener1);
    const unsub2 = subscribe('user-f', listener2);

    const event = makeEvent();
    emit('user-f', event);

    expect(listener1).toHaveBeenCalledWith(event);
    expect(listener2).toHaveBeenCalledWith(event);

    unsub1();
    unsub2();
  });
});
