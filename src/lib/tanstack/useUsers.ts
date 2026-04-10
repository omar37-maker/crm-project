import { Role } from "@/generated/prisma/enums";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "../api";
import { CreateUserSchema, UpdateUserSchema } from "@/services/admin/schema";



export type User = {
  id: string;
  email: string;
  name: string;
  role: Role;
  isActive: boolean;
  createdAt: Date;
};

export function useUsers() {
    return useQuery<User[]>({
        queryKey: ["admin", "users"],
        queryFn: async () => {
            const {data} = await api.get("/admin/users")
            return data.data
        }
    })
}

export function useCreateUser() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (user: CreateUserSchema): Promise<User> => {
            const { data } = await api.post("/admin/users", user)
            return data.data
        },

        onSuccess: () => {
            queryClient.invalidateQueries({queryKey: ["admin", "users"]})
        }
    })
}


export function useUpdateUser(id: string) {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: async (user: UpdateUserSchema): Promise<User> => {
            const { data } = await api.put(`/admin/users/${id}`, user)
            return data.data
        },
        onSuccess: () => {
            queryClient.invalidateQueries({queryKey: ["admin", "users"]})
        }
    })
    
}


export function useDeactivateUser(id: string) {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: async (): Promise<User> => {
            const { data } = await api.post(`/admin/users/${id}/deactivate`)
            return data.data
        },
        onSuccess: () => {
            queryClient.invalidateQueries({queryKey: ["admin", "users"]})
        }
    })
}


export function useReactivateUser(id: string) {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: async (): Promise<User> => {
            const { data } = await api.post(`/admin/users/${id}/reactivate`)
            return data.data

        },
        onSuccess: () => {
            queryClient.invalidateQueries({queryKey: ["admin", "users"]})
        }
    })
}