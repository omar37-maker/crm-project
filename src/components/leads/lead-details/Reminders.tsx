"use client";

import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useCreateLeadReminder } from "@/lib/tanstack/useReminders";
import { CreateReminderRequest } from "@/services/reminder/schema";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import React, { useState } from "react";

function mergeDateKeepingTime(base: Date, nextDay: Date): Date {
  const d = new Date(nextDay);
  d.setHours(base.getHours(), base.getMinutes(), 0, 0);
  return d;
}

export const Reminders = ({ leadId }: { leadId: string }) => {
  const [pickerOpen, setPickerOpen] = useState(false);
  const [formData, setFormData] = useState<CreateReminderRequest>({
    title: "",
    note: "",
    dueAt: new Date(),
    leadId,
  });
  const { mutate: createReminder } = useCreateLeadReminder(leadId);

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    createReminder(formData);
  }

  return (
    <div>
      <form onSubmit={handleSubmit} className="flex flex-col gap-2">
        <Input
          placeholder="Reminder title"
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
        />
        <Input
          placeholder="Reminder description"
          value={formData.note}
          onChange={(e) => setFormData({ ...formData, note: e.target.value })}
        />
        <Popover open={pickerOpen} onOpenChange={setPickerOpen}>
          <PopoverTrigger asChild>
            <Button
              type="button"
              variant="outline"
              className="h-8 w-full justify-start px-2.5 font-normal"
            >
              <CalendarIcon className="mr-2 size-4 shrink-0" />
              {format(formData.dueAt, "PPP p")}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto overflow-hidden p-0" align="start">
            <div className="flex flex-col gap-2 p-3">
              <Calendar
                mode="single"
                selected={formData.dueAt}
                onSelect={(date) => {
                  if (!date) return;
                  setFormData({
                    ...formData,
                    dueAt: mergeDateKeepingTime(formData.dueAt, date),
                  });
                }}
                initialFocus
              />
              <div className="flex flex-col gap-1.5 border-t pt-3">
                <Label htmlFor="reminder-due-time" className="px-1">
                  Time
                </Label>
                <Input
                  id="reminder-due-time"
                  type="time"
                  step={60}
                  value={format(formData.dueAt, "HH:mm")}
                  onChange={(e) => {
                    const v = e.target.value;
                    if (!v) return;
                    const [h, m] = v.split(":").map(Number);
                    const next = new Date(formData.dueAt);
                    next.setHours(h, m, 0, 0);
                    setFormData({ ...formData, dueAt: next });
                  }}
                />
              </div>
            </div>
          </PopoverContent>
        </Popover>
        <Button type="submit">Create Reminder</Button>
      </form>
    </div>
  );
};
