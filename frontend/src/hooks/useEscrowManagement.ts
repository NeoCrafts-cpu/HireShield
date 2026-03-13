import { useWriteContract, useReadContract, useAccount } from "wagmi";
import { parseEther } from "viem";
import { HIRESHIELD_ABI, HIRESHIELD_ADDRESS } from "../lib/constants";
import toast from "react-hot-toast";

export function useEscrowManagement(jobId?: number) {
  const { address } = useAccount();
  const { writeContractAsync, isPending } = useWriteContract();

  const { data: jobData, refetch } = useReadContract({
    address: HIRESHIELD_ADDRESS,
    abi: HIRESHIELD_ABI,
    functionName: "getJob",
    args: jobId != null ? [BigInt(jobId)] : undefined,
    query: { enabled: jobId != null },
  });

  const employer = jobData ? (jobData as any)[0] as string : undefined;
  const isActive = jobData ? (jobData as any)[1] as boolean : false;
  const escrowAmount = jobData ? (jobData as any)[2] as bigint : 0n;
  const isOwner = employer?.toLowerCase() === address?.toLowerCase();

  const topUpEscrow = async (ethAmount: string) => {
    if (jobId == null) return;
    const hash = await writeContractAsync({
      address: HIRESHIELD_ADDRESS,
      abi: HIRESHIELD_ABI,
      functionName: "topUpEscrow",
      args: [BigInt(jobId)],
      value: parseEther(ethAmount),
    });
    toast.success("Escrow topped up!");
    await refetch();
    return hash;
  };

  const deactivateJob = async () => {
    if (jobId == null) return;
    const hash = await writeContractAsync({
      address: HIRESHIELD_ADDRESS,
      abi: HIRESHIELD_ABI,
      functionName: "deactivateJob",
      args: [BigInt(jobId)],
    });
    toast.success("Job deactivated");
    await refetch();
    return hash;
  };

  const reclaimEscrow = async () => {
    if (jobId == null) return;
    const hash = await writeContractAsync({
      address: HIRESHIELD_ADDRESS,
      abi: HIRESHIELD_ABI,
      functionName: "reclaimEscrow",
      args: [BigInt(jobId)],
    });
    toast.success("Escrow reclaimed!");
    await refetch();
    return hash;
  };

  return {
    isOwner,
    isActive,
    escrowAmount,
    topUpEscrow,
    deactivateJob,
    reclaimEscrow,
    isPending,
    refetch,
  };
}
