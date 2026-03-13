import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";
import { Navbar } from "../components/layout/Navbar";
import { Footer } from "../components/layout/Footer";
import { GlassCard } from "../components/ui/GlassCard";
import {
  BookOpen,
  Shield,
  Lock,
  Zap,
  Briefcase,
  User,
  Code,
  ChevronDown,
  ChevronRight,
  ExternalLink,
  Key,
  Coins,
  Award,
  Users,
  Search,
  FileText,
  CheckCircle,
  AlertCircle,
  Info,
} from "lucide-react";

// ─── Section types ────────────────────────────────────────────────────────────

interface DocSection {
  id: string;
  icon: React.ElementType;
  title: string;
  color: string;
  content: React.ReactNode;
}

// ─── Reusable sub-components ─────────────────────────────────────────────────

function Callout({
  type,
  children,
}: {
  type: "info" | "warn" | "tip";
  children: React.ReactNode;
}) {
  const styles = {
    info: {
      border: "border-[rgba(0,212,255,0.3)]",
      bg: "bg-[rgba(0,212,255,0.06)]",
      icon: Info,
      iconColor: "text-neon-cyan",
    },
    warn: {
      border: "border-[rgba(251,191,36,0.35)]",
      bg: "bg-[rgba(251,191,36,0.06)]",
      icon: AlertCircle,
      iconColor: "text-yellow-400",
    },
    tip: {
      border: "border-[rgba(0,255,136,0.3)]",
      bg: "bg-[rgba(0,255,136,0.06)]",
      icon: CheckCircle,
      iconColor: "text-neon-green",
    },
  }[type];

  const IconEl = styles.icon;
  return (
    <div className={`flex gap-3 p-4 rounded-xl border ${styles.border} ${styles.bg} my-4`}>
      <IconEl className={`w-5 h-5 mt-0.5 flex-shrink-0 ${styles.iconColor}`} />
      <div className="text-[rgba(255,255,255,0.7)] text-sm leading-relaxed">{children}</div>
    </div>
  );
}

function CodeBlock({ code, lang = "solidity" }: { code: string; lang?: string }) {
  return (
    <div className="my-4 rounded-xl overflow-hidden border border-[rgba(255,255,255,0.08)]">
      <div className="flex items-center justify-between px-4 py-2 bg-[rgba(255,255,255,0.04)] border-b border-[rgba(255,255,255,0.08)]">
        <span className="text-xs text-[rgba(255,255,255,0.35)] font-mono">{lang}</span>
      </div>
      <pre className="p-4 overflow-x-auto text-sm font-mono text-[rgba(0,212,255,0.85)] leading-relaxed bg-[rgba(10,10,15,0.6)]">
        <code>{code}</code>
      </pre>
    </div>
  );
}

function H2({ children }: { children: React.ReactNode }) {
  return <h3 className="text-xl font-heading font-bold text-white mt-8 mb-3">{children}</h3>;
}

function H3({ children }: { children: React.ReactNode }) {
  return <h4 className="text-base font-semibold text-[rgba(255,255,255,0.9)] mt-5 mb-2">{children}</h4>;
}

function P({ children }: { children: React.ReactNode }) {
  return <p className="text-[rgba(255,255,255,0.55)] leading-relaxed mb-3">{children}</p>;
}

function UL({ items }: { items: React.ReactNode[] }) {
  return (
    <ul className="space-y-1.5 my-3">
      {items.map((item, i) => (
        <li key={i} className="flex items-start gap-2 text-[rgba(255,255,255,0.55)] text-sm">
          <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-neon-cyan flex-shrink-0" />
          {item}
        </li>
      ))}
    </ul>
  );
}

