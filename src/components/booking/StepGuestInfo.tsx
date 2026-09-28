"use client";

import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { MAX_GUEST_COUNT, type BookingDraft } from "./types";

interface StepGuestInfoProps {
  draft: BookingDraft;
  onChange: (patch: Partial<BookingDraft>) => void;
}

const guestCountOptions = Array.from({ length: MAX_GUEST_COUNT }, (_, index) => index + 1);

export function StepGuestInfo({ draft, onChange }: StepGuestInfoProps) {
  return (
    <div className="grid gap-6 sm:grid-cols-2">
      <div className="grid gap-2">
        <Label htmlFor="guestName">İsim / Lakap</Label>
        <Input
          id="guestName"
          placeholder="Ör. Ayşe"
          value={draft.guestName}
          onChange={(event) => onChange({ guestName: event.target.value })}
        />
      </div>

      <div className="grid gap-2">
        <Label htmlFor="guestCount">Kaç kişi geliyorsunuz?</Label>
        <Select
          value={String(draft.guestCount)}
          onValueChange={(value) => {
            if (value !== null) {
              onChange({ guestCount: Number(value) });
            }
          }}
        >
          <SelectTrigger id="guestCount" className="w-full">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {guestCountOptions.map((count) => (
              <SelectItem key={count} value={String(count)}>
                {count} kişi
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="grid gap-3 rounded-lg border border-dashed p-4 sm:col-span-2">
        <div className="flex items-center gap-2">
          <Checkbox
            id="bringsContribution"
            checked={draft.bringsContribution}
            onCheckedChange={(checked) => onChange({ bringsContribution: checked })}
          />
          <Label htmlFor="bringsContribution">Eli boş gelmiyorum 🎁</Label>
        </div>
        {draft.bringsContribution ? (
          <Textarea
            placeholder="Ne getiriyorsun? (ör. ev yapımı kurabiye)"
            value={draft.guestContribution}
            onChange={(event) => onChange({ guestContribution: event.target.value })}
          />
        ) : null}
      </div>
    </div>
  );
}
