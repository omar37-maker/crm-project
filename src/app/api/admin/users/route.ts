import { Role } from "@/generated/prisma/enums";
import { AdminService } from "@/services/admin";
import { createUserSchema } from "@/services/admin/schema";
import { authenticateUser } from "@/utils/authenticateUser";
import { handleRouteError } from "@/utils/handleRouteError";
import { NextRequest, NextResponse } from "next/server";



export async function GET() {
    
    try {
        await authenticateUser ([Role.ADMIN] )
        const users = await AdminService.user.list()
        return NextResponse.json({ success: true, data: users })
        
    } catch (error) {
        
        return handleRouteError(error)
    }
}


export async function POST(request: NextRequest) {
    
    try {
        await authenticateUser([Role.ADMIN])

        const body = await request.json()
        const data = createUserSchema.parse(body)

        const user = await AdminService.user.create(data)

        return NextResponse.json({success:true, data:true}, {status: 201})
    } catch (error) {
        return handleRouteError(error)
    }
}