import { useReadContract } from "wagmi";
import { useQuery } from "@tanstack/react-query";
import { HIRESHIELD_NFT_ABI, NFT_ADDRESS, HIRESHIELD_ADDRESS, HIRESHIELD_ABI } from "../lib/constants";
import { usePublicClient } from "wagmi";

export interface CredentialData {
  tokenId: number;
  jobId: number;
  applicationId: number;
  employer: string;
  matchTimestamp: number;
}

export function useNFTCredentials(candidateAddress?: string) {
  const publicClient = usePublicClient();

  const { data: tokenIds, isLoading: isLoadingTokens } = useReadContract({
    address: NFT_ADDRESS,
    abi: HIRESHIELD_NFT_ABI,
    functionName: "getCandidateTokens",
    args: candidateAddress ? [candidateAddress as `0x${string}`] : undefined,
    query: { enabled: !!candidateAddress && NFT_ADDRESS !== "0x0000000000000000000000000000000000000000" },
  });

  const { data: credentials, isLoading: isLoadingCreds } = useQuery({
    queryKey: ["nft-credentials", candidateAddress, tokenIds],
    enabled: !!tokenIds && (tokenIds as bigint[]).length > 0 && !!publicClient,
    queryFn: async () => {
      if (!tokenIds || !publicClient) return [];
      const ids = tokenIds as bigint[];

      const reads = ids.map((id) => ({
        address: NFT_ADDRESS as `0x${string}`,
        abi: HIRESHIELD_NFT_ABI,
        functionName: "credentials" as const,
        args: [id] as const,
      }));

      const results = await publicClient.multicall({ contracts: reads });

      return ids.map((id, i): CredentialData => {
        const r = results[i];
        if (r.status === "success" && r.result) {
          const res = r.result as any;
          return {
            tokenId: Number(id),
            jobId: Number(res[0]),
            applicationId: Number(res[1]),
            employer: res[2] as string,
            matchTimestamp: Number(res[3]),
          };
        }
        return { tokenId: Number(id), jobId: 0, applicationId: 0, employer: "", matchTimestamp: 0 };
      });
    },
  });

  return {
    credentials: credentials ?? [],
    isLoading: isLoadingTokens || isLoadingCreds,
  };
}
