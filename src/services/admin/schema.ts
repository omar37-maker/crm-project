import { Role } from "@/generated/prisma/enums";
import { z } from "zod";

export const createUserSchema = z.object({
  email: z.email().transform((email) => email.toLowerCase().trim()),
  name: z.string().min(1).max(100),
  role: z.enum(Role),
});

export type CreateUserSchema = z.infer<typeof createUserSchema>;

export const updateUserSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  role: z.enum(Role).optional(),
});

export type UpdateUserSchema = z.infer<typeof updateUserSchema>;

export const listUsersParamsSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(20),
});

export type ListUsersParams = z.infer<typeof listUsersParamsSchema>;
