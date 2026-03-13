import { motion } from "framer-motion";
import { useAccount } from "wagmi";
import { PostJobForm } from "../components/employer/PostJobForm";
import { JobCard } from "../components/employer/JobCard";
import { MatchReview } from "../components/employer/MatchReview";
import { EscrowPanel } from "../components/employer/EscrowPanel";
import { GlassCard } from "../components/ui/GlassCard";
import { LoadingDots } from "../components/ui/LoadingDots";
import { NeonButton } from "../components/ui/NeonButton";
import { ErrorBoundary } from "../components/ui/ErrorBoundary";
import { Navbar } from "../components/layout/Navbar";
import { Sidebar } from "../components/layout/Sidebar";
import { Footer } from "../components/layout/Footer";
import { AuroraBackground } from "../components/ui/AuroraBackground";
import { useJobList, useJob } from "../hooks/useJobList";
import { useSalaryAnalytics } from "../hooks/useSalaryAnalytics";
import { Briefcase, Plus, Shield, BarChart3, Users } from "lucide-react";
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
  const [view, setView] = useState<"post" | "jobs" | "review" | "analytics">("post");
  const [selectedJobId, setSelectedJobId] = useState<number | null>(null);

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
              </div>
              {/* View tabs */}
              <div className="flex items-center gap-2 mt-4 flex-wrap">
                {([
                  { key: "post", label: "Post Job", icon: <Plus className="w-4 h-4 inline mr-1.5" /> },
                  { key: "jobs", label: "My Jobs", icon: <Briefcase className="w-4 h-4 inline mr-1.5" /> },
                  { key: "review", label: "Review Apps", icon: <Users className="w-4 h-4 inline mr-1.5" /> },
                  { key: "analytics", label: "Analytics", icon: <BarChart3 className="w-4 h-4 inline mr-1.5" /> },
                ] as const).map((tab) => (
                  <button
                    key={tab.key}
                    onClick={() => setView(tab.key)}
                    className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
                      view === tab.key
                        ? "text-neon-cyan bg-[rgba(0,212,255,0.1)] border border-[rgba(0,212,255,0.2)]"
                        : "text-[rgba(255,255,255,0.4)] hover:text-white hover:bg-[rgba(255,255,255,0.05)] border border-transparent"
                    }`}
                  >
                    {tab.icon}{tab.label}
                  </button>
                ))}
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
            ) : view === "post" ? (
              <ErrorBoundary fallbackMessage="FHE encryption module failed to load. Make sure your wallet is connected to the correct chain.">
                <PostJobForm />
              </ErrorBoundary>
            ) : view === "review" ? (
              <div className="space-y-6">
                <h2 className="text-xl font-heading font-semibold text-white">
                  Review Applications
                </h2>
                {selectedJobId ? (
                  <div className="space-y-4">
                    <NeonButton variant="ghost" size="sm" onClick={() => setSelectedJobId(null)}>
                      Back to Job List
                    </NeonButton>
                    <MatchReview jobId={selectedJobId} jobTitle={`Job #${selectedJobId}`} />
                    <EscrowPanel jobId={selectedJobId} />
                  </div>
                ) : (
                  <>
                    <p className="text-[rgba(255,255,255,0.4)] text-sm">Select a job to review its applications:</p>
                    <div className="grid md:grid-cols-2 gap-4">
                      {jobIds.map((id) => (
                        <button key={id} onClick={() => setSelectedJobId(id)} className="text-left">
                          <JobListItem jobId={id} />
                        </button>
                      ))}
                    </div>
                  </>
                )}
              </div>
            ) : view === "analytics" ? (
              <AnalyticsDashboard />
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

const CATEGORIES = ["Engineering", "Design", "Marketing", "Operations", "Finance", "Sales"];

function AnalyticsDashboard() {
  return (
    <div className="space-y-6">
      <h2 className="text-xl font-heading font-semibold text-white flex items-center gap-2">
        <BarChart3 className="w-5 h-5 text-neon-cyan" /> Salary Band Analytics
      </h2>
      <p className="text-[rgba(255,255,255,0.4)] text-sm">
        Aggregated match counts per category. Salary totals are FHE-encrypted on-chain.
      </p>
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {CATEGORIES.map((cat) => (
          <CategoryCard key={cat} category={cat} />
        ))}
      </div>
    </div>
  );
}

function CategoryCard({ category }: { category: string }) {
  const { matchCount, isLoading } = useSalaryAnalytics(category);

  return (
    <GlassCard className="p-5" glow={matchCount > 0 ? "cyan" : "none"}>
      <h4 className="text-white font-heading font-bold text-sm mb-2">{category}</h4>
      <div className="flex items-center justify-between">
        <span className="text-[rgba(255,255,255,0.4)] text-xs">Matches</span>
        <span className="text-neon-cyan font-mono font-bold">
          {isLoading ? "..." : matchCount}
        </span>
      </div>
      {matchCount > 0 && (
        <div className="mt-2 text-xs text-[rgba(255,255,255,0.3)]">
          Total salary: <code className="text-neon-violet">encrypted</code>
        </div>
      )}
    </GlassCard>
  );
}
