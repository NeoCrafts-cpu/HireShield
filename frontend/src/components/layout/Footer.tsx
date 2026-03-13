import { Shield } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t border-[rgba(255,255,255,0.05)] px-6 py-8">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-7 h-7 rounded-lg bg-[rgba(0,212,255,0.15)] border border-[rgba(0,212,255,0.2)] flex items-center justify-center">
            <Shield className="w-3.5 h-3.5 text-neon-cyan" />
          </div>
          <span className="text-sm text-[rgba(255,255,255,0.3)]">
            HireShield © 2026 — Privacy-first hiring
          </span>
        </div>
        <div className="flex items-center gap-6 text-sm text-[rgba(255,255,255,0.3)]">
          <a
            href="https://cofhe-docs.fhenix.zone/"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-neon-cyan transition-colors"
          >
            Fhenix CoFHE
          </a>
          <a
            href="https://sepolia.etherscan.io/"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-neon-violet transition-colors"
          >
            Sepolia Etherscan
          </a>
          <a
            href="https://github.com/FhenixProtocol/awesome-fhenix"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-white transition-colors"
          >
            GitHub
          </a>
        </div>
      </div>
    </footer>
  );
}
