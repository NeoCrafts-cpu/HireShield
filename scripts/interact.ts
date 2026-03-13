import { ethers } from "hardhat";

async function main() {
  const [employer, candidate] = await ethers.getSigners();

  const hireShieldAddress = process.env.VITE_HIRESHIELD_ADDRESS;
  if (!hireShieldAddress) {
    throw new Error("Set VITE_HIRESHIELD_ADDRESS in .env");
  }

  const HireShield = await ethers.getContractAt("HireShield", hireShieldAddress);

  console.log("--- Interaction Script ---");
  console.log("Employer:", employer.address);
  console.log("Candidate:", candidate.address);

  // Read current job count
  const jobCount = await HireShield.jobCounter();
  console.log("Current job count:", jobCount.toString());

  // Read current application count
  const appCount = await HireShield.applicationCounter();
  console.log("Current application count:", appCount.toString());

  // Fetch job details if any exist
  if (jobCount > 0n) {
    const job = await HireShield.getJob(1);
    console.log("\nJob #1:");
    console.log("  Employer:", job.employer);
    console.log("  Active:", job.isActive);
    console.log("  Escrow:", ethers.formatEther(job.escrowAmount), "ETH");
    console.log("  Applications:", job.applicationCount.toString());
    console.log("  Title:", job.title);
    console.log("  Description:", job.description);
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
