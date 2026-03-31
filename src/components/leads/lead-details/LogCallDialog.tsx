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
import { useLogCallAttempt } from "@/lib/tanstack/useActivities";
import { CallOutcome } from "@/services/activity";

function getTextAreaClassName() {
  return "min-h-32 w-full rounded-lg border border-input bg-transparent px-3 py-2 text-sm outline-none transition-colors placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:pointer-events-none disabled:cursor-not-allowed disabled:bg-input/50 disabled:opacity-50";
}

const callOutcomeOptions: { value: CallOutcome; label: string }[] = [
  { value: "NO_ANSWER", label: "No Answer" },
  { value: "ANSWERED", label: "Answered" },
  { value: "WRONG_NUMBER", label: "Wrong Number" },
  { value: "BUSY", label: "Busy" },
  { value: "CALL_BACK_LATER", label: "Call Back Later" },
];

export function LogCallDialog({ leadId }: { leadId: string }) {
  const [open, setOpen] = useState(false);
  const [outcome, setOutcome] = useState<CallOutcome | "">("");
  const [notes, setNotes] = useState("");
  const [error, setError] = useState("");
  const logCall = useLogCallAttempt(leadId);

  function resetForm() {
    setOutcome("");
    setNotes("");
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

    if (!outcome) {
      setError("Outcome is required");
      return;
    }

    try {
      const cleanedNotes = notes.trim();
      await logCall.mutateAsync({
        outcome,
        notes: cleanedNotes ? cleanedNotes : undefined,
      });
      resetForm();
      setOpen(false);
    } catch (mutationError) {
      setError(getApiErrorMessage(mutationError, "Failed to log call attempt"));
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button className="h-9 rounded-lg px-4">Log Call</Button>
      </DialogTrigger>
      <DialogContent className="max-w-[40rem] p-0">
        <DialogHeader>
          <DialogTitle>Log Call</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 px-6 py-6">
          <div className="space-y-2">
            <Label htmlFor="call-outcome" className="text-sm font-medium">
              Outcome <span className="text-destructive">*</span>
            </Label>
            <select
              id="call-outcome"
              value={outcome}
              onChange={(event) =>
                setOutcome(event.target.value as CallOutcome)
              }
              className="h-11 w-full rounded-lg border border-input bg-transparent px-3 text-sm outline-none transition-colors focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:pointer-events-none disabled:cursor-not-allowed disabled:bg-input/50 disabled:opacity-50"
              disabled={logCall.isPending}
            >
              <option value="" disabled>
                Select an outcome
              </option>
              {callOutcomeOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="call-notes" className="text-sm font-medium">
              Notes
            </Label>
            <textarea
              id="call-notes"
              value={notes}
              onChange={(event) => setNotes(event.target.value)}
              placeholder="What was discussed?"
              className={getTextAreaClassName()}
              disabled={logCall.isPending}
            />
          </div>

          {error ? <p className="text-sm text-destructive">{error}</p> : null}

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => handleOpenChange(false)}
              disabled={logCall.isPending}
              className="h-11 rounded-xl px-8"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={logCall.isPending || !outcome}
              className="h-11 rounded-xl px-8"
            >
              {logCall.isPending ? "Saving..." : "Save Call"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
