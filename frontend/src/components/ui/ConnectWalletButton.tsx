import { ConnectButton } from "@rainbow-me/rainbowkit";
import { motion } from "framer-motion";
import { Wallet } from "lucide-react";

export function ConnectWalletButton() {
  return (
    <ConnectButton.Custom>
      {({
        account,
        chain,
        openAccountModal,
        openChainModal,
        openConnectModal,
        mounted,
      }) => {
        const connected = mounted && account && chain;

        return (
          <div
            {...(!mounted && {
              "aria-hidden": true,
              style: {
                opacity: 0,
                pointerEvents: "none" as const,
                userSelect: "none" as const,
              },
            })}
          >
            {(() => {
              if (!connected) {
                return (
                  <motion.button
                    onClick={openConnectModal}
                    className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[rgba(0,212,255,0.1)] border border-[rgba(0,212,255,0.3)] text-neon-cyan font-semibold text-sm hover:bg-[rgba(0,212,255,0.2)] hover:shadow-glow-cyan transition-all duration-200"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Wallet className="w-4 h-4" />
                    Connect Wallet
                  </motion.button>
                );
              }

              if (chain.unsupported) {
                return (
                  <motion.button
                    onClick={openChainModal}
                    className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[rgba(244,63,94,0.1)] border border-[rgba(244,63,94,0.3)] text-neon-rose font-semibold text-sm hover:bg-[rgba(244,63,94,0.2)] transition-all duration-200"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    Wrong Network
                  </motion.button>
                );
              }

              return (
                <div className="flex items-center gap-2">
                  <motion.button
                    onClick={openChainModal}
                    className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[rgba(255,255,255,0.05)] border border-[rgba(255,255,255,0.08)] text-[rgba(255,255,255,0.7)] text-sm hover:bg-[rgba(255,255,255,0.08)] transition-all duration-200"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    {chain.hasIcon && chain.iconUrl && (
                      <img
                        alt={chain.name ?? "Chain"}
                        src={chain.iconUrl}
                        className="w-4 h-4 rounded-full"
                      />
                    )}
                    {chain.name}
                  </motion.button>

                  <motion.button
                    onClick={openAccountModal}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[rgba(0,212,255,0.08)] border border-[rgba(0,212,255,0.2)] text-white text-sm font-medium hover:bg-[rgba(0,212,255,0.15)] transition-all duration-200"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <div className="w-2 h-2 rounded-full bg-neon-green animate-pulse" />
                    {account.displayName}
                    {account.displayBalance && (
                      <span className="text-[rgba(255,255,255,0.4)]">
                        ({account.displayBalance})
                      </span>
                    )}
                  </motion.button>
                </div>
              );
            })()}
          </div>
        );
      }}
    </ConnectButton.Custom>
  );
}
