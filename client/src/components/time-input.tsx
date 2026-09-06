import { useEffect, useState } from "react";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CircularDial, type DialMode } from "@/components/circular-dial";
import { cn } from "@/lib/utils";

interface TimeInputProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  className?: string;
}

function parseTime(timeStr: string) {
  if (!timeStr) return { hour: "09", minute: "00", period: "AM" };
  const [time, period] = timeStr.split(" ");
  const [hour, minute] = time.split(":");
  const hourNum = parseInt(hour, 10);
  const minuteNum = parseInt(minute, 10);
  return {
    hour: String(Number.isNaN(hourNum) ? 9 : hourNum).padStart(2, "0"),
    minute: String(Number.isNaN(minuteNum) ? 0 : minuteNum).padStart(2, "0"),
    period: period === "PM" ? "PM" : "AM",
  };
}

const popupClass =
  "w-auto p-2 rounded-2xl border-primary/20 bg-background/95 backdrop-blur-xl shadow-xl";

export function TimeInput({ label, value, onChange, className }: TimeInputProps) {
  const [state, setState] = useState(() => parseTime(value));
  const [openOn, setOpenOn] = useState<DialMode | null>(null);
  const [mode, setMode] = useState<DialMode>("hour");

  useEffect(() => {
    setState(parseTime(value));
  }, [value]);

  const commit = (next: Partial<typeof state>) => {
    setState((prev) => {
      const merged = { ...prev, ...next };
      onChange(`${merged.hour}:${merged.minute} ${merged.period}`);
      return merged;
    });
  };

  const renderDial = () => (
    <CircularDial
      kind="clock"
      mode={mode}
      hour={parseInt(state.hour, 10)}
      minute={parseInt(state.minute, 10)}
      onHourChange={(hour) => commit({ hour: String(hour).padStart(2, "0") })}
      onMinuteChange={(minute) => commit({ minute: String(minute).padStart(2, "0") })}
      onHourPicked={() => setMode("minute")}
      onMinutePicked={() => setOpenOn(null)}
    />
  );

  return (
    <div className={cn("space-y-2", className)}>
      <Label className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
        {label}
      </Label>
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-1 font-mono">
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
                className="rounded-xl border border-primary/20 bg-background/50 px-3 py-2 text-xl font-semibold hover:border-primary/40 hover:bg-primary/10"
                aria-label="Edit hour"
              >
                {state.hour}
              </button>
            </PopoverTrigger>
            <PopoverContent align="start" side="bottom" sideOffset={8} className={popupClass}>
              {renderDial()}
            </PopoverContent>
          </Popover>
          <span className="text-xl font-bold text-muted-foreground/40">:</span>
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
                className="rounded-xl border border-primary/20 bg-background/50 px-3 py-2 text-xl font-semibold hover:border-primary/40 hover:bg-primary/10"
                aria-label="Edit minute"
              >
                {state.minute}
              </button>
            </PopoverTrigger>
            <PopoverContent align="start" side="bottom" sideOffset={8} className={popupClass}>
              {renderDial()}
            </PopoverContent>
          </Popover>
        </div>
        <div className="flex rounded-full border border-border/50 bg-muted/50 p-1">
          {(["AM", "PM"] as const).map((period) => (
            <button
              key={period}
              type="button"
              onClick={() => commit({ period })}
              className={cn(
                "rounded-full px-3 py-1 text-[11px] font-bold transition-all",
                state.period === period
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              {period}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
