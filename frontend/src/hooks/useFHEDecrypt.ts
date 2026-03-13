import { useCofheReadContractAndDecrypt, useCofheActivePermit } from "@cofhe/react";
import { FheTypes } from "@cofhe/sdk";
import { HIRESHIELD_ADDRESS, REPUTATION_ADDRESS } from "../lib/constants";

// ─────────────────────────────────────────────────────────────
//  Minimal per-function ABIs — avoids TypeScript tuple-size limit
//  when using the full HIRESHIELD_ABI (50+ items) as a generic.
// ─────────────────────────────────────────────────────────────

const APPLICATION_SALARY_ABI = [
  {
    inputs: [{ name: "_applicationId", type: "uint256" }],
    name: "getApplicationSalaryHandle",
    outputs: [{ name: "", type: "bytes32" }],
    stateMutability: "view",
    type: "function",
  },
] as const;

const JOB_BUDGET_ABI = [
  {
    inputs: [{ name: "_jobId", type: "uint256" }],
    name: "getJobBudgetHandle",
    outputs: [{ name: "", type: "bytes32" }],
    stateMutability: "view",
    type: "function",
  },
] as const;

const QUALIFICATION_ABI = [
  {
    inputs: [{ name: "_applicationId", type: "uint256" }],
    name: "getQualificationResult",
    outputs: [{ name: "", type: "bytes32" }],
    stateMutability: "view",
    type: "function",
  },
] as const;

const SCORE_ABI = [
  {
    inputs: [{ name: "candidate", type: "address" }],
    name: "getScore",
    outputs: [{ name: "", type: "bytes32" }],
    stateMutability: "view",
    type: "function",
  },
] as const;

// ─────────────────────────────────────────────────────────────
//  Hooks
// ─────────────────────────────────────────────────────────────

/**
 * Decrypt a candidate's own expected salary for an application.
 * Only the candidate and the employer can call getApplicationSalaryHandle.
 */
export function useDecryptApplicationSalary(applicationId: bigint | undefined) {
  const result = useCofheReadContractAndDecrypt<
    typeof APPLICATION_SALARY_ABI,
    "getApplicationSalaryHandle",
    FheTypes.Uint128
  >(
    {
      address: HIRESHIELD_ADDRESS,
      abi: APPLICATION_SALARY_ABI,
      functionName: "getApplicationSalaryHandle",
      args: applicationId !== undefined ? [applicationId] : undefined,
      requiresPermit: true,
    }
  );

  return {
    value: result.decrypted.data as bigint | undefined,
    isLoading: result.decrypted.isLoading || result.encrypted.isLoading,
    error: result.decrypted.error || result.encrypted.error,
    disabledDueToMissingPermit: result.disabledDueToMissingPermit,
  };
}

/**
 * Decrypt an employer's job budget for a given job.
 * Only the employer (job owner) can call getJobBudgetHandle.
 */
export function useDecryptJobBudget(jobId: bigint | undefined) {
  const result = useCofheReadContractAndDecrypt<
    typeof JOB_BUDGET_ABI,
    "getJobBudgetHandle",
    FheTypes.Uint128
  >(
    {
      address: HIRESHIELD_ADDRESS,
      abi: JOB_BUDGET_ABI,
      functionName: "getJobBudgetHandle",
      args: jobId !== undefined ? [jobId] : undefined,
      requiresPermit: true,
    }
  );

  return {
    value: result.decrypted.data as bigint | undefined,
    isLoading: result.decrypted.isLoading || result.encrypted.isLoading,
    error: result.decrypted.error || result.encrypted.error,
    disabledDueToMissingPermit: result.disabledDueToMissingPermit,
  };
}

/**
 * Decrypt an application's 4D qualification result ebool.
 * Only the candidate and employer can call getQualificationResult.
 */
export function useDecryptQualification(applicationId: bigint | undefined) {
  const result = useCofheReadContractAndDecrypt<
    typeof QUALIFICATION_ABI,
    "getQualificationResult",
    FheTypes.Bool
  >(
    {
      address: HIRESHIELD_ADDRESS,
      abi: QUALIFICATION_ABI,
      functionName: "getQualificationResult",
      args: applicationId !== undefined ? [applicationId] : undefined,
      requiresPermit: true,
    }
  );

  return {
    value: result.decrypted.data as boolean | undefined,
    isLoading: result.decrypted.isLoading || result.encrypted.isLoading,
    error: result.decrypted.error || result.encrypted.error,
    disabledDueToMissingPermit: result.disabledDueToMissingPermit,
  };
}

/**
 * Decrypt a candidate's encrypted reputation score.
 * Only the candidate themselves can call getScore on the Reputation contract.
 */
export function useDecryptReputationScore(candidateAddress: `0x${string}` | undefined) {
  const result = useCofheReadContractAndDecrypt<
    typeof SCORE_ABI,
    "getScore",
    FheTypes.Uint32
  >(
    {
      address: REPUTATION_ADDRESS,
      abi: SCORE_ABI,
      functionName: "getScore",
      args: candidateAddress ? [candidateAddress] : undefined,
      requiresPermit: true,
    }
  );

  return {
    value: result.decrypted.data as bigint | undefined,
    isLoading: result.decrypted.isLoading || result.encrypted.isLoading,
    error: result.decrypted.error || result.encrypted.error,
    disabledDueToMissingPermit: result.disabledDueToMissingPermit,
  };
}

/**
 * Returns whether the current wallet has an active CoFHE permit.
 */
export function useHasActivePermit(): boolean {
  const permitResult = useCofheActivePermit();
  return !!permitResult?.permit;
}

/** Format a decrypted bigint as a human-readable USD salary string */
export function formatDecryptedSalary(value: bigint | undefined): string {
  if (value === undefined) return "—";
  return `$${Number(value).toLocaleString()}`;
}

