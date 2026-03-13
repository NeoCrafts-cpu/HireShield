import { ethers, network } from "hardhat";

async function main() {
  const [deployer] = await ethers.getSigners();
  // Default cofheNode to deployer address so setMatchResult works out-of-the-box
  const cofheNodeAddress =
    process.env.COFHE_NODE_ADDRESS && process.env.COFHE_NODE_ADDRESS !== ethers.ZeroAddress
      ? process.env.COFHE_NODE_ADDRESS
      : deployer.address;
  const privaraAddress = process.env.PRIVARA_ESCROW_ADDRESS || ethers.ZeroAddress;

  console.log(`\nDeploying to: ${network.name} (chainId: ${(await ethers.provider.getNetwork()).chainId})`);
  console.log("Deployer account:", deployer.address);
  const balance = await ethers.provider.getBalance(deployer.address);
  console.log("Account balance:", ethers.formatEther(balance), "ETH\n");

  if (balance === 0n) {
    throw new Error("Deployer account has 0 ETH. Fund it with Sepolia ETH from https://sepoliafaucet.com");
  }

  // Deploy Escrow first
  const Escrow = await ethers.deployContract("HireShieldEscrow", [
    ethers.ZeroAddress, // Will be updated after HireShield deploys
    privaraAddress,
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

  console.log("\n--- Deployment Summary ---");
  console.log("HireShieldEscrow:", escrowAddress);
  console.log("HireShield:", hireShieldAddress);
  console.log("CoFHE Node:", cofheNodeAddress);
  console.log("Privara Escrow:", privaraAddress);
  console.log("\nUpdate your frontend/.env with:");
  console.log(`VITE_HIRESHIELD_ADDRESS=${hireShieldAddress}`);
  console.log(`VITE_ESCROW_ADDRESS=${escrowAddress}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
