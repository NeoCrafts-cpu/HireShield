import { useReadContract, usePublicClient, useAccount } from "wagmi";
import { useQuery } from "@tanstack/react-query";
import { parseAbiItem } from "viem";
import { HIRESHIELD_ABI, HIRESHIELD_ADDRESS } from "../lib/constants";

export interface JobData {
  jobId: number;
  employer: string;
  isActive: boolean;
  escrowAmount: bigint;
  applicationCount: number;
  title: string;
  description: string;
}

export function useJobList() {
  const { data: jobCount, isLoading: isLoadingCount } = useReadContract({
    address: HIRESHIELD_ADDRESS,
    abi: HIRESHIELD_ABI,
    functionName: "jobCounter",
  });

  return {
    jobCount: jobCount ? Number(jobCount) : 0,
    isLoadingCount,
  };
}

export function useJob(jobId: number | undefined) {
  const { data, isLoading, error, refetch } = useReadContract({
    address: HIRESHIELD_ADDRESS,
    abi: HIRESHIELD_ABI,
    functionName: "getJob",
    args: jobId !== undefined ? [BigInt(jobId)] : undefined,
    query: {
      enabled: jobId !== undefined && jobId > 0,
    },
  });

  const job: JobData | undefined = data
    ? {
        jobId: jobId!,
        employer: (data as any)[0],
        isActive: (data as any)[1],
        escrowAmount: (data as any)[2],
        applicationCount: Number((data as any)[3]),
        title: (data as any)[4],
        description: (data as any)[5],
      }
    : undefined;

  return {
    job,
    isLoading,
    error,
    refetch,
  };
}

export interface ApplicationData {
  applicationId: number;
  jobId: number;
  jobTitle: string;
  isMatched: boolean;
}

const APPLICATION_SUBMITTED_EVENT = parseAbiItem(
  "event ApplicationSubmitted(uint256 indexed applicationId, uint256 indexed jobId, address indexed candidate)"
);

export function useMyApplications() {
  const { address } = useAccount();
  const publicClient = usePublicClient();

  const { data, isLoading, error } = useQuery({
    queryKey: ["my-applications", address],
    enabled: !!address && !!publicClient,
    queryFn: async () => {
      if (!address || !publicClient) return [];

      const logs = await publicClient.getLogs({
        address: HIRESHIELD_ADDRESS,
        event: APPLICATION_SUBMITTED_EVENT,
        args: { candidate: address },
        fromBlock: "earliest",
      });

      if (logs.length === 0) return [];

      const appIds = logs.map((l) => Number(l.args.applicationId));
      const jobIds = logs.map((l) => Number(l.args.jobId));
      const uniqueJobIds = [...new Set(jobIds)];

      const appReads = appIds.map((id) => ({
        address: HIRESHIELD_ADDRESS as `0x${string}`,
        abi: HIRESHIELD_ABI,
        functionName: "applications" as const,
        args: [BigInt(id)] as const,
      }));

      const jobReads = uniqueJobIds.map((id) => ({
        address: HIRESHIELD_ADDRESS as `0x${string}`,
        abi: HIRESHIELD_ABI,
        functionName: "getJob" as const,
        args: [BigInt(id)] as const,
      }));

      const results = await publicClient.multicall({
        contracts: [...appReads, ...jobReads],
      });

      const appResults = results.slice(0, appIds.length);
      const jobResults = results.slice(appIds.length);

      const jobTitleMap: Record<number, string> = {};
      uniqueJobIds.forEach((jid, i) => {
        const r = jobResults[i];
        if (r.status === "success" && r.result) {
          jobTitleMap[jid] = (r.result as any)[4] as string;
        }
      });

      return appIds
        .map((appId, i): ApplicationData => {
          const r = appResults[i];
          const isMatched =
            r.status === "success" ? Boolean((r.result as any)[3]) : false;
          return {
            applicationId: appId,
            jobId: jobIds[i],
            jobTitle: jobTitleMap[jobIds[i]] ?? `Job #${jobIds[i]}`,
            isMatched,
          };
        })
        .reverse();
    },
  });

  return {
    applications: data ?? [],
    isLoading,
    error,
  };
}
