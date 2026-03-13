import { useParams } from "react-router-dom";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useJob } from "../hooks/useJobList";
import { useEscrow } from "../hooks/useEscrow";
import { useCheckQualification } from "../hooks/useCheckQualification";
import { ApplyForm } from "../components/candidate/ApplyForm";
import { EscrowStatus } from "../components/shared/EscrowStatus";
import { FHEStatusIndicator } from "../components/shared/FHEStatusIndicator";
import { GlassCard } from "../components/ui/GlassCard";
import { EncryptedBadge } from "../components/ui/EncryptedBadge";
import { StatusPill } from "../components/ui/StatusPill";
import { LoadingDots } from "../components/ui/LoadingDots";
import { Navbar } from "../components/layout/Navbar";
import { Footer } from "../components/layout/Footer";
import { AuroraBackground } from "../components/ui/AuroraBackground";
import {
  Briefcase,
  Users,
  Lock,
  Coins,
  ArrowLeft,
  Shield,
  CheckCircle,
  XCircle,
  Sparkles,
} from "lucide-react";
import { NeonButton } from "../components/ui/NeonButton";
import { useNavigate } from "react-router-dom";
import { formatEther } from "viem";
import toast from "react-hot-toast";

export function JobDetail() {
  const { id } = useParams<{ id: string }>();
  const jobId = id ? parseInt(id) : undefined;
  const navigate = useNavigate();
  const { job, isLoading } = useJob(jobId);
  const { escrowAmount } = useEscrow(jobId);

  if (isLoading) {
    return (
      <div className="relative min-h-screen bg-background-primary">
        <AuroraBackground />
        <div className="relative z-10">
          <Navbar />
          <div className="flex items-center justify-center py-24">
            <LoadingDots color="cyan" size="md" />
          </div>
        </div>
      </div>
    );
  }

  if (!job) {
    return (
      <div className="relative min-h-screen bg-background-primary">
        <AuroraBackground />
        <div className="relative z-10">
          <Navbar />
          <div className="max-w-4xl mx-auto p-8">
            <GlassCard className="p-12 text-center" glow="none">
              <p className="text-[rgba(255,255,255,0.4)] text-lg">
                Job not found
              </p>
              <NeonButton
                variant="ghost"
                onClick={() => navigate("/candidate")}
                className="mt-4 mx-auto"
              >
                Back to Jobs
              </NeonButton>
            </GlassCard>
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
        <main className="max-w-4xl mx-auto p-4 md:p-8">
          {/* Back button */}
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

          {/* Job Detail Card */}
          <GlassCard className="p-6 md:p-8 mb-6" glow="cyan">
            <div className="flex items-start justify-between mb-6 flex-wrap gap-3">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-[rgba(0,212,255,0.1)] border border-[rgba(0,212,255,0.2)] flex items-center justify-center">
                  <Briefcase className="w-7 h-7 text-neon-cyan" />
                </div>
                <div>
                  <h1 className="text-2xl md:text-3xl font-heading font-bold text-white">
                    {job.title}
                  </h1>
                  <p className="text-[rgba(255,255,255,0.3)] text-sm">
                    Posted by {job.employer.slice(0, 6)}...
                    {job.employer.slice(-4)}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <StatusPill
                  status={job.isActive ? "active" : "closed"}
                  size="md"
                />
                <FHEStatusIndicator status="encrypted" />
              </div>
            </div>

            <p className="text-[rgba(255,255,255,0.6)] leading-relaxed mb-6">
              {job.description}
            </p>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <div className="glass p-4 rounded-xl text-center">
                <Users className="w-5 h-5 text-neon-cyan mx-auto mb-2" />
                <div className="text-white font-bold text-lg">
                  {job.applicationCount}
                </div>
                <div className="text-[rgba(255,255,255,0.3)] text-xs">
                  Applicants
                </div>
              </div>
              <div className="glass p-4 rounded-xl text-center">
                <Lock className="w-5 h-5 text-neon-violet mx-auto mb-2" />
                <div className="text-neon-violet font-mono text-sm">
                  0x████
                </div>
                <div className="text-[rgba(255,255,255,0.3)] text-xs">
                  Budget (Encrypted)
                </div>
              </div>
              <div className="glass p-4 rounded-xl text-center">
                <Coins className="w-5 h-5 text-neon-green mx-auto mb-2" />
                <div className="text-neon-green font-bold text-lg">
                  {formatEther(job.escrowAmount)} ETH
                </div>
                <div className="text-[rgba(255,255,255,0.3)] text-xs">
                  Signing Bonus
                </div>
              </div>
              <div className="glass p-4 rounded-xl text-center">
                <EncryptedBadge label="FHE" size="sm" />
                <div className="text-[rgba(255,255,255,0.3)] text-xs mt-2">
                  Encryption
                </div>
              </div>
            </div>
          </GlassCard>

          {/* Escrow Status */}
          {job.escrowAmount > 0n && (
            <div className="mb-6">
              <EscrowStatus
                jobId={job.jobId}
                amount={job.escrowAmount}
                status="funded"
              />
            </div>
          )}

          {/* Apply Form */}
          {job.isActive && (
            <ApplyForm jobId={job.jobId} jobTitle={job.title} />
          )}

          {/* Check If I Qualify — the killer demo moment */}
          <QualificationChecker jobId={job.jobId} />
        </main>
        <Footer />
      </div>
    </div>
  );
}

function QualificationChecker({ jobId }: { jobId: number }) {
  const [applicationId, setApplicationId] = useState("");
  const [revealPhase, setRevealPhase] = useState<"idle" | "computing" | "revealing" | "done">("idle");

  const {
    checkQualification,
    isChecking,
    qualificationChecked,
    isMatched,
  } = useCheckQualification(
    jobId,
    applicationId ? parseInt(applicationId) : undefined
  );

  const handleCheck = async () => {
    if (!applicationId) {
      toast.error("Enter your application ID");
      return;
    }
    try {
      setRevealPhase("computing");
      await checkQualification();
      setRevealPhase("revealing");
      // Dramatic reveal delay
      await new Promise((r) => setTimeout(r, 2000));
      setRevealPhase("done");
    } catch (err) {
      console.error(err);
      toast.error("Qualification check failed");
      setRevealPhase("idle");
    }
  };

  return (
    <GlassCard className="p-6 md:p-8 mt-6" glow="green">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl bg-[rgba(0,255,136,0.1)] border border-[rgba(0,255,136,0.2)] flex items-center justify-center">
          <Shield className="w-5 h-5 text-neon-green" />
        </div>
        <div>
          <h2 className="text-xl font-heading font-bold text-white">
            Do I Qualify?
          </h2>
          <p className="text-[rgba(255,255,255,0.4)] text-sm">
            FHE checks salary, experience, skills & location — without revealing your data
          </p>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {revealPhase === "idle" && (
          <motion.div
            key="input"
            className="space-y-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div>
              <label className="text-[rgba(255,255,255,0.6)] text-sm mb-2 block">
                Your Application ID
              </label>
              <input
                type="number"
                value={applicationId}
                onChange={(e) => setApplicationId(e.target.value)}
                placeholder="e.g. 1"
                className="w-full bg-[rgba(255,255,255,0.05)] border border-[rgba(255,255,255,0.1)] rounded-xl px-4 py-3 text-white placeholder-[rgba(255,255,255,0.3)] focus:outline-none focus:border-[rgba(0,255,136,0.5)] transition-all"
              />
            </div>
            <NeonButton
              variant="primary"
              size="lg"
              onClick={handleCheck}
              loading={isChecking}
              icon={<Sparkles className="w-5 h-5" />}
              className="w-full justify-center"
            >
              Check If I Qualify
            </NeonButton>
            <p className="text-xs text-[rgba(255,255,255,0.3)] text-center">
              4-dimensional FHE comparison on encrypted data — neither party's values are revealed
            </p>
          </motion.div>
        )}

        {revealPhase === "computing" && (
          <motion.div
            key="computing"
            className="flex flex-col items-center justify-center py-12 gap-6"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="w-24 h-24 rounded-full border-2 border-[rgba(0,255,136,0.3)] flex items-center justify-center"
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            >
              <Shield className="w-10 h-10 text-neon-green" />
            </motion.div>
            <div className="text-center">
              <h3 className="text-xl font-heading font-bold text-white mb-2">
                FHE Computation In Progress
              </h3>
              <p className="text-[rgba(255,255,255,0.5)] text-sm">
                Comparing salary, experience, skills & location on encrypted data...
              </p>
              <div className="flex justify-center gap-3 mt-4">
                {["Salary ≤ Budget", "Exp ≥ Required", "Skills ≥ Min", "Location = Match"].map((label, i) => (
                  <motion.div
                    key={label}
                    className="text-xs px-3 py-1 rounded-full bg-[rgba(0,255,136,0.1)] text-neon-green border border-[rgba(0,255,136,0.2)]"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.4 }}
                  >
                    {label}
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {revealPhase === "revealing" && (
          <motion.div
            key="revealing"
            className="flex flex-col items-center justify-center py-12 gap-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="w-24 h-24 rounded-full bg-[rgba(0,255,136,0.1)] border-2 border-[rgba(0,255,136,0.3)] flex items-center justify-center"
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 0.8, repeat: Infinity }}
            >
              <Lock className="w-10 h-10 text-neon-green" />
            </motion.div>
            <h3 className="text-xl font-heading font-bold text-white">
              Decrypting Result...
            </h3>
          </motion.div>
        )}

        {revealPhase === "done" && (
          <motion.div
            key="result"
            className="flex flex-col items-center justify-center py-8 gap-4"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ type: "spring", stiffness: 200, damping: 15 }}
          >
            {qualificationChecked ? (
              <>
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", delay: 0.2 }}
                >
                  <div className="w-24 h-24 rounded-full bg-[rgba(0,255,136,0.15)] border-2 border-[rgba(0,255,136,0.4)] flex items-center justify-center">
                    <CheckCircle className="w-12 h-12 text-neon-green" />
                  </div>
                </motion.div>
                <h3 className="text-2xl font-heading font-black text-white">
                  Qualification Check Complete!
                </h3>
                <p className="text-[rgba(255,255,255,0.5)] text-center max-w-md">
                  The FHE computation has been performed on encrypted data.
                  Your encrypted result is stored on-chain — only you and the employer can decrypt it.
                </p>
                <div className="flex gap-2 mt-2">
                  <span className="text-xs px-3 py-1 rounded-full bg-[rgba(0,255,136,0.1)] text-neon-green border border-[rgba(0,255,136,0.2)]">
                    4D Match Computed
                  </span>
                  <span className="text-xs px-3 py-1 rounded-full bg-[rgba(124,58,237,0.1)] text-neon-violet border border-[rgba(124,58,237,0.2)]">
                    Result Sealed On-Chain
                  </span>
                </div>
              </>
            ) : (
              <>
                <div className="w-24 h-24 rounded-full bg-[rgba(255,255,255,0.05)] border-2 border-[rgba(255,255,255,0.1)] flex items-center justify-center">
                  <XCircle className="w-12 h-12 text-[rgba(255,255,255,0.3)]" />
                </div>
                <h3 className="text-xl font-heading font-bold text-white">
                  Check Pending
                </h3>
                <p className="text-[rgba(255,255,255,0.5)]">
                  The FHE result is still being computed by the threshold network.
                </p>
              </>
            )}
            <NeonButton
              variant="ghost"
              size="sm"
              onClick={() => setRevealPhase("idle")}
              className="mt-4"
            >
              Check Again
            </NeonButton>
          </motion.div>
        )}
      </AnimatePresence>
    </GlassCard>
  );
}
