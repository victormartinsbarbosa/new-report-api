import type { FastifyRequest, FastifyReply } from "fastify";
import { auth } from "./auth.js";

export async function handleAuthRequest(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  const host =
    request.headers.host || `${request.hostname}:${process.env.PORT || 3001}`;
  const url = new URL(request.url, `${request.protocol}://${host}`);

  const headers = new Headers();
  Object.entries(request.headers).forEach(([key, value]) => {
    if (value !== undefined) {
      if (Array.isArray(value)) {
        value.forEach((v) => headers.append(key, v));
      } else {
        headers.set(key, value);
      }
    }
  });

  const requestInit: RequestInit = {
    method: request.method,
    headers,
  };

  if (!["GET", "HEAD"].includes(request.method) && request.body) {
    requestInit.body = JSON.stringify(request.body);
  }

  const webRequest = new Request(url.toString(), requestInit);

  const response = await auth.handler(webRequest);

  reply.status(response.status);
  response.headers.forEach((value, key) => {
    reply.header(key, value);
  });

  return reply.send(await response.text());
}
