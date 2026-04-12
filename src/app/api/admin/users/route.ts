import { authenticateUser } from "@/utils/authenticateUser";
import { NextRequest, NextResponse } from "next/server";
import { Role } from "@/generated/prisma/enums";
import { handleRouteError } from "@/utils/handleRouteError";
import { AdminSchema, AdminService } from "@/services/admin";


// GET /api/admin/users — List all users

export async function GET() {
  try {
    
    await authenticateUser([Role.ADMIN]);

    const users = await AdminService.user.list();

    return NextResponse.json({ success: true, data: users });
  } catch (error) {
    return handleRouteError(error);
  }
}


// POST /api/admin/users — Create a new user with invitation

export async function POST(request: NextRequest) {
  try {
    await authenticateUser([Role.ADMIN]);

    
    const body = await request.json();
    const data = AdminSchema.user.create.parse(body);

    const user = await AdminService.user.create(data);

    return NextResponse.json({ success: true, data: user }, { status: 201 });
  } catch (error) {
    return handleRouteError(error);
  }
}
