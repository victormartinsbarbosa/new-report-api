import type { FastifyInstance } from "fastify";
import { NewReportException } from "./new-report-exception.js";

export function setupExceptionHandler(app: FastifyInstance) {
  app.setErrorHandler((error, request, reply) => {
    if (error instanceof NewReportException) {
      return reply.status(error.statusCode).send({
        type: `https://api.seuapp.com/errors/${error.code.toLowerCase()}`,
        title: error.code,
        status: error.statusCode,
        detail: error.message,
        instance: request.url,
        ...(error.details ? { invalidParams: error.details } : {}),
        timestamp: new Date().toISOString(),
      });
    }

    app.log.error(error);

    return reply.status(500).send({
      type: `https://api.seuapp.com/errors/internal-server-error`,
      title: "INTERNAL_SERVER_ERROR",
      status: 500,
      detail: "Ocorreu um erro interno inesperado no servidor.",
      instance: request.url,
      timestamp: new Date().toISOString(),
    });
  });
}
