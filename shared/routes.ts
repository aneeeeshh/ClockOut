import { z } from 'zod';

export const api = {
  time: {
    get: {
      method: 'GET' as const,
      path: '/api/time',
      responses: {
        200: z.object({
          iso: z.string(),
          ist: z.string(),
        }),
      },
    },
  },
};

export function buildUrl(path: string, params?: Record<string, string | number>): string {
  let url = path;
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (url.includes(`:${key}`)) {
        url = url.replace(`:${key}`, String(value));
      }
    });
  }
  return url;
}
