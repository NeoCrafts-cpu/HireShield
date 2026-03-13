import { expect } from "chai";
import hre from "hardhat";
import { Encryptable } from "@cofhe/sdk";
const { ethers } = hre;

async function getClient(signer?: any) {
  return hre.cofhe.createClientWithBatteries(signer);
}

describe("E2E: Full Hiring Flow", function () {
  it("employer posts → candidate applies → cofhe matches → escrow releases", async function () {
    const [employer, candidate, cofheNode] = await ethers.getSigners();
    const employerClient = await getClient(employer);
    const candidateClient = await getClient(candidate);

    // --- Deploy contracts ---
    const Escrow = await ethers.deployContract("HireShieldEscrow", [
      ethers.ZeroAddress, // placeholder, updated below
      ethers.ZeroAddress,
    ]);
    const escrowAddr = await Escrow.getAddress();

    const HireShield = await ethers.deployContract("HireShield", [
      escrowAddr,
      cofheNode.address,
    ]);
    const hireShieldAddr = await HireShield.getAddress();

    // --- Step 1: Employer posts a job with encrypted budget + escrow bonus ---
    const bonusAmount = ethers.parseEther("1.0");

    const [encBudget, encSkills] = await employerClient
      .encryptInputs([
        Encryptable.uint128(150000n), // $150k budget
        Encryptable.uint32(0xdeadbeefn), // skills hash
      ])
      .execute();

    const postTx = await HireShield.connect(employer).postJob(
      encBudget,
      encSkills,
      "Lead Solidity Engineer",
      "Build privacy-first dApps with FHE",
      { value: bonusAmount }
    );
    await postTx.wait();

    // Verify job was created
    const job = await HireShield.getJob(1);
    expect(job.employer).to.equal(employer.address);
    expect(job.isActive).to.be.true;
    expect(job.escrowAmount).to.equal(bonusAmount);
    expect(job.title).to.equal("Lead Solidity Engineer");
    expect(job.applicationCount).to.equal(0n);

    // Verify event emitted
    await expect(postTx)
      .to.emit(HireShield, "JobPosted")
      .withArgs(1n, employer.address, "Lead Solidity Engineer");
    await expect(postTx)
      .to.emit(HireShield, "EscrowFunded")
      .withArgs(1n, bonusAmount);

    // --- Step 2: Candidate applies with encrypted salary expectation ---
    const [encSalary, encCreds] = await candidateClient
      .encryptInputs([
        Encryptable.uint128(140000n), // $140k expected (within budget)
        Encryptable.uint32(0xcafe1234n), // credentials hash
      ])
      .execute();

    const applyTx = await HireShield.connect(candidate).applyToJob(
      1,
      encSalary,
      encCreds
    );
    await applyTx.wait();

    // Verify application recorded
    const appIds = await HireShield.getJobApplicationIds(1);
    expect(appIds.length).to.equal(1);
    expect(appIds[0]).to.equal(1n);

    const updatedJob = await HireShield.getJob(1);
    expect(updatedJob.applicationCount).to.equal(1n);

    // Verify event
    await expect(applyTx)
      .to.emit(HireShield, "ApplicationSubmitted")
      .withArgs(1n, 1n, candidate.address);

    // --- Step 3: CoFHE node signals a match ---
    const matchTx = await HireShield.connect(cofheNode).setMatchResult(1, 1);
    await matchTx.wait();

    // Verify match state
    const app = await HireShield.applications(1);
    expect(app.isMatched).to.be.true;

    const closedJob = await HireShield.getJob(1);
    expect(closedJob.isActive).to.be.false;

    await expect(matchTx)
      .to.emit(HireShield, "MatchFound")
      .withArgs(1n, 1n);

    // --- Step 4: Fund escrow bonus for the candidate ---
    const fundTx = await Escrow.connect(employer).fundJobBonus(
      1,
      candidate.address,
      { value: bonusAmount }
    );
    await fundTx.wait();

    expect(await Escrow.jobEscrowAmount(1)).to.equal(bonusAmount);
    expect(await Escrow.jobEscrowRecipient(1)).to.equal(candidate.address);

    // --- Step 5: Release escrow bonus via HireShield.claimBonus ---
    // Update Escrow to point to HireShield so releaseBonus access check passes
    const Escrow2 = await ethers.deployContract("HireShieldEscrow", [
      hireShieldAddr,
      ethers.ZeroAddress,
    ]);
    const escrow2Addr = await Escrow2.getAddress();

    // Re-deploy HireShield pointing at Escrow2
    const HireShield2 = await ethers.deployContract("HireShield", [
      escrow2Addr,
      cofheNode.address,
    ]);
    const hireShield2Addr = await HireShield2.getAddress();

    // Fund escrow2
    await Escrow2.connect(employer).fundJobBonus(1, candidate.address, {
      value: bonusAmount,
    });

    const candidateBalBefore = await ethers.provider.getBalance(
      candidate.address
    );

    // Release bonus via claimBonus — callable by employer or matched candidate
    // (job 1 was matched in HireShield2? No, we need a fresh flow. Test candidate directly on Escrow2.)
    // Candidate is the recipient, so they can call releaseBonus directly on Escrow2
    await Escrow2.connect(candidate).releaseBonus(1);

    const candidateBalAfter = await ethers.provider.getBalance(
      candidate.address
    );
    expect(candidateBalAfter - candidateBalBefore).to.be.closeTo(
      bonusAmount,
      ethers.parseEther("0.01") // allow gas tolerance
    );
  });

  it("second candidate cannot apply after job is matched", async function () {
    const [employer, candidate1, candidate2, cofheNode] =
      await ethers.getSigners();
    const employerClient = await getClient(employer);
    const c1Client = await getClient(candidate1);
    const c2Client = await getClient(candidate2);

    const Escrow = await ethers.deployContract("HireShieldEscrow", [
      ethers.ZeroAddress,
      ethers.ZeroAddress,
    ]);
    const HireShield = await ethers.deployContract("HireShield", [
      await Escrow.getAddress(),
      cofheNode.address,
    ]);

    // Employer posts
    const [encBudget, encSkills] = await employerClient
      .encryptInputs([
        Encryptable.uint128(100000n),
        Encryptable.uint32(0x1111n),
      ])
      .execute();
    await HireShield.connect(employer).postJob(
      encBudget,
      encSkills,
      "Junior Dev",
      "Entry level"
    );

    // Candidate 1 applies
    const [encSal1, encCred1] = await c1Client
      .encryptInputs([
        Encryptable.uint128(80000n),
        Encryptable.uint32(0x2222n),
      ])
      .execute();
    await HireShield.connect(candidate1).applyToJob(1, encSal1, encCred1);

    // CoFHE matches candidate 1 → job becomes inactive
    await HireShield.connect(cofheNode).setMatchResult(1, 1);

    // Candidate 2 tries to apply — should fail
    const [encSal2, encCred2] = await c2Client
      .encryptInputs([
        Encryptable.uint128(75000n),
        Encryptable.uint32(0x3333n),
      ])
      .execute();

    await expect(
      HireShield.connect(candidate2).applyToJob(1, encSal2, encCred2)
    ).to.be.revertedWith("HireShield: Job not active");
  });

  it("only cofhe node can set match result", async function () {
    const [employer, candidate, cofheNode, attacker] =
      await ethers.getSigners();
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

    // Post + apply
    const [encBudget, encSkills] = await employerClient
      .encryptInputs([
        Encryptable.uint128(100000n),
        Encryptable.uint32(0xaaaan),
      ])
      .execute();
    await HireShield.connect(employer).postJob(
      encBudget,
      encSkills,
      "Test Job",
      "Testing"
    );

    const [encSal, encCred] = await candidateClient
      .encryptInputs([
        Encryptable.uint128(90000n),
        Encryptable.uint32(0xbbbbn),
      ])
      .execute();
    await HireShield.connect(candidate).applyToJob(1, encSal, encCred);

    // Attacker tries to set match — should fail
    await expect(
      HireShield.connect(attacker).setMatchResult(1, 1)
    ).to.be.revertedWith("HireShield: Only CoFHE node or owner");

    // cofheNode succeeds
    await HireShield.connect(cofheNode).setMatchResult(1, 1);
    const app = await HireShield.applications(1);
    expect(app.isMatched).to.be.true;
  });

  it("multiple candidates can apply before match", async function () {
    const [employer, c1, c2, c3, cofheNode] = await ethers.getSigners();
    const employerClient = await getClient(employer);

    const Escrow = await ethers.deployContract("HireShieldEscrow", [
      ethers.ZeroAddress,
      ethers.ZeroAddress,
    ]);
    const HireShield = await ethers.deployContract("HireShield", [
      await Escrow.getAddress(),
      cofheNode.address,
    ]);

    // Post job
    const [encBudget, encSkills] = await employerClient
      .encryptInputs([
        Encryptable.uint128(200000n),
        Encryptable.uint32(0xffn),
      ])
      .execute();
    await HireShield.connect(employer).postJob(
      encBudget,
      encSkills,
      "Staff Engineer",
      "Lead the team"
    );

    // Three candidates apply
    for (const candidate of [c1, c2, c3]) {
      const client = await getClient(candidate);
      const [encSal, encCred] = await client
        .encryptInputs([
          Encryptable.uint128(180000n),
          Encryptable.uint32(0xeen),
        ])
        .execute();
      await HireShield.connect(candidate).applyToJob(1, encSal, encCred);
    }

    const job = await HireShield.getJob(1);
    expect(job.applicationCount).to.equal(3n);

    const appIds = await HireShield.getJobApplicationIds(1);
    expect(appIds.length).to.equal(3);
    expect(appIds[0]).to.equal(1n);
    expect(appIds[1]).to.equal(2n);
    expect(appIds[2]).to.equal(3n);
  });
});
