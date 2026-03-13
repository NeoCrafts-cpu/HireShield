import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { GlassCard } from "../components/ui/GlassCard";
import { NeonButton } from "../components/ui/NeonButton";
import { EncryptedBadge } from "../components/ui/EncryptedBadge";
import { AuroraBackground } from "../components/ui/AuroraBackground";
import { Navbar } from "../components/layout/Navbar";
import { Footer } from "../components/layout/Footer";
import {
  Lock,
  Shield,
  Zap,
  Eye,
  EyeOff,
  Server,
  Key,
  ArrowRight,
  ChevronRight,
  Database,
  Cpu,
  Users,
} from "lucide-react";

const FLOW_STEPS = [
  {
    icon: Lock,
    title: "Client-Side Encryption",
    description:
      "The CoFHE SDK encrypts sensitive data (salary, credentials) in the user's browser before any on-chain transaction. Raw values never leave the client.",
    detail: "encrypt(salary, 'euint128') → ciphertext",
    color: "cyan" as const,
  },
  {
    icon: Database,
    title: "Encrypted On-Chain Storage",
    description:
      "Ciphertexts are stored in the HireShield smart contract. The Fhenix chain natively supports FHE data types (euint128, euint32, ebool).",
    detail: "jobs[id].budgetEncrypted = ciphertext",
    color: "violet" as const,
  },
  {
    icon: Cpu,
    title: "FHE Computation",
    description:
      "The CoFHE threshold network performs encrypted comparisons. FHE.lte(candidateSalary, employerBudget) runs on ciphertext — no decryption needed.",
    detail: "FHE.lte(enc_salary, enc_budget) → enc_bool",
    color: "green" as const,
  },
  {
    icon: Key,
    title: "Threshold Decryption",
    description:
      "Match results are decrypted by the threshold key-sharing network (5+ nodes). No single party can decrypt alone.",
    detail: "Threshold(n=5, t=3) → decrypt(enc_bool)",
    color: "cyan" as const,
  },
  {
    icon: Users,
    title: "Reveal & Payout",
    description:
      "Only the match boolean is revealed. If matched, the on-chain escrow auto-releases the signing bonus to the candidate.",
    detail: "isMatch=true → releaseBonus(candidate)",
    color: "green" as const,
  },
];

const colorMap = {
  cyan: {
    textClass: "text-neon-cyan",
    bgClass: "bg-[rgba(0,212,255,0.1)]",
    borderClass: "border-[rgba(0,212,255,0.2)]",
    codeBg: "bg-[rgba(0,212,255,0.05)]",
  },
  violet: {
    textClass: "text-neon-violet",
    bgClass: "bg-[rgba(124,58,237,0.1)]",
    borderClass: "border-[rgba(124,58,237,0.2)]",
    codeBg: "bg-[rgba(124,58,237,0.05)]",
  },
  green: {
    textClass: "text-neon-green",
    bgClass: "bg-[rgba(0,255,136,0.1)]",
    borderClass: "border-[rgba(0,255,136,0.2)]",
    codeBg: "bg-[rgba(0,255,136,0.05)]",
  },
};

