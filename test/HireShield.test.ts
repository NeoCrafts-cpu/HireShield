import { expect } from "chai";
import hre from "hardhat";
import { Encryptable } from "@cofhe/sdk";
const { ethers } = hre;

async function getClient(signer?: any) {
  return hre.cofhe.createClientWithBatteries(signer);
}

describe("HireShield", function () {
  it("Should store encrypted job with multi-dimensional requirements", async function () {
    const [employer, cofheNode] = await ethers.getSigners();
    const client = await getClient(employer);

    const Escrow = await ethers.deployContract("HireShieldEscrow", [
      ethers.ZeroAddress,
    ]);
    const HireShield = await ethers.deployContract("HireShield", [
      await Escrow.getAddress(),
      cofheNode.address,
    ]);

    const [encBudget, encExp, encSkills, encLoc] = await client
      .encryptInputs([
        Encryptable.uint128(120000n),
        Encryptable.uint32(3n),
        Encryptable.uint32(70n),
        Encryptable.uint32(1n),
      ])
      .execute();

    await HireShield.connect(employer).postJob(
      encBudget,
      encExp,
      encSkills,
      encLoc,
      "Senior Dev",
      "Build FHE apps"
    );

    const job = await HireShield.getJob(1);
    expect(job.employer).to.equal(employer.address);
    expect(job.isActive).to.be.true;
    expect(job.title).to.equal("Senior Dev");
  });

  it("Should allow multi-dimensional encrypted application", async function () {
    const [employer, candidate, cofheNode] = await ethers.getSigners();
    const employerClient = await getClient(employer);
    const candidateClient = await getClient(candidate);

    const Escrow = await ethers.deployContract("HireShieldEscrow", [
      ethers.ZeroAddress,
    ]);
    const HireShield = await ethers.deployContract("HireShield", [
      await Escrow.getAddress(),
      cofheNode.address,
    ]);

    const [encBudget, encExpReq, encSkillReq, encLocReq] = await employerClient
      .encryptInputs([
        Encryptable.uint128(100000n),
        Encryptable.uint32(2n),
        Encryptable.uint32(60n),
        Encryptable.uint32(1n),
      ])
      .execute();
    await HireShield.connect(employer).postJob(
      encBudget,
      encExpReq,
      encSkillReq,
      encLocReq,
      "Solidity Dev",
      "Build smart contracts"
    );

    const [encSalary, encExp, encSkills, encLoc] = await candidateClient
      .encryptInputs([
        Encryptable.uint128(90000n),
        Encryptable.uint32(5n),
        Encryptable.uint32(85n),
        Encryptable.uint32(1n),
      ])
      .execute();
    await HireShield.connect(candidate).applyToJob(
      1, encSalary, encExp, encSkills, encLoc
    );

    const appIds = await HireShield.getJobApplicationIds(1);
    expect(appIds.length).to.equal(1);
  });

  it("Should reject application to inactive job", async function () {
    const [_employer, candidate, cofheNode] = await ethers.getSigners();
    const candidateClient = await getClient(candidate);

    const Escrow = await ethers.deployContract("HireShieldEscrow", [
      ethers.ZeroAddress,
    ]);
    const HireShield = await ethers.deployContract("HireShield", [
      await Escrow.getAddress(),
      cofheNode.address,
    ]);

    const [encSalary, encExp, encSkills, encLoc] = await candidateClient
      .encryptInputs([
        Encryptable.uint128(90000n),
        Encryptable.uint32(3n),
        Encryptable.uint32(70n),
        Encryptable.uint32(1n),
      ])
      .execute();

    await expect(
      HireShield.connect(candidate).applyToJob(
        999, encSalary, encExp, encSkills, encLoc
      )
    ).to.be.revertedWith("HireShield: Job not active");
  });

  it("Should track escrow amounts", async function () {
    const [employer, cofheNode] = await ethers.getSigners();
    const client = await getClient(employer);

    const Escrow = await ethers.deployContract("HireShieldEscrow", [
      ethers.ZeroAddress,
    ]);
    const HireShield = await ethers.deployContract("HireShield", [
      await Escrow.getAddress(),
      cofheNode.address,
    ]);

    const [encBudget, encExp, encSkills, encLoc] = await client
      .encryptInputs([
        Encryptable.uint128(120000n),
        Encryptable.uint32(3n),
        Encryptable.uint32(70n),
        Encryptable.uint32(1n),
      ])
      .execute();
    const escrowValue = ethers.parseEther("0.5");

    await HireShield.connect(employer).postJob(
      encBudget,
      encExp,
      encSkills,
      encLoc,
      "FHE Engineer",
      "Work on CoFHE",
      { value: escrowValue }
    );

    const job = await HireShield.getJob(1);
    expect(job.escrowAmount).to.equal(escrowValue);
  });

  it("Should perform FHE qualification check", async function () {
    const [employer, candidate, cofheNode] = await ethers.getSigners();
    const employerClient = await getClient(employer);
    const candidateClient = await getClient(candidate);

    const Escrow = await ethers.deployContract("HireShieldEscrow", [
      ethers.ZeroAddress,
    ]);
    const HireShield = await ethers.deployContract("HireShield", [
      await Escrow.getAddress(),
      cofheNode.address,
    ]);

    // Post job: budget 150k, 3yr exp, 70 skills, location 1
    const [encBudget, encExpReq, encSkillReq, encLocReq] = await employerClient
      .encryptInputs([
        Encryptable.uint128(150000n),
        Encryptable.uint32(3n),
        Encryptable.uint32(70n),
        Encryptable.uint32(1n),
      ])
      .execute();
    await HireShield.connect(employer).postJob(
      encBudget, encExpReq, encSkillReq, encLocReq,
      "Lead Engineer", "Build privacy apps"
    );

    // Apply: salary 120k, 5yr exp, 85 skills, location 1
    const [encSalary, encExp, encSkills, encLoc] = await candidateClient
      .encryptInputs([
        Encryptable.uint128(120000n),
        Encryptable.uint32(5n),
        Encryptable.uint32(85n),
        Encryptable.uint32(1n),
      ])
      .execute();
    await HireShield.connect(candidate).applyToJob(
      1, encSalary, encExp, encSkills, encLoc
    );

    // Check qualification
    const checkTx = await HireShield.connect(candidate).checkQualification(1, 1);
    await checkTx.wait();

    await expect(checkTx)
      .to.emit(HireShield, "QualificationChecked")
      .withArgs(1n, 1n, candidate.address);

    // Verify qualification was checked
    const app = await HireShield.applications(1);
    expect(app.qualificationChecked).to.be.true;
  });
});