function Table({
  headers,
  rows,
}: {
  headers: string[];
  rows: string[][];
}) {
  return (
    <div className="overflow-x-auto my-4 rounded-xl border border-[rgba(255,255,255,0.08)]">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-[rgba(255,255,255,0.08)] bg-[rgba(255,255,255,0.04)]">
            {headers.map((h) => (
              <th key={h} className="text-left px-4 py-3 text-[rgba(255,255,255,0.6)] font-semibold">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr
              key={i}
              className="border-b border-[rgba(255,255,255,0.04)] hover:bg-[rgba(255,255,255,0.02)] transition-colors"
            >
              {row.map((cell, j) => (
                <td key={j} className="px-4 py-3 text-[rgba(255,255,255,0.5)] font-mono text-xs">
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ─── Doc sections ─────────────────────────────────────────────────────────────

const SECTIONS: DocSection[] = [
  {
    id: "overview",
    icon: BookOpen,
    title: "Overview",
    color: "text-neon-cyan",
    content: (
      <div>
        <P>
          HireShield is a decentralized, privacy-preserving hiring platform built on Ethereum Sepolia using{" "}
          <a href="https://cofhe-docs.fhenix.zone/" target="_blank" rel="noopener noreferrer" className="text-neon-cyan hover:underline inline-flex items-center gap-1">
            Fhenix CoFHE <ExternalLink className="w-3 h-3" />
          </a>
          . It enables employers and candidates to match on salary, experience, skills, and location — entirely on encrypted data — without either party ever revealing their numbers.
        </P>
        <Callout type="info">
          HireShield runs on <strong className="text-white">Ethereum Sepolia testnet</strong>. All transactions require SepoliaETH (free from faucets). Real ETH is never used.
        </Callout>
        <H2>Core Principles</H2>
        <UL items={[
          <><strong className="text-white">Zero knowledge of values:</strong> Salary, experience, skill scores, and location are encrypted client-side before reaching the chain. Nobody — not the employer, not the protocol — can see raw numbers.</>,
          <><strong className="text-white">4-dimensional encrypted matching:</strong> Smart contracts compare ciphertexts using FHE operations (lte, gte, eq). The result is a boolean — match or no match.</>,
          <><strong className="text-white">Soulbound credentials:</strong> Successful matches mint a non-transferable NFT to the candidate's wallet as proof of qualification.</>,
          <><strong className="text-white">Auto-escrow:</strong> Employers can lock ETH that is released only to matched candidates, enforced entirely on-chain.</>,
        ]} />
        <H2>Tech Stack</H2>
        <Table
          headers={["Layer", "Technology"]}
          rows={[
            ["Encryption", "Fhenix CoFHE — FHE on Ethereum"],
            ["Smart Contracts", "Solidity 0.8.27 + Hardhat"],
            ["FHE Types", "euint128, euint32, ebool"],
            ["Frontend", "React 18 + TypeScript + Vite"],
            ["Wallet", "RainbowKit + Wagmi v2 + viem"],
            ["Network", "Ethereum Sepolia (chainId 11155111)"],
            ["State", "Zustand + TanStack Query v5"],
          ]}
        />
      </div>
    ),
  },
  {
    id: "getting-started",
    icon: Zap,
    title: "Getting Started",
    color: "text-neon-green",
    content: (
      <div>
        <H2>Prerequisites</H2>
        <UL items={[
          "MetaMask (or any EVM wallet) installed in your browser",
          "Sepolia network added to your wallet (chainId 11155111)",
          "SepoliaETH for gas — get free ETH from the Sepolia faucet",
        ]} />
        <Callout type="tip">
          Get free SepoliaETH at{" "}
          <a href="https://sepoliafaucet.com" target="_blank" rel="noopener noreferrer" className="text-neon-green hover:underline">sepoliafaucet.com</a>{" "}
          or{" "}
          <a href="https://faucets.chain.link/sepolia" target="_blank" rel="noopener noreferrer" className="text-neon-green hover:underline">faucets.chain.link/sepolia</a>.
          You need at least 0.05 SepoliaETH for gas.
        </Callout>
        <H2>Connecting Your Wallet</H2>
        <P>Click the <strong className="text-white">Connect Wallet</strong> button in the top-right of any page. Select MetaMask or your preferred connector. HireShield will automatically switch to Sepolia.</P>
        <H2>Choosing Your Role</H2>
        <P>From the landing page, navigate to:</P>
        <UL items={[
          <><strong className="text-white">Employer Dashboard</strong> — Post jobs, set encrypted budgets, review applications, trigger matching, manage escrow, and access analytics.</>,
          <><strong className="text-white">Candidate Dashboard</strong> — Browse jobs, apply with encrypted credentials, track application status, view match results, and collect NFT credentials.</>,
        ]} />
        <Callout type="warn">
          FHE encryption happens client-side via a WASM module. The first page load downloads ~2MB of CoFHE WASM. Wait for the <em>"FHE Ready"</em> indicator before submitting any forms.
        </Callout>
      </div>
    ),
  },
  {
    id: "employer",
    icon: Briefcase,
    title: "Employer Guide",
    color: "text-neon-violet",
    content: (
      <div>
        <P>
          The Employer Dashboard has four tabs: <strong className="text-white">Post Job</strong>, <strong className="text-white">My Jobs</strong>, <strong className="text-white">Review Apps</strong>, and <strong className="text-white">Analytics</strong>.
        </P>

        <H2>Posting a Job</H2>
        <P>Navigate to the <strong className="text-white">Post Job</strong> tab and fill in:</P>
        <Table
          headers={["Field", "Type", "Description"]}
          rows={[
            ["Job Title", "String", "Visible job title"],
            ["Description", "String", "Public job description"],
            ["Category", "String (optional)", "Industry/role category tag"],
            ["Max Budget", "euint128", "Maximum salary — encrypted before submission"],
            ["Min Experience", "euint32", "Years required — encrypted"],
            ["Min Skill Score", "euint32", "0–100 skill benchmark — encrypted"],
            ["Location Code", "euint32", "Numeric location code — encrypted"],
            ["Escrow Amount", "ETH (optional)", "ETH locked for the matched candidate"],
          ]}
        />
        <Callout type="info">
          All four numeric fields are batch-encrypted in a single CoFHE round-trip — this is what keeps the "Encrypting…" step fast. The encrypted values are stored on-chain; nobody can read them without the threshold key network.
        </Callout>
        <H2>Managing Your Jobs</H2>
        <P>The <strong className="text-white">My Jobs</strong> tab lists all jobs you have posted. Each card shows application count, escrow status, and match state. You can close a job at any time, which prevents new applications.</P>

        <H2>Reviewing Applications</H2>
        <P>The <strong className="text-white">Review Apps</strong> tab shows all applicants per job. Because applications are encrypted, you cannot see candidate values. You can only see:</P>
        <UL items={[
          "Wallet address (candidate pseudonym)",
          "Whether qualification was already checked",
          "Whether a match result was already set",
          "Referral indicator (if any)",
        ]} />

        <H2>Triggering a Match</H2>
        <P>Click <strong className="text-white">Run Match</strong> on an application. This calls <code className="text-neon-cyan text-sm bg-[rgba(0,212,255,0.08)] px-1.5 py-0.5 rounded">setMatchResult</code> on-chain. The CoFHE network runs FHE comparisons on all four encrypted dimensions:</P>
        <CodeBlock
          lang="solidity"
          code={`// On-chain FHE matching (HireShield.sol)
ebool salaryOk  = FHE.lte(app.salary,    job.budgetEncrypted);
ebool expOk     = FHE.gte(app.experience, job.experienceRequired);
ebool skillsOk  = FHE.gte(app.skillScore, job.skillScore);
ebool locOk     = FHE.eq(app.location,   job.locationPref);
ebool matched   = FHE.and(FHE.and(salaryOk, expOk), FHE.and(skillsOk, locOk));`}
        />
        <P>The boolean result is stored encrypted and later revealed via threshold decryption.</P>

        <H2>Escrow Management</H2>
        <P>
          The <strong className="text-white">Escrow</strong> panel on the My Jobs tab allows you to fund or reclaim escrow.
          Once a match is confirmed, use <strong className="text-white">Release Escrow</strong> to transfer ETH to the candidate.
          You can only reclaim escrow if no match has been set (<code className="text-neon-cyan text-sm bg-[rgba(0,212,255,0.08)] px-1.5 py-0.5 rounded">hasMatch</code> flag is false).
        </P>

        <H2>Analytics</H2>
        <P>The Analytics tab provides salary range insights and application funnel metrics derived from your posted jobs and match results.</P>
      </div>
    ),
  },
  {
    id: "candidate",
    icon: User,
    title: "Candidate Guide",
    color: "text-neon-cyan",
    content: (
      <div>
        <P>
          The Candidate Dashboard has four tabs: <strong className="text-white">Browse Jobs</strong>, <strong className="text-white">My Applications</strong>, <strong className="text-white">Activity</strong>, and <strong className="text-white">NFT Credentials</strong>.
        </P>

        <H2>Browsing Jobs</H2>
        <P>The <strong className="text-white">Browse Jobs</strong> tab lists all active jobs. Each job card shows the public title, description, category, and application count. Encrypted values (budget, experience, skill requirements) are intentionally hidden — you are expected to decide based on the description alone.</P>

        <H2>Applying to a Job</H2>
        <P>Click <strong className="text-white">Apply</strong> on any active job. Fill in:</P>
        <Table
          headers={["Field", "Type", "Description"]}
          rows={[
            ["Expected Salary", "euint128", "Your target salary — encrypted before submission"],
            ["Years Experience", "euint32", "Your experience level — encrypted"],
            ["Skill Score", "euint32", "Self-assessed 0–100 skill level — encrypted"],
            ["Location Code", "euint32", "Your location preference — encrypted"],
            ["Referrer Address", "address (optional)", "Wallet address of the person who referred you"],
          ]}
        />
        <Callout type="tip">
          All four (or five with referral) values are batch-encrypted in a single CoFHE operation before being sent to the smart contract. This minimises the time you see the "Encrypting…" spinner.
        </Callout>
        <Callout type="warn">
          Wait for the <em>"FHE Ready"</em> indicator in the form before clicking Apply. Submitting before FHE is initialised will show an error.
        </Callout>

        <H2>Tracking Applications</H2>
        <P>The <strong className="text-white">My Applications</strong> tab shows all jobs you applied to, your application status, and whether a match result has been revealed. You can navigate directly to the Match Result page from here.</P>

        <H2>Match Result Page</H2>
        <P>When an employer runs the FHE match, the result is stored on-chain and becomes viewable at <code className="text-neon-cyan text-sm bg-[rgba(0,212,255,0.08)] px-1.5 py-0.5 rounded">/match/:applicationId</code>. The page shows:</P>
        <UL items={[
          "Match outcome (Matched / No Match)",
          "Employer and contract links on Etherscan",
          "Negotiation panel (up to 3 rounds if matched)",
          "NFT credential status",
        ]} />

        <H2>Salary Negotiation</H2>
        <P>If you are matched, you can submit a counter-offer salary (encrypted) up to 3 rounds. Each round calls <code className="text-neon-cyan text-sm bg-[rgba(0,212,255,0.08)] px-1.5 py-0.5 rounded">submitNegotiation</code> on-chain with the new encrypted value.</P>

        <H2>NFT Credentials</H2>
        <P>
          The <strong className="text-white">NFT Credentials</strong> tab shows all soulbound NFTs minted to your wallet. Each NFT represents a verified qualification event (a successful FHE match). These are non-transferable ERC-721 tokens stored on Sepolia.
        </P>
        <Callout type="info">
          NFT metadata includes the job ID and timestamp, providing a verifiable, immutable record of your qualification — without revealing what criteria you matched.
        </Callout>
      </div>
    ),
  },
  {
    id: "fhe",
    icon: Lock,
    title: "FHE & Encryption",
    color: "text-neon-violet",
    content: (
      <div>
        <H2>What is Fully Homomorphic Encryption?</H2>
        <P>
          FHE (Fully Homomorphic Encryption) allows computation on encrypted data without decrypting it first. HireShield uses Fhenix's CoFHE (Cooperative FHE), a threshold-based FHE system that runs natively on Ethereum.
        </P>

        <H2>How Encryption Works in HireShield</H2>
        <P>When you submit a salary value, the following happens client-side:</P>
        <CodeBlock
          lang="typescript"
          code={`// Single batch call — all values encrypted together
const [encSalary, encExp, encSkills, encLoc] = await encryptInputsAsync([
  Encryptable.uint128(BigInt(salary)),
  Encryptable.uint32(BigInt(experience)),
  Encryptable.uint32(BigInt(skillScore)),
  Encryptable.uint32(BigInt(locationCode)),
], signer);

// Each result is an InEuint tuple:
// { ctHash: uint256, securityZone: uint8, utype: uint8, signature: bytes }`}
        />
        <P>The <code className="text-neon-cyan text-sm bg-[rgba(0,212,255,0.08)] px-1.5 py-0.5 rounded">ctHash</code> is a commitment to the ciphertext stored off-chain by the CoFHE network. The smart contract stores these hashes and uses them to perform FHE operations.</P>

        <H2>FHE Operations Used</H2>
        <Table
          headers={["Operation", "Description", "Used For"]}
          rows={[
            ["FHE.lte(a, b)", "Encrypted less-than-or-equal", "Salary ≤ budget"],
            ["FHE.gte(a, b)", "Encrypted greater-than-or-equal", "Experience ≥ required, Skills ≥ required"],
            ["FHE.eq(a, b)", "Encrypted equality", "Location match"],
            ["FHE.and(a, b)", "Encrypted logical AND", "Combining all 4 results"],
            ["FHE.add(a, b)", "Encrypted addition", "Negotiation round tracking"],
            ["FHE.asEuint128(x)", "Type cast", "Salary input normalisation"],
            ["FHE.asEuint32(x)", "Type cast", "Dimension input normalisation"],
          ]}
        />

        <H2>Threshold Decryption</H2>
        <P>
          Match results (<code className="text-neon-cyan text-sm bg-[rgba(0,212,255,0.08)] px-1.5 py-0.5 rounded">ebool</code>) are decrypted by the CoFHE threshold network — a set of key-sharing nodes where a minimum threshold (e.g., 3-of-5) must cooperate to produce a plaintext result. No single node can decrypt alone.
        </P>
        <Callout type="info">
          Salary and other euint128/euint32 values are <strong className="text-white">never decrypted</strong> — only the final boolean match result is revealed. Your actual numbers remain private forever.
        </Callout>

        <H2>Security Zones</H2>
        <P>
          Each encrypted value is tagged with a <code className="text-neon-cyan text-sm bg-[rgba(0,212,255,0.08)] px-1.5 py-0.5 rounded">securityZone</code>. HireShield uses zone <code className="text-neon-cyan text-sm bg-[rgba(0,212,255,0.08)] px-1.5 py-0.5 rounded">0</code> (default). Values encrypted in different zones cannot be compared, preventing cross-contamination attacks.
        </P>
      </div>
    ),
  },
  {
    id: "contracts",
    icon: Code,
    title: "Smart Contracts",
    color: "text-neon-green",
    content: (
      <div>
        <H2>Deployed Contracts (Sepolia)</H2>
        <Table
          headers={["Contract", "Address", "Role"]}
          rows={[
            ["HireShield", "0x4B91743bE751A9f9871eb2cD22472C5a6aa6f26F", "Core matching + job registry"],
            ["HireShieldEscrow", "0xe88235ac739dD5154cd69E56b7232eC1987Cd82D", "ETH escrow per job"],
            ["HireShieldNFT", "0x580Ba8983A81c9545AA29524F6D4bA18351f3D90", "Soulbound credential NFTs"],
          ]}
        />
        <Callout type="info">
          View these on{" "}
          <a
            href="https://sepolia.etherscan.io/address/0x4B91743bE751A9f9871eb2cD22472C5a6aa6f26F"
            target="_blank"
            rel="noopener noreferrer"
            className="text-neon-cyan hover:underline inline-flex items-center gap-1"
          >
            Sepolia Etherscan <ExternalLink className="w-3 h-3" />
          </a>.
        </Callout>

        <H2>HireShield.sol — Key Functions</H2>
        <Table
          headers={["Function", "Access", "Description"]}
          rows={[
            ["postJob(budget, exp, skills, loc, title, desc, category)", "Any", "Post a new job with 4 encrypted dimensions"],
            ["applyToJob(jobId, salary, exp, skills, loc)", "Any", "Apply with 4 encrypted credentials"],
            ["applyWithReferral(jobId, ...credentials, referrer, referrerId)", "Any", "Apply with referral bonus"],
            ["setMatchResult(jobId, appId)", "cofheNode", "Run FHE match on-chain"],
            ["reclaimEscrow(jobId)", "Employer", "Reclaim escrow if no match set"],
            ["submitNegotiation(jobId, appId, salary)", "Candidate", "Submit counter-offer (max 3 rounds)"],
            ["revealReferral(jobId, appId)", "Any", "Reveal referral for bonus tracking"],
            ["mintCredential(jobId, appId)", "cofheNode", "Mint soulbound NFT to matched candidate"],
            ["closeJob(jobId)", "Employer", "Close job to new applications"],
          ]}
        />

        <H2>Job Struct</H2>
        <CodeBlock
          lang="solidity"
          code={`struct Job {
    address employer;
    InEuint128 budgetEncrypted;    // Max salary (FHE)
    InEuint32  experienceRequired; // Min years (FHE)
    InEuint32  skillScore;         // Min skill 0-100 (FHE)
    InEuint32  locationPref;       // Location code (FHE)
    bool       isActive;
    bool       hasMatch;           // O(1) escrow reclaim guard
    uint256    escrowAmount;       // ETH locked (wei)
    uint256    applicationCount;
    string     title;
    string     description;
    string     category;
}`}
        />

        <H2>Application Struct</H2>
        <CodeBlock
          lang="solidity"
          code={`// Applications stored as dynamic array per job:
// [0] candidate address
// [1] salary       (InEuint128)
// [2] experience   (InEuint32)
// [3] skillScore   (InEuint32)
// [4] location     (InEuint32)
// [5] qualResult   (ebool)       — encrypted match result
// [6] qualChecked  (bool)        — has match been run?
// [7] isMatched    (bool)        — revealed match result
// [8] jobId        (uint256)
// [9] referrer     (address)
// [10] negotiationRound (uint8)  — 0–3`}
        />

        <H2>Events</H2>
        <Table
          headers={["Event", "Description"]}
          rows={[
            ["JobPosted(jobId, employer, title)", "New job created"],
            ["EscrowFunded(jobId, amount)", "ETH locked for job"],
            ["ApplicationSubmitted(jobId, appId, candidate)", "New application"],
            ["MatchResultSet(jobId, appId, matched)", "FHE match completed"],
            ["EscrowReclaimed(jobId, employer, amount)", "Escrow returned to employer"],
            ["EscrowReleased(jobId, candidate, amount)", "Escrow sent to candidate"],
            ["CredentialMinted(jobId, appId, candidate, tokenId)", "NFT credential issued"],
            ["NegotiationSubmitted(jobId, appId, round)", "Counter-offer submitted"],
            ["ReferralSubmitted(jobId, appId, referrer)", "Referral recorded"],
            ["ReferralRevealed(jobId, appId, referrer)", "Referral publicly revealed"],
          ]}
        />
      </div>
    ),
  },
  {
    id: "escrow",
    icon: Coins,
    title: "Escrow System",
    color: "text-yellow-400",
    content: (
      <div>
        <H2>How Escrow Works</H2>
        <P>Employers can optionally attach ETH to a job posting as a performance bonus or guarantee. The escrow is managed by the <code className="text-neon-cyan text-sm bg-[rgba(0,212,255,0.08)] px-1.5 py-0.5 rounded">HireShieldEscrow</code> contract and enforced entirely on-chain.</P>

        <H2>Lifecycle</H2>
        <UL items={[
          <><strong className="text-white">Fund:</strong> Send ETH with the <code className="text-neon-cyan text-sm bg-[rgba(0,212,255,0.08)] px-1.5 py-0.5 rounded">postJob</code> call (as <code className="text-neon-cyan text-sm bg-[rgba(0,212,255,0.08)] px-1.5 py-0.5 rounded">msg.value</code>) or deposit later via the Escrow panel.</>,
          <><strong className="text-white">Lock:</strong> ETH is held by the Escrow contract, mapped to the job ID. Neither employer nor candidate can unilaterally access it.</>,
          <><strong className="text-white">Release:</strong> After a successful match, the employer calls <code className="text-neon-cyan text-sm bg-[rgba(0,212,255,0.08)] px-1.5 py-0.5 rounded">releaseEscrow</code> to send ETH to the matched candidate.</>,
          <><strong className="text-white">Reclaim:</strong> If no match was ever set (<code className="text-neon-cyan text-sm bg-[rgba(0,212,255,0.08)] px-1.5 py-0.5 rounded">hasMatch == false</code>), the employer can reclaim ETH in O(1) — no loop over applications.</>,
        ]} />
        <Callout type="warn">
          Once a match is set (<code className="text-neon-cyan text-sm bg-[rgba(0,212,255,0.08)] px-1.5 py-0.5 rounded">hasMatch = true</code>), the escrow can only be released to the matched candidate — not reclaimed by the employer.
        </Callout>

        <H2>Gas Optimisation</H2>
        <P>A previous version iterated over all applications to check for a match before allowing reclaim. The current version uses a single <code className="text-neon-cyan text-sm bg-[rgba(0,212,255,0.08)] px-1.5 py-0.5 rounded">bool hasMatch</code> flag on the Job struct, reducing <code className="text-neon-cyan text-sm bg-[rgba(0,212,255,0.08)] px-1.5 py-0.5 rounded">reclaimEscrow</code> gas from O(n) to O(1).</P>
      </div>
    ),
  },
  {
    id: "nft",
    icon: Award,
    title: "NFT Credentials",
    color: "text-neon-cyan",
    content: (
      <div>
        <H2>Soulbound Credentials</H2>
        <P>
          HireShieldNFT is a soulbound (non-transferable) ERC-721 contract. Each token represents a verified qualification — a candidate who passed the 4D FHE match for a specific job.
        </P>
        <CodeBlock
          lang="solidity"
          code={`// Transfer is blocked — tokens are permanently bound to the holder
function transferFrom(address, address, uint256) public override {
    revert("HireShieldNFT: soulbound — non-transferable");
}`}
        />

        <H2>When Are They Minted?</H2>
        <P>
          The CoFHE node (<code className="text-neon-cyan text-sm bg-[rgba(0,212,255,0.08)] px-1.5 py-0.5 rounded">cofheNode</code> address) calls <code className="text-neon-cyan text-sm bg-[rgba(0,212,255,0.08)] px-1.5 py-0.5 rounded">mintCredential(jobId, appId)</code> after a match is confirmed. Only the cofheNode can trigger minting — prevents self-minting attacks.
        </P>

        <H2>What They Prove</H2>
        <UL items={[
          "You applied with encrypted credentials to a specific job",
          "The on-chain FHE match returned true for all 4 dimensions",
          "The employer's encrypted requirements were satisfied",
          "No raw salary, skill score, or location data was ever revealed",
        ]} />
        <Callout type="tip">
          NFT credentials are permanent and verifiable on Sepolia Etherscan. They are stored in the <strong className="text-white">NFT Credentials</strong> tab of your Candidate Dashboard.
        </Callout>
      </div>
    ),
  },
  {
    id: "referrals",
    icon: Users,
    title: "Referrals",
    color: "text-neon-violet",
    content: (
      <div>
        <H2>How Referrals Work</H2>
        <P>
          Any candidate can optionally include a referrer wallet address when applying. The referral is stored on-chain (encrypted referrer ID) and can later be revealed publicly via <code className="text-neon-cyan text-sm bg-[rgba(0,212,255,0.08)] px-1.5 py-0.5 rounded">revealReferral</code>.
        </P>

        <H2>Applying With a Referral</H2>
        <P>In the Apply form, enter the referrer's wallet address (0x…) in the optional <strong className="text-white">Referrer Address</strong> field. This adds a 5th encrypted value to the batch encryption call:</P>
        <CodeBlock
          lang="typescript"
          code={`// 5 values encrypted in one batch call (with referral)
const [encSalary, encExp, encSkills, encLoc, encReferrerId] =
  await encryptBatch([
    { value: BigInt(salary),      type: "euint128" },
    { value: BigInt(experience),  type: "euint32"  },
    { value: BigInt(skillScore),  type: "euint32"  },
    { value: BigInt(location),    type: "euint32"  },
    { value: BigInt(randomId),    type: "euint32"  }, // encrypted referrer nonce
  ]);`}
        />

        <H2>Revealing a Referral</H2>
        <P>After a successful match, anyone can call <code className="text-neon-cyan text-sm bg-[rgba(0,212,255,0.08)] px-1.5 py-0.5 rounded">revealReferral(jobId, appId)</code> to publicly log the referrer address via the <code className="text-neon-cyan text-sm bg-[rgba(0,212,255,0.08)] px-1.5 py-0.5 rounded">ReferralRevealed</code> event. This enables off-chain referral bonus tracking.</P>
      </div>
    ),
  },
  {
    id: "faq",
    icon: Search,
    title: "FAQ",
    color: "text-[rgba(255,255,255,0.6)]",
    content: (
      <div>
        {[
          {
            q: "Can the employer see my salary expectation?",
            a: "No. Your salary is encrypted with CoFHE before it leaves your browser. The employer only sees the final boolean result: matched or not. Your raw number is never revealed.",
          },
          {
            q: "Can I apply to multiple jobs?",
            a: "Yes. You can apply to as many active jobs as you like. Each application is independent and fully encrypted.",
          },
          {
            q: "What does 'FHE Ready' mean?",
            a: "The CoFHE WASM module must download and initialise before encryption is possible. 'FHE Ready' means the client-side cryptographic engine is loaded and you can safely submit encrypted data.",
          },
          {
            q: "Why does posting a job cost more gas than usual?",
            a: "FHE operations require additional computation from the CoFHE precompile contract on Sepolia. Each encrypted storage operation (asEuintXX, allowThis, allow) consumes gas. HireShield batches these to minimise cost.",
          },
          {
            q: "What happens if the employer doesn't run the match?",
            a: "Applications sit in a pending state indefinitely. The employer can close the job. If no match is ever set, the employer can reclaim escrow.",
          },
          {
            q: "Are NFT credentials transferable?",
            a: "No. HireShieldNFT is soulbound — all transfer functions revert. Credentials are permanently bound to the wallet that passed the match.",
          },
          {
            q: "What is the negotiation system?",
            a: "After a successful match, the candidate can submit an encrypted counter-offer salary up to 3 rounds. This allows salary negotiation to happen on-chain without either party revealing a number until both agree.",
          },
          {
            q: "Is my wallet address public?",
            a: "Yes. All Ethereum addresses are public on-chain. HireShield protects the values attached to your address (salary, skills, etc.) — not the address itself.",
          },
          {
            q: "What is the CoFHE node address?",
            a: "The CoFHE node (0x7e7E257715Ba3E9143336c5348C6dd44c41c9dF1) is the trusted oracle that runs on-chain FHE matches and mints NFT credentials. It is set at deployment and cannot be changed.",
          },
        ].map(({ q, a }, i) => (
          <div key={i} className="border-b border-[rgba(255,255,255,0.06)] py-5 last:border-0">
            <h4 className="text-white font-semibold mb-2">{q}</h4>
            <p className="text-[rgba(255,255,255,0.5)] text-sm leading-relaxed">{a}</p>
          </div>
        ))}
      </div>
    ),
  },
];

// ─── Main page ────────────────────────────────────────────────────────────────

export function Docs() {
  const [active, setActive] = useState<string>("overview");
  const [mobileOpen, setMobileOpen] = useState<string | null>(null);

  const activeSection = SECTIONS.find((s) => s.id === active)!;

  return (
    <div className="relative min-h-screen bg-[#0a0a0f]">
      {/* Subtle background */}
      <div
        className="fixed inset-0 z-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse 80% 50% at 50% -10%, rgba(0,212,255,0.06) 0%, transparent 70%)",
        }}
      />

      <div className="relative z-10">
        <Navbar />

        <div className="max-w-7xl mx-auto px-4 md:px-8 py-10">
          {/* Page header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="mb-10"
          >
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-xl bg-[rgba(0,212,255,0.1)] border border-[rgba(0,212,255,0.2)] flex items-center justify-center">
                <FileText className="w-5 h-5 text-neon-cyan" />
              </div>
              <span className="text-xs font-bold uppercase tracking-widest text-[rgba(0,212,255,0.6)]">
                Documentation
              </span>
            </div>
            <h1 className="text-3xl md:text-4xl font-heading font-black text-white mb-2">
              HireShield Docs
            </h1>
            <p className="text-[rgba(255,255,255,0.45)]">
              Everything you need to use HireShield — from wallet setup to FHE internals.
            </p>
          </motion.div>

          <div className="flex flex-col lg:flex-row gap-6">
            {/* ── Sidebar ── */}
            <aside className="lg:w-64 flex-shrink-0">
              <GlassCard className="p-3 sticky top-24">
                <nav className="space-y-0.5">
                  {SECTIONS.map((section) => {
                    const IconEl = section.icon;
                    const isActive = active === section.id;
                    return (
                      <button
                        key={section.id}
                        onClick={() => setActive(section.id)}
                        className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition-all text-sm font-medium ${
                          isActive
                            ? "bg-[rgba(0,212,255,0.1)] text-white"
                            : "text-[rgba(255,255,255,0.45)] hover:text-white hover:bg-[rgba(255,255,255,0.04)]"
                        }`}
                      >
                        <IconEl className={`w-4 h-4 flex-shrink-0 ${isActive ? section.color : "text-[rgba(255,255,255,0.3)]"}`} />
                        {section.title}
                        {isActive && <ChevronRight className="w-3.5 h-3.5 ml-auto text-neon-cyan opacity-60" />}
                      </button>
                    );
                  })}
                </nav>

                {/* External links */}
                <div className="mt-4 pt-4 border-t border-[rgba(255,255,255,0.06)] space-y-1">
                  <a
                    href="https://cofhe-docs.fhenix.zone/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 px-3 py-2 rounded-xl text-[rgba(255,255,255,0.35)] hover:text-neon-cyan text-xs transition-colors"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    Fhenix CoFHE Docs
                  </a>
                  <a
                    href="https://sepolia.etherscan.io/address/0x4B91743bE751A9f9871eb2cD22472C5a6aa6f26F"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 px-3 py-2 rounded-xl text-[rgba(255,255,255,0.35)] hover:text-neon-violet text-xs transition-colors"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    Contract on Etherscan
                  </a>
                  <a
                    href="https://github.com/NeoCrafts-cpu/HireShield"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 px-3 py-2 rounded-xl text-[rgba(255,255,255,0.35)] hover:text-neon-green text-xs transition-colors"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    GitHub Source
                  </a>
                </div>
              </GlassCard>
            </aside>

            {/* ── Main content ── */}
            <main className="flex-1 min-w-0">
              <AnimatePresence mode="wait">
                <motion.div
                  key={active}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.2 }}
                >
                  <GlassCard className="p-6 md:p-8">
                    {/* Section header */}
                    <div className="flex items-center gap-3 mb-6 pb-6 border-b border-[rgba(255,255,255,0.07)]">
                      {(() => {
                        const IconEl = activeSection.icon;
                        return (
                          <div className="w-10 h-10 rounded-xl bg-[rgba(255,255,255,0.05)] border border-[rgba(255,255,255,0.08)] flex items-center justify-center">
                            <IconEl className={`w-5 h-5 ${activeSection.color}`} />
                          </div>
                        );
                      })()}
                      <h2 className="text-2xl font-heading font-bold text-white">
                        {activeSection.title}
                      </h2>
                    </div>

                    {/* Section content */}
                    <div>{activeSection.content}</div>

                    {/* Navigation buttons */}
                    <div className="flex items-center justify-between mt-10 pt-6 border-t border-[rgba(255,255,255,0.06)]">
                      {(() => {
                        const idx = SECTIONS.findIndex((s) => s.id === active);
                        const prev = SECTIONS[idx - 1];
                        const next = SECTIONS[idx + 1];
                        return (
                          <>
                            {prev ? (
                              <button
                                onClick={() => setActive(prev.id)}
                                className="flex items-center gap-2 text-sm text-[rgba(255,255,255,0.4)] hover:text-white transition-colors"
                              >
                                <ChevronDown className="w-4 h-4 rotate-90" />
                                {prev.title}
                              </button>
                            ) : <div />}
                            {next ? (
                              <button
                                onClick={() => setActive(next.id)}
                                className="flex items-center gap-2 text-sm text-[rgba(255,255,255,0.4)] hover:text-white transition-colors ml-auto"
                              >
                                {next.title}
                                <ChevronDown className="w-4 h-4 -rotate-90" />
                              </button>
                            ) : <div />}
                          </>
                        );
                      })()}
                    </div>
                  </GlassCard>
                </motion.div>
              </AnimatePresence>
            </main>
          </div>
        </div>

        <Footer />
      </div>
    </div>
  );
}
