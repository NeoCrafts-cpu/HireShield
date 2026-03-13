import { motion } from "framer-motion";
import { useAccount } from "wagmi";
import { JobCard } from "../components/employer/JobCard";
import { MatchCard } from "../components/candidate/MatchCard";
import { GlassCard } from "../components/ui/GlassCard";
import { LoadingDots } from "../components/ui/LoadingDots";
import { Navbar } from "../components/layout/Navbar";
import { Sidebar } from "../components/layout/Sidebar";
import { Footer } from "../components/layout/Footer";
import { AuroraBackground } from "../components/ui/AuroraBackground";
import { useJobList, useJob, useMyApplications } from "../hooks/useJobList";
import { User, Briefcase, Shield } from "lucide-react";
import { useState } from "react";

function BrowseJobItem({ jobId }: { jobId: number }) {
  const { job, isLoading } = useJob(jobId);

  if (isLoading) {
    return (
      <GlassCard className="p-6" glow="none">
        <div className="flex items-center justify-center py-4">
          <LoadingDots color="violet" />
        </div>
      </GlassCard>
    );
  }

  if (!job || !job.isActive) return null;

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

export function CandidateDashboard() {
  const { isConnected } = useAccount();
  const { jobCount, isLoadingCount } = useJobList();
  const { applications, isLoading: isLoadingApps } = useMyApplications();
  const [tab, setTab] = useState<"browse" | "applications">("browse");

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
              <h1 className="text-3xl font-heading font-bold text-white flex items-center gap-3">
                <User className="w-8 h-8 text-neon-violet" />
                Candidate Dashboard
              </h1>
              <p className="text-[rgba(255,255,255,0.5)] mt-1">
                Browse encrypted jobs and apply with private salary expectations
              </p>
            </motion.div>

            {/* Tabs */}
            <div className="flex items-center gap-2 mb-6">
              <button
                onClick={() => setTab("browse")}
                className={`px-5 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                  tab === "browse"
                    ? "text-neon-violet bg-[rgba(124,58,237,0.1)] border border-[rgba(124,58,237,0.2)]"
                    : "text-[rgba(255,255,255,0.4)] hover:text-white hover:bg-[rgba(255,255,255,0.05)] border border-transparent"
                }`}
              >
                <Briefcase className="w-4 h-4 inline mr-2" />
                Browse Jobs
              </button>
              <button
                onClick={() => setTab("applications")}
                className={`px-5 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                  tab === "applications"
                    ? "text-neon-cyan bg-[rgba(0,212,255,0.1)] border border-[rgba(0,212,255,0.2)]"
                    : "text-[rgba(255,255,255,0.4)] hover:text-white hover:bg-[rgba(255,255,255,0.05)] border border-transparent"
                }`}
              >
                <Shield className="w-4 h-4 inline mr-2" />
                My Applications
              </button>
            </div>

            {!isConnected ? (
              <GlassCard className="p-12 text-center" glow="violet">
                <Shield className="w-16 h-16 text-neon-violet mx-auto mb-4 opacity-50" />
                <h2 className="text-2xl font-heading font-bold text-white mb-2">
                  Connect Your Wallet
                </h2>
                <p className="text-[rgba(255,255,255,0.5)]">
                  Connect your wallet to browse jobs and submit applications
                </p>
              </GlassCard>
            ) : tab === "browse" ? (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-heading font-semibold text-white">
                    Available Jobs
                  </h2>
                </div>
                {isLoadingCount ? (
                  <div className="flex items-center justify-center py-12">
                    <LoadingDots color="violet" />
                  </div>
                ) : jobIds.length === 0 ? (
                  <GlassCard className="p-12 text-center" glow="none">
                    <Briefcase className="w-12 h-12 text-[rgba(255,255,255,0.2)] mx-auto mb-3" />
                    <p className="text-[rgba(255,255,255,0.4)]">
                      No jobs posted yet. Check back soon!
                    </p>
                  </GlassCard>
                ) : (
                  <div className="grid md:grid-cols-2 gap-4">
                    {jobIds.map((id) => (
                      <BrowseJobItem key={id} jobId={id} />
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-6">
                <h2 className="text-xl font-heading font-semibold text-white">
                  My Applications
                </h2>
                {isLoadingApps ? (
                  <div className="flex items-center justify-center py-12">
                    <LoadingDots color="violet" />
                  </div>
                ) : applications.length === 0 ? (
                  <GlassCard className="p-12 text-center" glow="none">
                    <Shield className="w-12 h-12 text-[rgba(255,255,255,0.2)] mx-auto mb-3" />
                    <p className="text-[rgba(255,255,255,0.4)]">
                      Your encrypted applications will appear here after
                      submitting.
                    </p>
                    <p className="text-[rgba(255,255,255,0.25)] text-sm mt-2">
                      Match results are computed via FHE — no salary data is
                      revealed
                    </p>
                  </GlassCard>
                ) : (
                  <div className="grid md:grid-cols-2 gap-4">
                    {applications.map((app) => (
                      <MatchCard
                        key={app.applicationId}
                        applicationId={app.applicationId}
                        jobId={app.jobId}
                        jobTitle={app.jobTitle}
                        isMatched={app.isMatched}
                      />
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