export function HowItWorks() {
  const navigate = useNavigate();

  return (
    <div className="relative min-h-screen bg-background-primary">
      <AuroraBackground />
      <div className="relative z-10">
        <Navbar />
        <main className="max-w-4xl mx-auto p-4 md:p-8">
          {/* Header */}
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <EncryptedBadge
              label="Technical Deep Dive"
              variant="shield"
              size="md"
            />
            <h1 className="text-4xl md:text-5xl font-heading font-black text-white mt-6 mb-4">
              How{" "}
              <span className="gradient-text">HireShield</span>{" "}
              Works
            </h1>
            <p className="text-[rgba(255,255,255,0.5)] text-lg max-w-2xl mx-auto">
              A step-by-step breakdown of the FHE-powered confidential hiring
              flow — from encryption to payout.
            </p>
          </motion.div>

          {/* Flow Steps */}
          <div className="space-y-6">
            {FLOW_STEPS.map((step, i) => {
              const palette = colorMap[step.color];
              return (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: i % 2 === 0 ? -30 : 30 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.1, duration: 0.5 }}
                  viewport={{ once: true }}
                >
                  <GlassCard className="p-6 md:p-8" glow={step.color}>
                    <div className="flex items-start gap-5">
                      <div className="flex flex-col items-center gap-2 shrink-0">
                        <div
                          className={`w-12 h-12 rounded-2xl ${palette.bgClass} border ${palette.borderClass} flex items-center justify-center`}
                        >
                          <step.icon
                            className={`w-6 h-6 ${palette.textClass}`}
                          />
                        </div>
                        <span
                          className={`text-xs font-mono ${palette.textClass} opacity-50`}
                        >
                          {String(i + 1).padStart(2, "0")}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-xl font-heading font-bold text-white mb-2">
                          {step.title}
                        </h3>
                        <p className="text-[rgba(255,255,255,0.5)] leading-relaxed mb-3">
                          {step.description}
                        </p>
                        <div
                          className={`inline-block ${palette.codeBg} border ${palette.borderClass} rounded-xl px-4 py-2`}
                        >
                          <code
                            className={`text-sm font-mono ${palette.textClass}`}
                          >
                            {step.detail}
                          </code>
                        </div>
                      </div>
                    </div>
                    {i < FLOW_STEPS.length - 1 && (
                      <div className="flex justify-center mt-4">
                        <ChevronRight
                          className="w-5 h-5 text-[rgba(255,255,255,0.15)] rotate-90"
                        />
                      </div>
                    )}
                  </GlassCard>
                </motion.div>
              );
            })}
          </div>

          {/* Privacy Guarantees */}
          <motion.div
            className="mt-16"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <GlassCard className="p-8 md:p-10" glow="violet">
              <div className="text-center mb-8">
                <Shield className="w-10 h-10 text-neon-violet mx-auto mb-4" />
                <h2 className="text-2xl font-heading font-bold text-white mb-2">
                  Privacy Guarantees
                </h2>
                <p className="text-[rgba(255,255,255,0.5)]">
                  What's protected, what's public
                </p>
              </div>
              <div className="grid md:grid-cols-2 gap-6">
                <div className="glass p-5 rounded-2xl">
                  <div className="flex items-center gap-2 mb-3">
                    <EyeOff className="w-5 h-5 text-neon-green" />
                    <h3 className="text-white font-semibold">
                      Always Encrypted
                    </h3>
                  </div>
                  <ul className="space-y-2 text-[rgba(255,255,255,0.5)] text-sm">
                    <li className="flex items-center gap-2">
                      <Lock className="w-3 h-3 text-neon-green" /> Salary
                      budgets
                    </li>
                    <li className="flex items-center gap-2">
                      <Lock className="w-3 h-3 text-neon-green" /> Salary
                      expectations
                    </li>
                    <li className="flex items-center gap-2">
                      <Lock className="w-3 h-3 text-neon-green" /> Credential
                      hashes
                    </li>
                    <li className="flex items-center gap-2">
                      <Lock className="w-3 h-3 text-neon-green" /> Bonus
                      amounts (on-chain escrow)
                    </li>
                  </ul>
                </div>
                <div className="glass p-5 rounded-2xl">
                  <div className="flex items-center gap-2 mb-3">
                    <Eye className="w-5 h-5 text-neon-amber" />
                    <h3 className="text-white font-semibold">Public Data</h3>
                  </div>
                  <ul className="space-y-2 text-[rgba(255,255,255,0.5)] text-sm">
                    <li className="flex items-center gap-2">
                      <ArrowRight className="w-3 h-3 text-neon-amber" /> Job
                      title & description
                    </li>
                    <li className="flex items-center gap-2">
                      <ArrowRight className="w-3 h-3 text-neon-amber" />{" "}
                      Employer address
                    </li>
                    <li className="flex items-center gap-2">
                      <ArrowRight className="w-3 h-3 text-neon-amber" />{" "}
                      Application count
                    </li>
                    <li className="flex items-center gap-2">
                      <ArrowRight className="w-3 h-3 text-neon-amber" />{" "}
                      Match boolean result
                    </li>
                  </ul>
                </div>
              </div>
            </GlassCard>
          </motion.div>

          {/* References */}
          <motion.div
            className="mt-12 mb-8"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
          >
            <GlassCard className="p-6" glow="none">
              <h3 className="text-lg font-heading font-semibold text-white mb-4">
                References & Documentation
              </h3>
              <div className="grid md:grid-cols-2 gap-3">
                {[
                  {
                    label: "Fhenix CoFHE Docs",
                    url: "https://cofhe-docs.fhenix.zone/",
                    color: "text-neon-cyan",
                  },
                  {
                    label: "CoFHE SDK (npm)",
                    url: "https://www.npmjs.com/package/@cofhe/sdk",
                    color: "text-neon-cyan",
                  },
                  {
                    label: "Sepolia Etherscan",
                    url: "https://sepolia.etherscan.io/",
                    color: "text-neon-violet",
                  },
                  {
                    label: "Awesome Fhenix Examples",
                    url: "https://github.com/FhenixProtocol/awesome-fhenix",
                    color: "text-[rgba(255,255,255,0.6)]",
                  },
                ].map((ref) => (
                  <a
                    key={ref.url}
                    href={ref.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`glass p-3 rounded-xl flex items-center gap-2 ${ref.color} hover:bg-[rgba(255,255,255,0.05)] transition-all text-sm`}
                  >
                    <Server className="w-4 h-4" />
                    {ref.label}
                    <ArrowRight className="w-3 h-3 ml-auto opacity-50" />
                  </a>
                ))}
              </div>
            </GlassCard>
          </motion.div>

          {/* CTA */}
          <div className="text-center py-8">
            <NeonButton
              onClick={() => navigate("/employer")}
              size="lg"
              icon={<Zap className="w-5 h-5" />}
            >
              Start Using HireShield
            </NeonButton>
          </div>
        </main>
        <Footer />
      </div>
    </div>
  );
}
