// SPDX-License-Identifier: MIT
pragma solidity ^0.8.27;

import "@fhenixprotocol/cofhe-contracts/FHE.sol";

interface IHireShieldEscrow {
    function fundJobBonus(uint256 jobId, address candidate) external payable;
    function releaseBonus(uint256 jobId) external;
}

interface IHireShieldNFT {
    function mintCredential(address candidate, uint256 jobId, uint256 applicationId, address employer) external returns (uint256);
}

/**
 * @title HireShield
 * @notice Privacy-first multi-dimensional job matching using Fhenix CoFHE (FHE)
 * @dev All salary, experience, skills, and location data is encrypted client-side.
 *      Matching happens entirely on ciphertext — no raw values are ever revealed on-chain.
 *      Candidates can check qualification without revealing their data to anyone.
 *      Includes: NFT credentials, escrow management, negotiation, referrals, salary analytics.
 */
contract HireShield {

    struct Job {
        address employer;
        euint128 budgetEncrypted;       // Encrypted max salary budget (USD)
        euint32 experienceRequired;      // Encrypted min years of experience
        euint32 skillScore;              // Encrypted min skill level (1-100)
        euint32 locationPref;            // Encrypted location code
        bool isActive;
        bool hasMatch;                  // Gas-optimized: skip loop in reclaimEscrow
        uint256 escrowAmount;           // Signing bonus locked (ETH)
        uint256 applicationCount;
        string title;
        string description;
        string category;                // Job category for analytics
    }

    struct Application {
        address candidate;
        euint128 expectedSalaryEncrypted; // Encrypted salary expectation (USD)
        euint32 experienceYears;          // Encrypted years of experience
        euint32 skillScore;               // Encrypted skill level (1-100)
        euint32 locationPref;             // Encrypted location code
        ebool qualificationResult;        // Encrypted multi-dim match result
        bool qualificationChecked;        // Whether FHE check has been performed
        bool isMatched;
        uint256 jobId;
        address referrer;                 // Encrypted referral (revealed on hire)
        uint8 negotiationRound;           // Counter-offer rounds
    }

    // Referral tracking
    struct Referral {
        address referrer;
        euint32 encryptedReferrerId;     // Encrypted referrer identity
        bool revealed;                    // Revealed on successful hire
    }

    // Salary analytics per category (FHE aggregated)
    struct CategoryAnalytics {
        euint128 totalSalary;            // Running FHE sum of accepted salaries
        uint256 matchCount;              // Number of matches (plaintext counter)
    }

    mapping(uint256 => Job) public jobs;
    mapping(uint256 => Application) public applications;
    mapping(uint256 => uint256[]) public jobApplications;          // jobId => applicationIds
    mapping(uint256 => Referral) public referrals;                 // applicationId => referral
    mapping(string => CategoryAnalytics) public categoryAnalytics; // category => analytics
    mapping(uint256 => mapping(address => bool)) public candidateApplied; // Duplicate guard
    mapping(uint256 => address) public jobMatchedCandidate;        // O(1) claimBonus lookup

    uint256 public jobCounter;
    uint256 public applicationCounter;

    address public escrowContract;
    address public nftContract;         // Soulbound credential NFT
    address public reputationContract;  // HireShieldReputation
    address public biddingContract;     // HireShieldBidding
    address public stakingContract;     // HireShieldStaking
    address public cofheNode;     // Authorized FHE computation node
    address public owner;         // Contract owner (deployer)

    event JobPosted(uint256 indexed jobId, address indexed employer, string title);
    event ApplicationSubmitted(uint256 indexed applicationId, uint256 indexed jobId, address indexed candidate);
    event QualificationChecked(uint256 indexed jobId, uint256 indexed applicationId, address indexed candidate);
    event MatchFound(uint256 indexed jobId, uint256 indexed applicationId);
    event EscrowFunded(uint256 indexed jobId, uint256 amount);
    event BonusAutoReleased(uint256 indexed jobId, address indexed candidate, uint256 amount);
    event CofheNodeUpdated(address indexed oldNode, address indexed newNode);
    event EscrowReclaimed(uint256 indexed jobId, address indexed employer, uint256 amount);
    event CredentialMinted(uint256 indexed jobId, uint256 indexed applicationId, uint256 tokenId);
    event NegotiationSubmitted(uint256 indexed applicationId, uint8 round);
    event ReferralSubmitted(uint256 indexed applicationId, address indexed referrer);
    event ReferralRevealed(uint256 indexed applicationId, address indexed referrer);

    modifier onlyOwner() {
        require(msg.sender == owner, "HireShield: Only owner");
        _;
    }

    modifier onlyCofheNode() {
        require(msg.sender == cofheNode || msg.sender == owner, "HireShield: Only CoFHE node or owner");
        _;
    }

    constructor(address _escrowContract, address _cofheNode) {
        owner = msg.sender;
        escrowContract = _escrowContract;
        cofheNode = _cofheNode != address(0) ? _cofheNode : msg.sender;
    }

    /// @notice Update the authorized CoFHE node address (owner only)
    function setCofheNode(address _newNode) external onlyOwner {
        emit CofheNodeUpdated(cofheNode, _newNode);
        cofheNode = _newNode;
    }

    /// @notice Set the NFT credential contract address
    function setNFTContract(address _nft) external onlyOwner {
        nftContract = _nft;
    }

    /// @notice Set the Reputation contract address
    function setReputationContract(address _rep) external onlyOwner {
        reputationContract = _rep;
    }

    /// @notice Set the Bidding contract address
    function setBiddingContract(address _bid) external onlyOwner {
        biddingContract = _bid;
    }

    /// @notice Set the Staking contract address
    function setStakingContract(address _staking) external onlyOwner {
        stakingContract = _staking;
    }

    // ═══════════════════════════════════════════════════════
    //  JOB POSTING
    // ═══════════════════════════════════════════════════════

    /// @notice Employer posts a job (with optional category). Pass empty string for no category.
    function postJob(
        InEuint128 memory _budget,
        InEuint32 memory _experienceRequired,
        InEuint32 memory _skillScore,
        InEuint32 memory _locationPref,
        string calldata _title,
        string calldata _description,
        string calldata _category
    ) external payable returns (uint256 jobId) {
        jobId = ++jobCounter;

        euint128 encBudget = FHE.asEuint128(_budget);
        euint32 encExp = FHE.asEuint32(_experienceRequired);
        euint32 encSkills = FHE.asEuint32(_skillScore);
        euint32 encLoc = FHE.asEuint32(_locationPref);

        Job storage j = jobs[jobId];
        j.employer = msg.sender;
        j.budgetEncrypted = encBudget;
        j.experienceRequired = encExp;
        j.skillScore = encSkills;
        j.locationPref = encLoc;
        j.isActive = true;
        j.escrowAmount = msg.value;
        j.title = _title;
        j.description = _description;
        if (bytes(_category).length > 0) {
            j.category = _category;
        }

        // ACL: grant this contract + employer access to all ciphertexts
        FHE.allowThis(encBudget);
        FHE.allowThis(encExp);
        FHE.allowThis(encSkills);
        FHE.allowThis(encLoc);
        FHE.allow(encBudget, msg.sender);
        FHE.allow(encExp, msg.sender);
        FHE.allow(encSkills, msg.sender);
        FHE.allow(encLoc, msg.sender);

        if (msg.value > 0) {
            emit EscrowFunded(jobId, msg.value);
        }

        emit JobPosted(jobId, msg.sender, _title);
    }

    // ═══════════════════════════════════════════════════════
    //  APPLICATIONS + REFERRALS
    // ═══════════════════════════════════════════════════════

    /// @notice Candidate applies with multi-dimensional encrypted credentials
    function applyToJob(
        uint256 _jobId,
        InEuint128 memory _expectedSalary,
        InEuint32 memory _experienceYears,
        InEuint32 memory _skillScore,
        InEuint32 memory _locationPref
    ) external returns (uint256 applicationId) {
        require(jobs[_jobId].isActive, "HireShield: Job not active");
        require(!candidateApplied[_jobId][msg.sender], "HireShield: Already applied to this job");
        candidateApplied[_jobId][msg.sender] = true;

        applicationId = ++applicationCounter;

        euint128 encSalary = FHE.asEuint128(_expectedSalary);
        euint32 encExp = FHE.asEuint32(_experienceYears);
        euint32 encSkills = FHE.asEuint32(_skillScore);
        euint32 encLoc = FHE.asEuint32(_locationPref);

        Application storage app = applications[applicationId];
        app.candidate = msg.sender;
        app.expectedSalaryEncrypted = encSalary;
        app.experienceYears = encExp;
        app.skillScore = encSkills;
        app.locationPref = encLoc;
        app.jobId = _jobId;

        FHE.allowThis(encSalary);
        FHE.allowThis(encExp);
        FHE.allowThis(encSkills);
        FHE.allowThis(encLoc);
        FHE.allow(encSalary, msg.sender);
        FHE.allow(encExp, msg.sender);
        FHE.allow(encSkills, msg.sender);
        FHE.allow(encLoc, msg.sender);

        jobApplications[_jobId].push(applicationId);
        jobs[_jobId].applicationCount++;

        emit ApplicationSubmitted(applicationId, _jobId, msg.sender);
    }

    /// @notice Apply with a referral (referrer identity encrypted)
    function applyWithReferral(
        uint256 _jobId,
        InEuint128 memory _expectedSalary,
        InEuint32 memory _experienceYears,
        InEuint32 memory _skillScore,
        InEuint32 memory _locationPref,
        address _referrer,
        InEuint32 memory _encryptedReferrerId
    ) external returns (uint256 applicationId) {
        require(jobs[_jobId].isActive, "HireShield: Job not active");
        require(_referrer != address(0), "HireShield: Invalid referrer");
        require(_referrer != msg.sender, "HireShield: Cannot refer yourself");
        require(!candidateApplied[_jobId][msg.sender], "HireShield: Already applied to this job");
        candidateApplied[_jobId][msg.sender] = true;

        applicationId = ++applicationCounter;

        euint128 encSalary = FHE.asEuint128(_expectedSalary);
        euint32 encExp = FHE.asEuint32(_experienceYears);
        euint32 encSkills = FHE.asEuint32(_skillScore);
        euint32 encLoc = FHE.asEuint32(_locationPref);
        euint32 encRefId = FHE.asEuint32(_encryptedReferrerId);

        Application storage app = applications[applicationId];
        app.candidate = msg.sender;
        app.expectedSalaryEncrypted = encSalary;
        app.experienceYears = encExp;
        app.skillScore = encSkills;
        app.locationPref = encLoc;
        app.jobId = _jobId;
        app.referrer = _referrer;

        referrals[applicationId].referrer = _referrer;
        referrals[applicationId].encryptedReferrerId = encRefId;

        FHE.allowThis(encSalary);
        FHE.allowThis(encExp);
        FHE.allowThis(encSkills);
        FHE.allowThis(encLoc);
        FHE.allowThis(encRefId);
        FHE.allow(encSalary, msg.sender);
        FHE.allow(encExp, msg.sender);
        FHE.allow(encSkills, msg.sender);
        FHE.allow(encLoc, msg.sender);

        jobApplications[_jobId].push(applicationId);
        jobs[_jobId].applicationCount++;

        emit ApplicationSubmitted(applicationId, _jobId, msg.sender);
        emit ReferralSubmitted(applicationId, _referrer);
    }

    // ═══════════════════════════════════════════════════════
    //  FHE QUALIFICATION + MATCHING
    // ═══════════════════════════════════════════════════════

    /// @notice Perform multi-dimensional FHE qualification check on encrypted data
    function checkQualification(
        uint256 _jobId,
        uint256 _applicationId
    ) external {
        Application storage app = applications[_applicationId];
        Job storage job = jobs[_jobId];
        require(app.jobId == _jobId, "HireShield: App not for this job");
        require(job.isActive, "HireShield: Job not active");
        require(
            msg.sender == job.employer || msg.sender == cofheNode || msg.sender == owner,
            "HireShield: Only employer or CoFHE node"
        );

        ebool salaryFits = FHE.lte(app.expectedSalaryEncrypted, job.budgetEncrypted);
        ebool experienceMeets = FHE.gte(app.experienceYears, job.experienceRequired);
        ebool skillsMeet = FHE.gte(app.skillScore, job.skillScore);
        ebool locationMatch = FHE.eq(app.locationPref, job.locationPref);

        ebool qualified = FHE.and(
            FHE.and(salaryFits, experienceMeets),
            FHE.and(skillsMeet, locationMatch)
        );

        app.qualificationResult = qualified;
        app.qualificationChecked = true;

        FHE.allowThis(qualified);
        FHE.allow(qualified, app.candidate);
        FHE.allow(qualified, job.employer);

        emit QualificationChecked(_jobId, _applicationId, app.candidate);
    }

    /// @notice Get encrypted qualification result handle (for decryptForView off-chain)
    function getQualificationResult(uint256 _applicationId) external view returns (ebool) {
        Application storage app = applications[_applicationId];
        require(
            msg.sender == app.candidate || msg.sender == jobs[app.jobId].employer,
            "HireShield: Not authorized"
        );
        require(app.qualificationChecked, "HireShield: Not checked yet");
        return app.qualificationResult;
    }

    /// @notice CoFHE node confirms a match — auto-releases signing bonus, mints NFT, updates analytics
    function setMatchResult(
        uint256 _jobId,
        uint256 _applicationId
    ) external onlyCofheNode {
        Application storage app = applications[_applicationId];
        require(app.jobId == _jobId, "HireShield: App not for this job");
        require(app.qualificationChecked, "HireShield: Qualification not checked first");
        require(!app.isMatched, "HireShield: Already matched");
        app.isMatched = true;
        jobs[_jobId].isActive = false;
        jobs[_jobId].hasMatch = true;
        jobMatchedCandidate[_jobId] = app.candidate;

        // Auto-transfer signing bonus to escrow for the matched candidate
        uint256 bonus = jobs[_jobId].escrowAmount;
        if (bonus > 0 && escrowContract != address(0)) {
            address candidate = app.candidate;
            jobs[_jobId].escrowAmount = 0;
            IHireShieldEscrow(escrowContract).fundJobBonus{value: bonus}(_jobId, candidate);
            emit BonusAutoReleased(_jobId, candidate, bonus);
        }

        // Mint soulbound NFT credential
        if (nftContract != address(0)) {
            uint256 tokenId = IHireShieldNFT(nftContract).mintCredential(
                app.candidate, _jobId, _applicationId, jobs[_jobId].employer
            );
            emit CredentialMinted(_jobId, _applicationId, tokenId);
        }

        // Reveal referral if exists
        if (app.referrer != address(0) && !referrals[_applicationId].revealed) {
            referrals[_applicationId].revealed = true;
            emit ReferralRevealed(_applicationId, app.referrer);
        }

        // Update salary analytics for the category
        string memory cat = jobs[_jobId].category;
        if (bytes(cat).length > 0) {
            CategoryAnalytics storage analytics = categoryAnalytics[cat];
            if (analytics.matchCount == 0) {
                analytics.totalSalary = app.expectedSalaryEncrypted;
            } else {
                analytics.totalSalary = FHE.add(analytics.totalSalary, app.expectedSalaryEncrypted);
            }
            FHE.allowThis(analytics.totalSalary);
            FHE.allow(analytics.totalSalary, owner); // Owner can decrypt category benchmarks
            analytics.matchCount++;
        }

        emit MatchFound(_jobId, _applicationId);
    }

    // ═══════════════════════════════════════════════════════
    //  MULTI-ROUND NEGOTIATION
    // ═══════════════════════════════════════════════════════

    /// @notice Candidate submits a counter-offer (re-encrypted salary) — auto re-checks qualification
    function submitCounterOffer(
        uint256 _applicationId,
        InEuint128 memory _newSalary
    ) external {
        Application storage app = applications[_applicationId];
        require(msg.sender == app.candidate, "HireShield: Not candidate");
        require(!app.isMatched, "HireShield: Already matched");
        require(app.negotiationRound < 3, "HireShield: Max negotiation rounds reached");

        Job storage job = jobs[app.jobId];
        euint128 encSalary = FHE.asEuint128(_newSalary);
        app.expectedSalaryEncrypted = encSalary;
        app.negotiationRound++;

        FHE.allowThis(encSalary);
        FHE.allow(encSalary, msg.sender);
        FHE.allow(encSalary, job.employer);

        // Inline auto-recheck: recompute 4D qualification with the new salary
        ebool salaryFits    = FHE.lte(encSalary, job.budgetEncrypted);
        ebool expMeets      = FHE.gte(app.experienceYears, job.experienceRequired);
        ebool skillsMeet    = FHE.gte(app.skillScore, job.skillScore);
        ebool locationMatch = FHE.eq(app.locationPref, job.locationPref);
        ebool qualified     = FHE.and(FHE.and(salaryFits, expMeets), FHE.and(skillsMeet, locationMatch));

        app.qualificationResult = qualified;
        app.qualificationChecked = true;

        FHE.allowThis(qualified);
        FHE.allow(qualified, msg.sender);
        FHE.allow(qualified, job.employer);

        emit NegotiationSubmitted(_applicationId, app.negotiationRound);
        emit QualificationChecked(app.jobId, _applicationId, msg.sender);
    }

    // ═══════════════════════════════════════════════════════
    //  ESCROW MANAGEMENT
    // ═══════════════════════════════════════════════════════

    /// @notice Employer reclaims escrow from an unmatched job (O(1) gas)
    function reclaimEscrow(uint256 _jobId) external {
        Job storage job = jobs[_jobId];
        require(msg.sender == job.employer, "HireShield: Not employer");
        require(!job.isActive, "HireShield: Job still active - deactivate first");
        require(job.escrowAmount > 0, "HireShield: No escrow to reclaim");
        require(!job.hasMatch, "HireShield: Has matched candidate - escrow was released");

        uint256 amount = job.escrowAmount;
        job.escrowAmount = 0;
        (bool success, ) = payable(msg.sender).call{value: amount}("");
        require(success, "HireShield: Transfer failed");

        emit EscrowReclaimed(_jobId, msg.sender, amount);
    }

    /// @notice Employer deactivates a job (required before escrow reclaim)
    function deactivateJob(uint256 _jobId) external {
        Job storage job = jobs[_jobId];
        require(msg.sender == job.employer, "HireShield: Not employer");
        require(job.isActive, "HireShield: Already inactive");
        job.isActive = false;
    }

    /// @notice Employer tops up escrow on an active job
    function topUpEscrow(uint256 _jobId) external payable {
        Job storage job = jobs[_jobId];
        require(msg.sender == job.employer, "HireShield: Not employer");
        require(msg.value > 0, "HireShield: Must send ETH");
        job.escrowAmount += msg.value;
        emit EscrowFunded(_jobId, msg.value);
    }

    /// @notice One-transaction close: deactivate job and reclaim escrow (if no match)
    function closeAndReclaim(uint256 _jobId) external {
        Job storage job = jobs[_jobId];
        require(msg.sender == job.employer, "HireShield: Not employer");
        require(!job.hasMatch, "HireShield: Has matched candidate - use claimBonus");
        require(job.escrowAmount > 0, "HireShield: No escrow to reclaim");

        job.isActive = false;
        uint256 amount = job.escrowAmount;
        job.escrowAmount = 0;
        (bool success, ) = payable(msg.sender).call{value: amount}("");
        require(success, "HireShield: Transfer failed");

        emit EscrowReclaimed(_jobId, msg.sender, amount);
    }

    // ═══════════════════════════════════════════════════════
    //  SALARY BAND ANALYTICS (FHE AGGREGATED)
    // ═══════════════════════════════════════════════════════

    /// @notice Get encrypted total salary for a category (for threshold decryption)
    function getCategoryTotalSalary(string calldata _category) external view returns (euint128) {
        require(categoryAnalytics[_category].matchCount > 0, "HireShield: No data");
        return categoryAnalytics[_category].totalSalary;
    }

    /// @notice Get plaintext match count for a category
    function getCategoryMatchCount(string calldata _category) external view returns (uint256) {
        return categoryAnalytics[_category].matchCount;
    }

    // ═══════════════════════════════════════════════════════
    //  VIEWS + HELPERS
    // ═══════════════════════════════════════════════════════

    function getJobBudgetHandle(uint256 _jobId) external view returns (euint128) {
        require(jobs[_jobId].employer == msg.sender, "Not job owner");
        return jobs[_jobId].budgetEncrypted;
    }

    /// @notice Returns an application's encrypted salary handle (candidate or employer only)
    ///         Use cofhejs sealOutput / decryptForView on the returned handle
    function getApplicationSalaryHandle(uint256 _applicationId) external view returns (euint128) {
        Application storage app = applications[_applicationId];
        require(
            msg.sender == app.candidate || msg.sender == jobs[app.jobId].employer,
            "HireShield: Not authorized"
        );
        return app.expectedSalaryEncrypted;
    }

    function getJob(uint256 _jobId) external view returns (
        address employer,
        bool isActive,
        uint256 escrowAmount,
        uint256 applicationCount,
        string memory title,
        string memory description
    ) {
        Job storage j = jobs[_jobId];
        return (j.employer, j.isActive, j.escrowAmount, j.applicationCount, j.title, j.description);
    }

    function getJobCategory(uint256 _jobId) external view returns (string memory) {
        return jobs[_jobId].category;
    }

    function getJobApplicationIds(uint256 _jobId) external view returns (uint256[] memory) {
        return jobApplications[_jobId];
    }

    function getApplicationReferrer(uint256 _applicationId) external view returns (address, bool) {
        Referral storage ref = referrals[_applicationId];
        return (ref.referrer, ref.revealed);
    }

    /// @notice Matched candidate claims the escrow bonus (O(1) via jobMatchedCandidate)
    function claimBonus(uint256 _jobId) external {
        address matched = jobMatchedCandidate[_jobId];
        require(
            msg.sender == jobs[_jobId].employer ||
            (matched != address(0) && msg.sender == matched),
            "HireShield: Not authorized to claim bonus"
        );
        require(escrowContract != address(0), "HireShield: No escrow configured");
        IHireShieldEscrow(escrowContract).releaseBonus(_jobId);
    }

    /// @notice Allow contract to receive ETH (for escrow refund scenarios)
    receive() external payable {}
}
