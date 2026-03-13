# HireShield — Privacy-First Confidential Hiring dApp

> Employer budgets & candidate salaries stay encrypted on-chain via **Fhenix CoFHE**.  
> Confidential stablecoin settlements powered by **Privara / Reineira**.

---

## Architecture

```
┌───────────────────────────────────────────────────────────┐
│  React 18 + Wagmi v2 + RainbowKit + Framer Motion        │
│  (NullPay-inspired dark-mode UI, glassmorphism panels)    │
├───────────────────────────────────────────────────────────┤
│                  Fhenix CoFHE SDK                         │
│  ┌──────────────┐  ┌──────────────────┐  ┌────────────┐  │
│  │ HireShield   │  │ HireShieldEscrow │  │  Privara   │  │
│  │  (FHE jobs)  │  │   (ETH escrow)   │  │  (stables) │  │
│  └──────────────┘  └──────────────────┘  └────────────┘  │
├───────────────────────────────────────────────────────────┤
│            Fhenix Testnet (chain 8008148)                 │
└───────────────────────────────────────────────────────────┘
```

## Quick Start

### Prerequisites

- Node.js ≥ 18
- npm or yarn

### 1. Clone & install root deps

```bash
git clone <repo-url> HireShield
cd HireShield
npm install
```

### 2. Compile & test contracts

```bash
npx hardhat compile
npx hardhat test
```

### 3. Deploy contracts

```bash
cp .env.example .env
# Fill in PRIVATE_KEY, FHENIX_RPC, etc.
npx hardhat run scripts/deploy.ts --network fhenix_testnet
```

### 4. Start frontend

```bash
cd frontend
npm install
cp .env.example .env
# Fill in VITE_* variables with deployed addresses
npm run dev
```

Open [http://localhost:5173](http://localhost:5173)

---

## Project Structure

```
HireShield/
├── contracts/
│   ├── HireShield.sol          # Main FHE hiring contract
│   ├── HireShieldEscrow.sol    # Escrow for job bonuses
│   └── interfaces/
│       └── IPrivaraEscrow.sol  # Privara interface stub
├── scripts/
│   ├── deploy.ts               # Deployment script
│   └── interact.ts             # CLI interaction script
├── test/
│   ├── HireShield.test.ts      # Contract tests
│   └── Escrow.test.ts          # Escrow tests
├── frontend/
│   ├── public/shield.svg
│   └── src/
│       ├── components/
│       │   ├── ui/             # Design system atoms
│       │   ├── layout/         # Navbar, Sidebar, Footer
│       │   ├── employer/       # PostJobForm, JobCard
│       │   ├── candidate/      # ApplyForm, MatchCard
│       │   └── shared/         # FHEStatusIndicator, EscrowStatus
│       ├── hooks/              # Custom React hooks
│       ├── lib/                # SDK wrappers & config
│       ├── pages/              # Route pages
│       ├── store/              # Zustand global state
│       └── styles/             # Global CSS & animations
├── hardhat.config.ts
├── package.json
└── README.md
```

---

## Smart Contracts

### HireShield.sol

- `postJob(title, desc, inBudget)` — Employer posts a job with FHE-encrypted budget
- `apply(jobId, inSalary)` — Candidate applies with FHE-encrypted expected salary
- `setMatchResult(appId, matched)` — Owner records encrypted match outcome
- `getJobBudget(jobId)` — Employer-only: unseals their encrypted budget
- `getMyExpectedSalary(appId)` — Candidate-only: unseals their encrypted salary

### HireShieldEscrow.sol

- `fundJobBonus(jobId)` — Employer funds ETH bonus for a job
- `releaseBonus(jobId, candidate)` — HireShield contract releases bonus to matched candidate

---

## Design System

- **NullPay-inspired dark mode** — Background #0a0a0f, panels with glassmorphism
- **Neon accent palette** — Cyan (#00d4ff), Violet (#7c3aed), Green (#00ff88), Amber (#f59e0b), Rose (#f43f5e)
- **Typography** — Inter (body) + Space Grotesk (headings)
- **Animations** — Framer Motion page transitions, FHE encryption sequences, aurora gradients

---

## Tech Stack

| Layer         | Technology                              |
| ------------- | --------------------------------------- |
| Blockchain    | Fhenix CoFHE (FHE on-chain)            |
| Payments      | Privara / Reineira SDK                  |
| Smart Contracts | Solidity 0.8.24 + Hardhat            |
| Frontend      | React 18 + TypeScript                  |
| Wallet        | Wagmi v2 + RainbowKit v2               |
| Styling       | Tailwind CSS 3 + Framer Motion 11      |
| State         | Zustand 4                               |
| Build         | Vite 5                                  |

---

## Environment Variables

### Root `.env`

```
PRIVATE_KEY=0x_your_deployer_private_key
FHENIX_RPC=https://api.testnet.fhenix.zone:7747
```

### Frontend `.env`

```
VITE_WALLETCONNECT_PROJECT_ID=your_project_id
VITE_PRIVARA_API_KEY=your_privara_key
VITE_HIRESHIELD_ADDRESS=0x_deployed_address
VITE_ESCROW_ADDRESS=0x_deployed_address
```

---

## License

MIT
