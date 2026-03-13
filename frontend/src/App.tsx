import { BrowserRouter, Routes, Route } from "react-router-dom";
import { WagmiProvider, usePublicClient, useWalletClient } from "wagmi";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { RainbowKitProvider, darkTheme } from "@rainbow-me/rainbowkit";
import { CofheProvider } from "@cofhe/react";
import { Toaster } from "react-hot-toast";
import { wagmiConfig } from "./lib/wagmi";
import { cofheConfig } from "./lib/cofhe";
import { ToastContainer } from "./components/ui/ToastNotification";
import { CursorLight } from "./components/ui/CursorLight";

import { Landing } from "./pages/Landing";
import { EmployerDashboard } from "./pages/EmployerDashboard";
import { CandidateDashboard } from "./pages/CandidateDashboard";
import { JobDetail } from "./pages/JobDetail";
import { MatchResult } from "./pages/MatchResult";
import { HowItWorks } from "./pages/HowItWorks";
import { Privacy } from "./pages/Privacy";

import "@rainbow-me/rainbowkit/styles.css";

const queryClient = new QueryClient();

/**
 * Inner shell — must be inside WagmiProvider so we can read the wallet/public clients
 * and pass them into CofheProvider to trigger useCofheAutoConnect.
 */
function AppProviders({ children }: { children: React.ReactNode }) {
  const publicClient = usePublicClient();
  const { data: walletClient } = useWalletClient();

  return (
    <CofheProvider
      config={cofheConfig}
      publicClient={publicClient as any}
      walletClient={walletClient as any}
    >
      <RainbowKitProvider
        theme={darkTheme({
          accentColor: "#00d4ff",
          accentColorForeground: "#0a0a0f",
          borderRadius: "large",
          overlayBlur: "small",
        })}
      >
        {children}
        <Toaster
          position="bottom-right"
          toastOptions={{
            style: {
              background: "rgba(13, 13, 20, 0.95)",
              color: "#e5e7eb",
              border: "1px solid rgba(255, 255, 255, 0.08)",
              borderRadius: "16px",
              backdropFilter: "blur(16px)",
            },
            success: { iconTheme: { primary: "#00ff88", secondary: "#0a0a0f" } },
            error: { iconTheme: { primary: "#f43f5e", secondary: "#0a0a0f" } },
          }}
        />
        <ToastContainer />
      </RainbowKitProvider>
    </CofheProvider>
  );
}

function App() {
  return (
    <WagmiProvider config={wagmiConfig}>
      <QueryClientProvider client={queryClient}>
        <AppProviders>
          <BrowserRouter>
            <CursorLight />
            <Routes>
              <Route path="/" element={<Landing />} />
              <Route path="/employer" element={<EmployerDashboard />} />
              <Route path="/candidate" element={<CandidateDashboard />} />
              <Route path="/job/:id" element={<JobDetail />} />
              <Route path="/match/:id" element={<MatchResult />} />
              <Route path="/how-it-works" element={<HowItWorks />} />
              <Route path="/privacy" element={<Privacy />} />
            </Routes>
          </BrowserRouter>
        </AppProviders>
      </QueryClientProvider>
    </WagmiProvider>
  );
}

export default App;
