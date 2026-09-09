import { BadRequestException } from "../../exceptions/bad-request-exception.js";
import { CustomerNotFoundException } from "./customer-not-found-exception.js";
import { CustomersRepository } from "./customers.repository.js";

import type {
  CreateCustomerDTO,
  UpdateCustomerDTO,
} from "./customers.schema.js";

export class CustomerService {
  constructor(private customersRepository: CustomersRepository) {}

  async listCustomers(organizationId: string, search?: string) {
    return this.customersRepository.findAll(organizationId, search);
  }

  async getCustomerById(id: string, organizationId: string) {
    const found = await this.customersRepository.findById(id, organizationId);
    if (!found) {
      throw new CustomerNotFoundException(id);
    }
    return found;
  }

  async createCustomer(organizationId: string, payload: CreateCustomerDTO) {
    if (!payload.name) {
      throw new BadRequestException(
        "O nome do cliente/razão social é obrigatório.",
      );
    }

    return this.customersRepository.create({
      id: crypto.randomUUID(),
      organizationId,
      ...payload,
    });
  }

  async updateCustomer(
    id: string,
    organizationId: string,
    payload: UpdateCustomerDTO,
  ) {
    await this.getCustomerById(id, organizationId);
    return this.customersRepository.update(id, organizationId, payload);
  }

  async deleteCustomer(id: string, organizationId: string) {
    await this.getCustomerById(id, organizationId);
    return this.customersRepository.delete(id, organizationId);
  }
}
