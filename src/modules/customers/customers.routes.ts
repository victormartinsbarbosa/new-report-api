import type { FastifyInstance } from "fastify";
import { CustomersRepository } from "./customers.repository.js";
import { CustomerService } from "./customers.service.js";
import { CustomerController } from "./customers.controller.js";

export async function customerRoutes(app: FastifyInstance) {
  const repository = new CustomersRepository();
  const service = new CustomerService(repository);
  const controller = new CustomerController(service);

  app.get("/api/customers", (req, reply) => controller.list(req, reply));
  app.get("/api/customers/:id", (req, reply) => controller.getById(req, reply));
  app.post("/api/customers", (req, reply) => controller.create(req, reply));
  app.put("/api/customers/:id", (req, reply) => controller.update(req, reply));
  app.delete("/api/customers/:id", (req, reply) =>
    controller.delete(req, reply),
  );
}
