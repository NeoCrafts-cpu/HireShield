import { useState } from "react";
import { motion } from "framer-motion";
import { useAccount, useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { Shield, Star, Lock, Unlock, TrendingUp, Award, Eye, EyeOff } from "lucide-react";
import { GlassCard } from "../components/ui/GlassCard";
import { NeonButton } from "../components/ui/NeonButton";
import { EncryptedBadge } from "../components/ui/EncryptedBadge";
import { LoadingDots } from "../components/ui/LoadingDots";
import { AppNavbar } from "../components/layout/AppNavbar";
import { Footer } from "../components/layout/Footer";
import { AuroraBackground } from "../components/ui/AuroraBackground";
import { REPUTATION_ADDRESS, REPUTATION_ABI } from "../lib/constants";
import {
  useDecryptReputationScore,
  useHasActivePermit,
} from "../hooks/useFHEDecrypt";
import toast from "react-hot-toast";

function ScoreGauge({ score }: { score: bigint }) {
  // Score is an accumulation of ratings (euint32) — display as ratio out of a typical max
  const raw = Number(score);
  const displayScore = Math.min(raw, 9999);
  const pct = Math.min((displayScore / 500) * 100, 100); // scale: 500 = "perfect" cumulative score

  return (
    <div className="flex flex-col items-center gap-3">
      <div className="relative w-32 h-32">
        <svg className="w-full h-full -rotate-90" viewBox="0 0 120 120">
          <circle cx="60" cy="60" r="50" fill="none" stroke="rgba(255,255,255,0.07)" strokeWidth="12" />
          <circle
            cx="60" cy="60" r="50"
            fill="none"
            stroke="url(#gaugeGrad)"
            strokeWidth="12"
            strokeLinecap="round"
            strokeDasharray={`${pct * 3.14159} 314.159`}
            className="transition-all duration-700"
          />
          <defs>
            <linearGradient id="gaugeGrad" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#7c3aed" />
              <stop offset="100%" stopColor="#00d4ff" />
            </linearGradient>
          </defs>
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-2xl font-bold text-neon-cyan font-mono">{displayScore}</span>
        </div>
      </div>
      <p className="text-xs text-text-secondary">Cumulative reputation score</p>
    </div>
  );
}

export function Reputation() {
  const { isConnected, address } = useAccount();
  const [revealed, setRevealed] = useState(false);
  const hasPermit = useHasActivePermit();

  const {
    value: score,
    isLoading: isDecrypting,
    disabledDueToMissingPermit,
  } = useDecryptReputationScore(revealed && address ? (address as `0x${string}`) : undefined);

  // Read plaintext rating count from contract via wagmi readContract
  // (ratingCount is public, no FHE)
  const { writeContract, data: txHash, isPending: isTxPending } = useWriteContract();
  const { isLoading: isTxConfirming } = useWaitForTransactionReceipt({ hash: txHash });

  const handleReveal = () => {
    if (!hasPermit) {
      toast.error("Generate a CoFHE permit first — click the CoFHE shield button in the top-right corner.");
      return;
    }
    setRevealed(true);
  };

  const handleHide = () => setRevealed(false);

  return (
    <div className="relative min-h-screen bg-background-primary">
      <AuroraBackground />
      <AppNavbar />
      <main className="p-4 md:p-8">
        <div className="max-w-4xl mx-auto">

            {/* Header */}
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-8"
            >
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 rounded-xl bg-[rgba(124,58,237,0.15)] border border-[rgba(124,58,237,0.3)]">
                  <Shield className="w-6 h-6 text-neon-violet" />
                </div>
                <h1 className="text-3xl font-bold text-white">Reputation</h1>
              </div>
              <p className="text-text-secondary">
                Your privacy-preserving reputation score — encrypted on-chain with FHE.
                Only you can reveal the actual value.
              </p>
            </motion.div>

            {!isConnected ? (
              <GlassCard className="p-8 text-center">
                <Shield className="w-12 h-12 text-neon-violet mx-auto mb-4 opacity-50" />
                <p className="text-text-secondary">Connect your wallet to view your reputation.</p>
              </GlassCard>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                {/* Score Card */}
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 }}
                >
                  <GlassCard className="p-6" glow="violet">
                    <div className="flex items-center gap-2 mb-6">
                      <Star className="w-5 h-5 text-neon-violet" />
                      <h2 className="text-lg font-semibold text-white">Your Score</h2>
                      <EncryptedBadge label="FHE" />
                    </div>

                    <div className="flex flex-col items-center gap-6">
                      {revealed && score !== undefined ? (
                        <motion.div
                          initial={{ scale: 0.8, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          className="flex flex-col items-center"
                        >
                          <ScoreGauge score={score} />
                          <div className="mt-4 flex items-center gap-2 text-neon-cyan">
                            <Unlock className="w-4 h-4" />
                            <span className="text-sm font-medium">Decrypted via CoFHE permit</span>
                          </div>
                        </motion.div>
                      ) : revealed && isDecrypting ? (
                        <div className="py-8 flex flex-col items-center gap-3">
                          <LoadingDots color="violet" />
                          <p className="text-text-secondary text-sm">Decrypting with your permit…</p>
                        </div>
                      ) : (
                        <div className="py-8 flex flex-col items-center gap-4">
                          <div className="w-24 h-24 rounded-full bg-[rgba(124,58,237,0.1)] border border-[rgba(124,58,237,0.3)] flex items-center justify-center">
                            <Lock className="w-10 h-10 text-neon-violet opacity-60" />
                          </div>
                          <p className="text-text-secondary text-sm text-center">
                            Your score is encrypted on-chain.<br />Reveal it using your CoFHE permit.
                          </p>
                          {disabledDueToMissingPermit && (
                            <p className="text-neon-rose text-xs text-center mt-1">
                              Missing permit — click the CoFHE button to generate one.
                            </p>
                          )}
                        </div>
                      )}

                      <div className="flex gap-3 w-full">
                        {!revealed ? (
                          <NeonButton
                            variant="secondary"
                            icon={<Eye className="w-4 h-4" />}
                            onClick={handleReveal}
                            className="flex-1"
                          >
                            Reveal Score
                          </NeonButton>
                        ) : (
                          <NeonButton
                            variant="ghost"
                            icon={<EyeOff className="w-4 h-4" />}
                            onClick={handleHide}
                            className="flex-1"
                          >
                            Hide Score
                          </NeonButton>
                        )}
                      </div>
                    </div>
                  </GlassCard>
                </motion.div>

                {/* Info Card */}
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 }}
                >
                  <GlassCard className="p-6" glow="cyan">
                    <div className="flex items-center gap-2 mb-4">
                      <TrendingUp className="w-5 h-5 text-neon-cyan" />
                      <h2 className="text-lg font-semibold text-white">How It Works</h2>
                    </div>
                    <div className="space-y-4">
                      <div className="flex gap-3">
                        <div className="w-8 h-8 rounded-lg bg-[rgba(0,212,255,0.1)] border border-[rgba(0,212,255,0.2)] flex items-center justify-center shrink-0">
                          <span className="text-neon-cyan text-xs font-bold">1</span>
                        </div>
                        <div>
                          <p className="text-white text-sm font-medium">Employers rate you</p>
                          <p className="text-text-secondary text-xs">After a successful job match, employers submit an encrypted rating.</p>
                        </div>
                      </div>
                      <div className="flex gap-3">
                        <div className="w-8 h-8 rounded-lg bg-[rgba(0,212,255,0.1)] border border-[rgba(0,212,255,0.2)] flex items-center justify-center shrink-0">
                          <span className="text-neon-cyan text-xs font-bold">2</span>
                        </div>
                        <div>
                          <p className="text-white text-sm font-medium">Scores accumulate privately</p>
                          <p className="text-text-secondary text-xs">Ratings are added with FHE addition — no one can see individual ratings.</p>
                        </div>
                      </div>
                      <div className="flex gap-3">
                        <div className="w-8 h-8 rounded-lg bg-[rgba(0,212,255,0.1)] border border-[rgba(0,212,255,0.2)] flex items-center justify-center shrink-0">
                          <span className="text-neon-cyan text-xs font-bold">3</span>
                        </div>
                        <div>
                          <p className="text-white text-sm font-medium">Threshold proofs</p>
                          <p className="text-text-secondary text-xs">Prove your score exceeds a minimum without revealing the actual number.</p>
                        </div>
                      </div>
                    </div>
                  </GlassCard>

                  {/* Privacy Badge */}
                  <GlassCard className="p-4 mt-4">
                    <div className="flex items-center gap-3">
                      <Award className="w-8 h-8 text-neon-violet" />
                      <div>
                        <p className="text-white text-sm font-semibold">FHE-Protected Score</p>
                        <p className="text-text-secondary text-xs">
                          Stored as <code className="text-neon-cyan">euint32</code> via Fhenix CoFHE.
                          Only your permit can decrypt it.
                        </p>
                      </div>
                    </div>
                  </GlassCard>
                </motion.div>

              </div>
            )}
          </div>
        </main>
      <Footer />
    </div>
  );
}
