import { useState } from "react";
import { motion } from "framer-motion";
import { GlassCard } from "../ui/GlassCard";
import { NeonButton } from "../ui/NeonButton";
import { useEscrowManagement } from "../../hooks/useEscrowManagement";
import { txUrl } from "../../lib/etherscan";
import { Coins, Power, RotateCcw, Plus } from "lucide-react";
import { formatEther } from "viem";
import toast from "react-hot-toast";

interface Props {
  jobId: number;
}

export function EscrowPanel({ jobId }: Props) {
  const {
    isOwner,
    isActive,
    escrowAmount,
    topUpEscrow,
    deactivateJob,
    reclaimEscrow,
    isPending,
  } = useEscrowManagement(jobId);

  const [topUpAmount, setTopUpAmount] = useState("");

  if (!isOwner) return null;

  const handleTopUp = async () => {
    if (!topUpAmount || parseFloat(topUpAmount) <= 0) {
      toast.error("Enter a valid ETH amount");
      return;
    }
    try {
      const hash = await topUpEscrow(topUpAmount);
      if (hash) {
        toast.success(
          <span>
            Topped up! <a href={txUrl(hash)} target="_blank" rel="noreferrer" className="underline text-neon-green">Tx</a>
          </span>
        );
      }
      setTopUpAmount("");
    } catch (err: any) {
      toast.error(err?.shortMessage || "Top-up failed");
    }
  };

  const handleDeactivate = async () => {
    try {
      const hash = await deactivateJob();
      if (hash) {
        toast.success(
          <span>
            Deactivated! <a href={txUrl(hash)} target="_blank" rel="noreferrer" className="underline">Tx</a>
          </span>
        );
      }
    } catch (err: any) {
      toast.error(err?.shortMessage || "Deactivate failed");
    }
  };

  const handleReclaim = async () => {
    try {
      const hash = await reclaimEscrow();
      if (hash) {
        toast.success(
          <span>
            Reclaimed! <a href={txUrl(hash)} target="_blank" rel="noreferrer" className="underline">Tx</a>
          </span>
        );
      }
    } catch (err: any) {
      toast.error(err?.shortMessage || "Reclaim failed");
    }
  };

  return (
    <GlassCard className="p-6" glow="green">
      <div className="flex items-center gap-3 mb-4">
        <Coins className="w-5 h-5 text-neon-green" />
        <h3 className="text-lg font-heading font-bold text-white">
          Escrow Management
        </h3>
      </div>

      <div className="glass p-4 rounded-xl mb-4">
        <div className="flex items-center justify-between">
          <span className="text-[rgba(255,255,255,0.5)] text-sm">Current Escrow</span>
          <span className="text-neon-green font-mono font-bold">
            {escrowAmount ? formatEther(escrowAmount) : "0"} ETH
          </span>
        </div>
        <div className="flex items-center justify-between mt-2">
          <span className="text-[rgba(255,255,255,0.5)] text-sm">Status</span>
          <span className={`text-sm font-medium ${isActive ? "text-neon-cyan" : "text-[rgba(255,255,255,0.3)]"}`}>
            {isActive ? "Active" : "Inactive"}
          </span>
        </div>
      </div>

      <div className="space-y-3">
        {/* Top Up */}
        {isActive && (
          <div className="flex gap-2">
            <input
              type="number"
              value={topUpAmount}
              onChange={(e) => setTopUpAmount(e.target.value)}
              placeholder="ETH amount"
              step="0.01"
              className="flex-1 bg-[rgba(255,255,255,0.05)] border border-[rgba(255,255,255,0.1)] rounded-xl px-3 py-2 text-white text-sm placeholder-[rgba(255,255,255,0.3)] focus:outline-none focus:border-[rgba(0,255,136,0.5)]"
            />
            <NeonButton
              variant="primary"
              size="sm"
              onClick={handleTopUp}
              loading={isPending}
              icon={<Plus className="w-3.5 h-3.5" />}
            >
              Top Up
            </NeonButton>
          </div>
        )}

        {/* Deactivate */}
        {isActive && (
          <NeonButton
            variant="ghost"
            size="sm"
            onClick={handleDeactivate}
            loading={isPending}
            icon={<Power className="w-3.5 h-3.5" />}
            className="w-full justify-center"
          >
            Deactivate Job
          </NeonButton>
        )}

        {/* Reclaim */}
        {!isActive && !!escrowAmount && escrowAmount > 0n && (
          <NeonButton
            variant="secondary"
            size="sm"
            onClick={handleReclaim}
            loading={isPending}
            icon={<RotateCcw className="w-3.5 h-3.5" />}
            className="w-full justify-center"
          >
            Reclaim Escrow
          </NeonButton>
        )}
      </div>
    </GlassCard>
  );
}
