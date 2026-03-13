import { motion } from "framer-motion";
import { GlassCard } from "../components/ui/GlassCard";
import { AuroraBackground } from "../components/ui/AuroraBackground";
import { Navbar } from "../components/layout/Navbar";
import { Footer } from "../components/layout/Footer";
import {
  Shield,
  Lock,
  Eye,
  EyeOff,
  Key,
  Server,
  CheckCircle,
  XCircle,
  Cpu,
  ExternalLink,
} from "lucide-react";

const GUARANTEES = [
  {
    icon: EyeOff,
    title: "Zero Salary Exposure",
    body: "Employer budgets and candidate salary expectations are encrypted client-side before any data leaves the browser. No server, no API, and no on-chain observer ever sees a raw number.",
    color: "cyan",
  },
  {
    icon: Lock,
    title: "Computation on Ciphertext",
    body: "Matching is performed directly on encrypted values using Fully Homomorphic Encryption (FHE). The contract calls FHE.lte(encSalary, encBudget) — the comparison happens without decryption.",
    color: "violet",
  },
  {
    icon: Key,
    title: "Threshold Decryption",
    body: "Match results are decrypted by a distributed threshold network (Fhenix CoFHE). A minimum quorum of independent nodes must cooperate — no single party can decrypt alone.",
    color: "green",
  },
  {
    icon: Server,
    title: "Non-Custodial Escrow",
    body: "Employer funds are held in a trustless Solidity escrow contract. Bonuses are released programmatically upon a verified FHE match — no human intermediary controls the funds.",
    color: "cyan",
  },
];

const DATA_TABLE = [
  { field: "Employer salary budget", stored: "Encrypted (euint128)", onChain: true, visible: false },
  { field: "Employer job requirements", stored: "Encrypted (euint32)", onChain: true, visible: false },
  { field: "Candidate expected salary", stored: "Encrypted (euint128)", onChain: true, visible: false },
  { field: "Candidate credentials hash", stored: "Encrypted (euint32)", onChain: true, visible: false },
  { field: "Job title & description", stored: "Plaintext", onChain: true, visible: true },
  { field: "Match result (boolean)", stored: "Decrypted via threshold", onChain: true, visible: true },
  { field: "Wallet address", stored: "Plaintext", onChain: true, visible: true },
];

const colorMap: Record<string, { text: string; bg: string; border: string }> = {
  cyan: {
    text: "text-neon-cyan",
    bg: "bg-[rgba(0,212,255,0.08)]",
    border: "border-[rgba(0,212,255,0.2)]",
  },
  violet: {
    text: "text-neon-violet",
    bg: "bg-[rgba(124,58,237,0.08)]",
    border: "border-[rgba(124,58,237,0.2)]",
  },
  green: {
    text: "text-neon-green",
    bg: "bg-[rgba(0,255,136,0.08)]",
    border: "border-[rgba(0,255,136,0.2)]",
  },
};

