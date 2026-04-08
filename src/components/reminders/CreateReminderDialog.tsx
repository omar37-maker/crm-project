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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useCreateLeadReminder } from "@/lib/tanstack/useReminders";
import { useGetLeads } from "@/lib/tanstack/useLeads";
import { getApiErrorMessage } from "@/lib/get-api-error-message";
import { format } from "date-fns";
import { CalendarIcon, Plus } from "lucide-react";

function mergeDateAndTime(date: Date, hours: number, minutes: number): Date {
  const d = new Date(date);
  d.setHours(hours, minutes, 0, 0);
  return d;
}

export function CreateReminderDialog({ leadId }: { leadId?: string }) {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [selectedLeadId, setSelectedLeadId] = useState(leadId ?? "");
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [timeValue, setTimeValue] = useState("10:00");
  const [calendarOpen, setCalendarOpen] = useState(false);
  const [error, setError] = useState("");

  const effectiveLeadId = leadId ?? selectedLeadId;
  const createReminder = useCreateLeadReminder(effectiveLeadId);

  // Only fetch leads when no leadId is provided (for the lead selector)
  const { data: leadsData } = useGetLeads({
    page: 1,
    pageSize: 100,
  });
  const leads = leadsData?.leads ?? [];

  function resetForm() {
    setTitle("");
    if (!leadId) setSelectedLeadId("");
    setSelectedDate(new Date());
    setTimeValue("10:00");
    setError("");
  }

  function handleOpenChange(nextOpen: boolean) {
    setOpen(nextOpen);
    if (!nextOpen) resetForm();
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    if (!title.trim()) {
      setError("Title is required");
      return;
    }

    if (!effectiveLeadId) {
      setError("Please select a lead");
      return;
    }

    const [h, m] = timeValue.split(":").map(Number);
    const dueAt = mergeDateAndTime(selectedDate, h, m);

    if (dueAt.getTime() <= Date.now()) {
      setError("Due date must be in the future");
      return;
    }

    try {
      await createReminder.mutateAsync({
        title: title.trim(),
        dueAt,
        leadId: effectiveLeadId,
      });
      resetForm();
      setOpen(false);
    } catch (mutationError) {
      setError(getApiErrorMessage(mutationError, "Failed to create reminder"));
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button className="h-9 gap-2 rounded-lg px-4">
          <Plus className="size-4" />
          Create Reminder
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-[28rem] p-0">
        <DialogHeader>
          <DialogTitle>Create Reminder</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 px-6 py-6">
          <div className="space-y-2">
            <Label htmlFor="reminder-title" className="text-sm font-medium">
              Title <span className="text-destructive">*</span>
            </Label>
            <Input
              id="reminder-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Follow up on pricing discussion"
              disabled={createReminder.isPending}
            />
          </div>

          {!leadId && (
            <div className="space-y-2">
              <Label className="text-sm font-medium">
                Lead <span className="text-destructive">*</span>
              </Label>
              <Select
                value={selectedLeadId}
                onValueChange={setSelectedLeadId}
                disabled={createReminder.isPending}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a lead" />
                </SelectTrigger>
                <SelectContent>
                  {leads.map((lead) => (
                    <SelectItem key={lead.id} value={lead.id}>
                      {lead.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-sm font-medium">
                Due Date <span className="text-destructive">*</span>
              </Label>
              <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
                <PopoverTrigger asChild>
                  <Button
                    type="button"
                    variant="outline"
                    className="h-10 w-full justify-start px-3 font-normal"
                  >
                    <CalendarIcon className="mr-2 size-4 shrink-0" />
                    {format(selectedDate, "MMM d, yyyy")}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={selectedDate}
                    onSelect={(date) => {
                      if (!date) return;
                      setSelectedDate(date);
                      setCalendarOpen(false);
                    }}
                    disabled={(date) =>
                      date < new Date(new Date().setHours(0, 0, 0, 0))
                    }
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="space-y-2">
              <Label htmlFor="reminder-time" className="text-sm font-medium">
                Due Time <span className="text-destructive">*</span>
              </Label>
              <Input
                id="reminder-time"
                type="time"
                step={60}
                value={timeValue}
                onChange={(e) => setTimeValue(e.target.value)}
                className="h-10"
                disabled={createReminder.isPending}
              />
            </div>
          </div>

          {error ? <p className="text-sm text-destructive">{error}</p> : null}

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => handleOpenChange(false)}
              disabled={createReminder.isPending}
              className="h-11 rounded-xl px-8"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={createReminder.isPending}
              className="h-11 rounded-xl px-8"
            >
              {createReminder.isPending ? "Creating..." : "Create Reminder"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
