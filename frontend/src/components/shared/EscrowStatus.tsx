import { motion } from "framer-motion";
import { GlassCard } from "../ui/GlassCard";
import { StatusPill } from "../ui/StatusPill";
import { Coins, Shield, ExternalLink } from "lucide-react";
import { formatEther } from "viem";

interface EscrowStatusProps {
  jobId: number;
  amount: bigint;
  status: "funded" | "pending" | "released";
  recipient?: string;
}

export function EscrowStatus({ jobId, amount, status, recipient }: EscrowStatusProps) {
  return (
    <GlassCard className="p-5" glow={status === "funded" ? "green" : "none"}>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-[rgba(124,58,237,0.1)] border border-[rgba(124,58,237,0.2)] flex items-center justify-center">
            <Coins className="w-4 h-4 text-neon-violet" />
          </div>
          <div>
            <p className="text-white text-sm font-semibold">Signing Bonus Escrow</p>
            <p className="text-[rgba(255,255,255,0.3)] text-xs">Job #{jobId}</p>
          </div>
        </div>
        <StatusPill status={status === "released" ? "matched" : status} />
      </div>

      <div className="glass p-3 rounded-xl space-y-2">
        <div className="flex items-center justify-between text-sm">
          <span className="text-[rgba(255,255,255,0.4)]">Amount</span>
          <span className="text-neon-green font-mono">
            {formatEther(amount)} ETH
          </span>
        </div>
        {recipient && (
          <div className="flex items-center justify-between text-sm">
            <span className="text-[rgba(255,255,255,0.4)]">Recipient</span>
            <span className="text-[rgba(255,255,255,0.6)] font-mono text-xs">
              {recipient.slice(0, 6)}...{recipient.slice(-4)}
            </span>
          </div>
        )}
        <div className="flex items-center justify-between text-sm">
          <span className="text-[rgba(255,255,255,0.4)]">Privacy</span>
          <div className="flex items-center gap-1 text-neon-violet text-xs">
            <Shield className="w-3 h-3" />
            {/* On-chain escrow via HireShieldEscrow contract */}
            Secured On-Chain
          </div>
        </div>
      </div>
    </GlassCard>
  );
}
