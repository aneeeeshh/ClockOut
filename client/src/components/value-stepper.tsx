import { Minus, Plus } from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface ValueStepperProps {
  label: string;
  value: number;
  onChange: (value: number) => void;
  min: number;
  max: number;
  step?: number;
  suffix?: string;
  className?: string;
}

export function ValueStepper({
  label,
  value,
  onChange,
  min,
  max,
  step = 1,
  suffix,
  className,
}: ValueStepperProps) {
  const range = Math.max(max - min, 1);
  const progress = Math.min(1, Math.max(0, (value - min) / range));
  const radius = 22;
  const circumference = 2 * Math.PI * radius;
  const dashOffset = circumference * (1 - progress);
  const atMin = value <= min;
  const atMax = value >= max;

  const adjust = (direction: 1 | -1) => {
    const next = value + direction * step;
    onChange(Math.min(max, Math.max(min, next)));
  };

  return (
    <div
      className={cn(
        "flex flex-col items-center gap-2 rounded-xl border border-border/50 bg-background/40 px-2 py-3",
        className,
      )}
    >
      <span className="text-[10px] font-bold uppercase tracking-tighter text-muted-foreground">
        {label}
      </span>

      <div className="flex items-center gap-1.5">
        <button
          type="button"
          onClick={() => adjust(-1)}
          disabled={atMin}
          aria-label={`Decrease ${label}`}
          className="flex h-8 w-8 items-center justify-center rounded-full border border-border/60 bg-background/70 text-foreground transition-all hover:border-primary/40 hover:bg-primary/10 hover:text-primary disabled:pointer-events-none disabled:opacity-35"
        >
          <Minus className="h-3.5 w-3.5" />
        </button>

        <div className="relative h-14 w-14">
          <svg viewBox="0 0 56 56" className="h-full w-full -rotate-90">
            <circle
              cx="28"
              cy="28"
              r={radius}
              className="fill-none stroke-muted-foreground/15"
              strokeWidth="3.5"
            />
            <circle
              cx="28"
              cy="28"
              r={radius}
              className="fill-none stroke-primary"
              strokeWidth="3.5"
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={dashOffset}
              style={{ transition: "stroke-dashoffset 0.35s ease, stroke 0.7s ease" }}
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center leading-none">
            <motion.span
              key={value}
              initial={{ scale: 0.72, opacity: 0.4 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: "spring", stiffness: 420, damping: 22 }}
              className="text-lg font-bold tabular-nums"
            >
              {value}
            </motion.span>
            {suffix && (
              <span className="text-[9px] font-bold uppercase tracking-wider text-muted-foreground">
                {suffix}
              </span>
            )}
          </div>
        </div>

        <button
          type="button"
          onClick={() => adjust(1)}
          disabled={atMax}
          aria-label={`Increase ${label}`}
          className="flex h-8 w-8 items-center justify-center rounded-full border border-border/60 bg-background/70 text-foreground transition-all hover:border-primary/40 hover:bg-primary/10 hover:text-primary disabled:pointer-events-none disabled:opacity-35"
        >
          <Plus className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  );
}
