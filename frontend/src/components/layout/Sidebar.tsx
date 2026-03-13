import { Link, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Home,
  Briefcase,
  User,
  BookOpen,
  Settings,
  Shield,
} from "lucide-react";

const sidebarLinks = [
  { label: "Home", path: "/", icon: Home },
  { label: "Employer", path: "/employer", icon: Briefcase },
  { label: "Candidate", path: "/candidate", icon: User },
  { label: "How It Works", path: "/how-it-works", icon: BookOpen },
];

export function Sidebar() {
  const location = useLocation();

  return (
    <motion.aside
      className="hidden lg:flex flex-col w-64 glass border-r border-[rgba(255,255,255,0.05)] min-h-[calc(100vh-73px)]"
      style={{ borderRadius: 0 }}
      initial={{ x: -20, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ duration: 0.4, delay: 0.1 }}
    >
      <div className="flex-1 p-4 space-y-1">
        {sidebarLinks.map((link) => {
          const isActive = location.pathname === link.path;
          return (
            <Link
              key={link.path}
              to={link.path}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
                isActive
                  ? "text-neon-cyan bg-[rgba(0,212,255,0.1)] border border-[rgba(0,212,255,0.15)]"
                  : "text-[rgba(255,255,255,0.4)] hover:text-white hover:bg-[rgba(255,255,255,0.05)] border border-transparent"
              }`}
            >
              <link.icon className={`w-4 h-4 ${isActive ? "text-neon-cyan" : ""}`} />
              {link.label}
            </Link>
          );
        })}
      </div>

      {/* Bottom section */}
      <div className="p-4 border-t border-[rgba(255,255,255,0.05)]">
        <div className="glass p-4 rounded-2xl">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-8 h-8 rounded-xl bg-[rgba(0,255,136,0.1)] border border-[rgba(0,255,136,0.2)] flex items-center justify-center">
              <Shield className="w-4 h-4 text-neon-green" />
            </div>
            <div>
              <p className="text-white text-xs font-semibold">Privacy Mode</p>
              <p className="text-[rgba(255,255,255,0.3)] text-[10px]">
                FHE Active
              </p>
            </div>
          </div>
          <div className="h-1.5 rounded-full bg-[rgba(255,255,255,0.05)] overflow-hidden">
            <motion.div
              className="h-full rounded-full bg-gradient-to-r from-neon-cyan to-neon-green"
              initial={{ width: "0%" }}
              animate={{ width: "100%" }}
              transition={{ duration: 2, ease: "easeOut" }}
            />
          </div>
        </div>
      </div>
    </motion.aside>
  );
}
