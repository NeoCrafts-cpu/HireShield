import { ethers, network } from "hardhat";

async function main() {
  const [deployer] = await ethers.getSigners();
  // Default cofheNode to deployer address so setMatchResult works out-of-the-box
  const cofheNodeAddress =
    process.env.COFHE_NODE_ADDRESS && process.env.COFHE_NODE_ADDRESS !== ethers.ZeroAddress
      ? process.env.COFHE_NODE_ADDRESS
      : deployer.address;

  console.log(`\nDeploying to: ${network.name} (chainId: ${(await ethers.provider.getNetwork()).chainId})`);
  console.log("Deployer account:", deployer.address);
  const balance = await ethers.provider.getBalance(deployer.address);
  console.log("Account balance:", ethers.formatEther(balance), "ETH\n");

  if (balance === 0n) {
    throw new Error("Deployer account has 0 ETH. Fund it with Sepolia ETH from https://sepoliafaucet.com");
  }

  // Deploy Escrow first (with placeholder HireShield address)
  const Escrow = await ethers.deployContract("HireShieldEscrow", [
    ethers.ZeroAddress,
  ]);
  await Escrow.waitForDeployment();
  const escrowAddress = await Escrow.getAddress();
  console.log("HireShieldEscrow deployed to:", escrowAddress);

  // Deploy HireShield
  const HireShield = await ethers.deployContract("HireShield", [
    escrowAddress,
    cofheNodeAddress,
  ]);
  await HireShield.waitForDeployment();
  const hireShieldAddress = await HireShield.getAddress();
  console.log("HireShield deployed to:", hireShieldAddress);

  // Link escrow to HireShield (so auto-release works)
  const linkTx = await Escrow.setHireShieldContract(hireShieldAddress);
  await linkTx.wait();
  console.log("Escrow linked to HireShield ✅");

  // Deploy Soulbound NFT Credential
  const NFT = await ethers.deployContract("HireShieldNFT", []);
  await NFT.waitForDeployment();
  const nftAddress = await NFT.getAddress();
  console.log("HireShieldNFT deployed to:", nftAddress);

  // Link NFT to HireShield
  const nftLinkTx = await NFT.setHireShieldContract(hireShieldAddress);
  await nftLinkTx.wait();
  console.log("NFT linked to HireShield ✅");

  // Tell HireShield about the NFT contract
  const setNftTx = await HireShield.setNFTContract(nftAddress);
  await setNftTx.wait();
  console.log("HireShield linked to NFT ✅");

  // ─── Deploy new Phase 3 contracts ─────────────────────────

  // Deploy HireShieldReputation (requires HireShield address)
  const Reputation = await ethers.deployContract("HireShieldReputation", [hireShieldAddress]);
  await Reputation.waitForDeployment();
  const reputationAddress = await Reputation.getAddress();
  console.log("HireShieldReputation deployed to:", reputationAddress);

  // Deploy HireShieldBidding (no constructor args)
  const Bidding = await ethers.deployContract("HireShieldBidding", []);
  await Bidding.waitForDeployment();
  const biddingAddress = await Bidding.getAddress();
  console.log("HireShieldBidding deployed to:", biddingAddress);

  // Deploy HireShieldStaking (requires HireShield address)
  const Staking = await ethers.deployContract("HireShieldStaking", [hireShieldAddress]);
  await Staking.waitForDeployment();
  const stakingAddress = await Staking.getAddress();
  console.log("HireShieldStaking deployed to:", stakingAddress);

  // Register all three new contracts with HireShield
  const setRepTx = await HireShield.setReputationContract(reputationAddress);
  await setRepTx.wait();
  console.log("HireShield linked to Reputation ✅");

  const setBidTx = await HireShield.setBiddingContract(biddingAddress);
  await setBidTx.wait();
  console.log("HireShield linked to Bidding ✅");

  const setStakingTx = await HireShield.setStakingContract(stakingAddress);
  await setStakingTx.wait();
  console.log("HireShield linked to Staking ✅");

  console.log("\n--- Deployment Summary ---");
  console.log("HireShieldEscrow:", escrowAddress);
  console.log("HireShield:", hireShieldAddress);
  console.log("HireShieldNFT:", nftAddress);
  console.log("HireShieldReputation:", reputationAddress);
  console.log("HireShieldBidding:", biddingAddress);
  console.log("HireShieldStaking:", stakingAddress);
  console.log("CoFHE Node:", cofheNodeAddress);
  console.log("\nUpdate your frontend/.env with:");
  console.log(`VITE_HIRESHIELD_ADDRESS=${hireShieldAddress}`);
  console.log(`VITE_ESCROW_ADDRESS=${escrowAddress}`);
  console.log(`VITE_NFT_ADDRESS=${nftAddress}`);
  console.log(`VITE_REPUTATION_ADDRESS=${reputationAddress}`);
  console.log(`VITE_BIDDING_ADDRESS=${biddingAddress}`);
  console.log(`VITE_STAKING_ADDRESS=${stakingAddress}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
