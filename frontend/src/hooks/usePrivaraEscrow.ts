import { useReadContract, useWriteContract } from "wagmi";
import { ESCROW_ABI, ESCROW_ADDRESS, HIRESHIELD_ABI, HIRESHIELD_ADDRESS } from "../lib/constants";
import { parseEther } from "viem";
import { createJobEscrow, redeemEscrow } from "../lib/privara";
import toast from "react-hot-toast";
import { useState } from "react";

export function usePrivaraEscrow(jobId: number | undefined) {
  const [isCreatingPrivara, setIsCreatingPrivara] = useState(false);

  const { data: escrowAmount, isLoading: isLoadingAmount } = useReadContract({
    address: ESCROW_ADDRESS,
    abi: ESCROW_ABI,
    functionName: "jobEscrowAmount",
    args: jobId !== undefined ? [BigInt(jobId)] : undefined,
    query: {
      enabled: jobId !== undefined,
    },
  });

  const { data: recipient, isLoading: isLoadingRecipient } = useReadContract({
    address: ESCROW_ADDRESS,
    abi: ESCROW_ABI,
    functionName: "jobEscrowRecipient",
    args: jobId !== undefined ? [BigInt(jobId)] : undefined,
    query: {
      enabled: jobId !== undefined,
    },
  });

  const { writeContractAsync: fundBonus, isPending: isFunding } =
    useWriteContract();

  const { writeContractAsync: releaseBonus, isPending: isReleasing } =
    useWriteContract();

  /** Fund the on-chain escrow with ETH */
  const fundJobBonus = async (
    targetJobId: number,
    candidateAddress: string,
    amountEth: string
  ) => {
    try {
      await fundBonus({
        address: ESCROW_ADDRESS,
        abi: ESCROW_ABI,
        functionName: "fundJobBonus",
        args: [BigInt(targetJobId), candidateAddress as `0x${string}`],
        value: parseEther(amountEth),
      });
      toast.success("Bonus funded to escrow!");
    } catch (err) {
      console.error(err);
      toast.error("Escrow funding failed");
      throw err;
    }
  };

  /** Release on-chain escrow bonus — calls claimBonus on HireShield */
  const releaseBonusOnChain = async (targetJobId: number) => {
    try {
      await releaseBonus({
        address: HIRESHIELD_ADDRESS,
        abi: HIRESHIELD_ABI,
        functionName: "claimBonus",
        args: [BigInt(targetJobId)],
      });
      toast.success("Bonus released to candidate!");
    } catch (err) {
      console.error(err);
      toast.error("Bonus release failed");
      throw err;
    }
  };

  /** Create a confidential Privara escrow (USDC) */
  const createPrivaraEscrow = async (
    recipientAddress: string,
    amountUsdc: number
  ) => {
    setIsCreatingPrivara(true);
    try {
      const escrow = await createJobEscrow(recipientAddress, amountUsdc);
      toast.success(`Privara escrow created (ID: ${escrow.id})`);
      return escrow;
    } catch (err) {
      console.error(err);
      toast.error("Privara escrow creation failed");
      throw err;
    } finally {
      setIsCreatingPrivara(false);
    }
  };

  /** Redeem a Privara escrow */
  const redeemPrivaraEscrow = async (escrowId: bigint) => {
    try {
      const result = await redeemEscrow(escrowId);
      toast.success("Privara escrow redeemed!");
      return result;
    } catch (err) {
      console.error(err);
      toast.error("Privara redemption failed");
      throw err;
    }
  };

  return {
    escrowAmount: escrowAmount as bigint | undefined,
    recipient: recipient as string | undefined,
    isLoading: isLoadingAmount || isLoadingRecipient,
    fundJobBonus,
    isFunding,
    releaseBonusOnChain,
    isReleasing,
    createPrivaraEscrow,
    redeemPrivaraEscrow,
    isCreatingPrivara,
  };
}
