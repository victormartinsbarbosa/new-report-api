import type { FastifyRequest, FastifyReply } from "fastify";
import type { CustomerService } from "./customers.service.js";
import {
  createCustomerSchema,
  updateCustomerSchema,
  customerIdParamSchema,
  listCustomersQuerySchema,
} from "./customers.schema.js";
import { UnauthorizedException } from "../../exceptions/unauthorized-exception.js";

export class CustomerController {
  constructor(private customerService: CustomerService) {}

  private getActiveOrgId(request: FastifyRequest): string {
    const activeOrgId =
      request.session?.activeOrganizationId ||
      (request.headers["x-organization-id"] as string);

    if (!activeOrgId) {
      throw new UnauthorizedException("Organização ativa não selecionada.");
    }

    return activeOrgId;
  }

  async list(request: FastifyRequest, reply: FastifyReply) {
    const activeOrgId = this.getActiveOrgId(request);
    const { search } = listCustomersQuerySchema.parse(request.query);

    const customers = await this.customerService.listCustomers(
      activeOrgId,
      search,
    );
    return reply.status(200).send(customers);
  }

  async getById(request: FastifyRequest, reply: FastifyReply) {
    const activeOrgId = this.getActiveOrgId(request);
    const { id } = customerIdParamSchema.parse(request.params);

    const customer = await this.customerService.getCustomerById(
      id,
      activeOrgId,
    );
    return reply.status(200).send(customer);
  }

  async create(request: FastifyRequest, reply: FastifyReply) {
    const activeOrgId = this.getActiveOrgId(request);
    const body = createCustomerSchema.parse(request.body);

    const created = await this.customerService.createCustomer(
      activeOrgId,
      body,
    );
    return reply.status(201).send(created);
  }

  async update(request: FastifyRequest, reply: FastifyReply) {
    const activeOrgId = this.getActiveOrgId(request);
    const { id } = customerIdParamSchema.parse(request.params);
    const body = updateCustomerSchema.parse(request.body);

    const updated = await this.customerService.updateCustomer(
      id,
      activeOrgId,
      body,
    );
    return reply.status(200).send(updated);
  }

  async delete(request: FastifyRequest, reply: FastifyReply) {
    const activeOrgId = this.getActiveOrgId(request);
    const { id } = customerIdParamSchema.parse(request.params);

    await this.customerService.deleteCustomer(id, activeOrgId);
    return reply.status(204).send();
  }
}
