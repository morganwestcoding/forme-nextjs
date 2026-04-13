import { describe, it, expect } from 'vitest';
import { apiError, apiSuccess, apiErrorCode, ApiErrors } from '@/app/utils/api';

describe('apiError', () => {
  it('returns a Response with the correct status and error message', async () => {
    const response = apiError('Something went wrong', 422);
    expect(response.status).toBe(422);
    const body = await response.json();
    expect(body).toEqual({ error: 'Something went wrong' });
  });

  it('defaults to status 400', async () => {
    const response = apiError('Bad request');
    expect(response.status).toBe(400);
  });
});

describe('apiSuccess', () => {
  it('returns a 200 Response with data', async () => {
    const response = apiSuccess({ id: '1', name: 'Test' });
    expect(response.status).toBe(200);
    const body = await response.json();
    expect(body).toEqual({ id: '1', name: 'Test' });
  });
});

describe('apiErrorCode', () => {
  it('returns 401 for UNAUTHORIZED', async () => {
    const response = apiErrorCode('UNAUTHORIZED');
    expect(response.status).toBe(401);
    const body = await response.json();
    expect(body).toEqual({ error: ApiErrors.UNAUTHORIZED.message });
  });

  it('returns 404 for NOT_FOUND', async () => {
    const response = apiErrorCode('NOT_FOUND');
    expect(response.status).toBe(404);
    const body = await response.json();
    expect(body).toEqual({ error: ApiErrors.NOT_FOUND.message });
  });

  it('returns 403 for FORBIDDEN', async () => {
    const response = apiErrorCode('FORBIDDEN');
    expect(response.status).toBe(403);
    const body = await response.json();
    expect(body).toEqual({ error: ApiErrors.FORBIDDEN.message });
  });
});
