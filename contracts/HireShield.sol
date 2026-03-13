// SPDX-License-Identifier: MIT
pragma solidity ^0.8.27;

import "@fhenixprotocol/cofhe-contracts/FHE.sol";

interface IHireShieldEscrow {
    function fundJobBonus(uint256 jobId, address candidate) external payable;
    function releaseBonus(uint256 jobId) external;
}

/**
 * @title HireShield
 * @notice Privacy-first multi-dimensional job matching using Fhenix CoFHE (FHE)
 * @dev All salary, experience, skills, and location data is encrypted client-side.
 *      Matching happens entirely on ciphertext — no raw values are ever revealed on-chain.
 *      Candidates can check qualification without revealing their data to anyone.
 */
contract HireShield {

    struct Job {
        address employer;
        euint128 budgetEncrypted;       // Encrypted max salary budget (USD)
        euint32 experienceRequired;      // Encrypted min years of experience
        euint32 skillScore;              // Encrypted min skill level (1-100)
        euint32 locationPref;            // Encrypted location code
        bool isActive;
        uint256 escrowAmount;           // Signing bonus locked (ETH)
        uint256 applicationCount;
        string title;
        string description;
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
    }

    mapping(uint256 => Job) public jobs;
    mapping(uint256 => Application) public applications;
    mapping(uint256 => uint256[]) public jobApplications; // jobId => applicationIds

    uint256 public jobCounter;
    uint256 public applicationCounter;

    address public escrowContract;
    address public cofheNode; // Authorized FHE computation node
    address public owner;     // Contract owner (deployer)

    event JobPosted(uint256 indexed jobId, address indexed employer, string title);
    event ApplicationSubmitted(uint256 indexed applicationId, uint256 indexed jobId, address indexed candidate);
    event QualificationChecked(uint256 indexed jobId, uint256 indexed applicationId, address indexed candidate);
    event MatchFound(uint256 indexed jobId, uint256 indexed applicationId);
    event EscrowFunded(uint256 indexed jobId, uint256 amount);
    event BonusAutoReleased(uint256 indexed jobId, address indexed candidate, uint256 amount);
    event CofheNodeUpdated(address indexed oldNode, address indexed newNode);

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

    /// @notice Employer posts a job with multi-dimensional encrypted requirements
    /// @param _budget Encrypted max salary budget (InEuint128)
    /// @param _experienceRequired Encrypted min years of experience (InEuint32)
    /// @param _skillScore Encrypted min skill level 1-100 (InEuint32)
    /// @param _locationPref Encrypted location code (InEuint32)
    /// @param _title Public job title
    /// @param _description Public job description
    /// @return jobId The ID of the newly created job
    function postJob(
        InEuint128 memory _budget,
        InEuint32 memory _experienceRequired,
        InEuint32 memory _skillScore,
        InEuint32 memory _locationPref,
        string calldata _title,
        string calldata _description
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

    /// @notice Candidate applies with multi-dimensional encrypted credentials
    /// @param _jobId The job to apply to
    /// @param _expectedSalary Encrypted salary expectation (InEuint128)
    /// @param _experienceYears Encrypted years of experience (InEuint32)
    /// @param _skillScore Encrypted skill level 1-100 (InEuint32)
    /// @param _locationPref Encrypted location code (InEuint32)
    /// @return applicationId The ID of the new application
    function applyToJob(
        uint256 _jobId,
        InEuint128 memory _expectedSalary,
        InEuint32 memory _experienceYears,
        InEuint32 memory _skillScore,
        InEuint32 memory _locationPref
    ) external returns (uint256 applicationId) {
        require(jobs[_jobId].isActive, "HireShield: Job not active");

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

        // ACL: grant this contract + candidate access
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

    /// @notice Perform multi-dimensional FHE qualification check on encrypted data
    /// @dev Compares salary, experience, skills, and location — all on ciphertext.
    ///      Result is an encrypted boolean only the candidate and employer can decrypt.
    /// @param _jobId The job ID
    /// @param _applicationId The application ID
    function checkQualification(
        uint256 _jobId,
        uint256 _applicationId
    ) external {
        Application storage app = applications[_applicationId];
        Job storage job = jobs[_jobId];
        require(app.jobId == _jobId, "HireShield: App not for this job");
        require(job.isActive, "HireShield: Job not active");

        // 4-dimensional FHE comparison on ciphertext
        ebool salaryFits = FHE.lte(app.expectedSalaryEncrypted, job.budgetEncrypted);
        ebool experienceMeets = FHE.gte(app.experienceYears, job.experienceRequired);
        ebool skillsMeet = FHE.gte(app.skillScore, job.skillScore);
        ebool locationMatch = FHE.eq(app.locationPref, job.locationPref);

        // All four criteria must be satisfied
        ebool qualified = FHE.and(
            FHE.and(salaryFits, experienceMeets),
            FHE.and(skillsMeet, locationMatch)
        );

        app.qualificationResult = qualified;
        app.qualificationChecked = true;

        // ACL: only candidate and employer can decrypt the result
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

    /// @notice CoFHE node confirms a match — auto-releases signing bonus to escrow
    /// @param _jobId The job ID
    /// @param _applicationId The application ID
    function setMatchResult(
        uint256 _jobId,
        uint256 _applicationId
    ) external onlyCofheNode {
        applications[_applicationId].isMatched = true;
        jobs[_jobId].isActive = false;

        // Auto-transfer signing bonus to escrow for the matched candidate
        uint256 bonus = jobs[_jobId].escrowAmount;
        if (bonus > 0 && escrowContract != address(0)) {
            address candidate = applications[_applicationId].candidate;
            jobs[_jobId].escrowAmount = 0;
            IHireShieldEscrow(escrowContract).fundJobBonus{value: bonus}(_jobId, candidate);
            emit BonusAutoReleased(_jobId, candidate, bonus);
        }

        emit MatchFound(_jobId, _applicationId);
    }

    /// @notice Get the encrypted budget handle for a job (off-chain decryption via SDK permits)
    function getJobBudgetHandle(uint256 _jobId) external view returns (euint128) {
        require(jobs[_jobId].employer == msg.sender, "Not job owner");
        return jobs[_jobId].budgetEncrypted;
    }

    /// @notice Get public job info (non-encrypted fields)
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

    /// @notice Get all application IDs for a job
    function getJobApplicationIds(uint256 _jobId) external view returns (uint256[] memory) {
        return jobApplications[_jobId];
    }

    /// @notice Matched candidate claims the escrow bonus
    /// @param _jobId The job ID whose escrow bonus to release
    function claimBonus(uint256 _jobId) external {
        uint256[] storage appIds = jobApplications[_jobId];
        bool authorized = msg.sender == jobs[_jobId].employer;

        if (!authorized) {
            for (uint256 i = 0; i < appIds.length; i++) {
                if (applications[appIds[i]].candidate == msg.sender &&
                    applications[appIds[i]].isMatched) {
                    authorized = true;
                    break;
                }
            }
        }

        require(authorized, "HireShield: Not authorized to claim bonus");
        require(escrowContract != address(0), "HireShield: No escrow configured");

        IHireShieldEscrow(escrowContract).releaseBonus(_jobId);
    }

    /// @notice Allow contract to receive ETH (for escrow refund scenarios)
    receive() external payable {}
}
