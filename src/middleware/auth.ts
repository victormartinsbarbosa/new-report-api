import type { FastifyRequest, FastifyReply } from "fastify";
import { auth } from "../lib/auth.js";

export async function authenticate(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  const session = await auth.api.getSession({
    headers: request.headers as Record<string, string>,
  });

  if (!session) {
    return reply
      .status(401)
      .send({ error: "Não autorizado. Faça login para continuar." });
  }

  request.user = session.user;
  request.session = session.session;
}
