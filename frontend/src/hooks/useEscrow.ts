import { useReadContract, useWriteContract } from "wagmi";
import { ESCROW_ABI, ESCROW_ADDRESS, HIRESHIELD_ABI, HIRESHIELD_ADDRESS } from "../lib/constants";
import toast from "react-hot-toast";

export function useEscrow(jobId: number | undefined) {
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

  const { writeContractAsync: claimBonusTx, isPending: isClaiming } =
    useWriteContract();

  /** Claim escrow bonus on-chain via HireShield.claimBonus */
  const claimBonus = async (targetJobId: number) => {
    try {
      await claimBonusTx({
        address: HIRESHIELD_ADDRESS,
        abi: HIRESHIELD_ABI,
        functionName: "claimBonus",
        args: [BigInt(targetJobId)],
      });
      toast.success("Bonus released to your wallet!");
    } catch (err) {
      console.error(err);
      toast.error("Bonus claim failed");
      throw err;
    }
  };

  return {
    escrowAmount: escrowAmount as bigint | undefined,
    recipient: recipient as string | undefined,
    isLoading: isLoadingAmount || isLoadingRecipient,
    claimBonus,
    isClaiming,
  };
}
