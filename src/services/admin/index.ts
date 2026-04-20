import {
  createUserSchema,
  listUsersParamsSchema,
  updateUserSchema,
} from "./schema";
import {
  createUser,
  deactivateUser,
  getUserById,
  listUsers,
  reactivateUser,
  resendInvite,
  updateUserById,
} from "./service";

export const AdminService = {
  user: {
    create: createUser,
    list: listUsers,
    get: getUserById,
    update: updateUserById,
    deactivate: deactivateUser,
    reactivate: reactivateUser,
    resendInvite,
  },
} as const;

export const AdminSchema = {
  user: {
    create: createUserSchema,
    update: updateUserSchema,
    list: listUsersParamsSchema,
  },
} as const;
