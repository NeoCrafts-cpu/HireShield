import { useWriteContract, useReadContract, useAccount } from "wagmi";
import { HIRESHIELD_ABI, HIRESHIELD_ADDRESS } from "../lib/constants";

export function useCheckQualification(jobId?: number, applicationId?: number) {
  const { address } = useAccount();
  const { writeContractAsync, isPending: isChecking } = useWriteContract();

  // Read qualification status from the application struct
  const { data: appData, refetch: refetchApp } = useReadContract({
    address: HIRESHIELD_ADDRESS,
    abi: HIRESHIELD_ABI,
    functionName: "applications",
    args: applicationId != null ? [BigInt(applicationId)] : undefined,
    query: { enabled: applicationId != null },
  });

  const qualificationChecked = appData ? (appData as any)[6] as boolean : false;
  const isMatched = appData ? (appData as any)[7] as boolean : false;

  const checkQualification = async () => {
    if (jobId == null || applicationId == null) return;
    await writeContractAsync({
      address: HIRESHIELD_ADDRESS,
      abi: HIRESHIELD_ABI,
      functionName: "checkQualification",
      args: [BigInt(jobId), BigInt(applicationId)],
    });
    // Refetch to get updated qualification status
    await refetchApp();
  };

  return {
    checkQualification,
    isChecking,
    qualificationChecked,
    isMatched,
    refetchApp,
  };
}
