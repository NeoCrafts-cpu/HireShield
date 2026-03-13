import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { GlassCard } from "../ui/GlassCard";
import { StatusPill } from "../ui/StatusPill";
import { EncryptedBadge } from "../ui/EncryptedBadge";
import { NeonButton } from "../ui/NeonButton";
import { Briefcase, Users, Coins, ArrowRight } from "lucide-react";
import { formatEther } from "viem";

interface JobCardProps {
  jobId: number;
  title: string;
  description: string;
  employer: string;
  isActive: boolean;
  escrowAmount: bigint;
  applicationCount: number;
}

export function JobCard({
  jobId,
  title,
  description,
  employer,
  isActive,
  escrowAmount,
  applicationCount,
}: JobCardProps) {
  const navigate = useNavigate();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: jobId * 0.05 }}
    >
      <GlassCard className="p-6" glow={isActive ? "cyan" : "none"}>
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[rgba(0,212,255,0.1)] border border-[rgba(0,212,255,0.2)] flex items-center justify-center">
              <Briefcase className="w-5 h-5 text-neon-cyan" />
            </div>
            <div>
              <h3 className="text-white font-heading font-bold text-lg">
                {title}
              </h3>
              <p className="text-[rgba(255,255,255,0.3)] text-xs">
                {employer.slice(0, 6)}...{employer.slice(-4)}
              </p>
            </div>
          </div>
          <StatusPill status={isActive ? "active" : "closed"} />
        </div>

        <p className="text-[rgba(255,255,255,0.5)] text-sm mb-4 line-clamp-2">
          {description}
        </p>

        <div className="flex items-center gap-4 mb-4">
          <div className="flex items-center gap-1.5 text-sm text-[rgba(255,255,255,0.4)]">
            <Users className="w-3.5 h-3.5" />
            {applicationCount} applicant{applicationCount !== 1 ? "s" : ""}
          </div>
          {escrowAmount > 0n && (
            <div className="flex items-center gap-1.5 text-sm text-neon-green">
              <Coins className="w-3.5 h-3.5" />
              {formatEther(escrowAmount)} ETH bonus
            </div>
          )}
          <EncryptedBadge label="Budget Encrypted" size="sm" />
        </div>

        <NeonButton
          variant={isActive ? "primary" : "ghost"}
          size="sm"
          onClick={() => navigate(`/job/${jobId}`)}
          icon={<ArrowRight className="w-4 h-4" />}
          className="w-full justify-center"
        >
          View Details
        </NeonButton>
      </GlassCard>
    </motion.div>
  );
}
