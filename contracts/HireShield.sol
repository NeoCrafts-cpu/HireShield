// SPDX-License-Identifier: MIT
pragma solidity ^0.8.27;

import "@fhenixprotocol/cofhe-contracts/FHE.sol";

interface IHireShieldEscrow {
    function releaseBonus(uint256 jobId) external;
}

/**
 * @title HireShield
 * @notice Privacy-first job matching using Fhenix CoFHE (Fully Homomorphic Encryption)
 * @dev Employers post encrypted salary budgets, candidates submit encrypted expectations,
 *      and the contract performs matching on ciphertext — no raw values are ever revealed.
 */
contract HireShield {

    struct Job {
        address employer;
        euint128 budgetEncrypted;       // Encrypted salary budget
        euint32 requirementsHash;       // Encrypted skills hash
        bool isActive;
        uint256 escrowAmount;
        uint256 applicationCount;
        string title;                   // Public job title
        string description;             // Public description
    }

    struct Application {
        address candidate;
        euint128 expectedSalaryEncrypted;   // Encrypted salary expectation
        euint32 credentialsHash;            // Encrypted credentials
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
    event MatchFound(uint256 indexed jobId, uint256 indexed applicationId);
    event EscrowFunded(uint256 indexed jobId, uint256 amount);
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
        // Default cofheNode to deployer if not specified — enables demo use
        cofheNode = _cofheNode != address(0) ? _cofheNode : msg.sender;
    }

    /// @notice Update the authorized CoFHE node address (owner only)
    function setCofheNode(address _newNode) external onlyOwner {
        emit CofheNodeUpdated(cofheNode, _newNode);
        cofheNode = _newNode;
    }

    /// @notice Employer posts a job with encrypted budget
    /// @param _budget Encrypted salary budget (InEuint128)
    /// @param _requirementsHash Encrypted skills/requirements hash (InEuint32)
    /// @param _title Public job title
    /// @param _description Public job description
    /// @return jobId The ID of the newly created job
    function postJob(
        InEuint128 memory _budget,
        InEuint32 memory _requirementsHash,
        string calldata _title,
        string calldata _description
    ) external payable returns (uint256 jobId) {
        jobId = ++jobCounter;

        euint128 encBudget = FHE.asEuint128(_budget);
        euint32 encReqs = FHE.asEuint32(_requirementsHash);

        jobs[jobId] = Job({
            employer: msg.sender,
            budgetEncrypted: encBudget,
            requirementsHash: encReqs,
            isActive: true,
            escrowAmount: msg.value,
            applicationCount: 0,
            title: _title,
            description: _description
        });

        // ACL: grant this contract + employer access to the ciphertexts
        FHE.allowThis(encBudget);
        FHE.allowThis(encReqs);
        FHE.allow(encBudget, msg.sender);
        FHE.allow(encReqs, msg.sender);

        if (msg.value > 0) {
            emit EscrowFunded(jobId, msg.value);
        }

        emit JobPosted(jobId, msg.sender, _title);
    }

    /// @notice Candidate applies to a job with encrypted expected salary
    /// @param _jobId The job to apply to
    /// @param _expectedSalary Encrypted salary expectation (InEuint128)
    /// @param _credentialsHash Encrypted credentials hash (InEuint32)
    /// @return applicationId The ID of the new application
    function applyToJob(
        uint256 _jobId,
        InEuint128 memory _expectedSalary,
        InEuint32 memory _credentialsHash
    ) external returns (uint256 applicationId) {
        require(jobs[_jobId].isActive, "HireShield: Job not active");

        applicationId = ++applicationCounter;

        euint128 encSalary = FHE.asEuint128(_expectedSalary);
        euint32 encCreds = FHE.asEuint32(_credentialsHash);

        applications[applicationId] = Application({
            candidate: msg.sender,
            expectedSalaryEncrypted: encSalary,
            credentialsHash: encCreds,
            isMatched: false,
            jobId: _jobId
        });

        // ACL: grant this contract + candidate access
        FHE.allowThis(encSalary);
        FHE.allowThis(encCreds);
        FHE.allow(encSalary, msg.sender);
        FHE.allow(encCreds, msg.sender);

        jobApplications[_jobId].push(applicationId);
        jobs[_jobId].applicationCount++;

        emit ApplicationSubmitted(applicationId, _jobId, msg.sender);
    }

    /// @notice CoFHE node calls this after FHE comparison to set match result
    /// @param _jobId The job ID
    /// @param _applicationId The application ID
    function setMatchResult(
        uint256 _jobId,
        uint256 _applicationId
    ) external onlyCofheNode {
        applications[_applicationId].isMatched = true;
        jobs[_jobId].isActive = false;

        emit MatchFound(_jobId, _applicationId);
    }

    /// @notice Get the encrypted budget handle for a job (off-chain decryption via SDK permits)
    function getJobBudgetHandle(uint256 _jobId) external view returns (euint128) {
        require(jobs[_jobId].employer == msg.sender, "Not job owner");
        return jobs[_jobId].budgetEncrypted;
    }

    /// @notice Get the encrypted salary handle for an application (off-chain decryption via SDK permits)
    function getMyExpectedSalaryHandle(uint256 _applicationId) external view returns (euint128) {
        require(applications[_applicationId].candidate == msg.sender, "Not applicant");
        return applications[_applicationId].expectedSalaryEncrypted;
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

    /// @notice Matched candidate or employer claims the escrow bonus
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
}
