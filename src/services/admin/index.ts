import { create } from "domain"
import { get } from "http"
import { listUsers, getUserById, updateUserById, createUser, reactivateUser, deactivateUser } from "./service"
import { de } from "date-fns/locale"
import { createUserSchema, updateUserSchema } from "./schema"


export const AdminService = {
    user: {
        create: createUser,
        list: listUsers,
        get: getUserById,
        update: updateUserById,
        deactivate: deactivateUser,
        reactivate: reactivateUser,
    }
}as const

export const AdminSchema = {
    user: {
        create: createUserSchema,
        update: updateUserSchema,
    }
}as const