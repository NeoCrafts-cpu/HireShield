import { Link, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { ConnectWalletButton } from "../ui/ConnectWalletButton";
import { Briefcase, User, Shield, Gavel } from "lucide-react";

/** In-app navbar — shown on all feature pages after "Get Started" */
const appLinks = [
  { label: "Employer", path: "/employer", icon: Briefcase },
  { label: "Candidate", path: "/candidate", icon: User },
  { label: "Reputation", path: "/reputation", icon: Shield },
  { label: "Bidding", path: "/bidding", icon: Gavel },
];

export function AppNavbar() {
  const location = useLocation();

  return (
    <motion.nav
      className="sticky top-0 z-50 backdrop-blur-xl"
      style={{ borderRadius: 0, background: "rgba(10,10,15,0.92)" }}
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.4 }}
    >
      <div className="max-w-7xl mx-auto flex items-center justify-between px-8 py-3">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-3 group flex-shrink-0">
          <div className="logo-container">
            <img src="/logo.png" alt="HireShield" className="w-12 h-12 object-contain" />
          </div>
          <div className="leading-tight">
            <div className="text-base font-heading font-bold text-white tracking-tight">HireShield</div>
            <div className="text-[9px] text-[rgba(0,212,255,0.6)] font-semibold uppercase tracking-widest">App</div>
          </div>
        </Link>

        {/* Feature pill nav — app links only */}
        <div className="hidden md:flex items-center gap-1 px-2 py-1.5 rounded-full border border-[rgba(255,255,255,0.08)] bg-[rgba(255,255,255,0.03)]">
          {appLinks.map(({ label, path, icon: Icon }) => {
            const isActive =
              location.pathname === path ||
              (path !== "/" && location.pathname.startsWith(path));
            return (
              <Link
                key={path}
                to={path}
                className={`flex items-center gap-1.5 px-4 py-1.5 rounded-full text-sm font-medium transition-all duration-200 ${
                  isActive
                    ? "bg-[rgba(0,212,255,0.12)] text-neon-cyan border border-[rgba(0,212,255,0.25)]"
                    : "text-[rgba(255,255,255,0.5)] hover:text-white"
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                {label}
              </Link>
            );
          })}
        </div>

        {/* Right — wallet connect */}
        <div className="flex items-center gap-3">
          <ConnectWalletButton />
        </div>
      </div>
    </motion.nav>
  );
}
