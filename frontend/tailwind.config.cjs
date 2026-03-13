/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        background: {
          primary: "#0a0a0f",
          secondary: "#0d0d14",
          card: "rgba(255,255,255,0.04)",
        },
        neon: {
          cyan: "#00d4ff",
          violet: "#7c3aed",
          green: "#00ff88",
          amber: "#f59e0b",
          rose: "#f43f5e",
        },
        glass: {
          border: "rgba(255,255,255,0.08)",
          borderHover: "rgba(0,212,255,0.3)",
        },
      },
      fontFamily: {
        heading: ["Sora", "sans-serif"],
        body: ["Outfit", "sans-serif"],
      },
      backdropBlur: {
        glass: "16px",
      },
      boxShadow: {
        "glow-cyan":
          "0 0 20px rgba(0,212,255,0.3), 0 0 60px rgba(0,212,255,0.1)",
        "glow-violet":
          "0 0 20px rgba(124,58,237,0.3), 0 0 60px rgba(124,58,237,0.1)",
        "glow-green":
          "0 0 20px rgba(0,255,136,0.3), 0 0 60px rgba(0,255,136,0.1)",
        glass:
          "0 8px 32px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.05)",
      },
      animation: {
        "aurora-1": "aurora1 8s ease infinite alternate",
        "aurora-2": "aurora2 10s ease infinite alternate",
        "pulse-glow": "pulseGlow 2s ease-in-out infinite",
        float: "float 6s ease-in-out infinite",
        shimmer: "shimmer 2s linear infinite",
        "lock-pulse": "lockPulse 2s ease-in-out infinite",
      },
      keyframes: {
        aurora1: {
          "0%": { transform: "translate(0%, 0%) scale(1)" },
          "100%": { transform: "translate(10%, 15%) scale(1.1)" },
        },
        aurora2: {
          "0%": { transform: "translate(0%, 0%) scale(1.1)" },
          "100%": { transform: "translate(-8%, -10%) scale(1)" },
        },
        pulseGlow: {
          "0%, 100%": { opacity: "0.6" },
          "50%": { opacity: "1" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-10px)" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
        lockPulse: {
          "0%, 100%": { transform: "scale(1)", filter: "brightness(1)" },
          "50%": { transform: "scale(1.1)", filter: "brightness(1.3)" },
        },
      },
    },
  },
  plugins: [],
};
