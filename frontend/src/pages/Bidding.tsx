import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAccount, useReadContract, useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import {
  Gavel,
  Clock,
  Users,
  Lock,
  Trophy,
  Plus,
  CheckCircle,
  XCircle,
  Eye,
  ChevronRight,
  BarChart3,
} from "lucide-react";
import { GlassCard } from "../components/ui/GlassCard";
import { NeonButton } from "../components/ui/NeonButton";
import { EncryptedBadge } from "../components/ui/EncryptedBadge";
import { StatusPill } from "../components/ui/StatusPill";
import { LoadingDots } from "../components/ui/LoadingDots";
import { AppNavbar } from "../components/layout/AppNavbar";
import { Footer } from "../components/layout/Footer";
import { AuroraBackground } from "../components/ui/AuroraBackground";
import { BIDDING_ADDRESS, BIDDING_ABI } from "../lib/constants";
import toast from "react-hot-toast";

// ─────────────────────────────────────────────────────────────
//  Sub-components
// ─────────────────────────────────────────────────────────────

function TimeRemaining({ endTime }: { endTime: bigint }) {
  const now = BigInt(Math.floor(Date.now() / 1000));
  const remaining = Number(endTime - now);
  if (remaining <= 0) return <span className="text-neon-rose text-xs">Ended</span>;
  const h = Math.floor(remaining / 3600);
  const m = Math.floor((remaining % 3600) / 60);
  return (
    <span className="text-neon-cyan text-xs font-mono">
      {h > 0 ? `${h}h ` : ""}{m}m remaining
    </span>
  );
}

function AuctionCard({
  auctionId,
  isCandidate,
  onResolve,
  onAccept,
  onDecline,
}: {
  auctionId: bigint;
  isCandidate: boolean;
  onResolve: (id: bigint) => void;
  onAccept: (id: bigint) => void;
  onDecline: (id: bigint) => void;
}) {
  const { data: auction, isLoading } = useReadContract({
    address: BIDDING_ADDRESS,
    abi: BIDDING_ABI,
    functionName: "getAuction",
    args: [auctionId],
  });

  if (isLoading) {
    return (
      <GlassCard className="p-4">
        <div className="flex items-center justify-center py-3">
          <LoadingDots color="violet" />
        </div>
      </GlassCard>
    );
  }

  if (!auction) return null;

  const [candidate, active, resolved, bidCount, endTime, winnerEmployer] = auction as [
    `0x${string}`, boolean, boolean, bigint, bigint, `0x${string}`, bigint
  ];

  const hasWinner = winnerEmployer !== "0x0000000000000000000000000000000000000000";
  const isLive = active && !resolved;
  const isExpired = !active || Number(endTime) < Math.floor(Date.now() / 1000);

  return (
    <GlassCard className="p-5" glow={isLive ? "violet" : "none"}>
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          <Gavel className="w-4 h-4 text-neon-violet" />
          <span className="text-white font-semibold">Auction #{auctionId.toString()}</span>
          <EncryptedBadge label="Blind" />
        </div>
        {isLive ? (
          <StatusPill status="active" />
        ) : resolved ? (
          <StatusPill status="matched" />
        ) : (
          <StatusPill status="closed" />
        )}
      </div>

      <div className="grid grid-cols-3 gap-3 mb-4">
        <div className="text-center">
          <div className="flex items-center justify-center gap-1 text-text-secondary text-xs mb-1">
            <Users className="w-3 h-3" /> Bids
          </div>
          <p className="text-white font-bold">{Number(bidCount)}</p>
        </div>
        <div className="text-center">
          <div className="flex items-center justify-center gap-1 text-text-secondary text-xs mb-1">
            <Lock className="w-3 h-3" /> Amount
          </div>
          <p className="text-neon-violet font-bold text-sm">Hidden</p>
        </div>
        <div className="text-center">
          <div className="flex items-center justify-center gap-1 text-text-secondary text-xs mb-1">
            <Clock className="w-3 h-3" /> Time
          </div>
          <TimeRemaining endTime={endTime} />
        </div>
      </div>

      {hasWinner && resolved && (
        <div className="flex items-center gap-2 mb-3 p-2 rounded-lg bg-[rgba(0,212,255,0.07)] border border-[rgba(0,212,255,0.2)]">
          <Trophy className="w-4 h-4 text-neon-cyan" />
          <span className="text-neon-cyan text-xs">
            Winner: {winnerEmployer.slice(0, 6)}…{winnerEmployer.slice(-4)}
          </span>
        </div>
      )}

      {isCandidate && (
        <div className="flex gap-2 flex-wrap">
          {isExpired && !resolved && (
            <NeonButton
              variant="primary"
              size="sm"
              icon={<BarChart3 className="w-3 h-3" />}
              onClick={() => onResolve(auctionId)}
            >
              Resolve
            </NeonButton>
          )}
          {resolved && hasWinner && (
            <>
              <NeonButton
                variant="primary"
                size="sm"
                icon={<CheckCircle className="w-3 h-3" />}
                onClick={() => onAccept(auctionId)}
              >
                Accept
              </NeonButton>
              <NeonButton
                variant="danger"
                size="sm"
                icon={<XCircle className="w-3 h-3" />}
                onClick={() => onDecline(auctionId)}
              >
                Decline
              </NeonButton>
            </>
          )}
        </div>
      )}
    </GlassCard>
  );
}

