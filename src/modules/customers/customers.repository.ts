import { db } from "../../db/index.js";
import { customer } from "../../db/schema.js";
import { eq, and, ilike, or, desc } from "drizzle-orm";
import type { UpdateCustomerDTO } from "./customers.schema.js";

export type CreateCustomerInput = typeof customer.$inferInsert;
export type UpdateCustomerInput = UpdateCustomerDTO;

export class CustomersRepository {
  async findAll(organizationId: string, search?: string) {
    const baseCondition = eq(customer.organizationId, organizationId);

    if (!search) {
      return db
        .select()
        .from(customer)
        .where(baseCondition)
        .orderBy(desc(customer.createdAt));
    }

    return db
      .select()
      .from(customer)
      .where(
        and(
          baseCondition,
          or(
            ilike(customer.name, `%${search}%`),
            ilike(customer.document, `%${search}%`),
          ),
        ),
      )
      .orderBy(desc(customer.createdAt));
  }

  async findById(id: string, organizationId: string) {
    const [found] = await db
      .select()
      .from(customer)
      .where(
        and(eq(customer.id, id), eq(customer.organizationId, organizationId)),
      );
    return found || null;
  }

  async create(data: CreateCustomerInput) {
    const [created] = await db.insert(customer).values(data).returning();
    return created;
  }

  async update(id: string, organizationId: string, data: UpdateCustomerInput) {
    const [updated] = await db
      .update(customer)
      .set({ ...data, updatedAt: new Date() })
      .where(
        and(eq(customer.id, id), eq(customer.organizationId, organizationId)),
      )
      .returning();
    return updated || null;
  }

  async delete(id: string, organizationId: string) {
    const [deleted] = await db
      .delete(customer)
      .where(
        and(eq(customer.id, id), eq(customer.organizationId, organizationId)),
      )
      .returning();
    return !!deleted;
  }
}
