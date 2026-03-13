import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useWriteContract } from "wagmi";
import { parseEther } from "viem";
import { GlassCard } from "../ui/GlassCard";
import { NeonButton } from "../ui/NeonButton";
import { EncryptedBadge } from "../ui/EncryptedBadge";
import { HIRESHIELD_ABI, HIRESHIELD_ADDRESS } from "../../lib/constants";
import { useFHEEncrypt } from "../../hooks/useFHEEncrypt";
import { Briefcase, DollarSign, Code, Lock } from "lucide-react";
import toast from "react-hot-toast";

export function PostJobForm() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [budget, setBudget] = useState("");
  const [skills, setSkills] = useState("");
  const [escrowBonus, setEscrowBonus] = useState("0");
  const [step, setStep] = useState<"form" | "encrypting" | "confirming">("form");

  const { encrypt, isEncrypting, isFheReady } = useFHEEncrypt();
  const { writeContractAsync, isPending } = useWriteContract();

  const handleSubmit = async () => {
    if (!title || !budget) {
      toast.error("Please fill in all required fields");
      return;
    }

    if (!isFheReady) {
      toast.error("FHE client is still initializing. Please wait a moment.");
      return;
    }

    try {
      setStep("encrypting");

      // Encrypt budget and skills hash via CoFHE SDK
      const encBudget = await encrypt(BigInt(budget), "euint128");
      const skillsBytes = new TextEncoder().encode(skills);
      const skillsHash = BigInt(
        "0x" +
          Array.from(skillsBytes.slice(0, 4))
            .map((b) => b.toString(16).padStart(2, "0"))
            .join("")
      );
      const encSkills = await encrypt(skillsHash, "euint32");

      setStep("confirming");

      await writeContractAsync({
        address: HIRESHIELD_ADDRESS,
        abi: HIRESHIELD_ABI,
        functionName: "postJob",
        args: [encBudget as any, encSkills as any, title, description],
        value: parseEther(escrowBonus || "0"),
      });

      toast.success("Job posted confidentially! 🔒");
      setStep("form");
      setTitle("");
      setDescription("");
      setBudget("");
      setSkills("");
      setEscrowBonus("0");
    } catch (err) {
      console.error(err);
      toast.error("Transaction failed. Please try again.");
      setStep("form");
    }
  };

  return (
    <GlassCard className="p-6 md:p-8" glow="cyan">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-2xl font-heading font-bold text-white">
            Post a Job
          </h2>
          <p className="text-[rgba(255,255,255,0.5)] text-sm mt-1">
            Salary data stays encrypted on-chain
          </p>
        </div>
        <EncryptedBadge label="FHE Protected" variant="shield" size="md" />
      </div>

      <AnimatePresence mode="wait">
        {step === "form" && (
          <motion.div
            key="form"
            className="space-y-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            {/* Job Title */}
            <div>
              <label className="text-[rgba(255,255,255,0.7)] text-sm font-medium mb-2 flex items-center gap-2">
                <Briefcase className="w-4 h-4 text-neon-cyan" /> Job Title
              </label>
              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Senior Solidity Engineer"
                className="w-full bg-[rgba(255,255,255,0.05)] border border-[rgba(255,255,255,0.1)] rounded-xl px-4 py-3 text-white placeholder-[rgba(255,255,255,0.3)] focus:outline-none focus:border-[rgba(0,212,255,0.5)] transition-all"
              />
            </div>

            {/* Encrypted Budget */}
            <div>
              <label className="text-[rgba(255,255,255,0.7)] text-sm font-medium mb-2 flex items-center gap-2">
                <DollarSign className="w-4 h-4 text-neon-cyan" />
                Salary Budget (USD)
                <span className="text-xs text-neon-cyan bg-[rgba(0,212,255,0.1)] px-2 py-0.5 rounded-full ml-1">
                  🔒 Will be encrypted
                </span>
              </label>
              <input
                type="number"
                value={budget}
                onChange={(e) => setBudget(e.target.value)}
                placeholder="120000"
                className="w-full bg-[rgba(255,255,255,0.05)] border border-[rgba(255,255,255,0.1)] rounded-xl px-4 py-3 text-white placeholder-[rgba(255,255,255,0.3)] focus:outline-none focus:border-[rgba(0,212,255,0.5)] transition-all"
              />
              <p className="text-xs text-[rgba(255,255,255,0.3)] mt-1">
                This value will be encrypted client-side before submission
              </p>
            </div>

            {/* Skills */}
            <div>
              <label className="text-[rgba(255,255,255,0.7)] text-sm font-medium mb-2 flex items-center gap-2">
                <Code className="w-4 h-4 text-neon-violet" /> Required Skills
              </label>
              <input
                value={skills}
                onChange={(e) => setSkills(e.target.value)}
                placeholder="Solidity, React, FHE..."
                className="w-full bg-[rgba(255,255,255,0.05)] border border-[rgba(255,255,255,0.1)] rounded-xl px-4 py-3 text-white placeholder-[rgba(255,255,255,0.3)] focus:outline-none focus:border-[rgba(124,58,237,0.5)] transition-all"
              />
            </div>

            {/* Description */}
            <div>
              <label className="text-[rgba(255,255,255,0.7)] text-sm font-medium mb-2">
                Description (Public)
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                placeholder="Job responsibilities and requirements..."
                className="w-full bg-[rgba(255,255,255,0.05)] border border-[rgba(255,255,255,0.1)] rounded-xl px-4 py-3 text-white placeholder-[rgba(255,255,255,0.3)] focus:outline-none focus:border-[rgba(255,255,255,0.2)] resize-none transition-all"
              />
            </div>

            {/* Signing Bonus */}
            <div>
              <label className="text-[rgba(255,255,255,0.7)] text-sm font-medium mb-2 flex items-center gap-2">
                <Lock className="w-4 h-4 text-neon-green" /> Signing Bonus (ETH
                via Privara Escrow)
              </label>
              <input
                type="number"
                value={escrowBonus}
                onChange={(e) => setEscrowBonus(e.target.value)}
                placeholder="0.0"
                step="0.01"
                className="w-full bg-[rgba(255,255,255,0.05)] border border-[rgba(255,255,255,0.1)] rounded-xl px-4 py-3 text-white placeholder-[rgba(255,255,255,0.3)] focus:outline-none focus:border-[rgba(0,255,136,0.5)] transition-all"
              />
              <p className="text-xs text-[rgba(255,255,255,0.3)] mt-1">
                Optional. Funded to Privara confidential escrow
              </p>
            </div>

            <NeonButton
              onClick={handleSubmit}
              size="lg"
              className="w-full justify-center"
              loading={isPending || isEncrypting}
              disabled={!isFheReady}
              icon={<Lock className="w-5 h-5" />}
            >
              {!isFheReady ? "Initializing FHE..." : "Post Job Confidentially"}
            </NeonButton>
          </motion.div>
        )}

        {step === "encrypting" && (
          <motion.div
            key="encrypting"
            className="flex flex-col items-center justify-center py-12 gap-6"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="w-20 h-20 rounded-full border-2 border-[rgba(0,212,255,0.3)] flex items-center justify-center"
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            >
              <Lock className="w-8 h-8 text-neon-cyan" />
            </motion.div>
            <div className="text-center">
              <h3 className="text-xl font-heading font-bold text-white mb-2">
                Encrypting with FHE
              </h3>
              <p className="text-[rgba(255,255,255,0.5)] text-sm">
                Your salary data is being encrypted client-side via CoFHE...
              </p>
            </div>
            <div className="flex gap-2">
              {[0, 1, 2].map((i) => (
                <motion.div
                  key={i}
                  className="w-2 h-2 bg-neon-cyan rounded-full"
                  animate={{ scale: [1, 1.5, 1] }}
                  transition={{
                    duration: 0.6,
                    repeat: Infinity,
                    delay: i * 0.2,
                  }}
                />
              ))}
            </div>
          </motion.div>
        )}

        {step === "confirming" && (
          <motion.div
            key="confirming"
            className="flex flex-col items-center justify-center py-12 gap-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div className="w-20 h-20 rounded-full bg-[rgba(0,255,136,0.1)] border border-[rgba(0,255,136,0.3)] flex items-center justify-center">
              <Lock className="w-8 h-8 text-neon-green" />
            </div>
            <div className="text-center">
              <h3 className="text-xl font-heading font-bold text-white mb-2">
                Awaiting Wallet Confirmation
              </h3>
              <p className="text-[rgba(255,255,255,0.5)] text-sm">
                Encrypted ciphertext ready — confirm in MetaMask
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </GlassCard>
  );
}
