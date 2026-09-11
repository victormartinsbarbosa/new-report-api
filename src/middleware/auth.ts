import type { FastifyRequest, FastifyReply } from "fastify";
import { auth } from "../lib/auth.js";
import { UnauthorizedException } from "../exceptions/unauthorized-exception.js";

export async function authenticate(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  try {
    const sessionData = await auth.api.getSession({
      headers: request.headers as Record<string, any>,
    });

    if (!sessionData || !sessionData.session || !sessionData.user) {
      throw new UnauthorizedException(
        "Não autorizado. Faça login para continuar.",
      );
    }

    let activeOrgId = (sessionData.session as Record<string, any>)
      .activeOrganizationId;

    if (!activeOrgId) {
      const headerOrgId =
        request.headers["x-organization-id"] ||
        request.headers["organization-id"];

      if (typeof headerOrgId === "string" && headerOrgId.trim().length > 0) {
        activeOrgId = headerOrgId.trim();
      }
    }

    request.user = sessionData.user;
    request.session = {
      ...sessionData.session,
      activeOrganizationId: activeOrgId ?? undefined,
    };
  } catch (error) {
    if (error instanceof UnauthorizedException) {
      throw error;
    }

    throw new UnauthorizedException("Sessão inválida ou expirada.");
  }
}