export function Privacy() {
  return (
    <div className="relative min-h-screen bg-background-primary">
      <AuroraBackground />
      <div className="relative z-10">
        <Navbar />

        <main className="max-w-4xl mx-auto px-6 py-16 space-y-20">
          {/* Header */}
          <motion.div
            className="text-center"
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="flex items-center justify-center mb-6">
              <div className="w-16 h-16 rounded-3xl bg-[rgba(124,58,237,0.15)] border border-[rgba(124,58,237,0.3)] flex items-center justify-center">
                <Shield className="w-8 h-8 text-neon-violet" />
              </div>
            </div>
            <h1 className="text-4xl md:text-5xl font-heading font-black text-white mb-4">
              Privacy Model
            </h1>
            <p className="text-[rgba(255,255,255,0.5)] text-lg max-w-2xl mx-auto leading-relaxed">
              HireShield is built on Fhenix CoFHE — a fully homomorphic
              encryption layer that allows smart contracts to perform
              computations on encrypted data without ever decrypting it.
            </p>
          </motion.div>

          {/* FHE explanation */}
          <section>
            <GlassCard className="p-8 md:p-10" glow="violet">
              <div className="flex items-start gap-4 mb-6">
                <div className="w-10 h-10 rounded-2xl bg-[rgba(124,58,237,0.15)] border border-[rgba(124,58,237,0.25)] flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Cpu className="w-5 h-5 text-neon-violet" />
                </div>
                <div>
                  <h2 className="text-xl font-heading font-bold text-white mb-1">
                    What is FHE?
                  </h2>
                  <p className="text-[rgba(255,255,255,0.5)] text-sm">
                    Fully Homomorphic Encryption
                  </p>
                </div>
              </div>
              <p className="text-[rgba(255,255,255,0.65)] leading-relaxed mb-6">
                FHE is a form of encryption that allows arbitrary computations
                to be performed on ciphertexts, producing an encrypted result
                that, when decrypted, matches the result of the same operations
                on the plaintext. This means{" "}
                <strong className="text-white">
                  two encrypted numbers can be compared without either number
                  being revealed
                </strong>
                .
              </p>
              <div className="grid md:grid-cols-3 gap-4">
                {[
                  {
                    label: "Traditional DB",
                    code: "store(salary)\n→ anyone with DB\n   access sees it",
                    bad: true,
                  },
                  {
                    label: "ZK Proofs",
                    code: "prove(salary ≥ budget)\n→ circuit per op,\n   high gas cost",
                    bad: false,
                  },
                  {
                    label: "FHE (HireShield)",
                    code: "FHE.lte(enc_s, enc_b)\n→ on ciphertext,\n   no reveal",
                    bad: false,
                  },
                ].map(({ label, code, bad }) => (
                  <div
                    key={label}
                    className={`p-4 rounded-xl border font-mono text-xs ${
                      bad
                        ? "bg-[rgba(244,63,94,0.07)] border-[rgba(244,63,94,0.2)] text-[rgba(255,255,255,0.45)]"
                        : label.includes("FHE")
                        ? "bg-[rgba(0,255,136,0.07)] border-[rgba(0,255,136,0.2)] text-[rgba(255,255,255,0.65)]"
                        : "bg-[rgba(255,255,255,0.04)] border-[rgba(255,255,255,0.08)] text-[rgba(255,255,255,0.45)]"
                    }`}
                  >
                    <p
                      className={`font-semibold mb-2 font-sans text-[11px] uppercase tracking-wider ${
                        bad
                          ? "text-[rgba(244,63,94,0.7)]"
                          : label.includes("FHE")
                          ? "text-neon-green"
                          : "text-[rgba(255,255,255,0.4)]"
                      }`}
                    >
                      {label}
                    </p>
                    <pre className="whitespace-pre-wrap leading-relaxed">{code}</pre>
                  </div>
                ))}
              </div>
            </GlassCard>
          </section>

          {/* Guarantees grid */}
          <section>
            <h2 className="text-2xl font-heading font-bold text-white mb-8">
              Privacy Guarantees
            </h2>
            <div className="grid md:grid-cols-2 gap-6">
              {GUARANTEES.map((g, i) => {
                const palette = colorMap[g.color];
                return (
                  <motion.div
                    key={g.title}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.1, duration: 0.4 }}
                    viewport={{ once: true }}
                  >
                    <GlassCard className="p-6 h-full" glow="none">
                      <div
                        className={`w-10 h-10 rounded-2xl ${palette.bg} border ${palette.border} flex items-center justify-center mb-4`}
                      >
                        <g.icon className={`w-5 h-5 ${palette.text}`} />
                      </div>
                      <h3 className="text-white font-heading font-bold mb-2">
                        {g.title}
                      </h3>
                      <p className="text-[rgba(255,255,255,0.5)] text-sm leading-relaxed">
                        {g.body}
                      </p>
                    </GlassCard>
                  </motion.div>
                );
              })}
            </div>
          </section>

          {/* Data visibility table */}
          <section>
            <h2 className="text-2xl font-heading font-bold text-white mb-3">
              What Data Is Visible?
            </h2>
            <p className="text-[rgba(255,255,255,0.4)] text-sm mb-6">
              All data is stored on-chain. The table below shows whether each
              field is readable by a third party.
            </p>
            <GlassCard className="overflow-hidden p-0" glow="none">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-[rgba(255,255,255,0.07)]">
                    <th className="text-left text-[rgba(255,255,255,0.35)] font-semibold px-6 py-3.5 text-xs uppercase tracking-wider">
                      Field
                    </th>
                    <th className="text-left text-[rgba(255,255,255,0.35)] font-semibold px-4 py-3.5 text-xs uppercase tracking-wider">
                      How Stored
                    </th>
                    <th className="text-center text-[rgba(255,255,255,0.35)] font-semibold px-4 py-3.5 text-xs uppercase tracking-wider">
                      Visible to 3rd Party
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {DATA_TABLE.map((row, i) => (
                    <tr
                      key={row.field}
                      className={`border-b border-[rgba(255,255,255,0.04)] ${
                        i % 2 === 0 ? "" : "bg-[rgba(255,255,255,0.015)]"
                      }`}
                    >
                      <td className="px-6 py-3.5 text-[rgba(255,255,255,0.7)] font-medium">
                        {row.field}
                      </td>
                      <td className="px-4 py-3.5 font-mono text-xs text-[rgba(255,255,255,0.4)]">
                        {row.stored}
                      </td>
                      <td className="px-4 py-3.5 text-center">
                        {row.visible ? (
                          <CheckCircle className="w-4 h-4 text-[rgba(255,255,255,0.3)] inline" />
                        ) : (
                          <XCircle className="w-4 h-4 text-neon-green inline" />
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <div className="flex items-center gap-4 px-6 py-4 border-t border-[rgba(255,255,255,0.05)]">
                <div className="flex items-center gap-1.5 text-xs text-[rgba(255,255,255,0.3)]">
                  <XCircle className="w-3.5 h-3.5 text-neon-green" />
                  Not visible (encrypted)
                </div>
                <div className="flex items-center gap-1.5 text-xs text-[rgba(255,255,255,0.3)]">
                  <CheckCircle className="w-3.5 h-3.5 text-[rgba(255,255,255,0.3)]" />
                  Public on-chain
                </div>
              </div>
            </GlassCard>
          </section>

          {/* External links */}
          <section>
            <h2 className="text-2xl font-heading font-bold text-white mb-6">
              Further Reading
            </h2>
            <div className="grid md:grid-cols-2 gap-4">
              {[
                {
                  title: "Fhenix CoFHE Documentation",
                  desc: "Technical docs for the FHE framework powering HireShield",
                  href: "https://docs.fhenix.zone",
                },
                {
                  title: "Awesome Fhenix",
                  desc: "Curated resources, tutorials, and examples for building FHE dApps",
                  href: "https://github.com/FhenixProtocol/awesome-fhenix",
                },
              ].map((link) => (
                <a
                  key={link.title}
                  href={link.href}
                  target="_blank"
                  rel="noreferrer"
                  className="group block"
                >
                  <GlassCard
                    className="p-5 h-full transition-all duration-200 group-hover:border-[rgba(0,212,255,0.3)]"
                    glow="none"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-white font-semibold text-sm mb-1 group-hover:text-neon-cyan transition-colors">
                          {link.title}
                        </p>
                        <p className="text-[rgba(255,255,255,0.4)] text-xs leading-relaxed">
                          {link.desc}
                        </p>
                      </div>
                      <ExternalLink className="w-4 h-4 text-[rgba(255,255,255,0.2)] group-hover:text-neon-cyan transition-colors flex-shrink-0 mt-0.5" />
                    </div>
                  </GlassCard>
                </a>
              ))}
            </div>
          </section>
        </main>

        <Footer />
      </div>
    </div>
  );
}
