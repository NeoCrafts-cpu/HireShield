import { useReadContract, useAccount } from "wagmi";
import { HIRESHIELD_ABI, HIRESHIELD_ADDRESS } from "../lib/constants";

interface MatchResult {
  isMatched: boolean;
  qualificationChecked: boolean;
  candidate: string;
  jobId: bigint;
}

export function useMatchJob(applicationId: number | undefined) {
  const { address } = useAccount();

  const { data, isLoading, error, refetch } = useReadContract({
    address: HIRESHIELD_ADDRESS,
    abi: HIRESHIELD_ABI,
    functionName: "applications",
    args: applicationId !== undefined ? [BigInt(applicationId)] : undefined,
    query: {
      enabled: applicationId !== undefined,
    },
  });

  const matchResult: MatchResult | undefined = data
    ? {
        candidate: (data as any)[0],
        qualificationChecked: (data as any)[6],
        isMatched: (data as any)[7],
        jobId: (data as any)[8],
      }
    : undefined;

  return {
    matchResult,
    isLoading,
    error,
    refetch,
  };
}
