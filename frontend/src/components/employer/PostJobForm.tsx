import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useWriteContract } from "wagmi";
import { parseEther } from "viem";
import { GlassCard } from "../ui/GlassCard";
import { NeonButton } from "../ui/NeonButton";
import { EncryptedBadge } from "../ui/EncryptedBadge";
import { HIRESHIELD_ABI, HIRESHIELD_ADDRESS } from "../../lib/constants";
import { useFHEEncrypt } from "../../hooks/useFHEEncrypt";
import { Briefcase, DollarSign, Code, Lock, MapPin, Clock, Tag } from "lucide-react";
import { txUrl } from "../../lib/etherscan";
import toast from "react-hot-toast";

const LOCATION_OPTIONS = [
  { label: "Remote", value: 1 },
  { label: "North America", value: 2 },
  { label: "Europe", value: 3 },
  { label: "Asia Pacific", value: 4 },
  { label: "Latin America", value: 5 },
  { label: "Middle East / Africa", value: 6 },
];

export function PostJobForm() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [budget, setBudget] = useState("");
  const [experience, setExperience] = useState("");
  const [skillScore, setSkillScore] = useState("");
  const [location, setLocation] = useState("1");
  const [escrowBonus, setEscrowBonus] = useState("0");
  const [category, setCategory] = useState("");
  const [step, setStep] = useState<"form" | "encrypting" | "confirming">("form");

  const { encrypt, isEncrypting, isFheReady } = useFHEEncrypt();
  const { writeContractAsync, isPending } = useWriteContract();

  const handleSubmit = async () => {
    if (!title || !budget || !experience || !skillScore) {
      toast.error("Please fill in all required fields");
      return;
    }

    if (!isFheReady) {
      toast.error("FHE client is still initializing. Please wait a moment.");
      return;
    }

    try {
      setStep("encrypting");

      // Encrypt all 4 dimensions via CoFHE SDK
      const encBudget = await encrypt(BigInt(budget), "euint128");
      const encExperience = await encrypt(BigInt(experience), "euint32");
      const encSkills = await encrypt(BigInt(skillScore), "euint32");
      const encLocation = await encrypt(BigInt(location), "euint32");

      setStep("confirming");

      const fnName = category ? "postJobWithCategory" : "postJob";
      const args = category
        ? [encBudget as any, encExperience as any, encSkills as any, encLocation as any, title, description, category]
        : [encBudget as any, encExperience as any, encSkills as any, encLocation as any, title, description];

      const hash = await writeContractAsync({
        address: HIRESHIELD_ADDRESS,
        abi: HIRESHIELD_ABI,
        functionName: fnName,
        args: args as any,
        value: parseEther(escrowBonus || "0"),
      });

      if (hash) {
        toast.success(
          <span>Job posted! <a href={txUrl(hash)} target="_blank" rel="noreferrer" className="underline text-neon-cyan">View on Etherscan</a></span>
        );
      }

      setStep("form");
      setTitle("");
      setDescription("");
      setBudget("");
      setExperience("");
      setSkillScore("");
      setLocation("1");
      setEscrowBonus("0");
      setCategory("");
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

            {/* Experience Required */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-[rgba(255,255,255,0.7)] text-sm font-medium mb-2 flex items-center gap-2">
                  <Clock className="w-4 h-4 text-neon-violet" /> Min Experience (years)
                  <span className="text-xs text-neon-violet bg-[rgba(124,58,237,0.1)] px-2 py-0.5 rounded-full ml-1">
                    🔒 Encrypted
                  </span>
                </label>
                <input
                  type="number"
                  value={experience}
                  onChange={(e) => setExperience(e.target.value)}
                  placeholder="3"
                  min="0"
                  max="50"
                  className="w-full bg-[rgba(255,255,255,0.05)] border border-[rgba(255,255,255,0.1)] rounded-xl px-4 py-3 text-white placeholder-[rgba(255,255,255,0.3)] focus:outline-none focus:border-[rgba(124,58,237,0.5)] transition-all"
                />
              </div>
              <div>
                <label className="text-[rgba(255,255,255,0.7)] text-sm font-medium mb-2 flex items-center gap-2">
                  <Code className="w-4 h-4 text-neon-violet" /> Min Skill Level (1-100)
                  <span className="text-xs text-neon-violet bg-[rgba(124,58,237,0.1)] px-2 py-0.5 rounded-full ml-1">
                    🔒 Encrypted
                  </span>
                </label>
                <input
                  type="number"
                  value={skillScore}
                  onChange={(e) => setSkillScore(e.target.value)}
                  placeholder="70"
                  min="1"
                  max="100"
                  className="w-full bg-[rgba(255,255,255,0.05)] border border-[rgba(255,255,255,0.1)] rounded-xl px-4 py-3 text-white placeholder-[rgba(255,255,255,0.3)] focus:outline-none focus:border-[rgba(124,58,237,0.5)] transition-all"
                />
              </div>
            </div>

            {/* Location */}
            <div>
              <label className="text-[rgba(255,255,255,0.7)] text-sm font-medium mb-2 flex items-center gap-2">
                <MapPin className="w-4 h-4 text-neon-green" /> Location Preference
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

            {/* Category */}
            <div>
              <label className="text-[rgba(255,255,255,0.7)] text-sm font-medium mb-2 flex items-center gap-2">
                <Tag className="w-4 h-4 text-neon-cyan" /> Category (for analytics)
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full bg-[rgba(255,255,255,0.05)] border border-[rgba(255,255,255,0.1)] rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[rgba(0,212,255,0.5)] transition-all"
              >
                <option value="" className="bg-[#0a0a0f]">No category</option>
                <option value="Engineering" className="bg-[#0a0a0f]">Engineering</option>
                <option value="Design" className="bg-[#0a0a0f]">Design</option>
                <option value="Marketing" className="bg-[#0a0a0f]">Marketing</option>
                <option value="Operations" className="bg-[#0a0a0f]">Operations</option>
                <option value="Finance" className="bg-[#0a0a0f]">Finance</option>
                <option value="Sales" className="bg-[#0a0a0f]">Sales</option>
              </select>
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
                — auto-released on match)
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
                Optional. Locked on-chain and auto-released to matched candidate
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
