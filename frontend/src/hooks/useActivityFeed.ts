import { useQuery } from "@tanstack/react-query";
import { usePublicClient, useAccount } from "wagmi";
import { parseAbiItem } from "viem";
import { HIRESHIELD_ADDRESS } from "../lib/constants";

export type ActivityType = "applied" | "qualified" | "matched" | "escrow" | "negotiation" | "referral";

export interface ActivityItem {
  type: ActivityType;
  blockNumber: bigint;
  txHash: string;
  jobId?: number;
  applicationId?: number;
  timestamp?: number;
  detail?: string;
}

const EVENTS = {
  applied: parseAbiItem("event ApplicationSubmitted(uint256 indexed applicationId, uint256 indexed jobId, address indexed candidate)"),
  qualified: parseAbiItem("event QualificationChecked(uint256 indexed jobId, uint256 indexed applicationId, address indexed candidate)"),
  matched: parseAbiItem("event MatchFound(uint256 indexed jobId, uint256 indexed applicationId)"),
  escrow: parseAbiItem("event EscrowFunded(uint256 indexed jobId, uint256 amount)"),
  negotiation: parseAbiItem("event NegotiationSubmitted(uint256 indexed applicationId, uint8 round)"),
  referral: parseAbiItem("event ReferralSubmitted(uint256 indexed applicationId, address indexed referrer)"),
};

export function useActivityFeed() {
  const { address } = useAccount();
  const publicClient = usePublicClient();

  const { data, isLoading } = useQuery({
    queryKey: ["activity-feed", address],
    enabled: !!address && !!publicClient,
    queryFn: async () => {
      if (!address || !publicClient) return [];

      const items: ActivityItem[] = [];

      // Application events for this candidate
      const appLogs = await publicClient.getLogs({
        address: HIRESHIELD_ADDRESS,
        event: EVENTS.applied,
        args: { candidate: address },
        fromBlock: "earliest",
      });
      for (const log of appLogs) {
        items.push({
          type: "applied",
          blockNumber: log.blockNumber,
          txHash: log.transactionHash,
          applicationId: Number(log.args.applicationId),
          jobId: Number(log.args.jobId),
        });
      }

      // Qualification events
      const qualLogs = await publicClient.getLogs({
        address: HIRESHIELD_ADDRESS,
        event: EVENTS.qualified,
        args: { candidate: address },
        fromBlock: "earliest",
      });
      for (const log of qualLogs) {
        items.push({
          type: "qualified",
          blockNumber: log.blockNumber,
          txHash: log.transactionHash,
          jobId: Number(log.args.jobId),
          applicationId: Number(log.args.applicationId),
        });
      }

      // Match events (check all matches, filter by address off-chain)
      const matchLogs = await publicClient.getLogs({
        address: HIRESHIELD_ADDRESS,
        event: EVENTS.matched,
        fromBlock: "earliest",
      });
      for (const log of matchLogs) {
        items.push({
          type: "matched",
          blockNumber: log.blockNumber,
          txHash: log.transactionHash,
          jobId: Number(log.args.jobId),
          applicationId: Number(log.args.applicationId),
        });
      }

      // Sort by block number descending
      items.sort((a, b) => Number(b.blockNumber - a.blockNumber));
      return items;
    },
    staleTime: 30_000,
  });

  return {
    activities: data ?? [],
    isLoading,
  };
}
