import { useParams, useNavigate } from "react-router-dom";
import { useState } from "react";
import { motion } from "framer-motion";
import { useMatchJob } from "../hooks/useMatchJob";
import { useJob } from "../hooks/useJobList";
import { useEscrow } from "../hooks/useEscrow";
import { useNegotiation } from "../hooks/useNegotiation";
import { GlassCard } from "../components/ui/GlassCard";
import { NeonButton } from "../components/ui/NeonButton";
import { EncryptedBadge } from "../components/ui/EncryptedBadge";
import { StatusPill } from "../components/ui/StatusPill";
import { LoadingDots } from "../components/ui/LoadingDots";
import { FHEStatusIndicator } from "../components/shared/FHEStatusIndicator";
import { Navbar } from "../components/layout/Navbar";
import { Footer } from "../components/layout/Footer";
import { AuroraBackground } from "../components/ui/AuroraBackground";
import { txUrl, addressUrl } from "../lib/etherscan";
import { HIRESHIELD_ADDRESS } from "../lib/constants";
import {
  CheckCircle,
  XCircle,
  Shield,
  ArrowLeft,
  Coins,
  Lock,
  PartyPopper,
  ExternalLink,
  RefreshCw,
} from "lucide-react";
import toast from "react-hot-toast";

export function MatchResult() {
  const { id } = useParams<{ id: string }>();
  const applicationId = id ? parseInt(id) : undefined;
  const navigate = useNavigate();
  const { matchResult, isLoading } = useMatchJob(applicationId);
  const jobId = matchResult?.jobId ? Number(matchResult.jobId) : undefined;
  const { job } = useJob(jobId);
  const { claimBonus, isClaiming, escrowAmount } = useEscrow(jobId);
  const { negotiationRound, canNegotiate, submitCounterOffer, isPending: isNegotiating } = useNegotiation(applicationId);
  const [counterSalary, setCounterSalary] = useState("");

  const handleAccept = async () => {
    if (!jobId) return;
    try {
      await claimBonus(jobId);
    } catch {
      // toast already shown by hook
    }
  };

  const handleCounterOffer = async () => {
    if (!counterSalary) {
      toast.error("Enter a counter salary");
      return;
    }
    try {
      const hash = await submitCounterOffer(BigInt(counterSalary));
      if (hash) {
        toast.success(
          <span>
            Counter-offer sent!{" "}
            <a href={txUrl(hash)} target="_blank" rel="noreferrer" className="underline text-neon-cyan">
              View tx
            </a>
          </span>
        );
      }
      setCounterSalary("");
    } catch (err: any) {
      toast.error(err?.shortMessage || "Counter-offer failed");
    }
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
                    On-Chain Escrow
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
                  loading={isClaiming}
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

            {/* Negotiation Section */}
            {matchResult?.qualificationChecked && !matchResult?.isMatched && canNegotiate && (
              <motion.div
                className="mt-6 glass p-5 rounded-2xl border border-[rgba(139,92,246,0.2)]"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
              >
                <div className="flex items-center gap-2 mb-3">
                  <RefreshCw className="w-4 h-4 text-neon-violet" />
                  <h3 className="text-white font-heading font-bold text-sm">
                    Counter-Offer (Round {negotiationRound + 1}/3)
                  </h3>
                </div>
                <p className="text-[rgba(255,255,255,0.4)] text-xs mb-4">
                  Submit an updated salary expectation. It will be FHE-encrypted and re-evaluated.
                </p>
                <div className="flex gap-3">
                  <input
                    type="number"
                    value={counterSalary}
                    onChange={(e) => setCounterSalary(e.target.value)}
                    placeholder="New salary (e.g. 90000)"
                    className="flex-1 bg-[rgba(255,255,255,0.05)] border border-[rgba(255,255,255,0.1)] rounded-xl px-4 py-2.5 text-white text-sm placeholder:text-[rgba(255,255,255,0.2)] focus:outline-none focus:border-neon-violet"
                  />
                  <NeonButton
                    variant="secondary"
                    size="md"
                    onClick={handleCounterOffer}
                    loading={isNegotiating}
                    icon={<RefreshCw className="w-4 h-4" />}
                  >
                    Send
                  </NeonButton>
                </div>
              </motion.div>
            )}

            {/* Etherscan Links */}
            <div className="mt-6 flex items-center gap-4 text-xs text-[rgba(255,255,255,0.3)]">
              <a
                href={addressUrl(HIRESHIELD_ADDRESS)}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-1 hover:text-neon-cyan transition-colors"
              >
                <ExternalLink className="w-3 h-3" /> Contract on Etherscan
              </a>
              {job && (
                <a
                  href={addressUrl(job.employer)}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-1 hover:text-neon-cyan transition-colors"
                >
                  <ExternalLink className="w-3 h-3" /> Employer
                </a>
              )}
            </div>
          </GlassCard>
        </main>
        <Footer />
      </div>
    </div>
  );
}
