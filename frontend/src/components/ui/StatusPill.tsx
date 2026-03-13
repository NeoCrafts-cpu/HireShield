import { clsx } from "clsx";

interface StatusPillProps {
  status: "pending" | "matched" | "active" | "closed" | "funded";
  size?: "sm" | "md";
}

const statusConfig = {
  pending: {
    label: "Pending",
    bg: "bg-[rgba(245,158,11,0.1)]",
    border: "border-[rgba(245,158,11,0.3)]",
    text: "text-neon-amber",
    glow: "shadow-[0_0_10px_rgba(245,158,11,0.2)]",
  },
  matched: {
    label: "Matched",
    bg: "bg-[rgba(0,255,136,0.1)]",
    border: "border-[rgba(0,255,136,0.3)]",
    text: "text-neon-green",
    glow: "shadow-[0_0_10px_rgba(0,255,136,0.2)]",
  },
  active: {
    label: "Active",
    bg: "bg-[rgba(0,212,255,0.1)]",
    border: "border-[rgba(0,212,255,0.3)]",
    text: "text-neon-cyan",
    glow: "shadow-[0_0_10px_rgba(0,212,255,0.2)]",
  },
  closed: {
    label: "Closed",
    bg: "bg-[rgba(255,255,255,0.05)]",
    border: "border-[rgba(255,255,255,0.1)]",
    text: "text-[rgba(255,255,255,0.4)]",
    glow: "",
  },
  funded: {
    label: "Funded",
    bg: "bg-[rgba(124,58,237,0.1)]",
    border: "border-[rgba(124,58,237,0.3)]",
    text: "text-neon-violet",
    glow: "shadow-[0_0_10px_rgba(124,58,237,0.2)]",
  },
};

export function StatusPill({ status, size = "sm" }: StatusPillProps) {
  const config = statusConfig[status];
  return (
    <span
      className={clsx(
        "inline-flex items-center gap-1.5 rounded-full border font-medium font-body",
        config.bg,
        config.border,
        config.text,
        config.glow,
        size === "sm" ? "px-3 py-1 text-xs" : "px-4 py-1.5 text-sm"
      )}
    >
      <span
        className={clsx(
          "rounded-full",
          config.text.replace("text-", "bg-"),
          size === "sm" ? "w-1.5 h-1.5" : "w-2 h-2"
        )}
        style={{
          backgroundColor: "currentColor",
        }}
      />
      {config.label}
    </span>
  );
}
