import { motion } from "framer-motion";
import { Briefcase, User, Shield, Lock, CheckCircle, Zap } from "lucide-react";

// Animated data packet travelling along an SVG path using animateMotion
function Packet({
  pathId,
  color,
  dur,
  delay = "0s",
}: {
  pathId: string;
  color: string;
  dur: string;
  delay?: string;
}) {
  return (
    <circle r="3.5" fill={color} opacity="0.9">
      <animateMotion
        dur={dur}
        begin={delay}
        repeatCount="indefinite"
        calcMode="linear"
      >
        <mpath href={`#${pathId}`} />
      </animateMotion>
    </circle>
  );
}

export function HeroFigure() {
  // Layout constants — scaled up 20% from original
  const W = 516;
  const H = 564;

  // Node anchor points (used by SVG paths)
  // Employer card bottom-center
  const empX = 100;
  const empBottom = 190;
  // Candidate card bottom-center
  const canX = 416;
  const canBottom = 190;
  // FHE Contract left/right mid & bottom-center
  const fheLeft = 142;
  const fheRight = 374;
  const fheMidY = 322;
  const fheBottom = 402;
  // Match result top-center
  const matchTop = 450;
  const matchX = 258;

  return (
    <div className="relative select-none" style={{ width: W, height: H }}>
      {/* Ambient glow */}
      <div
        className="absolute pointer-events-none"
        style={{
          inset: 0,
          background:
            "radial-gradient(ellipse at 50% 55%, rgba(124,58,237,0.13) 0%, rgba(0,212,255,0.07) 40%, transparent 70%)",
          filter: "blur(28px)",
        }}
      />

      {/* ── SVG layer: paths + animated packets ── */}
      <svg
        className="absolute inset-0 pointer-events-none"
        width={W}
        height={H}
        overflow="visible"
      >
        <defs>
          {/* Employer → FHE */}
          <path
            id="path-emp"
            d={`M ${empX} ${empBottom} C ${empX} ${empBottom + 55} ${fheLeft - 20} ${fheMidY - 20} ${fheLeft} ${fheMidY}`}
            fill="none"
          />
          {/* Candidate → FHE */}
          <path
            id="path-can"
            d={`M ${canX} ${canBottom} C ${canX} ${canBottom + 55} ${fheRight + 20} ${fheMidY - 20} ${fheRight} ${fheMidY}`}
            fill="none"
          />
          {/* FHE → Match */}
          <path
            id="path-match"
            d={`M ${matchX} ${fheBottom} L ${matchX} ${matchTop}`}
            fill="none"
          />
          <linearGradient id="lg-cyan-violet" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#00d4ff" stopOpacity="0.7" />
            <stop offset="100%" stopColor="#7c3aed" stopOpacity="0.7" />
          </linearGradient>
          <linearGradient id="lg-violet-cyan" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#7c3aed" stopOpacity="0.7" />
            <stop offset="100%" stopColor="#00d4ff" stopOpacity="0.7" />
          </linearGradient>
          <linearGradient id="lg-violet-green" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#7c3aed" stopOpacity="0.7" />
            <stop offset="100%" stopColor="#00ff88" stopOpacity="0.7" />
          </linearGradient>
        </defs>

        {/* Visible dashed paths */}
        <use
          href="#path-emp"
          stroke="url(#lg-cyan-violet)"
          strokeWidth="1.5"
          strokeDasharray="6 5"
          opacity="0.6"
        >
          <animate
            attributeName="stroke-dashoffset"
            from="0"
            to="-44"
            dur="1.4s"
            repeatCount="indefinite"
          />
        </use>
        <use
          href="#path-can"
          stroke="url(#lg-violet-cyan)"
          strokeWidth="1.5"
          strokeDasharray="6 5"
          opacity="0.6"
        >
          <animate
            attributeName="stroke-dashoffset"
            from="0"
            to="-44"
            dur="1.4s"
            begin="0.5s"
            repeatCount="indefinite"
          />
        </use>
        <use
          href="#path-match"
          stroke="url(#lg-violet-green)"
          strokeWidth="1.5"
          strokeDasharray="6 5"
          opacity="0.6"
        >
          <animate
            attributeName="stroke-dashoffset"
            from="0"
            to="-44"
            dur="1.1s"
            repeatCount="indefinite"
          />
        </use>

        {/* Data packets */}
        <Packet pathId="path-emp"   color="#00d4ff" dur="1.8s" delay="0s" />
        <Packet pathId="path-emp"   color="#00d4ff" dur="1.8s" delay="0.9s" />
        <Packet pathId="path-can"   color="#7c3aed" dur="1.8s" delay="0.3s" />
        <Packet pathId="path-can"   color="#7c3aed" dur="1.8s" delay="1.15s" />
        <Packet pathId="path-match" color="#00ff88" dur="1.3s" delay="0s" />
        <Packet pathId="path-match" color="#00ff88" dur="1.3s" delay="0.65s" />
      </svg>

      {/* ── Employer node (top-left) ── */}
      <motion.div
        className="absolute"
        style={{ left: 10, top: 48, width: 180, height: 142 }}
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.15, duration: 0.5 }}
      >
        <div className="h-full rounded-2xl border border-[rgba(0,212,255,0.28)] bg-[rgba(0,212,255,0.05)] backdrop-blur-sm p-3.5 flex flex-col gap-2.5">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-xl bg-[rgba(0,212,255,0.15)] flex items-center justify-center flex-shrink-0">
              <Briefcase className="w-3.5 h-3.5 text-neon-cyan" />
            </div>
            <span className="text-white text-xs font-bold leading-none">Employer</span>
          </div>
          <div className="flex items-center gap-1.5 px-2 py-1.5 rounded-lg bg-[rgba(0,0,0,0.35)] border border-[rgba(0,212,255,0.12)]">
            <Lock className="w-2.5 h-2.5 text-neon-cyan flex-shrink-0" />
            <span className="text-[rgba(255,255,255,0.45)] text-[9px] font-mono truncate">
              Budget: <span className="text-neon-cyan">0xaf3e…</span>
            </span>
          </div>
          <div className="flex items-center gap-1.5 px-2 py-1.5 rounded-lg bg-[rgba(0,0,0,0.35)] border border-[rgba(0,212,255,0.12)]">
            <Lock className="w-2.5 h-2.5 text-neon-cyan flex-shrink-0" />
            <span className="text-[rgba(255,255,255,0.45)] text-[9px] font-mono truncate">
              Skills: <span className="text-neon-cyan">0x91c4…</span>
            </span>
          </div>
        </div>
      </motion.div>

      {/* ── Candidate node (top-right) ── */}
      <motion.div
        className="absolute"
        style={{ left: 326, top: 48, width: 180, height: 142 }}
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.3, duration: 0.5 }}
      >
        <div className="h-full rounded-2xl border border-[rgba(124,58,237,0.32)] bg-[rgba(124,58,237,0.05)] backdrop-blur-sm p-3.5 flex flex-col gap-2.5">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-xl bg-[rgba(124,58,237,0.2)] flex items-center justify-center flex-shrink-0">
              <User className="w-3.5 h-3.5 text-neon-violet" />
            </div>
            <span className="text-white text-xs font-bold leading-none">Candidate</span>
          </div>
          <div className="flex items-center gap-1.5 px-2 py-1.5 rounded-lg bg-[rgba(0,0,0,0.35)] border border-[rgba(124,58,237,0.15)]">
            <Lock className="w-2.5 h-2.5 text-neon-violet flex-shrink-0" />
            <span className="text-[rgba(255,255,255,0.45)] text-[9px] font-mono truncate">
              Salary: <span className="text-neon-violet">0x9b2c…</span>
            </span>
          </div>
          <div className="flex items-center gap-1.5 px-2 py-1.5 rounded-lg bg-[rgba(0,0,0,0.35)] border border-[rgba(124,58,237,0.15)]">
            <Lock className="w-2.5 h-2.5 text-neon-violet flex-shrink-0" />
            <span className="text-[rgba(255,255,255,0.45)] text-[9px] font-mono truncate">
              Creds: <span className="text-neon-violet">0x4d8a…</span>
            </span>
          </div>
        </div>
      </motion.div>

      {/* ── FHE Smart Contract (center) ── */}
      <motion.div
        className="absolute"
        style={{ left: 138, top: 246, width: 240, height: 156 }}
        initial={{ opacity: 0, scale: 0.88 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.5, duration: 0.6, type: "spring", stiffness: 120 }}
      >
        {/* Glow bloom */}
        <div
          className="absolute inset-0 rounded-2xl"
          style={{
            background: "radial-gradient(circle, rgba(124,58,237,0.22) 0%, transparent 70%)",
            filter: "blur(18px)",
            transform: "scale(1.3)",
          }}
        />
        <div className="relative h-full rounded-2xl border border-[rgba(124,58,237,0.5)] bg-[rgba(10,10,20,0.9)] backdrop-blur-md p-4 flex flex-col items-center justify-center gap-1.5 overflow-hidden">
          {/* Pulse ring */}
          <motion.div
            className="absolute inset-0 rounded-2xl border border-[rgba(124,58,237,0.35)]"
            animate={{ scale: [1, 1.06, 1], opacity: [0.35, 0.05, 0.35] }}
            transition={{ duration: 2.8, repeat: Infinity, ease: "easeInOut" }}
          />
          <div className="flex items-center gap-2 z-10">
            <Shield className="w-5 h-5 text-neon-violet" />
            <span className="text-white text-sm font-extrabold tracking-tight">HireShield</span>
          </div>
          <div className="text-[9.5px] text-[rgba(0,212,255,0.75)] font-mono font-semibold tracking-widest z-10">
            FHE SMART CONTRACT
          </div>
          <div className="flex items-center gap-1.5 mt-1 z-10">
            <Zap className="w-3 h-3 text-[rgba(255,255,255,0.3)]" />
            <motion.span
              className="text-[10px] text-[rgba(255,255,255,0.35)]"
              animate={{ opacity: [0.35, 0.9, 0.35] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              Computing on ciphertext…
            </motion.span>
          </div>
          <div className="flex gap-2 mt-1 z-10">
            {["euint128", "euint32"].map((t) => (
              <span
                key={t}
                className="text-[8px] font-mono px-1.5 py-0.5 rounded bg-[rgba(124,58,237,0.2)] text-[rgba(124,58,237,0.8)] border border-[rgba(124,58,237,0.2)]"
              >
                {t}
              </span>
            ))}
          </div>
        </div>
      </motion.div>

      {/* ── Match Result (bottom) ── */}
      <motion.div
        className="absolute"
        style={{ left: 108, top: 444, width: 300, height: 92 }}
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8, duration: 0.5 }}
      >
        <div className="h-full rounded-2xl border border-[rgba(0,255,136,0.35)] bg-[rgba(0,255,136,0.06)] backdrop-blur-sm px-4 flex items-center gap-3.5">
          <motion.div
            animate={{ scale: [1, 1.18, 1] }}
            transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut" }}
          >
            <CheckCircle className="w-8 h-8 text-neon-green flex-shrink-0" />
          </motion.div>
          <div>
            <p className="text-white text-xs font-bold leading-none mb-1">Match Result</p>
            <p className="text-[rgba(255,255,255,0.38)] text-[9.5px] font-mono">
              Budget ≥ Salary — verified in FHE
            </p>
            <p className="text-[rgba(255,255,255,0.22)] text-[9px] mt-0.5">
              No raw values ever revealed
            </p>
          </div>
        </div>
      </motion.div>

      {/* ── Floating label: "Encrypted inputs" ── */}
      <motion.div
        className="absolute"
        style={{ left: 210, top: 210 }}
        animate={{ opacity: [0.25, 0.7, 0.25], y: [0, -4, 0] }}
        transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut" }}
      >
        <span className="text-[9px] font-mono text-[rgba(0,212,255,0.6)]">
          enc(x) → 0xfe71…
        </span>
      </motion.div>
    </div>
  );
}
