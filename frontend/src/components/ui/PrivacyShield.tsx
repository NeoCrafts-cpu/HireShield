import { motion } from "framer-motion";
import { Shield } from "lucide-react";

interface PrivacyShieldProps {
  active?: boolean;
  size?: "sm" | "md" | "lg";
}

const sizeClasses = {
  sm: "w-8 h-8",
  md: "w-12 h-12",
  lg: "w-16 h-16",
};

const iconSizes = {
  sm: "w-4 h-4",
  md: "w-6 h-6",
  lg: "w-8 h-8",
};

export function PrivacyShield({ active = false, size = "md" }: PrivacyShieldProps) {
  return (
    <motion.div
      className={`${sizeClasses[size]} rounded-2xl flex items-center justify-center transition-all duration-500 ${
        active
          ? "bg-[rgba(0,255,136,0.15)] border border-[rgba(0,255,136,0.3)] shadow-glow-green"
          : "bg-[rgba(255,255,255,0.05)] border border-[rgba(255,255,255,0.1)]"
      }`}
      animate={
        active
          ? { scale: [1, 1.05, 1] }
          : {}
      }
      transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
    >
      <Shield
        className={`${iconSizes[size]} transition-colors duration-500 ${
          active ? "text-neon-green" : "text-[rgba(255,255,255,0.3)]"
        }`}
      />
    </motion.div>
  );
}
