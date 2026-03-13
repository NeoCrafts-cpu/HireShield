import { createCofheConfig } from "@cofhe/react";
import { sepolia as cofheSepolia } from "@cofhe/sdk/chains";

export { Encryptable } from "@cofhe/sdk";

/**
 * CoFHE React configuration.
 * Uses Sepolia testnet — CoFHE FHE operations run on-chain.
 */
export const cofheConfig = createCofheConfig({
  supportedChains: [cofheSepolia],
  react: {
    initialTheme: "dark",
  },
});
