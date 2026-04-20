import { Role } from "@/generated/prisma/enums";
import { LeadService } from "@/services/lead";
import { reassignLeadsSchema } from "@/services/lead/schema";
import { authenticateUser } from "@/utils/authenticateUser";
import { handleRouteError } from "@/utils/handleRouteError";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const profile = await authenticateUser([Role.MANAGER, Role.ADMIN]);
    const body = await req.json();
    const data = reassignLeadsSchema.parse(body);

    const result = await LeadService.reassignLeads(profile, data);

    return NextResponse.json({ success: true, data: result });
  } catch (error) {
    return handleRouteError(error);
  }
}
