import { useEffect, useState } from "react";

export function CursorLight() {
  const [pos, setPos] = useState({ x: -200, y: -200 });

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      setPos({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener("mousemove", handler);
    return () => window.removeEventListener("mousemove", handler);
  }, []);

  return (
    <div
      className="pointer-events-none fixed inset-0 z-[1] transition-opacity duration-300"
      style={{
        background: `radial-gradient(350px circle at ${pos.x}px ${pos.y}px, rgba(0,212,255,0.18), rgba(0,212,255,0.06) 40%, transparent 70%)`,
      }}
    />
  );
}
