import { motion } from "framer-motion";
import { clsx } from "clsx";

interface LoadingDotsProps {
  color?: "cyan" | "violet" | "green" | "white";
  size?: "sm" | "md";
}

const colorClasses = {
  cyan: "bg-neon-cyan",
  violet: "bg-neon-violet",
  green: "bg-neon-green",
  white: "bg-white",
};

export function LoadingDots({ color = "cyan", size = "md" }: LoadingDotsProps) {
  const dotSize = size === "sm" ? "w-1.5 h-1.5" : "w-2.5 h-2.5";

  return (
    <div className="flex items-center gap-1.5">
      {[0, 1, 2].map((i) => (
        <motion.div
          key={i}
          className={clsx("rounded-full", colorClasses[color], dotSize)}
          animate={{ scale: [1, 1.5, 1], opacity: [0.5, 1, 0.5] }}
          transition={{
            duration: 0.8,
            repeat: Infinity,
            delay: i * 0.2,
            ease: "easeInOut",
          }}
        />
      ))}
    </div>
  );
}
