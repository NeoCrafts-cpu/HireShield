export const HIRESHIELD_ADDRESS =
  (import.meta.env.VITE_HIRESHIELD_ADDRESS as `0x${string}`) ||
  "0x4B91743bE751A9f9871eb2cD22472C5a6aa6f26F";

export const ESCROW_ADDRESS =
  (import.meta.env.VITE_ESCROW_ADDRESS as `0x${string}`) ||
  "0xe88235ac739dD5154cd69E56b7232eC1987Cd82D";

export const NFT_ADDRESS =
  (import.meta.env.VITE_NFT_ADDRESS as `0x${string}`) ||
  "0x580Ba8983A81c9545AA29524F6D4bA18351f3D90";

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
  // ── postJob (unified: includes optional category) ──
  {
    inputs: [
      { name: "_budget", type: "tuple", components: IN_ENCRYPTED_TUPLE_COMPONENTS },
      { name: "_experienceRequired", type: "tuple", components: IN_ENCRYPTED_TUPLE_COMPONENTS },
      { name: "_skillScore", type: "tuple", components: IN_ENCRYPTED_TUPLE_COMPONENTS },
      { name: "_locationPref", type: "tuple", components: IN_ENCRYPTED_TUPLE_COMPONENTS },
      { name: "_title", type: "string" },
      { name: "_description", type: "string" },
      { name: "_category", type: "string" },
    ],
    name: "postJob",
    outputs: [{ name: "jobId", type: "uint256" }],
    stateMutability: "payable",
    type: "function",
  },
  // ── applyToJob (original) ──
  {
    inputs: [
      { name: "_jobId", type: "uint256" },
      { name: "_expectedSalary", type: "tuple", components: IN_ENCRYPTED_TUPLE_COMPONENTS },
      { name: "_experienceYears", type: "tuple", components: IN_ENCRYPTED_TUPLE_COMPONENTS },
      { name: "_skillScore", type: "tuple", components: IN_ENCRYPTED_TUPLE_COMPONENTS },
      { name: "_locationPref", type: "tuple", components: IN_ENCRYPTED_TUPLE_COMPONENTS },
    ],
    name: "applyToJob",
    outputs: [{ name: "applicationId", type: "uint256" }],
    stateMutability: "nonpayable",
    type: "function",
  },
  // ── applyWithReferral ──
  {
    inputs: [
      { name: "_jobId", type: "uint256" },
      { name: "_expectedSalary", type: "tuple", components: IN_ENCRYPTED_TUPLE_COMPONENTS },
      { name: "_experienceYears", type: "tuple", components: IN_ENCRYPTED_TUPLE_COMPONENTS },
      { name: "_skillScore", type: "tuple", components: IN_ENCRYPTED_TUPLE_COMPONENTS },
      { name: "_locationPref", type: "tuple", components: IN_ENCRYPTED_TUPLE_COMPONENTS },
      { name: "_referrer", type: "address" },
      { name: "_encryptedReferrerId", type: "tuple", components: IN_ENCRYPTED_TUPLE_COMPONENTS },
    ],
    name: "applyWithReferral",
    outputs: [{ name: "applicationId", type: "uint256" }],
    stateMutability: "nonpayable",
    type: "function",
  },
  // ── checkQualification ──
  {
    inputs: [
      { name: "_jobId", type: "uint256" },
      { name: "_applicationId", type: "uint256" },
    ],
    name: "checkQualification",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [{ name: "_applicationId", type: "uint256" }],
    name: "getQualificationResult",
    outputs: [{ name: "", type: "bytes32" }],
    stateMutability: "view",
    type: "function",
  },
  // ── setMatchResult (CoFHE node only) ──
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
  // ── submitCounterOffer (negotiation) ──
  {
    inputs: [
      { name: "_applicationId", type: "uint256" },
      { name: "_newSalary", type: "tuple", components: IN_ENCRYPTED_TUPLE_COMPONENTS },
    ],
    name: "submitCounterOffer",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  // ── Escrow management ──
  {
    inputs: [{ name: "_jobId", type: "uint256" }],
    name: "reclaimEscrow",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [{ name: "_jobId", type: "uint256" }],
    name: "deactivateJob",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [{ name: "_jobId", type: "uint256" }],
    name: "topUpEscrow",
    outputs: [],
    stateMutability: "payable",
    type: "function",
  },
  // ── Reads ──
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
    name: "getJobCategory",
    outputs: [{ name: "", type: "string" }],
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
    name: "getApplicationReferrer",
    outputs: [
      { name: "", type: "address" },
      { name: "", type: "bool" },
    ],
    stateMutability: "view",
    type: "function",
  },
  // ── Salary analytics ──
  {
    inputs: [{ name: "_category", type: "string" }],
    name: "getCategoryTotalSalary",
    outputs: [{ name: "", type: "bytes32" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [{ name: "_category", type: "string" }],
    name: "getCategoryMatchCount",
    outputs: [{ name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  // ── State variables ──
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
    inputs: [],
    name: "escrowContract",
    outputs: [{ name: "", type: "address" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "nftContract",
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
    inputs: [{ name: "_nft", type: "address" }],
    name: "setNFTContract",
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
  // ── Public mappings ──
  {
    inputs: [{ name: "", type: "uint256" }],
    name: "applications",
    outputs: [
      { name: "candidate", type: "address" },
      { name: "expectedSalaryEncrypted", type: "bytes32" },
      { name: "experienceYears", type: "bytes32" },
      { name: "skillScore", type: "bytes32" },
      { name: "locationPref", type: "bytes32" },
      { name: "qualificationResult", type: "bytes32" },
      { name: "qualificationChecked", type: "bool" },
      { name: "isMatched", type: "bool" },
      { name: "jobId", type: "uint256" },
      { name: "referrer", type: "address" },
      { name: "negotiationRound", type: "uint8" },
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
      { name: "experienceRequired", type: "bytes32" },
      { name: "skillScore", type: "bytes32" },
      { name: "locationPref", type: "bytes32" },
      { name: "isActive", type: "bool" },
      { name: "hasMatch", type: "bool" },
      { name: "escrowAmount", type: "uint256" },
      { name: "applicationCount", type: "uint256" },
      { name: "title", type: "string" },
      { name: "description", type: "string" },
      { name: "category", type: "string" },
    ],
    stateMutability: "view",
    type: "function",
  },
  // ── Events ──
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
      { indexed: true, name: "candidate", type: "address" },
    ],
    name: "QualificationChecked",
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
  {
    anonymous: false,
    inputs: [
      { indexed: true, name: "jobId", type: "uint256" },
      { indexed: true, name: "candidate", type: "address" },
      { indexed: false, name: "amount", type: "uint256" },
    ],
    name: "BonusAutoReleased",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, name: "jobId", type: "uint256" },
      { indexed: true, name: "employer", type: "address" },
      { indexed: false, name: "amount", type: "uint256" },
    ],
    name: "EscrowReclaimed",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, name: "jobId", type: "uint256" },
      { indexed: true, name: "applicationId", type: "uint256" },
      { indexed: false, name: "tokenId", type: "uint256" },
    ],
    name: "CredentialMinted",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, name: "applicationId", type: "uint256" },
      { indexed: false, name: "round", type: "uint8" },
    ],
    name: "NegotiationSubmitted",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, name: "applicationId", type: "uint256" },
      { indexed: true, name: "referrer", type: "address" },
    ],
    name: "ReferralSubmitted",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, name: "applicationId", type: "uint256" },
      { indexed: true, name: "referrer", type: "address" },
    ],
    name: "ReferralRevealed",
    type: "event",
  },
] as const;

