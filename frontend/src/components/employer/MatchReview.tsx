import { motion } from "framer-motion";
import { GlassCard } from "../ui/GlassCard";
import { StatusPill } from "../ui/StatusPill";
import { NeonButton } from "../ui/NeonButton";
import { useEmployerApplications } from "../../hooks/useEmployerApplications";
import { useWriteContract } from "wagmi";
import { HIRESHIELD_ABI, HIRESHIELD_ADDRESS } from "../../lib/constants";
import { txUrl, shortenAddress } from "../../lib/etherscan";
import { LoadingDots } from "../ui/LoadingDots";
import { CheckCircle, Shield, ExternalLink, UserCheck } from "lucide-react";
import toast from "react-hot-toast";

interface Props {
  jobId: number;
  jobTitle: string;
}

export function MatchReview({ jobId, jobTitle }: Props) {
  const { applications, isLoading } = useEmployerApplications(jobId);
  const { writeContractAsync, isPending } = useWriteContract();

  const handleSetMatch = async (applicationId: number) => {
    try {
      const hash = await writeContractAsync({
        address: HIRESHIELD_ADDRESS,
        abi: HIRESHIELD_ABI,
        functionName: "setMatchResult",
        args: [BigInt(jobId), BigInt(applicationId)],
      });
      if (hash) {
        toast.success(
          <span>
            Match confirmed!{" "}
            <a href={txUrl(hash)} target="_blank" rel="noreferrer" className="underline text-neon-green">
              View tx
            </a>
          </span>
        );
      }
    } catch (err: any) {
      toast.error(err?.shortMessage || "Match failed");
    }
  };

  if (isLoading) {
    return (
      <GlassCard className="p-6" glow="none">
        <LoadingDots color="cyan" />
      </GlassCard>
    );
  }

  if (applications.length === 0) {
    return (
      <GlassCard className="p-6 text-center" glow="none">
        <p className="text-[rgba(255,255,255,0.4)] text-sm">No applications yet for this job.</p>
      </GlassCard>
    );
  }

  return (
    <GlassCard className="p-6" glow="cyan">
      <div className="flex items-center gap-3 mb-4">
        <UserCheck className="w-5 h-5 text-neon-cyan" />
        <h3 className="text-lg font-heading font-bold text-white">
          Applications for {jobTitle}
        </h3>
      </div>
      <div className="space-y-3">
        {applications.map((app) => (
          <motion.div
            key={app.applicationId}
            className="glass p-4 rounded-xl flex items-center justify-between"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-[rgba(0,212,255,0.1)] flex items-center justify-center">
                <Shield className="w-4 h-4 text-neon-cyan" />
              </div>
              <div>
                <p className="text-white text-sm font-mono">
                  {shortenAddress(app.candidate)}
                </p>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="text-xs text-[rgba(255,255,255,0.3)]">
                    App #{app.applicationId}
                  </span>
                  {app.qualificationChecked && (
                    <span className="text-xs text-neon-green">Qualified</span>
                  )}
                  {app.negotiationRound > 0 && (
                    <span className="text-xs text-neon-amber">
                      Round {app.negotiationRound}/3
                    </span>
                  )}
                  {app.referrer !== "0x0000000000000000000000000000000000000000" && (
                    <span className="text-xs text-neon-violet">Referred</span>
                  )}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <StatusPill status={app.isMatched ? "matched" : app.qualificationChecked ? "active" : "pending"} />
              {app.qualificationChecked && !app.isMatched && (
                <NeonButton
                  variant="primary"
                  size="sm"
                  onClick={() => handleSetMatch(app.applicationId)}
                  loading={isPending}
                  icon={<CheckCircle className="w-3.5 h-3.5" />}
                >
                  Match
                </NeonButton>
              )}
              {app.isMatched && (
                <CheckCircle className="w-5 h-5 text-neon-green" />
              )}
            </div>
          </motion.div>
        ))}
      </div>
    </GlassCard>
  );
}
