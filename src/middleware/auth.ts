import type { FastifyRequest, FastifyReply } from "fastify";
import { auth } from "../lib/auth.js";

export async function authenticate(
  request: FastifyRequest,
  reply: FastifyReply,
) {
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

  const session = await auth.api.getSession({
    headers,
  });

  if (!session) {
    return reply
      .status(401)
      .send({ error: "Não autorizado. Faça login para continuar." });
  }

  request.user = session.user;
  request.session = session.session;
}