// ─────────────────────────────────────────────────────────────
//  Open Auction Modal
// ─────────────────────────────────────────────────────────────
function OpenAuctionPanel({ onSuccess }: { onSuccess: () => void }) {
  const [duration, setDuration] = useState("86400"); // 24h default
  const [jobId, setJobId] = useState("");
  const { writeContract, data: txHash, isPending } = useWriteContract();
  const { isLoading: isConfirming } = useWaitForTransactionReceipt({ hash: txHash });

  const handleOpen = () => {
    if (!duration || !jobId) {
      toast.error("Fill all fields");
      return;
    }
    writeContract({
      address: BIDDING_ADDRESS,
      abi: BIDDING_ABI,
      functionName: "openAuction",
      args: [BigInt(duration), BigInt(jobId)],
    }, {
      onSuccess: () => {
        toast.success("Auction opened! Employers can now place blind bids.");
        onSuccess();
      },
      onError: (e: Error) => toast.error(e.message || "Failed to open auction"),
    });
  };

  const durations = [
    { label: "1 hour", value: "3600" },
    { label: "24 hours", value: "86400" },
    { label: "3 days", value: "259200" },
    { label: "7 days", value: "604800" },
  ];

  return (
    <GlassCard className="p-5" glow="violet">
      <div className="flex items-center gap-2 mb-4">
        <Plus className="w-4 h-4 text-neon-violet" />
        <h3 className="text-white font-semibold">Open Blind Auction</h3>
      </div>
      <div className="space-y-3">
        <div>
          <label className="text-text-secondary text-xs mb-1 block">Linked Job ID (optional)</label>
          <input
            type="number"
            value={jobId}
            onChange={(e) => setJobId(e.target.value)}
            placeholder="0"
            className="w-full bg-[rgba(255,255,255,0.05)] border border-[rgba(255,255,255,0.1)] rounded-xl px-3 py-2 text-white text-sm focus:outline-none focus:border-neon-violet"
          />
        </div>
        <div>
          <label className="text-text-secondary text-xs mb-1 block">Auction Duration</label>
          <div className="grid grid-cols-2 gap-2">
            {durations.map((d) => (
              <button
                key={d.value}
                onClick={() => setDuration(d.value)}
                className={`px-3 py-2 rounded-xl text-xs border transition-all ${
                  duration === d.value
                    ? "border-neon-violet bg-[rgba(124,58,237,0.2)] text-neon-violet"
                    : "border-[rgba(255,255,255,0.1)] text-text-secondary hover:border-[rgba(124,58,237,0.4)]"
                }`}
              >
                {d.label}
              </button>
            ))}
          </div>
        </div>
        <NeonButton
          variant="secondary"
          icon={<Gavel className="w-4 h-4" />}
          onClick={handleOpen}
          loading={isPending || isConfirming}
          className="w-full"
        >
          {isConfirming ? "Confirming…" : "Open Auction"}
        </NeonButton>
      </div>
    </GlassCard>
  );
}

// ─────────────────────────────────────────────────────────────
//  Main page
// ─────────────────────────────────────────────────────────────

