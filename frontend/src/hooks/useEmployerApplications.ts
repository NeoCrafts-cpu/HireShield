import { useReadContract, usePublicClient } from "wagmi";
import { useQuery } from "@tanstack/react-query";
import { HIRESHIELD_ABI, HIRESHIELD_ADDRESS } from "../lib/constants";

export interface EmployerAppData {
  applicationId: number;
  candidate: string;
  qualificationChecked: boolean;
  isMatched: boolean;
  negotiationRound: number;
  referrer: string;
}

export function useEmployerApplications(jobId?: number) {
  const publicClient = usePublicClient();

  const { data: appIds, isLoading: isLoadingIds } = useReadContract({
    address: HIRESHIELD_ADDRESS,
    abi: HIRESHIELD_ABI,
    functionName: "getJobApplicationIds",
    args: jobId != null ? [BigInt(jobId)] : undefined,
    query: { enabled: jobId != null },
  });

  const { data: apps, isLoading: isLoadingApps } = useQuery({
    queryKey: ["employer-apps", jobId, appIds],
    enabled: !!appIds && (appIds as bigint[]).length > 0 && !!publicClient,
    queryFn: async () => {
      if (!appIds || !publicClient) return [];
      const ids = appIds as bigint[];

      const reads = ids.map((id) => ({
        address: HIRESHIELD_ADDRESS as `0x${string}`,
        abi: HIRESHIELD_ABI,
        functionName: "applications" as const,
        args: [id] as const,
      }));

      const results = await publicClient.multicall({ contracts: reads });

      return ids.map((id, i): EmployerAppData => {
        const r = results[i];
        if (r.status === "success" && r.result) {
          const res = r.result as any;
          return {
            applicationId: Number(id),
            candidate: res[0],
            qualificationChecked: res[6],
            isMatched: res[7],
            negotiationRound: Number(res[10]),
            referrer: res[9],
          };
        }
        return {
          applicationId: Number(id),
          candidate: "",
          qualificationChecked: false,
          isMatched: false,
          negotiationRound: 0,
          referrer: "0x0000000000000000000000000000000000000000",
        };
      });
    },
  });

  return {
    applications: apps ?? [],
    isLoading: isLoadingIds || isLoadingApps,
  };
}
