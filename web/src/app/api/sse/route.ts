// app/api/sse/route.ts — Server-Sent Events endpoint
import { subscribe, SSEEvent } from '@/app/libs/eventEmitter';
import getCurrentUser from '@/app/actions/getCurrentUser';
import { getUserFromRequest } from '@/app/utils/mobileAuth';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function GET(request: Request) {
  const currentUser =
    (await getUserFromRequest(request)) || (await getCurrentUser());

  if (!currentUser) {
    return new Response('Unauthorized', { status: 401 });
  }

  const stream = new ReadableStream({
    start(controller) {
      const encoder = new TextEncoder();

      const send = (data: string) => {
        try {
          controller.enqueue(encoder.encode(data));
        } catch {
          // Stream closed
        }
      };

      // Send initial keepalive so the connection is established
      send(': connected\n\n');

      // Heartbeat every 30s to keep the connection alive
      const heartbeat = setInterval(() => {
        send(': heartbeat\n\n');
      }, 30_000);

      // Subscribe to events for this user
      const unsubscribe = subscribe(currentUser.id, (event: SSEEvent) => {
        send(`event: ${event.type}\ndata: ${JSON.stringify(event.payload)}\n\n`);
      });

      // Clean up when client disconnects
      request.signal.addEventListener('abort', () => {
        clearInterval(heartbeat);
        unsubscribe();
      });
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache, no-transform',
      Connection: 'keep-alive',
      'X-Accel-Buffering': 'no',
    },
  });
}
