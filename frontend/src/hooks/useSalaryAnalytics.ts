import { useReadContract } from "wagmi";
import { HIRESHIELD_ABI, HIRESHIELD_ADDRESS } from "../lib/constants";

export function useSalaryAnalytics(category: string) {
  const { data: matchCount, isLoading: isLoadingCount } = useReadContract({
    address: HIRESHIELD_ADDRESS,
    abi: HIRESHIELD_ABI,
    functionName: "getCategoryMatchCount",
    args: [category],
    query: { enabled: !!category },
  });

  return {
    matchCount: matchCount ? Number(matchCount) : 0,
    isLoading: isLoadingCount,
  };
}
