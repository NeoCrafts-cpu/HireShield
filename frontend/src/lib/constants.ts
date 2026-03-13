export const HIRESHIELD_ADDRESS =
  (import.meta.env.VITE_HIRESHIELD_ADDRESS as `0x${string}`) ||
  "0x0000000000000000000000000000000000000000";

export const ESCROW_ADDRESS =
  (import.meta.env.VITE_ESCROW_ADDRESS as `0x${string}`) ||
  "0x0000000000000000000000000000000000000000";

// InEuint128 / InEuint32 tuple component definition (shared)
const IN_ENCRYPTED_TUPLE_COMPONENTS = [
  { name: "ctHash", type: "uint256" },
  { name: "securityZone", type: "uint8" },
  { name: "utype", type: "uint8" },
  { name: "signature", type: "bytes" },
] as const;

export const HIRESHIELD_ABI = [
  {
    inputs: [
      { name: "_escrowContract", type: "address" },
      { name: "_cofheNode", type: "address" },
    ],
    stateMutability: "nonpayable",
    type: "constructor",
  },
  {
    inputs: [
      { name: "got", type: "uint8" },
      { name: "expected", type: "uint8" },
    ],
    name: "InvalidEncryptedInput",
    type: "error",
  },
  {
    inputs: [
      {
        name: "_budget",
        type: "tuple",
        components: IN_ENCRYPTED_TUPLE_COMPONENTS,
      },
      {
        name: "_requirementsHash",
        type: "tuple",
        components: IN_ENCRYPTED_TUPLE_COMPONENTS,
      },
      { name: "_title", type: "string" },
      { name: "_description", type: "string" },
    ],
    name: "postJob",
    outputs: [{ name: "jobId", type: "uint256" }],
    stateMutability: "payable",
    type: "function",
  },
  {
    inputs: [
      { name: "_jobId", type: "uint256" },
      {
        name: "_expectedSalary",
        type: "tuple",
        components: IN_ENCRYPTED_TUPLE_COMPONENTS,
      },
      {
        name: "_credentialsHash",
        type: "tuple",
        components: IN_ENCRYPTED_TUPLE_COMPONENTS,
      },
    ],
    name: "applyToJob",
    outputs: [{ name: "applicationId", type: "uint256" }],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      { name: "_jobId", type: "uint256" },
      { name: "_applicationId", type: "uint256" },
    ],
    name: "setMatchResult",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [{ name: "_jobId", type: "uint256" }],
    name: "getJob",
    outputs: [
      { name: "employer", type: "address" },
      { name: "isActive", type: "bool" },
      { name: "escrowAmount", type: "uint256" },
      { name: "applicationCount", type: "uint256" },
      { name: "title", type: "string" },
      { name: "description", type: "string" },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [{ name: "_jobId", type: "uint256" }],
    name: "getJobApplicationIds",
    outputs: [{ name: "", type: "uint256[]" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [{ name: "_jobId", type: "uint256" }],
    name: "getJobBudgetHandle",
    outputs: [{ name: "", type: "bytes32" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [{ name: "_applicationId", type: "uint256" }],
    name: "getMyExpectedSalaryHandle",
    outputs: [{ name: "", type: "bytes32" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "jobCounter",
    outputs: [{ name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "applicationCounter",
    outputs: [{ name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "cofheNode",
    outputs: [{ name: "", type: "address" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "owner",
    outputs: [{ name: "", type: "address" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [{ name: "_newNode", type: "address" }],
    name: "setCofheNode",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [{ name: "_jobId", type: "uint256" }],
    name: "claimBonus",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [],
    name: "escrowContract",
    outputs: [{ name: "", type: "address" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [{ name: "", type: "uint256" }],
    name: "applications",
    outputs: [
      { name: "candidate", type: "address" },
      { name: "expectedSalaryEncrypted", type: "bytes32" },
      { name: "credentialsHash", type: "bytes32" },
      { name: "isMatched", type: "bool" },
      { name: "jobId", type: "uint256" },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [{ name: "", type: "uint256" }],
    name: "jobs",
    outputs: [
      { name: "employer", type: "address" },
      { name: "budgetEncrypted", type: "bytes32" },
      { name: "requirementsHash", type: "bytes32" },
      { name: "isActive", type: "bool" },
      { name: "escrowAmount", type: "uint256" },
      { name: "applicationCount", type: "uint256" },
      { name: "title", type: "string" },
      { name: "description", type: "string" },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, name: "jobId", type: "uint256" },
      { indexed: true, name: "employer", type: "address" },
      { indexed: false, name: "title", type: "string" },
    ],
    name: "JobPosted",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, name: "applicationId", type: "uint256" },
      { indexed: true, name: "jobId", type: "uint256" },
      { indexed: true, name: "candidate", type: "address" },
    ],
    name: "ApplicationSubmitted",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, name: "jobId", type: "uint256" },
      { indexed: true, name: "applicationId", type: "uint256" },
    ],
    name: "MatchFound",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, name: "jobId", type: "uint256" },
      { indexed: false, name: "amount", type: "uint256" },
    ],
    name: "EscrowFunded",
    type: "event",
  },
] as const;

export const ESCROW_ABI = [
  {
    inputs: [
      { name: "_hireshield", type: "address" },
      { name: "_privara", type: "address" },
    ],
    stateMutability: "nonpayable",
    type: "constructor",
  },
  {
    inputs: [
      { name: "jobId", type: "uint256" },
      { name: "candidate", type: "address" },
    ],
    name: "fundJobBonus",
    outputs: [],
    stateMutability: "payable",
    type: "function",
  },
  {
    inputs: [{ name: "jobId", type: "uint256" }],
    name: "releaseBonus",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [{ name: "", type: "uint256" }],
    name: "jobEscrowAmount",
    outputs: [{ name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [{ name: "", type: "uint256" }],
    name: "jobEscrowRecipient",
    outputs: [{ name: "", type: "address" }],
    stateMutability: "view",
    type: "function",
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, name: "jobId", type: "uint256" },
      { indexed: true, name: "candidate", type: "address" },
      { indexed: false, name: "amount", type: "uint256" },
    ],
    name: "BonusReleased",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, name: "jobId", type: "uint256" },
      { indexed: true, name: "candidate", type: "address" },
      { indexed: false, name: "amount", type: "uint256" },
    ],
    name: "BonusFunded",
    type: "event",
  },
] as const;
