"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "cn";
import { DAILY_SLOT_HOURS, VISIT_DURATION_MINUTES, type BookingDraft } from "./types";

interface StepDateTimeProps {
  draft: BookingDraft;
  onChange: (patch: Partial<BookingDraft>) => void;
}

function startOfDay(date: Date): Date {
  const copy = new Date(date);
  copy.setHours(0, 0, 0, 0);
  return copy;
}

export function StepDateTime({ draft, onChange }: StepDateTimeProps) {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(draft.slotStart ?? undefined);
  const now = new Date();
  const today = startOfDay(now);

  function handleSelectDate(date: Date | undefined) {
    setSelectedDate(date);
    onChange({ slotStart: null, slotEnd: null });
  }

  function handleSelectHour(hour: number) {
    if (!selectedDate) {
      return;
    }
    const slotStart = new Date(selectedDate);
    slotStart.setHours(hour, 0, 0, 0);
    const slotEnd = new Date(slotStart.getTime() + VISIT_DURATION_MINUTES * 60 * 1000);
    onChange({ slotStart, slotEnd });
  }

  return (
    <div className="grid gap-6 sm:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>Hangi gün?</CardTitle>
          <CardDescription>Geçmiş günler kilitlidir.</CardDescription>
        </CardHeader>
        <CardContent className="flex justify-center">
          <Calendar
            mode="single"
            selected={selectedDate}
            onSelect={handleSelectDate}
            disabled={{ before: today }}
            className="rounded-lg border"
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Hangi saat?</CardTitle>
          <CardDescription>
            {selectedDate ? "Uygun bir saat aralığı seç." : "Önce bir gün seç."}
          </CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-3 gap-2">
          {DAILY_SLOT_HOURS.map((hour) => {
            const label = `${String(hour).padStart(2, "0")}:00`;

            if (!selectedDate) {
              return (
                <Button key={hour} type="button" variant="outline" disabled>
                  {label}
                </Button>
              );
            }

            const candidateStart = new Date(selectedDate);
            candidateStart.setHours(hour, 0, 0, 0);
            const isPast = candidateStart <= now;
            const isSelected = draft.slotStart?.getTime() === candidateStart.getTime();

            return (
              <Button
                key={hour}
                type="button"
                variant={isSelected ? "default" : "outline"}
                disabled={isPast}
                className={cn(isPast && "line-through")}
                onClick={() => handleSelectHour(hour)}
              >
                {label}
              </Button>
            );
          })}
        </CardContent>
      </Card>
    </div>
  );
}
