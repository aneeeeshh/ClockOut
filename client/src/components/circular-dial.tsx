import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

export type DialKind = "clock" | "duration";
export type DialMode = "hour" | "minute";

const SIZE = 240;
const CX = SIZE / 2;
const CY = SIZE / 2;

interface CircularDialProps {
  kind: DialKind;
  mode: DialMode;
  hour: number;
  minute: number;
  onHourChange: (hour: number) => void;
  onMinuteChange: (minute: number) => void;
  onHourPicked?: () => void;
  onMinutePicked?: () => void;
}

function polar(index: number, total: number, radius: number) {
  const angle = (index / total) * 2 * Math.PI - Math.PI / 2;
  return { x: CX + radius * Math.cos(angle), y: CY + radius * Math.sin(angle) };
}

function shortestRotation(current: number, target: number) {
  const normalized = ((current % 360) + 360) % 360;
  let delta = target - normalized;
  if (delta > 180) delta -= 360;
  if (delta < -180) delta += 360;
  return current + delta;
}

function degFromPoint(dx: number, dy: number) {
  let deg = Math.atan2(dy, dx) * (180 / Math.PI) + 90;
  if (deg < 0) deg += 360;
  return deg;
}

export function CircularDial({
  kind,
  mode,
  hour,
  minute,
  onHourChange,
  onMinuteChange,
  onHourPicked,
  onMinutePicked,
}: CircularDialProps) {
  const liveRef = useRef(false);
  const faceRef = useRef<HTMLDivElement>(null);
  const modeRef = useRef(mode);
  const draggingRef = useRef(false);
  const movedRef = useRef(false);
  const hourPickRef = useRef(false);
  const startRef = useRef({ x: 0, y: 0 });
  const [dragging, setDragging] = useState(false);

  modeRef.current = mode;

  useEffect(() => {
    liveRef.current = false;
    const id = window.setTimeout(() => {
      liveRef.current = true;
    }, 250);
    return () => window.clearTimeout(id);
  }, []);

  const hourRotation = (hour % 12) * 30;
  const minuteRotation = minute * 6;
  const targetRotation = mode === "hour" ? hourRotation : minuteRotation;
  const [rotation, setRotation] = useState(targetRotation);

  useEffect(() => {
    setRotation((prev) => shortestRotation(prev, targetRotation));
  }, [targetRotation]);

  const durationOuter = kind === "duration" && mode === "hour" && hour >= 12;
  const numberRadius = mode === "hour" && kind === "duration"
    ? durationOuter ? 88 : 54
    : 78;

  const applyPoint = (clientX: number, clientY: number) => {
    if (!liveRef.current) return;
    const rect = faceRef.current?.getBoundingClientRect();
    if (!rect) return;
    const dx = clientX - (rect.left + rect.width / 2);
    const dy = clientY - (rect.top + rect.height / 2);
    const deg = degFromPoint(dx, dy);
    const currentMode = modeRef.current;

    if (currentMode === "minute") {
      onMinuteChange(Math.round(deg / 6) % 60);
      return;
    }

    const index = Math.round(deg / 30) % 12;
    if (kind === "clock") {
      onHourChange(index === 0 ? 12 : index);
      return;
    }

    const dist = Math.hypot(dx, dy);
    const outer = dist > rect.width * 0.28;
    onHourChange(outer ? (index === 0 ? 12 : index + 12) : index);
  };

  const onPointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
    event.preventDefault();
    draggingRef.current = true;
    movedRef.current = false;
    hourPickRef.current = modeRef.current === "hour";
    startRef.current = { x: event.clientX, y: event.clientY };
    applyPoint(event.clientX, event.clientY);
    try {
      event.currentTarget.setPointerCapture(event.pointerId);
    } catch {
      /* ignore */
    }
    setDragging(true);
  };

  const onPointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    if (!draggingRef.current) return;
    const dx = event.clientX - startRef.current.x;
    const dy = event.clientY - startRef.current.y;
    if (dx * dx + dy * dy > 36) movedRef.current = true;
    applyPoint(event.clientX, event.clientY);
  };

  const onPointerUp = (event: React.PointerEvent<HTMLDivElement>) => {
    if (!draggingRef.current) return;
    draggingRef.current = false;
    try {
      event.currentTarget.releasePointerCapture(event.pointerId);
    } catch {
      /* ignore */
    }
    setDragging(false);

    if (modeRef.current === "minute" && !movedRef.current) {
      const rect = faceRef.current?.getBoundingClientRect();
      if (rect) {
        const dx = event.clientX - (rect.left + rect.width / 2);
        const dy = event.clientY - (rect.top + rect.height / 2);
        const minuteNum = Math.round(degFromPoint(dx, dy) / 6) % 60;
        onMinuteChange((Math.round(minuteNum / 5) * 5) % 60);
      }
      onMinutePicked?.();
      return;
    }

    if (modeRef.current === "minute") {
      onMinutePicked?.();
      return;
    }

    if (hourPickRef.current) onHourPicked?.();
  };

  const clockHourMarks = [12, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11];
  const minuteMarks = [0, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55];
  const innerHours = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11];
  const outerHours = [12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23];

  const selectedMinuteOnMark = minute % 5 === 0;

  return (
    <div
      ref={faceRef}
      role="slider"
      tabIndex={0}
      aria-label={mode === "hour" ? "Hour dial" : "Minute dial"}
      aria-valuenow={mode === "hour" ? hour : minute}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerUp}
      className="relative mx-auto h-[176px] w-[176px] cursor-pointer touch-none select-none rounded-full outline-none focus-visible:ring-2 focus-visible:ring-ring/60"
    >
      <svg viewBox={`0 0 ${SIZE} ${SIZE}`} className="h-full w-full pointer-events-none">
        <circle cx={CX} cy={CY} r={114} className="fill-background stroke-primary/20" strokeWidth="1.5" />
        <circle cx={CX} cy={CY} r={96} className="fill-primary/[0.05]" />

        {Array.from({ length: 60 }, (_, i) => {
          const angle = (i / 60) * 2 * Math.PI - Math.PI / 2;
          const inner = i % 5 === 0 ? 104 : 108;
          return (
            <line
              key={i}
              x1={CX + inner * Math.cos(angle)}
              y1={CY + inner * Math.sin(angle)}
              x2={CX + 112 * Math.cos(angle)}
              y2={CY + 112 * Math.sin(angle)}
              className={i % 5 === 0 ? "stroke-muted-foreground/45" : "stroke-muted-foreground/20"}
              strokeWidth={i % 5 === 0 ? 1.5 : 1}
            />
          );
        })}

        <g
          style={{
            transform: `rotate(${rotation}deg)`,
            transformOrigin: "50% 50%",
            transformBox: "view-box",
            transition: dragging ? "none" : "transform 280ms cubic-bezier(0.22, 1, 0.36, 1)",
          }}
        >
          <line
            x1={CX}
            y1={CY}
            x2={CX}
            y2={CY - numberRadius + 18}
            className="stroke-primary"
            strokeWidth="2.75"
            strokeLinecap="round"
          />
          <circle
            cx={CX}
            cy={CY - numberRadius}
            r="18"
            className="fill-primary"
            style={{ filter: "drop-shadow(0 0 8px hsl(var(--primary) / 0.45))" }}
          />
          {mode === "minute" && !selectedMinuteOnMark && (
            <text
              x={CX}
              y={CY - numberRadius + 1}
              textAnchor="middle"
              dominantBaseline="middle"
              className="fill-primary-foreground font-bold"
              fontSize="12"
            >
              {String(minute).padStart(2, "0")}
            </text>
          )}
          <circle cx={CX} cy={CY} r="5.5" className="fill-primary" />
        </g>

        {mode === "minute" &&
          minuteMarks.map((mark, index) => {
            const pos = polar(index, 12, 78);
            const selected = selectedMinuteOnMark && minute === mark;
            return (
              <text
                key={mark}
                x={pos.x}
                y={pos.y + 1}
                textAnchor="middle"
                dominantBaseline="middle"
                fontSize="12"
                className={cn("font-semibold", selected ? "fill-primary-foreground" : "fill-muted-foreground")}
              >
                {String(mark).padStart(2, "0")}
              </text>
            );
          })}

        {mode === "hour" && kind === "clock" &&
          clockHourMarks.map((mark, index) => {
            const pos = polar(index, 12, 78);
            const selected = (hour % 12) === (mark % 12);
            return (
              <text
                key={mark}
                x={pos.x}
                y={pos.y + 1}
                textAnchor="middle"
                dominantBaseline="middle"
                fontSize="13"
                className={cn("font-semibold", selected ? "fill-primary-foreground" : "fill-muted-foreground")}
              >
                {mark}
              </text>
            );
          })}

        {mode === "hour" && kind === "duration" && (
          <>
            {innerHours.map((mark, index) => {
              const pos = polar(index, 12, 54);
              const selected = hour === mark;
              return (
                <text
                  key={`in-${mark}`}
                  x={pos.x}
                  y={pos.y + 1}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  fontSize="11"
                  className={cn("font-semibold", selected ? "fill-primary-foreground" : "fill-muted-foreground")}
                >
                  {String(mark).padStart(2, "0")}
                </text>
              );
            })}
            {outerHours.map((mark, index) => {
              const pos = polar(index, 12, 88);
              const selected = hour === mark;
              return (
                <text
                  key={`out-${mark}`}
                  x={pos.x}
                  y={pos.y + 1}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  fontSize="11"
                  className={cn("font-semibold", selected ? "fill-primary-foreground" : "fill-muted-foreground")}
                >
                  {mark}
                </text>
              );
            })}
          </>
        )}
      </svg>
    </div>
  );
}