export const ESCROW_ABI = [
  {
    inputs: [{ name: "jobId", type: "uint256" }],
    name: "jobEscrowAmount",
    outputs: [{ name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [{ name: "jobId", type: "uint256" }],
    name: "jobEscrowRecipient",
    outputs: [{ name: "", type: "address" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [{ name: "jobId", type: "uint256" }],
    name: "releaseEscrow",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [{ name: "jobId", type: "uint256" }, { name: "_candidate", type: "address" }],
    name: "depositEscrow",
    outputs: [],
    stateMutability: "payable",
    type: "function",
  },
] as const;

export const HIRESHIELD_NFT_ABI = [
  {
    inputs: [{ name: "_candidate", type: "address" }],
    name: "getCandidateTokens",
    outputs: [{ name: "", type: "uint256[]" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [{ name: "tokenId", type: "uint256" }],
    name: "tokenURI",
    outputs: [{ name: "", type: "string" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [{ name: "tokenId", type: "uint256" }],
    name: "credentials",
    outputs: [
      { name: "jobId", type: "uint256" },
      { name: "applicationId", type: "uint256" },
      { name: "employer", type: "address" },
      { name: "matchTimestamp", type: "uint256" },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [{ name: "tokenId", type: "uint256" }],
    name: "ownerOf",
    outputs: [{ name: "", type: "address" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [{ name: "owner", type: "address" }],
    name: "balanceOf",
    outputs: [{ name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
] as const;
