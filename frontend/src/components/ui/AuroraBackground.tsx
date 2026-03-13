import { motion } from "framer-motion";
import { useMemo } from "react";

/** Floating dot particles */
function Particles({ count = 30 }: { count?: number }) {
  const dots = useMemo(
    () =>
      Array.from({ length: count }, (_, i) => ({
        id: i,
        left: `${Math.random() * 100}%`,
        size: 2 + Math.random() * 3,
        delay: Math.random() * 8,
        duration: 10 + Math.random() * 12,
        color:
          i % 3 === 0
            ? "rgba(0,212,255,0.5)"
            : i % 3 === 1
            ? "rgba(124,58,237,0.4)"
            : "rgba(0,255,136,0.35)",
      })),
    [count]
  );

  return (
    <>
      {dots.map((d) => (
        <div
          key={d.id}
          className="absolute rounded-full"
          style={{
            left: d.left,
            bottom: "-5%",
            width: d.size,
            height: d.size,
            background: d.color,
            animation: `floatParticle ${d.duration}s ease-in-out ${d.delay}s infinite`,
          }}
        />
      ))}
    </>
  );
}

export function AuroraBackground() {
  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
      {/* Cyan aurora blob */}
      <motion.div
        className="absolute w-[600px] h-[600px] rounded-full opacity-20"
        style={{
          background: "radial-gradient(circle, #00d4ff 0%, transparent 70%)",
          filter: "blur(80px)",
          top: "-10%",
          left: "-10%",
        }}
        animate={{
          x: [0, 60, 0],
          y: [0, 40, 0],
          scale: [1, 1.1, 1],
        }}
        transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
      />
      {/* Violet aurora blob */}
      <motion.div
        className="absolute w-[500px] h-[500px] rounded-full opacity-15"
        style={{
          background: "radial-gradient(circle, #7c3aed 0%, transparent 70%)",
          filter: "blur(80px)",
          top: "20%",
          right: "-5%",
        }}
        animate={{
          x: [0, -50, 0],
          y: [0, 60, 0],
          scale: [1.1, 1, 1.1],
        }}
        transition={{ duration: 14, repeat: Infinity, ease: "easeInOut" }}
      />
      {/* Green accent blob */}
      <motion.div
        className="absolute w-[400px] h-[400px] rounded-full opacity-10"
        style={{
          background: "radial-gradient(circle, #00ff88 0%, transparent 70%)",
          filter: "blur(80px)",
          bottom: "10%",
          left: "30%",
        }}
        animate={{
          x: [0, 30, 0],
          y: [0, -40, 0],
          scale: [1, 1.15, 1],
        }}
        transition={{ duration: 16, repeat: Infinity, ease: "easeInOut" }}
      />

      {/* Floating particles */}
      <Particles count={30} />

      {/* Grid overlay */}
      <div
        className="absolute inset-0 opacity-5"
        style={{
          backgroundImage: `
            linear-gradient(rgba(0,212,255,0.1) 1px, transparent 1px),
            linear-gradient(90deg, rgba(0,212,255,0.1) 1px, transparent 1px)
          `,
          backgroundSize: "60px 60px",
        }}
      />
    </div>
  );
}
