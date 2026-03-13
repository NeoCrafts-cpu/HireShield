import { ReineiraSDK, type SDKConfigWithSigner } from "@reineira-os/sdk";
import type { ethers } from "ethers";

let sdkInstance: ReineiraSDK | null = null;

/**
 * Initialise the Reineira / Privara SDK with a wagmi signer.
 * Call once after wallet connection.
 */
export async function initPrivara(signer: ethers.Signer) {
  if (sdkInstance?.initialized) return sdkInstance;

  const config: SDKConfigWithSigner = {
    network: "testnet",
    signer,
  };

  sdkInstance = ReineiraSDK.create(config);
  await sdkInstance.initialize();
  return sdkInstance;
}

export function getPrivara(): ReineiraSDK | null {
  return sdkInstance;
}

/**
 * Create a confidential escrow for a job bonus using Privara.
 */
export async function createJobEscrow(
  recipient: string,
  amountUsdc: number,
) {
  if (!sdkInstance) throw new Error("Privara SDK not initialised");

  const escrow = await sdkInstance.escrow.create({
    amount: sdkInstance.usdc(amountUsdc),
    owner: recipient,
  });

  return escrow;
}

/**
 * Fund an existing Privara escrow.
 */
export async function fundEscrow(escrowId: bigint, amountUsdc: number) {
  if (!sdkInstance) throw new Error("Privara SDK not initialised");

  const escrow = sdkInstance.escrow.get(escrowId);
  const result = await escrow.fund(sdkInstance.usdc(amountUsdc), {
    autoApprove: true,
  });

  return result;
}

/**
 * Redeem (release) an escrow to the recipient.
 */
export async function redeemEscrow(escrowId: bigint) {
  if (!sdkInstance) throw new Error("Privara SDK not initialised");

  const escrow = sdkInstance.escrow.get(escrowId);
  return await escrow.redeem();
}
