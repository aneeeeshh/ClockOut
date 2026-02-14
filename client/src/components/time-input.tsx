import { useState, useEffect } from "react";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";

interface TimeInputProps {
  label: string;
  value: string; // Format "HH:mm AM/PM"
  onChange: (value: string) => void;
  className?: string;
}

export function TimeInput({ label, value, onChange, className }: TimeInputProps) {
  // Parse initial value or default
  const parseTime = (timeStr: string) => {
    if (!timeStr) return { hour: "09", minute: "00", period: "AM" };
    const [time, period] = timeStr.split(" ");
    const [hour, minute] = time.split(":");
    return { hour, minute, period };
  };

  const [state, setState] = useState(parseTime(value));

  useEffect(() => {
    setState(parseTime(value));
  }, [value]);

  const updateTime = (key: keyof typeof state, val: string) => {
    const newState = { ...state, [key]: val };
    setState(newState);
    onChange(`${newState.hour}:${newState.minute} ${newState.period}`);
  };

  const hours = Array.from({ length: 12 }, (_, i) => String(i + 1).padStart(2, '0'));
  const minutes = Array.from({ length: 60 }, (_, i) => String(i).padStart(2, '0'));

  return (
    <div className={cn("space-y-2", className)}>
      <Label className="text-sm font-medium text-muted-foreground uppercase tracking-wider">{label}</Label>
      <div className="flex gap-2 items-center">
        {/* Hour */}
        <Select value={state.hour} onValueChange={(v) => updateTime("hour", v)}>
          <SelectTrigger className="w-20 font-mono text-lg font-medium bg-background/50 border-primary/20 focus:ring-primary/20">
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="max-h-[300px]">
            {hours.map((h) => (
              <SelectItem key={h} value={h}>{h}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <span className="text-xl font-bold text-muted-foreground/50">:</span>

        {/* Minute */}
        <Select value={state.minute} onValueChange={(v) => updateTime("minute", v)}>
          <SelectTrigger className="w-20 font-mono text-lg font-medium bg-background/50 border-primary/20 focus:ring-primary/20">
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="max-h-[300px]">
            {minutes.map((m) => (
              <SelectItem key={m} value={m}>{m}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* AM/PM */}
        <div className="flex bg-muted/50 rounded-lg p-1 ml-2 border border-border/50">
          {(["AM", "PM"] as const).map((p) => (
            <button
              key={p}
              type="button"
              onClick={() => updateTime("period", p)}
              className={cn(
                "px-3 py-1.5 rounded-md text-sm font-bold transition-all duration-200",
                state.period === p 
                  ? "bg-primary text-primary-foreground shadow-sm" 
                  : "text-muted-foreground hover:text-foreground hover:bg-background/50"
              )}
            >
              {p}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
