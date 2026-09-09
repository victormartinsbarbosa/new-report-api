import { Session, User } from "better-auth/types";

declare module "fastify" {
  interface FastifyRequest {
    user?: User;
    session?: Session & {
      activeOrganizationId?: string;
    };
  }
}
