import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useWriteContract } from "wagmi";
import { GlassCard } from "../ui/GlassCard";
import { NeonButton } from "../ui/NeonButton";
import { EncryptedBadge } from "../ui/EncryptedBadge";
import { HIRESHIELD_ABI, HIRESHIELD_ADDRESS } from "../../lib/constants";
import { useFHEEncrypt } from "../../hooks/useFHEEncrypt";
import { DollarSign, Award, Lock, Send } from "lucide-react";
import toast from "react-hot-toast";

interface ApplyFormProps {
  jobId: number;
  jobTitle: string;
}

export function ApplyForm({ jobId, jobTitle }: ApplyFormProps) {
  const [expectedSalary, setExpectedSalary] = useState("");
  const [credentials, setCredentials] = useState("");
  const [step, setStep] = useState<"form" | "encrypting" | "confirming">("form");

  const { encrypt } = useFHEEncrypt();
  const { writeContractAsync, isPending } = useWriteContract();

  const handleApply = async () => {
    if (!expectedSalary) {
      toast.error("Please enter your expected salary");
      return;
    }

    try {
      setStep("encrypting");

      const encSalary = await encrypt(BigInt(expectedSalary), "euint128");
      const credBytes = new TextEncoder().encode(credentials);
      const credHash = BigInt(
        "0x" +
          Array.from(credBytes.slice(0, 4))
            .map((b) => b.toString(16).padStart(2, "0"))
            .join("")
      );
      const encCreds = await encrypt(credHash, "euint32");

      setStep("confirming");

      await writeContractAsync({
        address: HIRESHIELD_ADDRESS,
        abi: HIRESHIELD_ABI,
        functionName: "applyToJob",
        args: [BigInt(jobId), encSalary as any, encCreds as any],
      });

      toast.success("Application submitted confidentially! 🔒");
      setStep("form");
      setExpectedSalary("");
      setCredentials("");
    } catch (err) {
      console.error(err);
      toast.error("Application failed. Please try again.");
      setStep("form");
    }
  };

  return (
    <GlassCard className="p-6 md:p-8" glow="violet">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-heading font-bold text-white">
            Apply to: {jobTitle}
          </h2>
          <p className="text-[rgba(255,255,255,0.5)] text-sm mt-1">
            Your salary expectation is encrypted before submission
          </p>
        </div>
        <EncryptedBadge label="Private" variant="shield" size="md" />
      </div>

      <AnimatePresence mode="wait">
        {step === "form" && (
          <motion.div
            key="form"
            className="space-y-5"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div>
              <label className="text-[rgba(255,255,255,0.7)] text-sm font-medium mb-2 flex items-center gap-2">
                <DollarSign className="w-4 h-4 text-neon-violet" />
                Expected Salary (USD)
                <span className="text-xs text-neon-violet bg-[rgba(124,58,237,0.1)] px-2 py-0.5 rounded-full ml-1">
                  🔒 Encrypted
                </span>
              </label>
              <input
                type="number"
                value={expectedSalary}
                onChange={(e) => setExpectedSalary(e.target.value)}
                placeholder="95000"
                className="w-full bg-[rgba(255,255,255,0.05)] border border-[rgba(255,255,255,0.1)] rounded-xl px-4 py-3 text-white placeholder-[rgba(255,255,255,0.3)] focus:outline-none focus:border-[rgba(124,58,237,0.5)] transition-all"
              />
              <p className="text-xs text-[rgba(255,255,255,0.3)] mt-1">
                Never revealed — matched against employer budget using FHE
              </p>
            </div>

            <div>
              <label className="text-[rgba(255,255,255,0.7)] text-sm font-medium mb-2 flex items-center gap-2">
                <Award className="w-4 h-4 text-neon-cyan" /> Credentials /
                Skills
              </label>
              <input
                value={credentials}
                onChange={(e) => setCredentials(e.target.value)}
                placeholder="Solidity, Auditing, FHE, ZK..."
                className="w-full bg-[rgba(255,255,255,0.05)] border border-[rgba(255,255,255,0.1)] rounded-xl px-4 py-3 text-white placeholder-[rgba(255,255,255,0.3)] focus:outline-none focus:border-[rgba(0,212,255,0.5)] transition-all"
              />
            </div>

            <NeonButton
              variant="secondary"
              size="lg"
              onClick={handleApply}
              loading={isPending}
              icon={<Send className="w-5 h-5" />}
              className="w-full justify-center"
            >
              Submit Application
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
              className="w-20 h-20 rounded-full border-2 border-[rgba(124,58,237,0.3)] flex items-center justify-center"
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            >
              <Lock className="w-8 h-8 text-neon-violet" />
            </motion.div>
            <div className="text-center">
              <h3 className="text-xl font-heading font-bold text-white mb-2">
                Encrypting Your Data
              </h3>
              <p className="text-[rgba(255,255,255,0.5)] text-sm">
                Salary expectation being encrypted via CoFHE...
              </p>
            </div>
            <div className="flex gap-2">
              {[0, 1, 2].map((i) => (
                <motion.div
                  key={i}
                  className="w-2 h-2 bg-neon-violet rounded-full"
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
                Confirm in Wallet
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
