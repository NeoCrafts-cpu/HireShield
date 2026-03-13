import { motion } from "framer-motion";
import { Lock, Shield } from "lucide-react";

interface EncryptedBadgeProps {
  label?: string;
  variant?: "lock" | "shield";
  size?: "sm" | "md";
}

export function EncryptedBadge({
  label = "FHE Encrypted",
  variant = "lock",
  size = "sm",
}: EncryptedBadgeProps) {
  const Icon = variant === "lock" ? Lock : Shield;
  return (
    <motion.div
      className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[rgba(0,212,255,0.1)] border border-[rgba(0,212,255,0.2)]"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      <motion.div
        animate={{ scale: [1, 1.2, 1] }}
        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
      >
        <Icon
          className={`text-neon-cyan ${size === "sm" ? "w-3 h-3" : "w-4 h-4"}`}
        />
      </motion.div>
      <span
        className={`text-neon-cyan font-medium font-body ${
          size === "sm" ? "text-xs" : "text-sm"
        }`}
      >
        {label}
      </span>
    </motion.div>
  );
}
