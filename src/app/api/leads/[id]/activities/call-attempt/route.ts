import { ActivityType } from "@/generated/prisma/enums";
import { ActivitySchema, ActivityService } from "@/services/activity";
import { authenticateUser } from "@/utils/authenticateUser";
import { handleRouteError } from "@/utils/handleRouteError";
import { NextRequest, NextResponse } from "next/server";

// POST /api/leads/[id]/activities/call-attempt
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const profile = await authenticateUser();
    const body = await request.json();

    const input = ActivitySchema.createCallAttempt.parse(body);
    const content = input.notes
      ? `${input.outcome} — ${input.notes}`
      : input.outcome;

    const created = await ActivityService.create([
      {
        leadId: id,
        actorId: profile.id,
        type: ActivityType.CALL_ATTEMPT,
        content,
      },
    ]);

    if (!created.success) {
      return NextResponse.json({ error: created.errors }, { status: 400 });
    }

    return NextResponse.json({ success: true, data: created }, { status: 201 });
  } catch (error) {
    return handleRouteError(error);
  }
}
