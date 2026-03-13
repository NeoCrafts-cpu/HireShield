import { expect } from "chai";
import hre from "hardhat";
import { Encryptable } from "@cofhe/sdk";
const { ethers } = hre;

async function getClient(signer?: any) {
  return hre.cofhe.createClientWithBatteries(signer);
}

describe("HireShield", function () {
  it("Should store encrypted job budget", async function () {
    const [employer, cofheNode] = await ethers.getSigners();
    const client = await getClient(employer);

    const Escrow = await ethers.deployContract("HireShieldEscrow", [
      ethers.ZeroAddress,
      ethers.ZeroAddress,
    ]);
    const HireShield = await ethers.deployContract("HireShield", [
      await Escrow.getAddress(),
      cofheNode.address,
    ]);

    const [encBudget, encSkills] = await client
      .encryptInputs([
        Encryptable.uint128(120000n),
        Encryptable.uint32(0x12345678n),
      ])
      .execute();

    await HireShield.connect(employer).postJob(
      encBudget,
      encSkills,
      "Senior Dev",
      "Build FHE apps"
    );

    const job = await HireShield.getJob(1);
    expect(job.employer).to.equal(employer.address);
    expect(job.isActive).to.be.true;
    expect(job.title).to.equal("Senior Dev");
  });

  it("Should allow encrypted application", async function () {
    const [employer, candidate, cofheNode] = await ethers.getSigners();
    const employerClient = await getClient(employer);
    const candidateClient = await getClient(candidate);

    const Escrow = await ethers.deployContract("HireShieldEscrow", [
      ethers.ZeroAddress,
      ethers.ZeroAddress,
    ]);
    const HireShield = await ethers.deployContract("HireShield", [
      await Escrow.getAddress(),
      cofheNode.address,
    ]);

    const [encBudget, encSkills] = await employerClient
      .encryptInputs([
        Encryptable.uint128(100000n),
        Encryptable.uint32(0xabcdefn),
      ])
      .execute();
    await HireShield.connect(employer).postJob(
      encBudget,
      encSkills,
      "Solidity Dev",
      "Build smart contracts"
    );

    const [encExpected, encCreds] = await candidateClient
      .encryptInputs([
        Encryptable.uint128(90000n),
        Encryptable.uint32(0x99n),
      ])
      .execute();
    await HireShield.connect(candidate).applyToJob(1, encExpected, encCreds);

    const appIds = await HireShield.getJobApplicationIds(1);
    expect(appIds.length).to.equal(1);
  });

  it("Should reject application to inactive job", async function () {
    const [_employer, candidate, cofheNode] = await ethers.getSigners();
    const candidateClient = await getClient(candidate);

    const Escrow = await ethers.deployContract("HireShieldEscrow", [
      ethers.ZeroAddress,
      ethers.ZeroAddress,
    ]);
    const HireShield = await ethers.deployContract("HireShield", [
      await Escrow.getAddress(),
      cofheNode.address,
    ]);

    const [encExpected, encCreds] = await candidateClient
      .encryptInputs([
        Encryptable.uint128(90000n),
        Encryptable.uint32(0x99n),
      ])
      .execute();

    await expect(
      HireShield.connect(candidate).applyToJob(999, encExpected, encCreds)
    ).to.be.revertedWith("HireShield: Job not active");
  });

  it("Should track escrow amounts", async function () {
    const [employer, cofheNode] = await ethers.getSigners();
    const client = await getClient(employer);

    const Escrow = await ethers.deployContract("HireShieldEscrow", [
      ethers.ZeroAddress,
      ethers.ZeroAddress,
    ]);
    const HireShield = await ethers.deployContract("HireShield", [
      await Escrow.getAddress(),
      cofheNode.address,
    ]);

    const [encBudget, encSkills] = await client
      .encryptInputs([
        Encryptable.uint128(120000n),
        Encryptable.uint32(0x12345678n),
      ])
      .execute();
    const escrowValue = ethers.parseEther("0.5");

    await HireShield.connect(employer).postJob(
      encBudget,
      encSkills,
      "FHE Engineer",
      "Work on CoFHE",
      { value: escrowValue }
    );

    const job = await HireShield.getJob(1);
    expect(job.escrowAmount).to.equal(escrowValue);
  });
});
