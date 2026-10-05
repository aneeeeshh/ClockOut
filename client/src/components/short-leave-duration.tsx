import { useEffect, useRef, useState } from "react";
import { Minus, Plus } from "lucide-react";

interface ShortLeaveDurationProps {
  value: number;
  onChange: (minutes: number) => void;
}

export function ShortLeaveDuration({ value, onChange }: ShortLeaveDurationProps) {
  const hours = Math.floor(value / 60);
  const minutes = value % 60;
  const [hourDraft, setHourDraft] = useState(String(hours));
  const [minuteDraft, setMinuteDraft] = useState(String(minutes).padStart(2, "0"));
  const editingHours = useRef(false);
  const editingMinutes = useRef(false);

  useEffect(() => { if (!editingHours.current) setHourDraft(String(hours)); }, [hours]);
  useEffect(() => { if (!editingMinutes.current) setMinuteDraft(String(minutes).padStart(2, "0")); }, [minutes]);

  const changeHours = (raw: string) => {
    const digits = raw.replace(/\D/g, "");
    setHourDraft(digits);
    if (digits && Number.isSafeInteger(Number(digits) * 60 + minutes)) onChange(Number(digits) * 60 + minutes);
  };

  const changeMinutes = (raw: string) => {
    const digits = raw.replace(/\D/g, "").slice(0, 2);
    setMinuteDraft(digits);
    if (digits && Number(digits) <= 59) onChange(hours * 60 + Number(digits));
  };

  const controlClass = "flex h-6 flex-1 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-primary/10 hover:text-primary disabled:pointer-events-none disabled:opacity-35 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary";

  return (
    <div className="flex min-w-0 flex-col items-center gap-2 rounded-xl border border-border/50 bg-background/40 px-2 py-3">
      <span className="text-[10px] font-bold uppercase tracking-tighter text-muted-foreground">Each leave</span>
      <div className="grid w-full grid-cols-2 gap-1">
        <div className="min-w-0 rounded-lg border border-border/50 bg-background/60 px-1 py-0.5">
          <div className="flex items-baseline justify-center gap-0.5">
            <input
              aria-label="Hours per short leave"
              inputMode="numeric"
              autoComplete="off"
              value={hourDraft}
              onFocus={(event) => { editingHours.current = true; event.target.select(); }}
              onChange={(event) => changeHours(event.target.value)}
              onBlur={() => {
                editingHours.current = false;
                setHourDraft(hourDraft && Number.isSafeInteger(Number(hourDraft) * 60 + minutes) ? hourDraft : String(hours));
              }}
              className="min-w-0 w-7 bg-transparent text-center font-mono text-base font-bold tabular-nums outline-none focus:text-primary"
            />
            <span className="text-[9px] font-bold text-muted-foreground">h</span>
          </div>
          <div className="flex gap-0.5">
            <button type="button" aria-label="Decrease hours per short leave" disabled={value < 60} onClick={() => onChange(value - 60)} className={controlClass}><Minus className="h-3 w-3" /></button>
            <button type="button" aria-label="Increase hours per short leave" onClick={() => onChange(value + 60)} className={controlClass}><Plus className="h-3 w-3" /></button>
          </div>
        </div>
        <div className="min-w-0 rounded-lg border border-border/50 bg-background/60 px-1 py-0.5">
          <div className="flex items-baseline justify-center gap-0.5">
            <input
              aria-label="Minutes per short leave"
              inputMode="numeric"
              autoComplete="off"
              value={minuteDraft}
              onFocus={(event) => { editingMinutes.current = true; event.target.select(); }}
              onChange={(event) => changeMinutes(event.target.value)}
              onBlur={() => {
                editingMinutes.current = false;
                const next = Number(minuteDraft);
                if (minuteDraft && next <= 59) {
                  onChange(hours * 60 + next);
                  setMinuteDraft(String(next).padStart(2, "0"));
                } else setMinuteDraft(String(minutes).padStart(2, "0"));
              }}
              className="min-w-0 w-7 bg-transparent text-center font-mono text-base font-bold tabular-nums outline-none focus:text-primary"
            />
            <span className="text-[9px] font-bold text-muted-foreground">m</span>
          </div>
          <div className="flex gap-0.5">
            <button type="button" aria-label="Decrease minutes per short leave" disabled={value < 5} onClick={() => onChange(value - 5)} className={controlClass}><Minus className="h-3 w-3" /></button>
            <button type="button" aria-label="Increase minutes per short leave" onClick={() => onChange(value + 5)} className={controlClass}><Plus className="h-3 w-3" /></button>
          </div>
        </div>
      </div>
    </div>
  );
}
