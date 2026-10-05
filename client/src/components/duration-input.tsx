import { useEffect, useMemo, useRef, useState } from "react";
import { Clock3, X } from "lucide-react";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { TimeClock } from "@mui/x-date-pickers/TimeClock";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";

interface DurationInputProps {
  hours: string;
  minutes: string;
  onHoursChange: (value: string) => void;
  onMinutesChange: (value: string) => void;
}

type ClockView = "hours" | "minutes";

export function DurationInput({ hours, minutes, onHoursChange, onMinutesChange }: DurationInputProps) {
  const hour = Math.min(23, Math.max(0, Number(hours) || 0));
  const minute = Math.min(59, Math.max(0, Number(minutes) || 0));
  const [open, setOpen] = useState(false);
  const [view, setView] = useState<ClockView>("hours");
  const [hourDraft, setHourDraft] = useState(String(hour).padStart(2, "0"));
  const [minuteDraft, setMinuteDraft] = useState(String(minute).padStart(2, "0"));
  const hourInput = useRef<HTMLInputElement>(null);
  const minuteInput = useRef<HTMLInputElement>(null);
  const inlineMinuteInput = useRef<HTMLInputElement>(null);

  useEffect(() => { setHourDraft(String(hour).padStart(2, "0")); }, [hours]);
  useEffect(() => { setMinuteDraft(String(minute).padStart(2, "0")); }, [minutes]);

  const clockValue = useMemo(() => {
    const date = new Date();
    date.setHours(hour, minute, 0, 0);
    return date;
  }, [hour, minute]);

  const changeOpen = (next: boolean) => {
    setOpen(next);
    if (next) setView("hours");
    else {
      setHourDraft(String(hour).padStart(2, "0"));
      setMinuteDraft(String(minute).padStart(2, "0"));
    }
  };

  const finishHour = () => {
    const next = Number(hourDraft);
    if (hourDraft && next <= 23) onHoursChange(String(next).padStart(2, "0"));
    else setHourDraft(String(hour).padStart(2, "0"));
  };

  const finishMinute = () => {
    const next = Number(minuteDraft);
    if (minuteDraft && next <= 59) onMinutesChange(String(next).padStart(2, "0"));
    else setMinuteDraft(String(minute).padStart(2, "0"));
  };

  const typeHour = (raw: string, inline = false) => {
    const digits = raw.replace(/\D/g, "").slice(0, 2);
    setHourDraft(digits);
    if (digits.length === 2 && Number(digits) <= 23) {
      onHoursChange(digits);
      setView("minutes");
      requestAnimationFrame(() => (inline ? inlineMinuteInput : minuteInput).current?.focus());
    }
  };

  const typeMinute = (raw: string) => {
    const digits = raw.replace(/\D/g, "").slice(0, 2);
    setMinuteDraft(digits);
    if (digits.length === 2 && Number(digits) <= 59) {
      onMinutesChange(digits);
      setView("minutes");
    }
  };

  return (
    <div className="space-y-2">
      <Label className="text-xs font-bold uppercase tracking-tighter">Required Hours &amp; Mins</Label>
      <Popover open={open} onOpenChange={changeOpen}>
        <div className={cn(
          "group relative flex h-[82px] w-full items-center justify-between rounded-2xl border border-primary/25 bg-gradient-to-br from-primary/[0.09] via-background/80 to-background/60 px-4 shadow-[0_10px_30px_-20px_hsl(var(--primary)/0.65)] transition-all duration-200",
          "hover:border-primary/55 hover:shadow-[0_16px_35px_-20px_hsl(var(--primary)/0.8)] focus-within:border-primary/55",
          open && "border-primary/60 bg-primary/[0.12]",
        )}>
          <PopoverTrigger asChild>
            <button type="button" aria-label={`Required duration: ${hour} hours ${minute} minutes. Open duration clock`} aria-expanded={open} className="absolute inset-0 rounded-2xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/70" />
          </PopoverTrigger>
          <div className="pointer-events-none relative z-10 flex items-baseline gap-1 font-display tabular-nums">
            <input
              aria-label="Required duration hours"
              inputMode="numeric"
              autoComplete="off"
              value={hourDraft}
              onChange={(event) => typeHour(event.target.value, true)}
              onFocus={(event) => event.target.select()}
              onBlur={finishHour}
              onKeyDown={(event) => { if (event.key === "Enter") { finishHour(); inlineMinuteInput.current?.focus(); } }}
              className="pointer-events-auto w-[2ch] bg-transparent p-0 text-center text-[1.8rem] font-semibold leading-none tracking-tight text-foreground outline-none focus:text-primary"
            />
            <span className="text-[11px] font-bold uppercase tracking-widest text-primary">h</span>
            <input
              ref={inlineMinuteInput}
              aria-label="Required duration minutes"
              inputMode="numeric"
              autoComplete="off"
              value={minuteDraft}
              onChange={(event) => typeMinute(event.target.value)}
              onFocus={(event) => event.target.select()}
              onBlur={finishMinute}
              onKeyDown={(event) => { if (event.key === "Enter") { finishMinute(); event.currentTarget.blur(); } }}
              className="pointer-events-auto w-[2ch] bg-transparent p-0 text-center text-[1.8rem] font-semibold leading-none tracking-tight text-foreground outline-none focus:text-primary"
            />
            <span className="text-[11px] font-bold uppercase tracking-widest text-primary">m</span>
          </div>
          <span aria-hidden="true" className="pointer-events-none relative z-10 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-primary/20 bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
            <Clock3 className="h-[19px] w-[19px]" />
          </span>
        </div>
        <PopoverContent
          align="start"
          side="bottom"
          sideOffset={-244}
          collisionPadding={12}
          onOpenAutoFocus={(event) => { event.preventDefault(); hourInput.current?.focus(); hourInput.current?.select(); }}
          className="clockout-time-popover clockout-duration-popover z-50 w-[min(320px,calc(100vw-24px))] max-h-[calc(100vh-24px)] overflow-y-auto rounded-[1.35rem] border border-primary/25 bg-background p-0 text-foreground shadow-[0_30px_80px_-25px_hsl(var(--primary)/0.45)] outline-none"
        >
          <div className="border-b border-border/70 bg-gradient-to-br from-primary/15 via-primary/[0.06] to-background px-4 pb-4 pt-3">
            <div className="flex items-center justify-between gap-2">
              <h3 className="text-[10px] font-bold uppercase tracking-[0.22em] text-muted-foreground outline-none">Required duration</h3>
              <button type="button" aria-label="Close duration clock" onClick={() => changeOpen(false)} className="rounded-full p-1.5 text-muted-foreground hover:bg-primary/10 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary">
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="mt-2 flex items-end gap-2">
              <div className="flex items-end gap-1">
                <input
                  ref={hourInput}
                  aria-label="Duration hours"
                  inputMode="numeric"
                  autoComplete="off"
                  value={hourDraft}
                  onChange={(event) => typeHour(event.target.value)}
                  onFocus={(event) => { event.target.select(); setView("hours"); }}
                  onBlur={finishHour}
                  onKeyDown={(event) => {
                    if (event.key === "Enter") {
                      event.preventDefault();
                      finishHour();
                      setView("minutes");
                      minuteInput.current?.focus();
                    }
                  }}
                  className={cn("w-[2ch] bg-transparent p-0 text-center font-display text-[2.8rem] font-semibold leading-none tabular-nums outline-none", view === "hours" ? "text-primary" : "text-foreground")}
                />
                <span className="pb-1 text-xs font-bold uppercase tracking-wider text-muted-foreground">hours</span>
              </div>
              <div className="flex items-end gap-1">
                <input
                  ref={minuteInput}
                  aria-label="Duration minutes"
                  inputMode="numeric"
                  autoComplete="off"
                  value={minuteDraft}
                  onChange={(event) => typeMinute(event.target.value)}
                  onFocus={(event) => { event.target.select(); setView("minutes"); }}
                  onBlur={finishMinute}
                  onKeyDown={(event) => { if (event.key === "Enter") { finishMinute(); changeOpen(false); } }}
                  className={cn("w-[2ch] bg-transparent p-0 text-center font-display text-[2.8rem] font-semibold leading-none tabular-nums outline-none", view === "minutes" ? "text-primary" : "text-foreground")}
                />
                <span className="pb-1 text-xs font-bold uppercase tracking-wider text-muted-foreground">mins</span>
              </div>
            </div>
          </div>
          <div className="px-3 pb-3 pt-2">
            <div className="mb-1 flex justify-center gap-1 rounded-xl bg-muted/60 p-1">
              {(["hours", "minutes"] as const).map((nextView) => (
                <button key={nextView} type="button" aria-pressed={view === nextView} onClick={() => setView(nextView)} className={cn("flex-1 rounded-lg py-1.5 text-[11px] font-bold uppercase tracking-wider transition-colors", view === nextView ? "bg-background text-primary shadow-sm" : "text-muted-foreground hover:text-foreground")}>
                  {nextView}
                </button>
              ))}
            </div>
            <LocalizationProvider dateAdapter={AdapterDateFns}>
              <TimeClock
                value={clockValue}
                ampm={false}
                view={view}
                views={["hours", "minutes"]}
                onViewChange={(nextView) => { if (nextView !== "seconds") setView(nextView); }}
                onChange={(next, selectionState, selectedView) => {
                  if (!next) return;
                  if (selectedView === "hours") onHoursChange(String(next.getHours()).padStart(2, "0"));
                  if (selectedView === "minutes") onMinutesChange(String(next.getMinutes()).padStart(2, "0"));
                  if (selectedView === "minutes" && selectionState === "finish") changeOpen(false);
                }}
                sx={{
                  width: "100%", maxHeight: "none", margin: "0 auto",
                  "& .MuiTimeClock-arrowSwitcher": { display: "none" },
                  "& .MuiClock-clock": { backgroundColor: "hsl(var(--muted))", border: "1px solid hsl(var(--border))", boxShadow: "inset 0 1px 5px hsl(var(--foreground) / 0.04)" },
                  "& .MuiClockNumber-root": { color: "hsl(var(--foreground))", fontFamily: "var(--font-display)", fontWeight: 600 },
                  "& .MuiClockNumber-root.Mui-selected": { color: "hsl(var(--primary-foreground))" },
                  "& .MuiClockPointer-root, & .MuiClockPointer-thumb": { backgroundColor: "hsl(var(--primary))" },
                  "& .MuiClockPointer-thumb": { borderColor: "hsl(var(--primary))" },
                  "& .MuiClock-pin": { backgroundColor: "hsl(var(--primary))" },
                }}
              />
            </LocalizationProvider>
            <div className="-mt-3 flex items-center justify-between px-1 pb-1">
              <span className="text-[10px] text-muted-foreground">Tap the dial or type a duration</span>
              <button type="button" onClick={() => changeOpen(false)} className="rounded-full bg-primary px-4 py-1.5 text-xs font-bold text-primary-foreground shadow-sm hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2">Done</button>
            </div>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}
