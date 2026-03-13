import { useWriteContract, useReadContract } from "wagmi";
import { HIRESHIELD_ABI, HIRESHIELD_ADDRESS } from "../lib/constants";
import { useFHEEncrypt } from "./useFHEEncrypt";
import toast from "react-hot-toast";

export function useNegotiation(applicationId?: number) {
  const { writeContractAsync, isPending } = useWriteContract();
  const { encrypt } = useFHEEncrypt();

  const { data: appData, refetch } = useReadContract({
    address: HIRESHIELD_ADDRESS,
    abi: HIRESHIELD_ABI,
    functionName: "applications",
    args: applicationId != null ? [BigInt(applicationId)] : undefined,
    query: { enabled: applicationId != null },
  });

  const negotiationRound = appData ? Number((appData as any)[10]) : 0;
  const isMatched = appData ? (appData as any)[7] as boolean : false;
  const canNegotiate = !isMatched && negotiationRound < 3;

  const submitCounterOffer = async (newSalary: bigint) => {
    if (applicationId == null) return;
    const encSalary = await encrypt(newSalary, "euint128");
    const hash = await writeContractAsync({
      address: HIRESHIELD_ADDRESS,
      abi: HIRESHIELD_ABI,
      functionName: "submitCounterOffer",
      args: [BigInt(applicationId), encSalary as any],
    });
    toast.success(`Counter-offer submitted (round ${negotiationRound + 1}/3)`);
    await refetch();
    return hash;
  };

  return {
    negotiationRound,
    canNegotiate,
    submitCounterOffer,
    isPending,
    refetch,
  };
}
