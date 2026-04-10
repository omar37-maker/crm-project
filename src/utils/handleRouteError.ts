import { deleteLead, LeadServiceError } from "@/services/lead/service";
import { NotificationServiceError } from "@/services/notification/service";
import { authenticateUser, AuthenticationError } from "./authenticateUser";
import { ZodError } from "zod";
import { NextRequest, NextResponse } from "next/server";
import { AdminServiceError } from "@/services/admin/service";
import { leadIdParamsSchema } from "@/services/lead/schema";

export const handleRouteError = (error: unknown) => {
  if (
    error instanceof AuthenticationError ||
    error instanceof LeadServiceError ||
    error instanceof NotificationServiceError ||
    error instanceof AdminServiceError
  ) {
    return NextResponse.json(
      { error: error.message },
      { status: error.statusCode },
    );
  }

  if (error instanceof ZodError) {
    return NextResponse.json(
      {
        error: error.flatten().fieldErrors,
      },
      { status: 400 },
    );
  }

  return NextResponse.json({ error: "Internal server error" }, { status: 500 });
};

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const profile = await authenticateUser();
    const { id } = leadIdParamsSchema.parse(await params);
    const lead = await deleteLead(profile, id);

    return NextResponse.json({ success: true, data: lead });
  } catch (error) {
    return handleRouteError(error);
  }
}