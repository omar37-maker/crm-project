import UsersPageClient from "@/components/admin/users-page-client";
import { prisma } from "@/lib/prisma";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";



export default async function AdminUserPage() {
    const supabase = await createSupabaseServerClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) redirect("/login")
    
    const profile = await prisma.profile.findUnique({
        where: {
            id: user.id
        }
    })

    if (!profile || !profile.isActive) {
        
        await supabase.auth.signOut()
        redirect("/login")
    }

    if (profile.role !== "ADMIN") redirect("/dashboard")
    
    return(<UsersPageClient/>)
}