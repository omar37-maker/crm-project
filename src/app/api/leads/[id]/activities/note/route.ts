import { ActivityType } from "@/generated/prisma/enums";
import { ActivitySchema, ActivityService } from "@/services/activity";
import { authenticateUser } from "@/utils/authenticateUser";
import { handleRouteError } from "@/utils/handleRouteError";
import { NextRequest, NextResponse } from "next/server";

// POST /api/leads/[id]/activities/note
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const profile = await authenticateUser();
    const body = await request.json();

    const input = ActivitySchema.createNote.parse(body);

    const created = await ActivityService.create([
      {
        leadId: id,
        actorId: profile.id,
        type: ActivityType.NOTE,
        content: input.content,
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
