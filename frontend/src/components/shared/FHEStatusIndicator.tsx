import { motion } from "framer-motion";
import { Shield, Lock, Unlock, Loader2 } from "lucide-react";
import { clsx } from "clsx";

interface FHEStatusIndicatorProps {
  status: "idle" | "encrypting" | "encrypted" | "computing" | "revealed";
}

const statusConfig = {
  idle: {
    icon: Lock,
    label: "Ready to Encrypt",
    color: "text-[rgba(255,255,255,0.3)]",
    bg: "bg-[rgba(255,255,255,0.05)]",
    border: "border-[rgba(255,255,255,0.1)]",
  },
  encrypting: {
    icon: Loader2,
    label: "Encrypting...",
    color: "text-neon-cyan",
    bg: "bg-[rgba(0,212,255,0.08)]",
    border: "border-[rgba(0,212,255,0.2)]",
  },
  encrypted: {
    icon: Shield,
    label: "FHE Encrypted",
    color: "text-neon-green",
    bg: "bg-[rgba(0,255,136,0.08)]",
    border: "border-[rgba(0,255,136,0.2)]",
  },
  computing: {
    icon: Loader2,
    label: "FHE Computing...",
    color: "text-neon-violet",
    bg: "bg-[rgba(124,58,237,0.08)]",
    border: "border-[rgba(124,58,237,0.2)]",
  },
  revealed: {
    icon: Unlock,
    label: "Result Revealed",
    color: "text-neon-amber",
    bg: "bg-[rgba(245,158,11,0.08)]",
    border: "border-[rgba(245,158,11,0.2)]",
  },
};

export function FHEStatusIndicator({ status }: FHEStatusIndicatorProps) {
  const config = statusConfig[status];
  const Icon = config.icon;
  const isAnimating = status === "encrypting" || status === "computing";

  return (
    <motion.div
      className={clsx(
        "inline-flex items-center gap-2 px-4 py-2 rounded-full border",
        config.bg,
        config.border
      )}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      layout
    >
      <motion.div
        animate={isAnimating ? { rotate: 360 } : {}}
        transition={
          isAnimating
            ? { duration: 1, repeat: Infinity, ease: "linear" }
            : {}
        }
      >
        <Icon className={clsx("w-4 h-4", config.color)} />
      </motion.div>
      <span className={clsx("text-sm font-medium font-body", config.color)}>
        {config.label}
      </span>
    </motion.div>
  );
}
