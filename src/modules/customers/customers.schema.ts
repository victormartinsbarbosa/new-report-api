import { z } from "zod";

export const createCustomerSchema = z.object({
  name: z
    .string("O nome do cliente/razão social é obrigatório.")
    .min(2, "O nome deve ter pelo menos 2 caracteres."),

  document: z.string().optional().nullable(),
  address: z.string().optional().nullable(),

  contactEmail: z
    .email({ message: "Informe um e-mail de contato válido." })
    .optional()
    .nullable()
    .or(z.literal("")),

  contactPhone: z.string().optional().nullable(),
});

export const updateCustomerSchema = createCustomerSchema.partial();

export const customerIdParamSchema = z.object({
  id: z.uuid("ID de cliente inválido."),
});

export const listCustomersQuerySchema = z.object({
  search: z.string().optional(),
});

export type CreateCustomerDTO = z.infer<typeof createCustomerSchema>;
export type UpdateCustomerDTO = z.infer<typeof updateCustomerSchema>;
