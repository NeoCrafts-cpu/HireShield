import { motion, type HTMLMotionProps } from "framer-motion";
import { clsx } from "clsx";

interface GlassCardProps extends HTMLMotionProps<"div"> {
  glow?: "cyan" | "violet" | "green" | "none";
  hover?: boolean;
  children: React.ReactNode;
  className?: string;
}

const glowColors = {
  cyan: "hover:shadow-glow-cyan hover:border-[rgba(0,212,255,0.3)]",
  violet: "hover:shadow-glow-violet hover:border-[rgba(124,58,237,0.3)]",
  green: "hover:shadow-glow-green hover:border-[rgba(0,255,136,0.3)]",
  none: "",
};

export function GlassCard({
  glow = "cyan",
  hover = true,
  children,
  className,
  ...props
}: GlassCardProps) {
  return (
    <motion.div
      className={clsx(
        "glass transition-all duration-300",
        hover && glowColors[glow],
        className
      )}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      {...props}
    >
      {children}
    </motion.div>
  );
}
