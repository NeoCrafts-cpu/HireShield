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
import { useActivityFeed, ActivityItem } from "../hooks/useActivityFeed";
import { useNFTCredentials, CredentialData } from "../hooks/useNFTCredential";
import { txUrl, shortenAddress } from "../lib/etherscan";
import { NFT_ADDRESS } from "../lib/constants";
import { User, Briefcase, Shield, Activity, Award, Filter, ExternalLink } from "lucide-react";
import { useState } from "react";

function BrowseJobItem({ jobId, filterActive }: { jobId: number; filterActive: boolean }) {
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

  if (!job) return null;
  if (filterActive && !job.isActive) return null;

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
  const { isConnected, address } = useAccount();
  const { jobCount, isLoadingCount } = useJobList();
  const { applications, isLoading: isLoadingApps } = useMyApplications();
  const { activities, isLoading: isLoadingActivity } = useActivityFeed();
  const { credentials, isLoading: isLoadingNFTs } = useNFTCredentials(address);
  const [tab, setTab] = useState<"browse" | "applications" | "activity" | "credentials">("browse");
  const [filterActive, setFilterActive] = useState(true);

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
            <div className="flex items-center gap-2 mb-6 flex-wrap">
              {([
                { key: "browse", label: "Browse Jobs", icon: <Briefcase className="w-4 h-4 inline mr-1.5" />, color: "violet" },
                { key: "applications", label: "My Applications", icon: <Shield className="w-4 h-4 inline mr-1.5" />, color: "cyan" },
                { key: "activity", label: "Activity", icon: <Activity className="w-4 h-4 inline mr-1.5" />, color: "green" },
                { key: "credentials", label: "NFT Credentials", icon: <Award className="w-4 h-4 inline mr-1.5" />, color: "amber" },
              ] as const).map((t) => (
                <button
                  key={t.key}
                  onClick={() => setTab(t.key)}
                  className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
                    tab === t.key
                      ? `text-neon-${t.color} bg-[rgba(124,58,237,0.1)] border border-[rgba(124,58,237,0.2)]`
                      : "text-[rgba(255,255,255,0.4)] hover:text-white hover:bg-[rgba(255,255,255,0.05)] border border-transparent"
                  }`}
                >
                  {t.icon}{t.label}
                </button>
              ))}
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
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <h2 className="text-xl font-heading font-semibold text-white">
                    Available Jobs
                  </h2>
                  <button
                    onClick={() => setFilterActive(!filterActive)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                      filterActive
                        ? "text-neon-green bg-[rgba(0,255,136,0.1)] border border-[rgba(0,255,136,0.2)]"
                        : "text-[rgba(255,255,255,0.4)] bg-[rgba(255,255,255,0.05)] border border-[rgba(255,255,255,0.1)]"
                    }`}
                  >
                    <Filter className="w-3 h-3" />
                    {filterActive ? "Active Only" : "Show All"}
                  </button>
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
                      <BrowseJobItem key={id} jobId={id} filterActive={filterActive} />
                    ))}
                  </div>
                )}
              </div>
            ) : tab === "applications" ? (
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
            ) : tab === "activity" ? (
              <div className="space-y-6">
                <h2 className="text-xl font-heading font-semibold text-white flex items-center gap-2">
                  <Activity className="w-5 h-5 text-neon-green" /> Activity Feed
                </h2>
                {isLoadingActivity ? (
                  <LoadingDots color="green" />
                ) : activities.length === 0 ? (
                  <GlassCard className="p-12 text-center" glow="none">
                    <p className="text-[rgba(255,255,255,0.4)]">No activity yet.</p>
                  </GlassCard>
                ) : (
                  <div className="space-y-2">
                    {activities.slice(0, 20).map((item, i) => (
                      <ActivityRow key={`${item.txHash}-${i}`} item={item} />
                    ))}
                  </div>
                )}
              </div>
            ) : tab === "credentials" ? (
              <div className="space-y-6">
                <h2 className="text-xl font-heading font-semibold text-white flex items-center gap-2">
                  <Award className="w-5 h-5 text-neon-amber" /> Soulbound NFT Credentials
                </h2>
                <p className="text-[rgba(255,255,255,0.4)] text-sm">
                  Non-transferable proof of verified employment matches
                </p>
                {isLoadingNFTs ? (
                  <LoadingDots color="green" />
                ) : credentials.length === 0 ? (
                  <GlassCard className="p-12 text-center" glow="none">
                    <Award className="w-12 h-12 text-[rgba(255,255,255,0.2)] mx-auto mb-3" />
                    <p className="text-[rgba(255,255,255,0.4)]">
                      No credentials yet. Get matched to earn your first soulbound NFT!
                    </p>
                  </GlassCard>
                ) : (
                  <div className="grid md:grid-cols-2 gap-4">
                    {credentials.map((cred) => (
                      <CredentialCard key={cred.tokenId} credential={cred} />
                    ))}
                  </div>
                )}
              </div>
            ) : null}
          </main>
        </div>
        <Footer />
      </div>
    </div>
  );
}

