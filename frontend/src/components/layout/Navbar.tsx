import { Link, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { ConnectWalletButton } from "../ui/ConnectWalletButton";

const navLinks = [
  { label: "Home", path: "/" },
  { label: "How It Works", path: "/how-it-works" },
  { label: "Docs", path: "/docs" },
  { label: "Privacy", path: "/privacy" },
];

export function Navbar() {
  const location = useLocation();

  return (
    <motion.nav
      className="sticky top-0 z-50 backdrop-blur-xl"
      style={{ borderRadius: 0, background: "rgba(10,10,15,0.85)" }}
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.4 }}
    >
      <div className="max-w-7xl mx-auto flex items-center justify-between px-8 py-3">
        {/* Logo + tagline */}
        <Link to="/" className="flex items-center gap-3 group flex-shrink-0">
          <div className="logo-container">
            <img src="/logo.png" alt="HireShield" className="w-14 h-14 object-contain" />
          </div>
          <div className="leading-tight">
            <div className="text-lg font-heading font-bold text-white tracking-tight">HireShield</div>
            <div className="text-[10px] text-[rgba(0,212,255,0.6)] font-semibold uppercase tracking-widest">Privacy First</div>
          </div>
        </Link>

        {/* Centered pill nav */}
        <div className="hidden md:flex items-center gap-1 px-2 py-1.5 rounded-full border border-[rgba(255,255,255,0.08)] bg-[rgba(255,255,255,0.03)]">
          {navLinks.map((link) => {
            const isActive = location.pathname === link.path;
            return (
              <Link
                key={link.path}
                to={link.path}
                className={`px-5 py-1.5 rounded-full text-sm font-medium transition-all duration-200 ${
                  isActive
                    ? "bg-[rgba(255,255,255,0.1)] text-white"
                    : "text-[rgba(255,255,255,0.5)] hover:text-white"
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </div>

        {/* Right actions */}
        <div className="flex items-center gap-3">
          <ConnectWalletButton />
        </div>
      </div>
    </motion.nav>
  );
}