export function Bidding() {
  const { isConnected, address } = useAccount();
  const [tab, setTab] = useState<"candidate" | "employer">("candidate");
  const [auctionIdInput, setAuctionIdInput] = useState("");
  const [myAuctionIds, setMyAuctionIds] = useState<bigint[]>([]);
  const [refresh, setRefresh] = useState(0);

  // Read global auction counter
  const { data: auctionCount } = useReadContract({
    address: BIDDING_ADDRESS,
    abi: BIDDING_ABI,
    functionName: "auctionCounter",
  });

  const { writeContract, data: txHash, isPending } = useWriteContract();
  const { isLoading: isConfirming } = useWaitForTransactionReceipt({ hash: txHash });

  const handleResolve = (id: bigint) => {
    writeContract({
      address: BIDDING_ADDRESS,
      abi: BIDDING_ABI,
      functionName: "resolveAuction",
      args: [id],
    }, {
      onSuccess: () => toast.success("Auction resolved! Winner determined via FHE."),
      onError: (e: Error) => toast.error(e.message),
    });
  };

  const handleAccept = (id: bigint) => {
    writeContract({
      address: BIDDING_ADDRESS,
      abi: BIDDING_ABI,
      functionName: "acceptBid",
      args: [id],
    }, {
      onSuccess: () => toast.success("Bid accepted!"),
      onError: (e: Error) => toast.error(e.message),
    });
  };

  const handleDecline = (id: bigint) => {
    writeContract({
      address: BIDDING_ADDRESS,
      abi: BIDDING_ABI,
      functionName: "declineAuction",
      args: [id],
    }, {
      onSuccess: () => toast.success("Auction declined."),
      onError: (e: Error) => toast.error(e.message),
    });
  };

  const handleAddAuction = () => {
    const id = BigInt(auctionIdInput || "0");
    if (id > 0n && !myAuctionIds.includes(id)) {
      setMyAuctionIds((prev) => [...prev, id]);
      setAuctionIdInput("");
    }
  };

  const totalAuctions = auctionCount ? Number(auctionCount) : 0;

  return (
    <div className="relative min-h-screen bg-background-primary">
      <AuroraBackground />
      <AppNavbar />
      <main className="p-4 md:p-8">
        <div className="max-w-5xl mx-auto">

            {/* Header */}
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-8"
            >
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 rounded-xl bg-[rgba(124,58,237,0.15)] border border-[rgba(124,58,237,0.3)]">
                  <Gavel className="w-6 h-6 text-neon-violet" />
                </div>
                <h1 className="text-3xl font-bold text-white">Blind Auctions</h1>
              </div>
              <p className="text-text-secondary">
                FHE-powered salary auctions — bids stay encrypted until the winner is revealed.
              </p>

              {/* Stats bar */}
              <div className="flex gap-4 mt-4">
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[rgba(255,255,255,0.04)] border border-[rgba(255,255,255,0.08)]">
                  <Gavel className="w-3.5 h-3.5 text-neon-violet" />
                  <span className="text-text-secondary text-xs">{totalAuctions} total auctions</span>
                </div>
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[rgba(255,255,255,0.04)] border border-[rgba(255,255,255,0.08)]">
                  <Lock className="w-3.5 h-3.5 text-neon-cyan" />
                  <span className="text-text-secondary text-xs">All bids FHE-encrypted</span>
                </div>
              </div>
            </motion.div>

            {!isConnected ? (
              <GlassCard className="p-8 text-center">
                <Gavel className="w-12 h-12 text-neon-violet mx-auto mb-4 opacity-50" />
                <p className="text-text-secondary">Connect your wallet to participate in blind auctions.</p>
              </GlassCard>
            ) : (
              <div className="space-y-6">
                {/* Tabs */}
                <div className="flex gap-2">
                  {(["candidate", "employer"] as const).map((t) => (
                    <button
                      key={t}
                      onClick={() => setTab(t)}
                      className={`px-5 py-2 rounded-xl text-sm font-medium transition-all capitalize ${
                        tab === t
                          ? "bg-[rgba(124,58,237,0.2)] border border-neon-violet text-neon-violet"
                          : "border border-[rgba(255,255,255,0.1)] text-text-secondary hover:text-white"
                      }`}
                    >
                      {t === "candidate" ? "My Auctions (Candidate)" : "Place Bids (Employer)"}
                    </button>
                  ))}
                </div>

                <AnimatePresence mode="wait">
                  {tab === "candidate" ? (
                    <motion.div
                      key="candidate"
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 10 }}
                      className="grid grid-cols-1 lg:grid-cols-3 gap-6"
                    >
                      {/* Left: Open auction */}
                      <div className="lg:col-span-1">
                        <OpenAuctionPanel onSuccess={() => setRefresh((r) => r + 1)} />

                        {/* How FHE blind auction works */}
                        <GlassCard className="p-4 mt-4">
                          <h4 className="text-white text-sm font-semibold mb-3">How it works</h4>
                          <div className="space-y-2 text-xs text-text-secondary">
                            <div className="flex items-start gap-2">
                              <ChevronRight className="w-3 h-3 text-neon-violet mt-0.5 shrink-0" />
                              <span>You open an auction with a time limit.</span>
                            </div>
                            <div className="flex items-start gap-2">
                              <ChevronRight className="w-3 h-3 text-neon-violet mt-0.5 shrink-0" />
                              <span>Employers submit encrypted salary bids — no one can see them.</span>
                            </div>
                            <div className="flex items-start gap-2">
                              <ChevronRight className="w-3 h-3 text-neon-violet mt-0.5 shrink-0" />
                              <span>After the deadline, you trigger resolution — FHE finds the highest bid.</span>
                            </div>
                            <div className="flex items-start gap-2">
                              <ChevronRight className="w-3 h-3 text-neon-violet mt-0.5 shrink-0" />
                              <span>Accept or decline the winner. Only the winner amount is revealed to you.</span>
                            </div>
                          </div>
                        </GlassCard>
                      </div>

                      {/* Right: My auction list */}
                      <div className="lg:col-span-2 space-y-4">
                        <div className="flex items-center gap-3">
                          <input
                            type="number"
                            value={auctionIdInput}
                            onChange={(e) => setAuctionIdInput(e.target.value)}
                            placeholder="Track auction by ID…"
                            className="flex-1 bg-[rgba(255,255,255,0.05)] border border-[rgba(255,255,255,0.1)] rounded-xl px-3 py-2 text-white text-sm focus:outline-none focus:border-neon-violet"
                          />
                          <NeonButton variant="ghost" size="sm" onClick={handleAddAuction}>
                            Track
                          </NeonButton>
                        </div>

                        {myAuctionIds.length === 0 ? (
                          <GlassCard className="p-8 text-center">
                            <Gavel className="w-8 h-8 text-neon-violet mx-auto mb-3 opacity-30" />
                            <p className="text-text-secondary text-sm">
                              Open an auction above, or enter an auction ID to track it.
                            </p>
                          </GlassCard>
                        ) : (
                          <div className="space-y-3">
                            {myAuctionIds.map((id) => (
                              <AuctionCard
                                key={id.toString()}
                                auctionId={id}
                                isCandidate={true}
                                onResolve={handleResolve}
                                onAccept={handleAccept}
                                onDecline={handleDecline}
                              />
                            ))}
                          </div>
                        )}
                      </div>
                    </motion.div>
                  ) : (
                    <motion.div
                      key="employer"
                      initial={{ opacity: 0, x: 10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -10 }}
                    >
                      <EmployerBidPanel />
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )}
          </div>
        </main>
      <Footer />
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
//  Employer bid panel
// ─────────────────────────────────────────────────────────────
function EmployerBidPanel() {
  const [auctionIdStr, setAuctionIdStr] = useState("");
  const [bidAmount, setBidAmount] = useState("");
  const auctionId = auctionIdStr ? BigInt(auctionIdStr) : undefined;

  const { data: auction, isLoading: isLoadingAuction } = useReadContract({
    address: BIDDING_ADDRESS,
    abi: BIDDING_ABI,
    functionName: "getAuction",
    args: auctionId !== undefined ? [auctionId] : undefined,
    query: { enabled: auctionId !== undefined },
  });

  const { writeContract, data: txHash, isPending } = useWriteContract();
  const { isLoading: isConfirming } = useWaitForTransactionReceipt({ hash: txHash });

  const handlePlaceBid = () => {
    if (!auctionId || !bidAmount) {
      toast.error("Enter auction ID and bid amount");
      return;
    }
    // NOTE: In production, bidAmount should be encrypted with useCofheEncrypt before sending.
    // This simplified version sends a placeholder — integrate useCofheEncryptAndWriteContract
    // for real FHE encryption of the bid.
    toast.error(
      "To place a real encrypted bid, use the FHE encrypt flow (useCofheEncryptAndWriteContract). Connect your CoFHE wallet and use the encrypt button.",
      { duration: 6000 }
    );
  };

  const auctionInfo = auction
    ? (auction as [`0x${string}`, boolean, boolean, bigint, bigint, `0x${string}`, bigint])
    : null;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Auction lookup */}
      <GlassCard className="p-5" glow="cyan">
        <div className="flex items-center gap-2 mb-4">
          <Eye className="w-4 h-4 text-neon-cyan" />
          <h3 className="text-white font-semibold">Find Auction</h3>
        </div>
        <div className="space-y-3">
          <div>
            <label className="text-text-secondary text-xs mb-1 block">Auction ID</label>
            <input
              type="number"
              value={auctionIdStr}
              onChange={(e) => setAuctionIdStr(e.target.value)}
              placeholder="Enter auction ID"
              className="w-full bg-[rgba(255,255,255,0.05)] border border-[rgba(255,255,255,0.1)] rounded-xl px-3 py-2 text-white text-sm focus:outline-none focus:border-neon-cyan"
            />
          </div>

          {isLoadingAuction && <LoadingDots color="cyan" />}
          {auctionInfo && (
            <motion.div
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-2 p-3 rounded-xl bg-[rgba(0,212,255,0.05)] border border-[rgba(0,212,255,0.15)]"
            >
              <div className="flex justify-between text-xs">
                <span className="text-text-secondary">Candidate</span>
                <span className="text-white font-mono">
                  {auctionInfo[0].slice(0, 6)}…{auctionInfo[0].slice(-4)}
                </span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-text-secondary">Status</span>
                {auctionInfo[1] ? (
                  <StatusPill status="active" />
                ) : (
                  <StatusPill status="closed" />
                )}
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-text-secondary">Bids placed</span>
                <span className="text-white">{Number(auctionInfo[3])}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-text-secondary">Time</span>
                <TimeRemaining endTime={auctionInfo[4]} />
              </div>
            </motion.div>
          )}
        </div>
      </GlassCard>

      {/* Bid placement */}
      <GlassCard className="p-5">
        <div className="flex items-center gap-2 mb-4">
          <Lock className="w-4 h-4 text-neon-violet" />
          <h3 className="text-white font-semibold">Place Encrypted Bid</h3>
          <EncryptedBadge label="FHE" />
        </div>
        <div className="space-y-3">
          <div>
            <label className="text-text-secondary text-xs mb-1 block">Your Salary Offer (USD)</label>
            <input
              type="number"
              value={bidAmount}
              onChange={(e) => setBidAmount(e.target.value)}
              placeholder="e.g. 120000"
              className="w-full bg-[rgba(255,255,255,0.05)] border border-[rgba(255,255,255,0.1)] rounded-xl px-3 py-2 text-white text-sm focus:outline-none focus:border-neon-violet"
            />
            <p className="text-text-secondary text-xs mt-1">
              Your bid will be encrypted with FHE before being sent on-chain. Only the winner amount is ever revealed.
            </p>
          </div>

          <NeonButton
            variant="secondary"
            icon={<Lock className="w-4 h-4" />}
            onClick={handlePlaceBid}
            loading={isPending || isConfirming}
            disabled={!auctionId}
            className="w-full"
          >
            {isConfirming ? "Confirming…" : "Encrypt & Place Bid"}
          </NeonButton>

          <div className="p-3 rounded-xl bg-[rgba(124,58,237,0.07)] border border-[rgba(124,58,237,0.2)] text-xs text-text-secondary">
            <p className="font-medium text-neon-violet mb-1">Privacy guarantee</p>
            <p>
              Your bid is encrypted using Fhenix CoFHE before leaving your browser. The contract 
              never sees the plaintext — only an encrypted <code className="text-neon-cyan">euint128</code> ciphertext.
            </p>
          </div>
        </div>
      </GlassCard>
    </div>
  );
}
