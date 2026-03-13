import { motion } from "framer-motion";
import { clsx } from "clsx";
import { Loader2 } from "lucide-react";

interface NeonButtonProps {
  variant?: "primary" | "secondary" | "ghost" | "danger";
  size?: "sm" | "md" | "lg";
  loading?: boolean;
  disabled?: boolean;
  icon?: React.ReactNode;
  children: React.ReactNode;
  onClick?: () => void;
  className?: string;
  type?: "button" | "submit";
}

const variants = {
  primary:
    "bg-[rgba(0,212,255,0.1)] border border-[rgba(0,212,255,0.4)] text-neon-cyan hover:bg-[rgba(0,212,255,0.2)] hover:border-neon-cyan hover:shadow-glow-cyan",
  secondary:
    "bg-[rgba(124,58,237,0.1)] border border-[rgba(124,58,237,0.4)] text-neon-violet hover:bg-[rgba(124,58,237,0.2)] hover:border-neon-violet hover:shadow-glow-violet",
  ghost:
    "bg-transparent border border-[rgba(255,255,255,0.1)] text-[rgba(255,255,255,0.7)] hover:bg-[rgba(255,255,255,0.05)] hover:border-[rgba(255,255,255,0.2)] hover:text-white",
  danger:
    "bg-[rgba(244,63,94,0.1)] border border-[rgba(244,63,94,0.4)] text-neon-rose hover:bg-[rgba(244,63,94,0.2)] hover:border-neon-rose",
};

const sizes = {
  sm: "px-4 py-2 text-sm rounded-xl",
  md: "px-6 py-3 text-base rounded-xl",
  lg: "px-8 py-4 text-lg rounded-xl",
};

export function NeonButton({
  variant = "primary",
  size = "md",
  loading,
  disabled,
  icon,
  children,
  onClick,
  className,
  type = "button",
}: NeonButtonProps) {
  return (
    <motion.button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      className={clsx(
        "font-semibold font-body transition-all duration-200 flex items-center gap-2",
        "disabled:opacity-40 disabled:cursor-not-allowed",
        variants[variant],
        sizes[size],
        className
      )}
      whileHover={{ scale: disabled ? 1 : 1.02 }}
      whileTap={{ scale: disabled ? 1 : 0.98 }}
    >
      {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : icon}
      {children}
    </motion.button>
  );
}
