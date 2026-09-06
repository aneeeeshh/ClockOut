import { useState } from "react";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CircularDial, type DialMode } from "@/components/circular-dial";

interface DurationInputProps {
  hours: string;
  minutes: string;
  onHoursChange: (value: string) => void;
  onMinutesChange: (value: string) => void;
}

const popupClass =
  "w-auto p-2 rounded-2xl border-primary/20 bg-background/95 backdrop-blur-xl shadow-xl";

export function DurationInput({
  hours,
  minutes,
  onHoursChange,
  onMinutesChange,
}: DurationInputProps) {
  const [openOn, setOpenOn] = useState<DialMode | null>(null);
  const [mode, setMode] = useState<DialMode>("hour");
  const hourNum = Math.min(23, Math.max(0, parseInt(hours, 10) || 0));
  const minuteNum = Math.min(59, Math.max(0, parseInt(minutes, 10) || 0));

  const renderDial = () => (
    <CircularDial
      kind="duration"
      mode={mode}
      hour={hourNum}
      minute={minuteNum}
      onHourChange={(hour) => onHoursChange(String(hour).padStart(2, "0"))}
      onMinuteChange={(minute) => onMinutesChange(String(minute).padStart(2, "0"))}
      onHourPicked={() => setMode("minute")}
      onMinutePicked={() => setOpenOn(null)}
    />
  );

  return (
    <div className="space-y-2">
      <Label className="text-xs font-bold uppercase tracking-tighter">
        Required Hours & Mins
      </Label>
      <div className="grid grid-cols-2 gap-2">
        <Popover
          open={openOn === "hour"}
          onOpenChange={(open) => {
            setOpenOn(open ? "hour" : null);
            if (open) setMode("hour");
          }}
        >
          <PopoverTrigger asChild>
            <button
              type="button"
              className="h-10 rounded-xl border border-primary/20 bg-background/50 font-mono text-sm font-semibold hover:border-primary/40 hover:bg-primary/10"
            >
              {String(hourNum).padStart(2, "0")}h
            </button>
          </PopoverTrigger>
          <PopoverContent align="start" side="bottom" sideOffset={8} className={popupClass}>
            {renderDial()}
          </PopoverContent>
        </Popover>
        <Popover
          open={openOn === "minute"}
          onOpenChange={(open) => {
            setOpenOn(open ? "minute" : null);
            if (open) setMode("minute");
          }}
        >
          <PopoverTrigger asChild>
            <button
              type="button"
              className="h-10 rounded-xl border border-primary/20 bg-background/50 font-mono text-sm font-semibold hover:border-primary/40 hover:bg-primary/10"
            >
              {String(minuteNum).padStart(2, "0")}m
            </button>
          </PopoverTrigger>
          <PopoverContent align="start" side="bottom" sideOffset={8} className={popupClass}>
            {renderDial()}
          </PopoverContent>
        </Popover>
      </div>
    </div>
  );
}