const ACTIVITY_LABELS: Record<string, { label: string; color: string }> = {
  applied: { label: "Applied", color: "text-neon-violet" },
  qualified: { label: "Qualification Checked", color: "text-neon-cyan" },
  matched: { label: "Match Found!", color: "text-neon-green" },
  escrow: { label: "Escrow Funded", color: "text-neon-amber" },
  negotiation: { label: "Counter-Offer", color: "text-neon-violet" },
  referral: { label: "Referral Submitted", color: "text-neon-cyan" },
};

function ActivityRow({ item }: { item: ActivityItem }) {
  const info = ACTIVITY_LABELS[item.type] ?? { label: item.type, color: "text-white" };
  return (
    <div className="glass p-3 rounded-xl flex items-center justify-between">
      <div className="flex items-center gap-3">
        <div className={`w-2 h-2 rounded-full ${info.color.replace("text-", "bg-")}`} />
        <div>
          <span className={`text-sm font-medium ${info.color}`}>{info.label}</span>
          {item.jobId != null && (
            <span className="text-xs text-[rgba(255,255,255,0.3)] ml-2">
              Job #{item.jobId}
            </span>
          )}
          {item.applicationId != null && (
            <span className="text-xs text-[rgba(255,255,255,0.3)] ml-2">
              App #{item.applicationId}
            </span>
          )}
        </div>
      </div>
      <a
        href={txUrl(item.txHash)}
        target="_blank"
        rel="noreferrer"
        className="text-[rgba(255,255,255,0.3)] hover:text-neon-cyan transition-colors"
      >
        <ExternalLink className="w-3.5 h-3.5" />
      </a>
    </div>
  );
}

function CredentialCard({ credential }: { credential: CredentialData }) {
  return (
    <GlassCard className="p-5" glow="green">
      <div className="flex items-center gap-3 mb-3">
        <div className="w-10 h-10 rounded-xl bg-[rgba(0,255,136,0.1)] border border-[rgba(0,255,136,0.2)] flex items-center justify-center">
          <Award className="w-5 h-5 text-neon-green" />
        </div>
        <div>
          <h4 className="text-white font-heading font-bold text-sm">
            Credential #{credential.tokenId}
          </h4>
          <p className="text-[rgba(255,255,255,0.3)] text-xs">
            Soulbound (non-transferable)
          </p>
        </div>
      </div>
      <div className="space-y-1 text-xs">
        <div className="flex justify-between">
          <span className="text-[rgba(255,255,255,0.4)]">Job</span>
          <span className="text-white">#{credential.jobId}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-[rgba(255,255,255,0.4)]">Application</span>
          <span className="text-white">#{credential.applicationId}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-[rgba(255,255,255,0.4)]">Employer</span>
          <span className="text-white font-mono">{shortenAddress(credential.employer)}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-[rgba(255,255,255,0.4)]">Matched</span>
          <span className="text-white">
            {credential.matchTimestamp > 0
              ? new Date(credential.matchTimestamp * 1000).toLocaleDateString()
              : "N/A"}
          </span>
        </div>
      </div>
    </GlassCard>
  );
}
