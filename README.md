# HireShield — Privacy-First On-Chain Hiring

> **Salary numbers never leave the browser unencrypted.**
> HireShield uses Fhenix **Fully Homomorphic Encryption (FHE)** to match employers and candidates on-chain without either party revealing their numbers — not to each other, not to the blockchain, not to anyone.

Live demo · [Sepolia testnet](https://eth-sepolia.g.alchemy.com) · [Fhenix CoFHE](https://docs.fhenix.zone)

---

## What It Does

Traditional hiring platforms expose salary data in database columns that admins, scrapers, and data-brokers can read. Even "private" platforms store plaintext salaries server-side.

HireShield flips this:

| Step | What happens | What's visible on-chain |
|---|---|---|
| Employer posts job | Budget encrypted in browser via CoFHE SDK | `euint128` ciphertext |
| Candidate applies | Expected salary encrypted in browser | `euint128` ciphertext |
| Contract matches | `FHE.lte(candidateSalary, employerBudget)` on ciphertext | `ebool` ciphertext |
| Threshold decryption | Fhenix CoFHE threshold network (5+ nodes) decrypts result | `true` / `false` |
| Payout | Escrow releases ETH bonus to matched candidate | Transfer event |

**No raw salary figures ever appear on-chain or in any API response.**

---

## Architecture

```
+-----------------------------------------------------------------+
¦  React 18 + Wagmi v2 + RainbowKit + Framer Motion              ¦
¦  Dark glassmorphism UI  ·  Neon accent palette (cyan/violet/green) ¦
+-----------------------------------------------------------------¦
¦                    @cofhe/react  ·  @cofhe/sdk                  ¦
¦            Client-side FHE encryption (WASM, no worker)         ¦
¦            ZK proof generated on main-thread via CoFHE WASM     ¦
¦            Proof verified by https://testnet-cofhe-vrf.fhenix.zone ¦
+-----------------------------------------------------------------¦
¦  HireShield.sol      ¦  HireShieldEscrow.sol                    ¦
¦  FHE job matching    ¦  ETH bonus escrow                        ¦
¦  euint128 / euint32  ¦  fundJobBonus / releaseBonus             ¦
+-----------------------------------------------------------------¦
¦         Ethereum Sepolia  (chainId 11155111)                     ¦
¦   HireShield  0x8176549dfbE797b1C77316BFac18DAFCe42bEb8c        ¦
¦   Escrow      0x77d6f4B3250Ef6C88EC409d49dcF4e5a4DdF2187        ¦
¦   TaskManager 0xeA30c4B8b44078Bbf8a6ef5b9f1eC1626C7848D9        ¦
+-----------------------------------------------------------------+
```

---

## Key Features

### ?? Fully Homomorphic Encryption
- Salary budgets and expectations are encrypted as **`euint128`** via the Fhenix CoFHE SDK before any on-chain write.
- Skill/credential hashes are encrypted as **`euint32`**.
- Smart contract performs `FHE.lte()` arithmetic **directly on ciphertexts** — no plaintext decryption ever occurs mid-computation.
- ZK proof of valid encryption is generated in-browser via WASM (`cofhejs`) and verified by the CoFHE verifier service before the transaction is submitted.

### ?? Non-Custodial Escrow
- Employers fund a per-job ETH bonus into `HireShieldEscrow.sol`.
- The bonus is released programmatically by the HireShield contract when a match is confirmed — no human intermediary.
- Employers can reclaim unfunded jobs at any time.

### ??? Privacy Transparency
- The app includes a dedicated **/privacy** documentation page explaining exactly which fields are encrypted vs public, how threshold decryption works, and how FHE compares to ZK proofs and traditional encryption.

### ?? My Applications (Live On-Chain)
- The Candidate Dashboard queries `ApplicationSubmitted` events filtered by the connected address.
- Application status (`isMatched`) and job titles are batch-fetched via `multicall` — no backend required.

### ? Employer Dashboard
- Post jobs with encrypted salary budget + skill requirements.
- View all posted jobs with live application counts.
- One-click match triggering (cofheNode role).

---

## Pages

| Route | Description |
|---|---|
| `/` | Landing — hero FHE flow diagram, stats, how-it-works, CTA |
| `/employer` | Employer Dashboard — post jobs, view applications, trigger match |
| `/candidate` | Candidate Dashboard — browse jobs, apply, view My Applications |
| `/job/:id` | Job Detail — full job info + apply form |
| `/match/:id` | Match Result — show FHE comparison outcome |
| `/how-it-works` | Step-by-step technical walkthrough |
| `/privacy` | Privacy model, data visibility table, FHE vs ZK comparison |

---

## Smart Contracts

### `HireShield.sol`

```solidity
// Post a job with encrypted budget & requirements
function postJob(
    InEuint128 calldata _budget,
    InEuint32  calldata _requirementsHash,
    string     calldata _title,
    string     calldata _description
) external payable returns (uint256 jobId)

// Apply to a job with encrypted salary & credentials
function applyToJob(
    uint256    _jobId,
    InEuint128 calldata _expectedSalary,
    InEuint32  calldata _credentialsHash
) external returns (uint256 applicationId)

// CoFHE node calls this after FHE.lte(salary, budget)
function setMatchResult(uint256 _jobId, uint256 _applicationId) external

// Candidate claims escrow bonus after match
function claimBonus(uint256 _jobId) external
```

### `HireShieldEscrow.sol`

```solidity
function fundJob(uint256 jobId) external payable
function releaseBonus(uint256 jobId) external       // called by HireShield
function refundEmployer(uint256 jobId) external
```

---

## Tech Stack

| Layer | Technology |
|---|---|
| Blockchain | Ethereum Sepolia + Fhenix CoFHE |
| FHE | `@cofhe/sdk` `@cofhe/react` `cofhejs` (WASM) |
| Smart Contracts | Solidity 0.8.27 + Hardhat + TypeChain |
| Frontend | React 18 + TypeScript + Vite 5 |
| Wallet | Wagmi v2 + RainbowKit v2 + viem |
| Styling | Tailwind CSS 3 + Framer Motion 11 |
| State | Zustand 4 + TanStack Query v5 |
| Build tooling | `vite-plugin-wasm` + `vite-plugin-top-level-await` |

---

## Project Structure

```
HireShield/
+-- contracts/
¦   +-- HireShield.sol          # Main FHE hiring contract (euint128/euint32/ebool)
¦   +-- HireShieldEscrow.sol    # ETH escrow for job bonuses
¦   +-- interfaces/
¦       +-- IPrivaraEscrow.sol
+-- scripts/
¦   +-- deploy.ts               # Hardhat deploy script
¦   +-- interact.ts             # CLI interaction helpers
+-- test/
¦   +-- HireShield.test.ts      # 12/12 tests passing
¦   +-- Escrow.test.ts
¦   +-- E2EFlow.test.ts
+-- frontend/
¦   +-- public/
¦   ¦   +-- hero.png            # Landing hero background
¦   ¦   +-- logo.png
¦   +-- scripts/
¦   ¦   +-- patch-cofhe.cjs     # Patches @cofhe/react MUI icon stubs
¦   ¦   +-- patch-workers.cjs  # Disables Web Worker (zkProve ? main thread WASM)
¦   +-- src/
¦       +-- components/
¦       ¦   +-- ui/             # GlassCard, NeonButton, HeroFigure, LoadingDots…
¦       ¦   +-- layout/         # Navbar, Sidebar, Footer
¦       ¦   +-- employer/       # PostJobForm, JobCard
¦       ¦   +-- candidate/      # ApplyForm, MatchCard
¦       ¦   +-- shared/         # FHEStatusIndicator, EscrowStatus
¦       +-- hooks/
¦       ¦   +-- useJobList.ts   # useJobList, useJob, useMyApplications
¦       ¦   +-- useMatchJob.ts
¦       ¦   +-- useFHEEncrypt.ts
¦       +-- lib/
¦       ¦   +-- constants.ts    # ABI + contract addresses
¦       ¦   +-- cofhe.ts        # CoFHE SDK config (Sepolia chain)
¦       ¦   +-- wagmi.ts        # Wagmi + RainbowKit config
¦       +-- pages/
¦       ¦   +-- Landing.tsx
¦       ¦   +-- EmployerDashboard.tsx
¦       ¦   +-- CandidateDashboard.tsx
¦       ¦   +-- JobDetail.tsx
¦       ¦   +-- MatchResult.tsx
¦       ¦   +-- HowItWorks.tsx
¦       ¦   +-- Privacy.tsx
¦       +-- store/
¦           +-- useAppStore.ts
+-- vercel.json                 # Vercel SPA routing + COOP/COEP headers
+-- hardhat.config.ts
+-- package.json
```

---

## Quick Start (Local Dev)

### Prerequisites

- Node.js = 18
- npm = 9
- MetaMask with Sepolia ETH ([faucet](https://sepoliafaucet.com))

### 1. Clone & install

```bash
git clone https://github.com/NeoCrafts-cpu/HireShield.git
cd HireShield
npm install
```

### 2. Run contract tests

```bash
npx hardhat test
# ? 12 tests passing
```

### 3. Start the frontend

```bash
cd frontend
npm install          # postinstall patches run automatically
cp .env.example .env # contracts already deployed on Sepolia
npm run dev
```

Open [http://localhost:5173](http://localhost:5173)

> **Note:** The dev server sets `Cross-Origin-Opener-Policy: same-origin` and `Cross-Origin-Embedder-Policy: require-corp` headers — required for the CoFHE WASM module.

---

## Deploy to Vercel

The repo root contains a `vercel.json` that:
- Sets the **build root** to `frontend/`
- Configures SPA fallback routing (`/*` ? `/index.html`)
- Adds required **COOP / COEP** headers for WASM on all routes

### Steps

1. Push to GitHub (`main` branch)
2. Go to [vercel.com/new](https://vercel.com/new) ? import `NeoCrafts-cpu/HireShield`
3. Vercel auto-detects Vite. Override settings if needed:
   - **Root Directory:** `frontend`
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`
4. Add Environment Variables in Vercel dashboard:

| Variable | Value |
|---|---|
| `VITE_HIRESHIELD_ADDRESS` | `0x8176549dfbE797b1C77316BFac18DAFCe42bEb8c` |
| `VITE_ESCROW_ADDRESS` | `0x77d6f4B3250Ef6C88EC409d49dcF4e5a4DdF2187` |
| `VITE_WALLETCONNECT_PROJECT_ID` | your WalletConnect project ID |
| `VITE_SEPOLIA_RPC_URL` | your Alchemy/Infura Sepolia URL |
| `VITE_PRIVARA_API_KEY` | (optional) |

5. Click **Deploy**

---

## Environment Variables

### Root `.env`

```env
PRIVATE_KEY=0x_your_deployer_private_key
SEPOLIA_RPC_URL=https://eth-sepolia.g.alchemy.com/v2/YOUR_KEY
ETHERSCAN_API_KEY=optional
```

### Frontend `.env`

```env
VITE_HIRESHIELD_ADDRESS=0x8176549dfbE797b1C77316BFac18DAFCe42bEb8c
VITE_ESCROW_ADDRESS=0x77d6f4B3250Ef6C88EC409d49dcF4e5a4DdF2187
VITE_WALLETCONNECT_PROJECT_ID=your_project_id
VITE_SEPOLIA_RPC_URL=https://eth-sepolia.g.alchemy.com/v2/YOUR_KEY
VITE_PRIVARA_API_KEY=
```

---

## Known Quirks & Patches

### `patch-workers.cjs`
The `@cofhe/sdk` package conditionally spawns a `zkProve.worker.js` Web Worker for ZK proof generation. This file is not emitted into Vite's dep cache, causing a silent worker crash and invalid proof signatures. The patch overrides `areWorkersAvailable()` to return `false`, forcing WASM-based main-thread ZK proving — which is fully supported by the CoFHE SDK fallback path.

### `patch-cofhe.cjs`
`@cofhe/react` imports from `@mui/icons-material` which is not installed as a peer dependency. The patch injects `null` component stubs before the import so the build succeeds without pulling in the full MUI icons package.

---

## Design System

- **Background:** `#0a0a0f` dark base, glassmorphism panels with `backdrop-blur`
- **Accents:** Cyan `#00d4ff` · Violet `#7c3aed` · Green `#00ff88`
- **Typography:** Inter (body) + Space Grotesk (headings)
- **Animations:** Framer Motion — page transitions, FHE flow diagram (animated SVG packets), aurora gradients, floating pill labels
- **Hero Figure:** Interactive FHE flow diagram showing Employer ? FHE Contract ? Candidate ? Match Result with live animated encrypted data packets

---

## License

MIT
