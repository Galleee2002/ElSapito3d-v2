import { getCorsHeaders } from "./cors.ts";

export const createErrorResponse = (
  error: string,
  status: number,
  origin: string | null
): Response => {
  return new Response(JSON.stringify({ error }), {
    status,
    headers: {
      ...getCorsHeaders(origin),
      "Content-Type": "application/json",
    },
  });
};

export const createSuccessResponse = (
  data: unknown,
  origin: string | null
): Response => {
  return new Response(JSON.stringify(data), {
    status: 200,
    headers: {
      ...getCorsHeaders(origin),
      "Content-Type": "application/json",
    },
  });
};

export const handleOptionsRequest = (origin: string | null): Response => {
  return new Response(null, {
    status: 200,
    headers: {
      ...getCorsHeaders(origin),
      "Content-Length": "0",
    },
  });
};

