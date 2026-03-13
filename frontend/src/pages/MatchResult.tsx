import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useMatchJob } from "../hooks/useMatchJob";
import { useJob } from "../hooks/useJobList";
import { GlassCard } from "../components/ui/GlassCard";
import { NeonButton } from "../components/ui/NeonButton";
import { EncryptedBadge } from "../components/ui/EncryptedBadge";
import { StatusPill } from "../components/ui/StatusPill";
import { LoadingDots } from "../components/ui/LoadingDots";
import { FHEStatusIndicator } from "../components/shared/FHEStatusIndicator";
import { Navbar } from "../components/layout/Navbar";
import { Footer } from "../components/layout/Footer";
import { AuroraBackground } from "../components/ui/AuroraBackground";
import {
  CheckCircle,
  XCircle,
  Shield,
  ArrowLeft,
  Coins,
  Lock,
  PartyPopper,
} from "lucide-react";
import toast from "react-hot-toast";

export function MatchResult() {
  const { id } = useParams<{ id: string }>();
  const applicationId = id ? parseInt(id) : undefined;
  const navigate = useNavigate();
  const { matchResult, isLoading } = useMatchJob(applicationId);
  const jobId = matchResult?.jobId ? Number(matchResult.jobId) : undefined;
  const { job } = useJob(jobId);

  const handleAccept = () => {
    // TODO: integrate Privara SDK for confidential bonus payout
    toast.success("Match accepted! Bonus payout initiated via Privara 🎉");
  };

  const handleDecline = () => {
    toast("Match declined. The job will be reopened.");
  };

  if (isLoading) {
    return (
      <div className="relative min-h-screen bg-background-primary">
        <AuroraBackground />
        <div className="relative z-10">
          <Navbar />
          <div className="flex items-center justify-center py-24">
            <LoadingDots color="green" size="md" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen bg-background-primary">
      <AuroraBackground />
      <div className="relative z-10">
        <Navbar />
        <main className="max-w-3xl mx-auto p-4 md:p-8">
          <motion.div
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <NeonButton
              variant="ghost"
              size="sm"
              onClick={() => navigate(-1)}
              icon={<ArrowLeft className="w-4 h-4" />}
              className="mb-6"
            >
              Back
            </NeonButton>
          </motion.div>

          <GlassCard
            className="p-8 md:p-12"
            glow={matchResult?.isMatched ? "green" : "violet"}
          >
            {/* Match Header */}
            <div className="text-center mb-8">
              {matchResult?.isMatched ? (
                <>
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{
                      type: "spring",
                      stiffness: 200,
                      damping: 15,
                    }}
                  >
                    <div className="w-24 h-24 rounded-full bg-[rgba(0,255,136,0.1)] border-2 border-[rgba(0,255,136,0.3)] flex items-center justify-center mx-auto mb-6">
                      <CheckCircle className="w-12 h-12 text-neon-green" />
                    </div>
                  </motion.div>
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                  >
                    <div className="flex items-center justify-center gap-2 mb-3">
                      <PartyPopper className="w-6 h-6 text-neon-amber" />
                      <h1 className="text-3xl font-heading font-black text-white">
                        It's a Match!
                      </h1>
                      <PartyPopper className="w-6 h-6 text-neon-amber" />
                    </div>
                    <p className="text-[rgba(255,255,255,0.5)] text-lg">
                      Your salary expectation fits within the employer's
                      encrypted budget
                    </p>
                  </motion.div>
                </>
              ) : (
                <>
                  <div className="w-24 h-24 rounded-full bg-[rgba(255,255,255,0.05)] border-2 border-[rgba(255,255,255,0.1)] flex items-center justify-center mx-auto mb-6">
                    <XCircle className="w-12 h-12 text-[rgba(255,255,255,0.3)]" />
                  </div>
                  <h1 className="text-3xl font-heading font-bold text-white mb-2">
                    Pending Match
                  </h1>
                  <p className="text-[rgba(255,255,255,0.5)]">
                    FHE comparison is being computed on encrypted data...
                  </p>
                </>
              )}
            </div>

            {/* Match Details */}
            <div className="space-y-4 mb-8">
              <div className="glass p-5 rounded-2xl">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[rgba(255,255,255,0.5)] text-sm">
                    Job
                  </span>
                  {job && (
                    <StatusPill
                      status={job.isActive ? "active" : "closed"}
                    />
                  )}
                </div>
                <h3 className="text-white font-heading font-bold text-lg">
                  {job?.title || "Loading..."}
                </h3>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="glass p-4 rounded-xl">
                  <div className="text-xs text-[rgba(255,255,255,0.4)] uppercase tracking-wider mb-2">
                    Employer Budget
                  </div>
                  <div className="flex items-center gap-2">
                    <Lock className="w-4 h-4 text-neon-cyan" />
                    <code className="text-neon-cyan text-sm">
                      0x████...████
                    </code>
                  </div>
                  <EncryptedBadge label="Sealed" size="sm" />
                </div>
                <div className="glass p-4 rounded-xl">
                  <div className="text-xs text-[rgba(255,255,255,0.4)] uppercase tracking-wider mb-2">
                    Your Expectation
                  </div>
                  <div className="flex items-center gap-2">
                    <Lock className="w-4 h-4 text-neon-violet" />
                    <code className="text-neon-violet text-sm">
                      0x████...████
                    </code>
                  </div>
                  <EncryptedBadge label="Sealed" size="sm" />
                </div>
              </div>

              <div className="glass p-4 rounded-xl flex items-center justify-between">
                <span className="text-[rgba(255,255,255,0.5)] text-sm">
                  FHE Status
                </span>
                <FHEStatusIndicator
                  status={matchResult?.isMatched ? "revealed" : "computing"}
                />
              </div>

              {matchResult?.isMatched && (
                <motion.div
                  className="glass p-4 rounded-xl flex items-center justify-between bg-[rgba(0,255,136,0.05)] border-[rgba(0,255,136,0.15)]"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                >
                  <div className="flex items-center gap-2">
                    <Coins className="w-5 h-5 text-neon-green" />
                    <span className="text-white text-sm font-medium">
                      Signing Bonus Available
                    </span>
                  </div>
                  <span className="text-neon-green font-mono font-bold">
                    via Privara
                  </span>
                </motion.div>
              )}
            </div>

            {/* Actions */}
            {matchResult?.isMatched && (
              <motion.div
                className="flex items-center gap-4"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7 }}
              >
                <NeonButton
                  variant="primary"
                  size="lg"
                  onClick={handleAccept}
                  icon={<CheckCircle className="w-5 h-5" />}
                  className="flex-1 justify-center"
                >
                  Accept & Claim Bonus
                </NeonButton>
                <NeonButton
                  variant="ghost"
                  size="lg"
                  onClick={handleDecline}
                  icon={<XCircle className="w-5 h-5" />}
                >
                  Decline
                </NeonButton>
              </motion.div>
            )}
          </GlassCard>
        </main>
        <Footer />
      </div>
    </div>
  );
}
