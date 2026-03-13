import { expect } from "chai";
import { ethers } from "hardhat";

describe("HireShieldEscrow", function () {
  it("Should accept bonus funding", async function () {
    const [deployer, candidate] = await ethers.getSigners();

    const Escrow = await ethers.deployContract("HireShieldEscrow", [
      deployer.address, // hireshieldContract = deployer for testing
      ethers.ZeroAddress,
    ]);

    const bonusAmount = ethers.parseEther("1.0");
    await Escrow.fundJobBonus(1, candidate.address, { value: bonusAmount });

    const storedAmount = await Escrow.jobEscrowAmount(1);
    expect(storedAmount).to.equal(bonusAmount);

    const storedRecipient = await Escrow.jobEscrowRecipient(1);
    expect(storedRecipient).to.equal(candidate.address);
    console.log("✅ Bonus funded:", ethers.formatEther(storedAmount), "ETH");
  });

  it("Should release bonus to candidate", async function () {
    const [deployer, candidate] = await ethers.getSigners();

    const Escrow = await ethers.deployContract("HireShieldEscrow", [
      deployer.address, // hireshieldContract = deployer for testing
      ethers.ZeroAddress,
    ]);

    const bonusAmount = ethers.parseEther("1.0");
    await Escrow.fundJobBonus(1, candidate.address, { value: bonusAmount });

    const balanceBefore = await ethers.provider.getBalance(candidate.address);

    // Release bonus (deployer is hireshieldContract in this test)
    await Escrow.connect(deployer).releaseBonus(1);

    const balanceAfter = await ethers.provider.getBalance(candidate.address);
    expect(balanceAfter - balanceBefore).to.equal(bonusAmount);

    // Verify escrow zeroed out
    const storedAmount = await Escrow.jobEscrowAmount(1);
    expect(storedAmount).to.equal(0n);
    console.log("✅ Bonus released to candidate");
  });

  it("Should reject release from non-HireShield caller", async function () {
    const [deployer, attacker, candidate] = await ethers.getSigners();

    const Escrow = await ethers.deployContract("HireShieldEscrow", [
      deployer.address,
      ethers.ZeroAddress,
    ]);

    await Escrow.fundJobBonus(1, candidate.address, {
      value: ethers.parseEther("1.0"),
    });

    await expect(
      Escrow.connect(attacker).releaseBonus(1)
    ).to.be.revertedWith("Only HireShield or recipient");
  });

  it("Should reject release when no bonus exists", async function () {
    const [deployer] = await ethers.getSigners();

    const Escrow = await ethers.deployContract("HireShieldEscrow", [
      deployer.address,
      ethers.ZeroAddress,
    ]);

    await expect(Escrow.releaseBonus(1)).to.be.revertedWith("No bonus");
  });
});
