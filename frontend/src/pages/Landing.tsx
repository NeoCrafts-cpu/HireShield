import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import {
  Shield,
  Lock,
  Zap,
  ChevronRight,
  Github,
  Briefcase,
  BookOpen,
} from "lucide-react";
import { AuroraBackground } from "../components/ui/AuroraBackground";
import { GlassCard } from "../components/ui/GlassCard";
import { NeonButton } from "../components/ui/NeonButton";
import { EncryptedBadge } from "../components/ui/EncryptedBadge";
import { CountUp } from "../components/ui/CountUp";
import { CursorLight } from "../components/ui/CursorLight";
import { HeroFigure } from "../components/ui/HeroFigure";
import { Navbar } from "../components/layout/Navbar";
import { useInView } from "react-intersection-observer";

const HOW_IT_WORKS = [
  {
    step: "01",
    icon: Lock,
    title: "Encrypt Everything",
    description:
      "Salary, experience, skills, and location are encrypted client-side via Fhenix CoFHE. Nothing raw ever touches the chain.",
    color: "cyan" as const,
  },
  {
    step: "02",
    icon: Shield,
    title: "Apply Without Exposing",
    description:
      "Candidates submit encrypted credentials. No salary expectation, no skill level — nothing is visible to anyone.",
    color: "violet" as const,
  },
  {
    step: "03",
    icon: Zap,
    title: "4D FHE Match On-Chain",
    description:
      "Smart contract compares salary, experience, skills, and location — all on ciphertext. Only the boolean result is revealed.",
    color: "green" as const,
  },
];

const STATS = [
  {
    label: "Encrypted Dimensions",
    value: 4,
    suffix: "D",
    description: "Salary · Experience · Skills · Location",
  },
  {
    label: "Zero Bias",
    value: 100,
    suffix: "%",
    description: "No name, age, or photo during match",
  },
  {
    label: "Threshold Decrypt",
    value: 5,
    suffix: "+",
    description: "CoFHE key shares for decryption",
  },
];

const colorMap = {
  cyan: {
    textClass: "text-neon-cyan",
    bgClass: "bg-[rgba(0,212,255,0.1)]",
    borderClass: "border-[rgba(0,212,255,0.2)]",
    stepClass: "text-neon-cyan",
  },
  violet: {
    textClass: "text-neon-violet",
    bgClass: "bg-[rgba(124,58,237,0.1)]",
    borderClass: "border-[rgba(124,58,237,0.2)]",
    stepClass: "text-neon-violet",
  },
  green: {
    textClass: "text-neon-green",
    bgClass: "bg-[rgba(0,255,136,0.1)]",
    borderClass: "border-[rgba(0,255,136,0.2)]",
    stepClass: "text-neon-green",
  },
};

