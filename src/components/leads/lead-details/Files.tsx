"use client";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  useAttachments,
  useDeleteAttachment,
  useUploadAttachment,
} from "@/lib/tanstack/useAttachments";
import {
  ALLOWED_MIME_TYPES,
  AttachmentListItem,
  MAX_FILE_SIZE_BYTES,
} from "@/services/attachments/schema";
import {
  Download,
  FileIcon,
  FileImage,
  FileText,
  Loader2,
  LucideIcon,
  Trash2,
  Upload,
} from "lucide-react";
import { useRef, useState } from "react";
import { toast } from "sonner";

const ACCEPTED_FILE_EXTENSIONS =
  ".jpg,.jpeg,.png,.webp,.pdf,.txt,.docx,.xlsx,.mp4,.mpeg,.mov";

const Files = ({ leadId }: { leadId: string }) => {
  const [dragging, setDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { data: attachments, isLoading, isError } = useAttachments(leadId);
  const uploadMutation = useUploadAttachment(leadId);

  const handleFiles = (files: FileList | null) => {
    if (!files || files.length === 0) return;
    const file = files[0];

    if (file.size > MAX_FILE_SIZE_BYTES) {
      toast.error(
        `File is too large. Maximum size is ${formatSize(MAX_FILE_SIZE_BYTES)}.`,
      );
      return;
    }

    if (!ALLOWED_MIME_TYPES.includes(file.type)) {
      toast.error(`File type not allowed: ${file.type}`);
      return;
    }

    uploadMutation.mutate(file, {
      onSuccess: () => {
        toast.success(`${file.name} uploaded.`);
      },
      onError: (error) => {
        toast.error(error.message || "Failed to upload attachment.");
      },
    });
  };

  return (
    <Card>
      <CardContent className="space-y-4 py-6">
        {/* Upload zone */}
        <div
          className={`flex flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed p-8 transition ${
            dragging
              ? "border-primary bg-primary/5"
              : "border-muted-foreground/25"
          }`}
          onDragOver={(e) => {
            e.preventDefault();
            setDragging(true);
          }}
          onDragLeave={() => setDragging(false)}
          onDrop={(e) => {
            e.preventDefault();
            setDragging(false);
            handleFiles(e.dataTransfer.files);
          }}
        >
          <Upload className="h-8 w-8 text-muted-foreground" />
          <p className="text-sm text-muted-foreground">
            Drag a file here, or click to upload
          </p>
          <p className="text-xs text-muted-foreground">
            PDF, image, doc, spreadsheet, video. Up to 10 MB.
          </p>

          <input
            ref={fileInputRef}
            type="file"
            accept={ACCEPTED_FILE_EXTENSIONS}
            className="hidden"
            onChange={(e) => {
              handleFiles(e.target.files);
              // Reset so picking the same file twice still fires onChange.
              e.target.value = "";
            }}
          />

          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={uploadMutation.isPending}
            onClick={() => fileInputRef.current?.click()}
          >
            {uploadMutation.isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Uploading...
              </>
            ) : (
              <>Choose file</>
            )}
          </Button>
        </div>

        {/* File list */}
        {isLoading ? (
          <div className="space-y-2">
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
          </div>
        ) : isError ? (
          <p className="text-sm text-destructive">
            Failed to load attachments.
          </p>
        ) : !attachments || attachments.length === 0 ? (
          <p className="py-6 text-center text-sm text-muted-foreground">
            No files yet. Uploads appear here and in the activity timeline.
          </p>
        ) : (
          <ul className="divide-y rounded-md border">
            {attachments.map((a) => {
              const Icon = iconFor(a.mimeType);
              return (
                <FileRow
                  key={a.id}
                  attachment={a}
                  Icon={Icon}
                  leadId={leadId}
                />
              );
            })}
          </ul>
        )}
      </CardContent>
    </Card>
  );
};

export default Files;

// ------------------------------------------------------------------
// FileRow: one row per attachment
// ------------------------------------------------------------------
function FileRow({
  attachment,
  Icon,
  leadId,
}: {
  attachment: AttachmentListItem;
  Icon: LucideIcon;
  leadId: string;
}) {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const deleteMutation = useDeleteAttachment(leadId);

  const handleDelete = () => {
    deleteMutation.mutate(attachment.id, {
      onSuccess: () => {
        toast.success(`Deleted ${attachment.fileName}.`);
        setShowDeleteDialog(false);
      },
      onError: (error) => {
        toast.error(error.message || "Failed to delete attachment.");
      },
    });
  };

  return (
    <li className="flex items-center gap-3 px-4 py-3">
      <Icon className="h-5 w-5 text-muted-foreground" />
      <div className="flex-1 overflow-hidden">
        <p className="truncate text-sm font-medium">{attachment.fileName}</p>
        <p className="text-xs text-muted-foreground">
          {formatSize(attachment.sizeBytes)} · uploaded by{" "}
          {attachment.uploadedBy.name} ·{" "}
          {new Date(attachment.createdAt).toLocaleDateString()}
        </p>
      </div>
      <div className="flex items-center gap-2">
        <Button asChild size="sm" variant="outline">
          <a href={attachment.downloadUrl} target="_blank" rel="noreferrer">
            <Download className="mr-2 h-4 w-4" />
            Download
          </a>
        </Button>
        <Button
          size="icon"
          variant="ghost"
          onClick={() => setShowDeleteDialog(true)}
          disabled={deleteMutation.isPending}
          aria-label={`Delete ${attachment.fileName}`}
          className="text-muted-foreground hover:text-destructive"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent size="sm">
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this file?</AlertDialogTitle>
            <AlertDialogDescription>
              {attachment.fileName} will be removed from storage and from this
              lead. This cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleteMutation.isPending}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              onClick={handleDelete}
              disabled={deleteMutation.isPending}
            >
              {deleteMutation.isPending ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </li>
  );
}

// ------------------------------------------------------------------
// Helpers: colocated because they're only used here
// ------------------------------------------------------------------
function iconFor(mime: string) {
  if (mime.startsWith("image/")) return FileImage;
  if (
    mime === "application/pdf" ||
    mime === "application/msword" ||
    mime ===
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document" ||
    mime === "text/plain"
  ) {
    return FileText;
  }
  return FileIcon;
}

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}
