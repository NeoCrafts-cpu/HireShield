import { useParams } from "react-router-dom";
import { motion } from "framer-motion";
import { useJob } from "../hooks/useJobList";
import { usePrivaraEscrow } from "../hooks/usePrivaraEscrow";
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
} from "lucide-react";
import { NeonButton } from "../components/ui/NeonButton";
import { useNavigate } from "react-router-dom";
import { formatEther } from "viem";

export function JobDetail() {
  const { id } = useParams<{ id: string }>();
  const jobId = id ? parseInt(id) : undefined;
  const navigate = useNavigate();
  const { job, isLoading } = useJob(jobId);
  const { escrowAmount } = usePrivaraEscrow(jobId);

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
        </main>
        <Footer />
      </div>
    </div>
  );
}
