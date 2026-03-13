import { expect } from "chai";
import hre from "hardhat";
import { Encryptable } from "@cofhe/sdk";
const { ethers } = hre;

async function getClient(signer?: any) {
  return hre.cofhe.createClientWithBatteries(signer);
}

// Helper: encrypt 4D job requirements
async function encryptJobReqs(client: any, budget: bigint, exp: bigint, skills: bigint, loc: bigint) {
  return client.encryptInputs([
    Encryptable.uint128(budget),
    Encryptable.uint32(exp),
    Encryptable.uint32(skills),
    Encryptable.uint32(loc),
  ]).execute();
}

// Helper: encrypt 4D candidate credentials
async function encryptCandidateCreds(client: any, salary: bigint, exp: bigint, skills: bigint, loc: bigint) {
  return client.encryptInputs([
    Encryptable.uint128(salary),
    Encryptable.uint32(exp),
    Encryptable.uint32(skills),
    Encryptable.uint32(loc),
  ]).execute();
}

describe("E2E: Full Hiring Flow", function () {
  it("employer posts → candidate applies → qualification check → match → escrow auto-releases", async function () {
    const [employer, candidate, cofheNode] = await ethers.getSigners();
    const employerClient = await getClient(employer);
    const candidateClient = await getClient(candidate);

    // --- Deploy contracts ---
    const Escrow = await ethers.deployContract("HireShieldEscrow", [
      ethers.ZeroAddress,
    ]);
    const escrowAddr = await Escrow.getAddress();

    const HireShield = await ethers.deployContract("HireShield", [
      escrowAddr,
      cofheNode.address,
    ]);
    const hireShieldAddr = await HireShield.getAddress();

    // Link escrow to HireShield
    await Escrow.setHireShieldContract(hireShieldAddr);

    // --- Step 1: Employer posts a job with 4D encrypted requirements + escrow bonus ---
    const bonusAmount = ethers.parseEther("1.0");

    const [encBudget, encExpReq, encSkillReq, encLocReq] = await encryptJobReqs(
      employerClient, 150000n, 3n, 70n, 1n
    );

    const postTx = await HireShield.connect(employer).postJob(
      encBudget, encExpReq, encSkillReq, encLocReq,
      "Lead Solidity Engineer",
      "Build privacy-first dApps with FHE",
      "",
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

    await expect(postTx)
      .to.emit(HireShield, "JobPosted")
      .withArgs(1n, employer.address, "Lead Solidity Engineer");
    await expect(postTx)
      .to.emit(HireShield, "EscrowFunded")
      .withArgs(1n, bonusAmount);

    // --- Step 2: Candidate applies with 4D encrypted credentials ---
    const [encSalary, encExp, encSkills, encLoc] = await encryptCandidateCreds(
      candidateClient, 140000n, 5n, 85n, 1n
    );

    const applyTx = await HireShield.connect(candidate).applyToJob(
      1, encSalary, encExp, encSkills, encLoc
    );
    await applyTx.wait();

    const appIds = await HireShield.getJobApplicationIds(1);
    expect(appIds.length).to.equal(1);
    expect(appIds[0]).to.equal(1n);

    await expect(applyTx)
      .to.emit(HireShield, "ApplicationSubmitted")
      .withArgs(1n, 1n, candidate.address);

    // --- Step 3: Candidate checks qualification (4D FHE comparison) ---
    const checkTx = await HireShield.connect(candidate).checkQualification(1, 1);
    await checkTx.wait();

    await expect(checkTx)
      .to.emit(HireShield, "QualificationChecked")
      .withArgs(1n, 1n, candidate.address);

    const appAfterCheck = await HireShield.applications(1);
    expect(appAfterCheck.qualificationChecked).to.be.true;

    // --- Step 4: CoFHE node confirms match → escrow auto-releases ---
    const matchTx = await HireShield.connect(cofheNode).setMatchResult(1, 1);
    await matchTx.wait();

    const appAfterMatch = await HireShield.applications(1);
    expect(appAfterMatch.isMatched).to.be.true;

    const closedJob = await HireShield.getJob(1);
    expect(closedJob.isActive).to.be.false;
    // Escrow amount should be zero (auto-transferred to escrow contract)
    expect(closedJob.escrowAmount).to.equal(0n);

    await expect(matchTx).to.emit(HireShield, "MatchFound").withArgs(1n, 1n);
    await expect(matchTx)
      .to.emit(HireShield, "BonusAutoReleased")
      .withArgs(1n, candidate.address, bonusAmount);

    // Verify escrow received the bonus
    expect(await Escrow.jobEscrowAmount(1)).to.equal(bonusAmount);
    expect(await Escrow.jobEscrowRecipient(1)).to.equal(candidate.address);

    // --- Step 5: Candidate claims bonus from escrow ---
    const candidateBalBefore = await ethers.provider.getBalance(candidate.address);
    await Escrow.connect(candidate).releaseBonus(1);
    const candidateBalAfter = await ethers.provider.getBalance(candidate.address);

    expect(candidateBalAfter - candidateBalBefore).to.be.closeTo(
      bonusAmount,
      ethers.parseEther("0.01")
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
    ]);
    const HireShield = await ethers.deployContract("HireShield", [
      await Escrow.getAddress(),
      cofheNode.address,
    ]);

    const [encBudget, encExp, encSkills, encLoc] = await encryptJobReqs(
      employerClient, 100000n, 1n, 50n, 2n
    );
    await HireShield.connect(employer).postJob(
      encBudget, encExp, encSkills, encLoc,
      "Junior Dev", "Entry level", ""
    );

    const [encSal1, encExp1, encSk1, encLoc1] = await encryptCandidateCreds(
      c1Client, 80000n, 2n, 60n, 2n
    );
    await HireShield.connect(candidate1).applyToJob(
      1, encSal1, encExp1, encSk1, encLoc1
    );

    // Match candidate 1 → job becomes inactive
    await HireShield.connect(cofheNode).setMatchResult(1, 1);

    // Candidate 2 tries to apply — should fail
    const [encSal2, encExp2, encSk2, encLoc2] = await encryptCandidateCreds(
      c2Client, 75000n, 3n, 65n, 2n
    );

    await expect(
      HireShield.connect(candidate2).applyToJob(
        1, encSal2, encExp2, encSk2, encLoc2
      )
    ).to.be.revertedWith("HireShield: Job not active");
  });

  it("only cofhe node can set match result", async function () {
    const [employer, candidate, cofheNode, attacker] =
      await ethers.getSigners();
    const employerClient = await getClient(employer);
    const candidateClient = await getClient(candidate);

    const Escrow = await ethers.deployContract("HireShieldEscrow", [
      ethers.ZeroAddress,
    ]);
    const HireShield = await ethers.deployContract("HireShield", [
      await Escrow.getAddress(),
      cofheNode.address,
    ]);

    const [encBudget, encExp, encSkills, encLoc] = await encryptJobReqs(
      employerClient, 100000n, 2n, 60n, 3n
    );
    await HireShield.connect(employer).postJob(
      encBudget, encExp, encSkills, encLoc,
      "Test Job", "Testing", ""
    );

    const [encSal, encExpC, encSkC, encLocC] = await encryptCandidateCreds(
      candidateClient, 90000n, 4n, 80n, 3n
    );
    await HireShield.connect(candidate).applyToJob(
      1, encSal, encExpC, encSkC, encLocC
    );

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
    ]);
    const HireShield = await ethers.deployContract("HireShield", [
      await Escrow.getAddress(),
      cofheNode.address,
    ]);

    const [encBudget, encExp, encSkills, encLoc] = await encryptJobReqs(
      employerClient, 200000n, 5n, 90n, 1n
    );
    await HireShield.connect(employer).postJob(
      encBudget, encExp, encSkills, encLoc,
      "Staff Engineer", "Lead the team", ""
    );

    // Three candidates apply
    for (const candidate of [c1, c2, c3]) {
      const client = await getClient(candidate);
      const [encSal, encExpC, encSkC, encLocC] = await encryptCandidateCreds(
        client, 180000n, 7n, 95n, 1n
      );
      await HireShield.connect(candidate).applyToJob(
        1, encSal, encExpC, encSkC, encLocC
      );
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
