import { useEffect, useRef } from "react";

export function AnimatedBackground() {
  const layerRef = useRef<HTMLDivElement>(null);
  const glowRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const layer = layerRef.current;
    const glow = glowRef.current;
    if (!layer || !glow) return;

    let mx = 0.5;
    let my = 0.5;
    let tx = 0.5;
    let ty = 0.5;
    let frame = 0;

    const onMove = (event: MouseEvent) => {
      tx = event.clientX / window.innerWidth;
      ty = event.clientY / window.innerHeight;
    };

    const tick = () => {
      mx += (tx - mx) * 0.1;
      my += (ty - my) * 0.1;
      layer.style.transform = `translate(${(mx - 0.5) * 90}px, ${(my - 0.5) * 70}px)`;
      glow.style.left = `${mx * 100}%`;
      glow.style.top = `${my * 100}%`;
      frame = requestAnimationFrame(tick);
    };

    window.addEventListener("mousemove", onMove, { passive: true });
    frame = requestAnimationFrame(tick);

    return () => {
      window.removeEventListener("mousemove", onMove);
      cancelAnimationFrame(frame);
    };
  }, []);

  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
      <div
        ref={glowRef}
        className="absolute h-[28rem] w-[28rem] -translate-x-1/2 -translate-y-1/2 rounded-full blur-3xl"
        style={{
          left: "50%",
          top: "50%",
          background: "hsl(var(--primary) / 0.22)",
        }}
      />
      <div ref={layerRef} className="absolute inset-[-18%] will-change-transform">
        <div className="theme-bg-aurora" />
        <div className="theme-bg-spin" />
        <div className="theme-bg-orb theme-bg-orb-1" />
        <div className="theme-bg-orb theme-bg-orb-2" />
        <div className="theme-bg-orb theme-bg-orb-3" />
        <div className="theme-bg-glow" />
        {Array.from({ length: 9 }, (_, i) => (
          <span
            key={i}
            className="theme-bg-particle"
            style={{
              left: `${6 + i * 11}%`,
              animationDelay: `${i * 2.1}s`,
              animationDuration: `${18 + (i % 4) * 3}s`,
            }}
          />
        ))}
      </div>
    </div>
  );
}
