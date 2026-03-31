"use client";

import { FormEvent, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { getApiErrorMessage } from "@/lib/get-api-error-message";
import { useCreateNote } from "@/lib/tanstack/useActivities";

function getTextAreaClassName() {
  return "min-h-40 w-full rounded-lg border border-input bg-transparent px-3 py-2 text-sm outline-none transition-colors placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:pointer-events-none disabled:cursor-not-allowed disabled:bg-input/50 disabled:opacity-50";
}

export function AddNoteDialog({ leadId }: { leadId: string }) {
  const [open, setOpen] = useState(false);
  const [content, setContent] = useState("");
  const [error, setError] = useState("");
  const createNote = useCreateNote(leadId);

  function resetForm() {
    setContent("");
    setError("");
  }

  function handleOpenChange(nextOpen: boolean) {
    setOpen(nextOpen);

    if (!nextOpen) {
      resetForm();
    }
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    const trimmedContent = content.trim();
    if (!trimmedContent) {
      setError("Note content is required");
      return;
    }

    try {
      await createNote.mutateAsync(trimmedContent);
      resetForm();
      setOpen(false);
    } catch (mutationError) {
      setError(getApiErrorMessage(mutationError, "Failed to save note"));
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button variant="outline" className="h-9 rounded-lg px-4">
          Add Note
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-[52rem] p-0">
        <DialogHeader>
          <DialogTitle>Add Note</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 px-6 py-6">
          <div className="space-y-2">
            <Label htmlFor="note-content" className="text-sm font-medium">
              Note Content <span className="text-destructive">*</span>
            </Label>
            <textarea
              id="note-content"
              value={content}
              onChange={(event) => setContent(event.target.value)}
              placeholder="Enter your note here..."
              className={getTextAreaClassName()}
              disabled={createNote.isPending}
            />
          </div>

          {error ? <p className="text-sm text-destructive">{error}</p> : null}

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => handleOpenChange(false)}
              disabled={createNote.isPending}
              className="h-11 rounded-xl px-8"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={createNote.isPending}
              className="h-11 rounded-xl px-8"
            >
              {createNote.isPending ? "Saving..." : "Save Note"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
