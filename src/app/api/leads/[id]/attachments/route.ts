import { AttachmentService } from "@/services/attachments";
import { authenticateUser } from "@/utils/authenticateUser";
import { handleRouteError } from "@/utils/handleRouteError";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    await authenticateUser();
    const { id } = await params;

    const attachments = await AttachmentService.listForLead(id);
    return NextResponse.json({ success: true, data: attachments });
  } catch (error) {
    return handleRouteError(error);
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const profile = await authenticateUser();
    const { id } = await params;

    // Validate request is multipart/form-data
    if (!req.headers.get("content-type")?.includes("multipart/form-data")) {
      return NextResponse.json(
        { error: "Invalid request content type" },
        { status: 400 },
      );
    }

    const formData = await req.formData();
    const file = formData.get("file");

    if (!file || !(file instanceof File)) {
      return NextResponse.json({ error: "File is required" }, { status: 400 });
    }

    const attachment = await AttachmentService.uploadForLead({
      leadId: id,
      file,
      userSnapshot: profile,
    });

    return NextResponse.json({ success: true, data: attachment });
  } catch (error) {
    return handleRouteError(error);
  }
}
