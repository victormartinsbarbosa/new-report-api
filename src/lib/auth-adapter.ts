import type { FastifyRequest, FastifyReply } from "fastify";
import { auth } from "./auth.js";

export async function handleAuthRequest(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  const url = new URL(request.url, `${request.protocol}://${request.hostname}`);

  // 1. Cria as opções base da requisição
  const requestInit: RequestInit = {
    method: request.method,
    headers: request.headers as HeadersInit,
  };

  if (!["GET", "HEAD"].includes(request.method) && request.body) {
    requestInit.body = JSON.stringify(request.body);
  }

  const webRequest = new Request(url, requestInit);

  const response = await auth.handler(webRequest);

  reply.status(response.status);
  response.headers.forEach((value, key) => {
    reply.header(key, value);
  });

  return reply.send(await response.text());
}
