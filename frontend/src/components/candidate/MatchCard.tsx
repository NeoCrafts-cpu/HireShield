import { motion } from "framer-motion";
import { GlassCard } from "../ui/GlassCard";
import { StatusPill } from "../ui/StatusPill";
import { NeonButton } from "../ui/NeonButton";
import { EncryptedBadge } from "../ui/EncryptedBadge";
import { useNavigate } from "react-router-dom";
import { CheckCircle, ArrowRight, Lock } from "lucide-react";

interface MatchCardProps {
  applicationId: number;
  jobId: number;
  jobTitle: string;
  isMatched: boolean;
}

export function MatchCard({
  applicationId,
  jobId,
  jobTitle,
  isMatched,
}: MatchCardProps) {
  const navigate = useNavigate();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: applicationId * 0.05 }}
    >
      <GlassCard className="p-6" glow={isMatched ? "green" : "violet"}>
        <div className="flex items-start justify-between mb-4">
          <div>
            <h3 className="text-white font-heading font-bold">{jobTitle}</h3>
            <p className="text-[rgba(255,255,255,0.3)] text-xs mt-1">
              Application #{applicationId}
            </p>
          </div>
          <StatusPill status={isMatched ? "matched" : "pending"} />
        </div>

        <div className="flex items-center gap-3 mb-4">
          <EncryptedBadge label="Salary Encrypted" size="sm" />
          {isMatched && (
            <div className="flex items-center gap-1.5 text-neon-green text-sm">
              <CheckCircle className="w-4 h-4" />
              Match Found
            </div>
          )}
        </div>

        <div className="glass p-3 rounded-xl mb-4">
          <div className="flex items-center gap-2 text-[rgba(255,255,255,0.4)] text-xs">
            <Lock className="w-3 h-3" />
            <span>Your expected salary:&nbsp;</span>
            <code className="text-neon-violet">0x████...████</code>
            <span className="ml-auto text-[rgba(255,255,255,0.2)]">ciphertext</span>
          </div>
        </div>

        {isMatched ? (
          <NeonButton
            variant="primary"
            size="sm"
            onClick={() => navigate(`/match/${applicationId}`)}
            icon={<ArrowRight className="w-4 h-4" />}
            className="w-full justify-center"
          >
            View Match Result
          </NeonButton>
        ) : (
          <div className="text-center text-[rgba(255,255,255,0.3)] text-sm py-2">
            Awaiting FHE comparison...
          </div>
        )}
      </GlassCard>
    </motion.div>
  );
}
