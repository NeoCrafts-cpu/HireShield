import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useWriteContract } from "wagmi";
import { GlassCard } from "../ui/GlassCard";
import { NeonButton } from "../ui/NeonButton";
import { EncryptedBadge } from "../ui/EncryptedBadge";
import { HIRESHIELD_ABI, HIRESHIELD_ADDRESS } from "../../lib/constants";
import { useFHEEncrypt } from "../../hooks/useFHEEncrypt";
import { DollarSign, Award, Lock, Send, MapPin, Clock } from "lucide-react";
import toast from "react-hot-toast";

const LOCATION_OPTIONS = [
  { label: "Remote", value: 1 },
  { label: "North America", value: 2 },
  { label: "Europe", value: 3 },
  { label: "Asia Pacific", value: 4 },
  { label: "Latin America", value: 5 },
  { label: "Middle East / Africa", value: 6 },
];

interface ApplyFormProps {
  jobId: number;
  jobTitle: string;
}

export function ApplyForm({ jobId, jobTitle }: ApplyFormProps) {
  const [expectedSalary, setExpectedSalary] = useState("");
  const [experience, setExperience] = useState("");
  const [skillScore, setSkillScore] = useState("");
  const [location, setLocation] = useState("1");
  const [step, setStep] = useState<"form" | "encrypting" | "confirming">("form");

  const { encrypt } = useFHEEncrypt();
  const { writeContractAsync, isPending } = useWriteContract();

  const handleApply = async () => {
    if (!expectedSalary || !experience || !skillScore) {
      toast.error("Please fill in all required fields");
      return;
    }

    try {
      setStep("encrypting");

      // Encrypt all 4 dimensions via CoFHE SDK
      const encSalary = await encrypt(BigInt(expectedSalary), "euint128");
      const encExperience = await encrypt(BigInt(experience), "euint32");
      const encSkills = await encrypt(BigInt(skillScore), "euint32");
      const encLocation = await encrypt(BigInt(location), "euint32");

      setStep("confirming");

      await writeContractAsync({
        address: HIRESHIELD_ADDRESS,
        abi: HIRESHIELD_ABI,
        functionName: "applyToJob",
        args: [BigInt(jobId), encSalary as any, encExperience as any, encSkills as any, encLocation as any],
      });

      toast.success("Application submitted confidentially! 🔒");
      setStep("form");
      setExpectedSalary("");
      setExperience("");
      setSkillScore("");
      setLocation("1");
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

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-[rgba(255,255,255,0.7)] text-sm font-medium mb-2 flex items-center gap-2">
                  <Clock className="w-4 h-4 text-neon-cyan" /> Experience (years)
                  <span className="text-xs text-neon-cyan bg-[rgba(0,212,255,0.1)] px-2 py-0.5 rounded-full ml-1">
                    🔒
                  </span>
                </label>
                <input
                  type="number"
                  value={experience}
                  onChange={(e) => setExperience(e.target.value)}
                  placeholder="5"
                  min="0"
                  max="50"
                  className="w-full bg-[rgba(255,255,255,0.05)] border border-[rgba(255,255,255,0.1)] rounded-xl px-4 py-3 text-white placeholder-[rgba(255,255,255,0.3)] focus:outline-none focus:border-[rgba(0,212,255,0.5)] transition-all"
                />
              </div>
              <div>
                <label className="text-[rgba(255,255,255,0.7)] text-sm font-medium mb-2 flex items-center gap-2">
                  <Award className="w-4 h-4 text-neon-cyan" /> Skill Level (1-100)
                  <span className="text-xs text-neon-cyan bg-[rgba(0,212,255,0.1)] px-2 py-0.5 rounded-full ml-1">
                    🔒
                  </span>
                </label>
                <input
                  type="number"
                  value={skillScore}
                  onChange={(e) => setSkillScore(e.target.value)}
                  placeholder="85"
                  min="1"
                  max="100"
                  className="w-full bg-[rgba(255,255,255,0.05)] border border-[rgba(255,255,255,0.1)] rounded-xl px-4 py-3 text-white placeholder-[rgba(255,255,255,0.3)] focus:outline-none focus:border-[rgba(0,212,255,0.5)] transition-all"
                />
              </div>
            </div>

            <div>
              <label className="text-[rgba(255,255,255,0.7)] text-sm font-medium mb-2 flex items-center gap-2">
                <MapPin className="w-4 h-4 text-neon-green" /> Location
                <span className="text-xs text-neon-green bg-[rgba(0,255,136,0.1)] px-2 py-0.5 rounded-full ml-1">
                  🔒 Encrypted
                </span>
              </label>
              <select
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="w-full bg-[rgba(255,255,255,0.05)] border border-[rgba(255,255,255,0.1)] rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[rgba(0,255,136,0.5)] transition-all"
              >
                {LOCATION_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value} className="bg-[#0a0a0f]">
                    {opt.label}
                  </option>
                ))}
              </select>
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
