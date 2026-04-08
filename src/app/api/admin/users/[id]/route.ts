import { Role } from "@/generated/prisma/enums";
import { AdminSchema, AdminService } from "@/services/admin";
import { authenticateUser } from "@/utils/authenticateUser";
import { handleRouteError } from "@/utils/handleRouteError";
import { NextRequest, NextResponse } from "next/server";




export async function GET(

    _request: NextRequest,
    {params}: {params: Promise<{id: string}>},
) {
    try {
        await authenticateUser([Role.ADMIN])
        const { id } = await params
        const user = await AdminService.user.get(id)
        return NextResponse.json ({success: true, data:user})
    } catch (error) {
        return handleRouteError(error)
    }
    
}


export async function PUT(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
    
) {
    try {
        const profile = await authenticateUser([Role.ADMIN])
        const { id } = await params
        const body = await request.json()
        const data = AdminSchema.user.update.parse(body)
        const user = await AdminService.user.update(profile.id, id, data)
        return NextResponse.json({ success: true, data: user })
        
    } catch (error) {
        return handleRouteError(error)
    }
    
}