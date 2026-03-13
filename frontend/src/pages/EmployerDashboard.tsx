import { motion } from "framer-motion";
import { useAccount } from "wagmi";
import { PostJobForm } from "../components/employer/PostJobForm";
import { JobCard } from "../components/employer/JobCard";
import { GlassCard } from "../components/ui/GlassCard";
import { LoadingDots } from "../components/ui/LoadingDots";
import { NeonButton } from "../components/ui/NeonButton";
import { ErrorBoundary } from "../components/ui/ErrorBoundary";
import { Navbar } from "../components/layout/Navbar";
import { Sidebar } from "../components/layout/Sidebar";
import { Footer } from "../components/layout/Footer";
import { AuroraBackground } from "../components/ui/AuroraBackground";
import { useJobList, useJob } from "../hooks/useJobList";
import { Briefcase, Plus, Shield } from "lucide-react";
import { useState } from "react";

function JobListItem({ jobId }: { jobId: number }) {
  const { job, isLoading } = useJob(jobId);

  if (isLoading) {
    return (
      <GlassCard className="p-6" glow="none">
        <div className="flex items-center justify-center py-4">
          <LoadingDots color="cyan" />
        </div>
      </GlassCard>
    );
  }

  if (!job) return null;

  return (
    <JobCard
      jobId={job.jobId}
      title={job.title}
      description={job.description}
      employer={job.employer}
      isActive={job.isActive}
      escrowAmount={job.escrowAmount}
      applicationCount={job.applicationCount}
    />
  );
}

export function EmployerDashboard() {
  const { isConnected } = useAccount();
  const { jobCount, isLoadingCount } = useJobList();
  const [showForm, setShowForm] = useState(true);

  const jobIds = Array.from({ length: jobCount }, (_, i) => i + 1).reverse();

  return (
    <div className="relative min-h-screen bg-background-primary">
      <AuroraBackground />
      <div className="relative z-10">
        <Navbar />
        <div className="flex">
          <Sidebar />
          <main className="flex-1 p-4 md:p-8 max-w-5xl">
            {/* Header */}
            <motion.div
              className="mb-8"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <div className="flex items-center justify-between flex-wrap gap-4">
                <div>
                  <h1 className="text-3xl font-heading font-bold text-white flex items-center gap-3">
                    <Briefcase className="w-8 h-8 text-neon-cyan" />
                    Employer Dashboard
                  </h1>
                  <p className="text-[rgba(255,255,255,0.5)] mt-1">
                    Post jobs with encrypted budgets. Match candidates
                    privately.
                  </p>
                </div>
                <NeonButton
                  onClick={() => setShowForm(!showForm)}
                  icon={showForm ? <Shield className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                >
                  {showForm ? "View Jobs" : "Post New Job"}
                </NeonButton>
              </div>
            </motion.div>

            {!isConnected ? (
              <GlassCard className="p-12 text-center" glow="cyan">
                <Shield className="w-16 h-16 text-neon-cyan mx-auto mb-4 opacity-50" />
                <h2 className="text-2xl font-heading font-bold text-white mb-2">
                  Connect Your Wallet
                </h2>
                <p className="text-[rgba(255,255,255,0.5)]">
                  Connect your wallet to post jobs and view applications
                </p>
              </GlassCard>
            ) : showForm ? (
              <ErrorBoundary fallbackMessage="FHE encryption module failed to load. Make sure your wallet is connected to the correct chain.">
                <PostJobForm />
              </ErrorBoundary>
            ) : (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-heading font-semibold text-white">
                    Posted Jobs ({jobCount})
                  </h2>
                </div>

                {isLoadingCount ? (
                  <div className="flex items-center justify-center py-12">
                    <LoadingDots color="cyan" />
                  </div>
                ) : jobIds.length === 0 ? (
                  <GlassCard className="p-12 text-center" glow="none">
                    <Briefcase className="w-12 h-12 text-[rgba(255,255,255,0.2)] mx-auto mb-3" />
                    <p className="text-[rgba(255,255,255,0.4)]">
                      No jobs posted yet. Create your first confidential job
                      listing!
                    </p>
                  </GlassCard>
                ) : (
                  <div className="grid md:grid-cols-2 gap-4">
                    {jobIds.map((id) => (
                      <JobListItem key={id} jobId={id} />
                    ))}
                  </div>
                )}
              </div>
            )}
          </main>
        </div>
        <Footer />
      </div>
    </div>
  );
}