export function Landing() {
  const navigate = useNavigate();
  const [statsRef, statsInView] = useInView({ triggerOnce: true });

  return (
    <div className="relative min-h-screen overflow-hidden">
      {/* Hero background image */}
      <div
        className="fixed inset-0 z-0"
        style={{
          backgroundImage: "url('/hero.png')",
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
          filter: "blur(3px) brightness(0.28)",
          transform: "scale(1.05)",
        }}
      />
      {/* Dark overlay to keep text readable */}
      <div className="fixed inset-0 z-0 bg-[#0a0a0f]/60" />

      <AuroraBackground />

      <div className="relative z-10">
        <Navbar />
        {/* Hero Section — NullPay style */}
        <section className="relative px-8 pt-20 pb-10 max-w-7xl mx-auto min-h-[88vh] flex flex-col justify-center">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-0 items-center">

            {/* Left column */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="max-w-[600px]"
            >
              <h1 className="text-5xl md:text-6xl lg:text-7xl font-heading font-black text-white leading-[1.05] mb-4">
                End Salary
              </h1>
              <h1 className="text-5xl md:text-6xl lg:text-7xl font-heading font-black leading-[1.05] mb-8">
                <span className="gradient-text">Discrimination.</span>{" "}
                <span className="text-[rgba(255,255,255,0.18)] font-black">Forever.</span>
              </h1>

              <p className="text-lg text-[rgba(255,255,255,0.55)] max-w-lg mb-10 leading-relaxed">
                Companies compete on merit without seeing your{" "}
                <strong className="text-white">salary history</strong>. Candidates apply without revealing{" "}
                <strong className="text-white">their number</strong>. FHE matches on encrypted data — no one sees anything.
              </p>

              {/* CTAs */}
              <div className="flex items-center gap-4 mb-14 flex-wrap">
                <motion.button
                  onClick={() => navigate("/employer")}
                  className="flex items-center gap-2 px-7 py-3.5 rounded-full bg-neon-cyan text-[#0a0a0f] font-bold text-base hover:brightness-110 transition-all"
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                >
                  <Briefcase className="w-5 h-5" />
                  Get Started <ChevronRight className="w-4 h-4" />
                </motion.button>
                <motion.button
                  onClick={() => navigate("/docs")}
                  className="flex items-center gap-2 px-7 py-3.5 rounded-full border border-[rgba(255,255,255,0.15)] text-white font-semibold text-base hover:border-[rgba(255,255,255,0.35)] hover:bg-[rgba(255,255,255,0.04)] transition-all"
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                >
                  <BookOpen className="w-5 h-5" />
                  Documentation
                </motion.button>
              </div>

              {/* Trust badges */}
              <div className="flex items-center gap-6 flex-wrap">
                {[
                  { dot: "bg-neon-cyan", label: "ZERO BIAS" },
                  { dot: "bg-[#7c3aed]", label: "FHE NATIVE" },
                  { dot: "bg-neon-green", label: "4D MATCHING" },
                  { dot: "bg-[rgba(255,255,255,0.3)]", label: "AUTO ESCROW" },
                ].map(({ dot, label }) => (
                  <div key={label} className="flex items-center gap-2">
                    <div className={`w-1.5 h-1.5 rounded-full ${dot}`} />
                    <span className="text-[rgba(255,255,255,0.4)] text-xs font-semibold tracking-widest uppercase">
                      {label}
                    </span>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Right column — dot-sphere globe figure */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3, duration: 0.8 }}
              className="hidden lg:flex items-center justify-center"
            >
              <HeroFigure />
            </motion.div>
          </div>
        </section>

        {/* Stats Bar */}
        <section ref={statsRef} className="px-6 py-12 max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {STATS.map((stat, i) => (
              <GlassCard
                key={stat.label}
                className="p-6 text-center"
                glow="none"
              >
                <div className="text-4xl font-heading font-black text-neon-cyan mb-1">
                  {statsInView ? (
                    <CountUp
                      end={stat.value}
                      duration={2}
                      suffix={stat.suffix}
                    />
                  ) : (
                    `0${stat.suffix}`
                  )}
                </div>
                <div className="text-white font-semibold mb-1">
                  {stat.label}
                </div>
                <div className="text-[rgba(255,255,255,0.4)] text-sm">
                  {stat.description}
                </div>
              </GlassCard>
            ))}
          </div>
        </section>

        {/* How It Works */}
        <section className="px-6 py-20 max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-3xl md:text-4xl font-heading font-bold text-white mb-4">
              How HireShield Works
            </h2>
            <p className="text-[rgba(255,255,255,0.5)] text-lg">
              Three steps. Zero salary exposure. Cryptographic guarantees.
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {HOW_IT_WORKS.map((item, i) => {
              const palette = colorMap[item.color];
              return (
                <motion.div
                  key={item.step}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.15, duration: 0.5 }}
                  viewport={{ once: true }}
                >
                  <GlassCard className="p-8 h-full" glow={item.color}>
                    <div
                      className={`text-5xl font-heading font-black mb-6 opacity-20 ${palette.stepClass}`}
                    >
                      {item.step}
                    </div>
                    <div
                      className={`w-12 h-12 rounded-2xl ${palette.bgClass} border ${palette.borderClass} flex items-center justify-center mb-5`}
                    >
                      <item.icon
                        className={`w-6 h-6 ${palette.textClass}`}
                      />
                    </div>
                    <h3 className="text-xl font-heading font-bold text-white mb-3">
                      {item.title}
                    </h3>
                    <p className="text-[rgba(255,255,255,0.5)] leading-relaxed">
                      {item.description}
                    </p>
                  </GlassCard>
                </motion.div>
              );
            })}
          </div>
        </section>

        {/* CTA Section */}
        <section className="px-6 py-20 text-center">
          <GlassCard className="p-10 md:p-14 max-w-2xl mx-auto" glow="violet">
            <Shield className="w-14 h-14 text-neon-violet mx-auto mb-6 animate-float" />
            <h2 className="text-3xl md:text-4xl font-heading font-bold text-white mb-4">
              The future of hiring is private
            </h2>
            <p className="text-[rgba(255,255,255,0.5)] mb-8">
              Join the confidential hiring revolution. Powered by Fhenix FHE and
              on-chain escrow.
            </p>
            <NeonButton
              variant="secondary"
              size="lg"
              onClick={() => navigate("/employer")}
              className="mx-auto"
            >
              Launch App <ChevronRight className="w-5 h-5" />
            </NeonButton>
          </GlassCard>
        </section>

        {/* Footer */}
        <footer className="px-6 py-8 text-center border-t border-[rgba(255,255,255,0.05)]">
          <p className="text-[rgba(255,255,255,0.3)] text-sm">
            Built with{" "}
            <a
              href="https://cofhe-docs.fhenix.zone/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-neon-cyan hover:underline"
            >
              Fhenix CoFHE
            </a>{" "}
            +{" "}
            <a
              href="https://sepolia.etherscan.io/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-neon-violet hover:underline"
            >
              Sepolia
            </a>{" "}
            | HireShield © 2026
          </p>
        </footer>
      </div>
    </div>
  );
}
