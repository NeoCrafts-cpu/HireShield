// SPDX-License-Identifier: MIT
pragma solidity ^0.8.27;

/**
 * @title HireShieldStaking
 * @notice ETH-staking layer for spam-prevention and accountability.
 *         Employers stake a minimum ETH amount to post jobs. Stake is returned
 *         when they close the job. Stake is slashed if they ignore a matched
 *         candidate for longer than SLASH_WINDOW (14 days).
 *
 * @dev No FHE operations needed here — plain ETH staking.
 *      Integrates with HireShield via events: HireShield emits MatchFound(jobId, appId),
 *      and this contract tracks when each match was confirmed to enforce the window.
 *
 *      Slashed ETH is redistributed to a protocol treasury (owner).
 */
contract HireShieldStaking {

    // ─── Config ──────────────────────────────────────────
    uint256 public constant MIN_STAKE = 0.001 ether;   // Minimum to post a job
    uint256 public constant SLASH_WINDOW = 14 days;    // Ignore window before slashable

    address public owner;
    address public hireshieldContract;
    uint256 public treasury;  // Slashed ETH available for owner withdrawal

    // Re-entrancy guard
    uint256 private _locked = 1;
    modifier nonReentrant() {
        require(_locked == 1, "Staking: Reentrant call");
        _locked = 2;
        _;
        _locked = 1;
    }

    struct Stake {
        uint256 amount;         // ETH staked for this job
        bool active;            // True while job is open
        uint256 matchTime;      // Timestamp when MatchFound was recorded (0 = no match yet)
        bool slashed;           // Has this stake been slashed?
    }

    mapping(address => uint256) public employerBalance;  // Employer's total staked ETH
    mapping(uint256 => Stake)   public jobStakes;        // jobId => Stake

    event Staked(address indexed employer, uint256 jobId, uint256 amount);
    event StakeReturned(address indexed employer, uint256 jobId, uint256 amount);
    event MatchRecorded(uint256 indexed jobId, uint256 timestamp);
    event StakeSlashed(address indexed employer, uint256 jobId, uint256 amount);
    event TreasuryWithdrawn(address indexed owner, uint256 amount);

    modifier onlyOwner() {
        require(msg.sender == owner, "Staking: Only owner");
        _;
    }

    modifier onlyHireShield() {
        require(
            msg.sender == hireshieldContract || msg.sender == owner,
            "Staking: Only HireShield"
        );
        _;
    }

    constructor(address _hireshield) {
        owner = msg.sender;
        hireshieldContract = _hireshield != address(0) ? _hireshield : msg.sender;
    }

    function setHireShieldContract(address _hs) external onlyOwner {
        hireshieldContract = _hs;
    }

    // ═══════════════════════════════════════════════════════
    //  STAKING
    // ═══════════════════════════════════════════════════════

    /**
     * @notice Employer stakes ETH to activate job posting eligibility.
     *         Must stake at least MIN_STAKE per job.
     * @param jobId  The HireShield job ID being staked for
     */
    function stakeForJob(uint256 jobId) external payable {
        require(msg.value >= MIN_STAKE, "Staking: Below minimum stake");
        require(!jobStakes[jobId].active, "Staking: Already staked for this job");

        jobStakes[jobId] = Stake({
            amount: msg.value,
            active: true,
            matchTime: 0,
            slashed: false
        });
        employerBalance[msg.sender] += msg.value;

        emit Staked(msg.sender, jobId, msg.value);
    }

    /**
     * @notice HireShield notifies this contract when a match is confirmed.
     *         Starts the 14-day slash clock.
     * @param jobId  The matched job ID
     */
    function recordMatch(uint256 jobId) external onlyHireShield {
        Stake storage s = jobStakes[jobId];
        require(s.active, "Staking: No active stake for this job");
        require(s.matchTime == 0, "Staking: Match already recorded");
        s.matchTime = block.timestamp;
        emit MatchRecorded(jobId, block.timestamp);
    }

    // ═══════════════════════════════════════════════════════
    //  STAKE RETURN
    // ═══════════════════════════════════════════════════════

    /**
     * @notice Employer reclaims their stake after closing a job with no match.
     *         Job must have no active match (matchTime == 0).
     * @param jobId       The job ID
     * @param employer    The employer address to return stake to
     */
    function returnStake(uint256 jobId, address employer) external onlyHireShield nonReentrant {
        Stake storage s = jobStakes[jobId];
        require(s.active, "Staking: No active stake");
        require(!s.slashed, "Staking: Already slashed");
        require(s.matchTime == 0, "Staking: Match confirmed - cannot return stake during slash window");

        uint256 amount = s.amount;
        s.active = false;
        s.amount = 0;
        employerBalance[employer] = employerBalance[employer] > amount
            ? employerBalance[employer] - amount
            : 0;

        (bool success, ) = payable(employer).call{value: amount}("");
        require(success, "Staking: Transfer failed");

        emit StakeReturned(employer, jobId, amount);
    }

    // ═══════════════════════════════════════════════════════
    //  SLASHING
    // ═══════════════════════════════════════════════════════

    /**
     * @notice Anyone can slash an employer's stake if they ignored a matched candidate
     *         for more than SLASH_WINDOW (14 days) without releasing the bonus.
     * @param jobId  The job ID with an ignored match
     */
    function slash(uint256 jobId) external nonReentrant {
        Stake storage s = jobStakes[jobId];
        require(s.active, "Staking: No active stake");
        require(!s.slashed, "Staking: Already slashed");
        require(s.matchTime > 0, "Staking: No match recorded");
        require(
            block.timestamp >= s.matchTime + SLASH_WINDOW,
            "Staking: Slash window not elapsed"
        );

        uint256 amount = s.amount;
        s.slashed = true;
        s.active = false;
        s.amount = 0;
        treasury += amount;

        emit StakeSlashed(msg.sender, jobId, amount);
    }

    // ═══════════════════════════════════════════════════════
    //  TREASURY
    // ═══════════════════════════════════════════════════════

    /**
     * @notice Owner withdraws accumulated slashed ETH from treasury.
     */
    function withdrawTreasury() external onlyOwner nonReentrant {
        uint256 amount = treasury;
        require(amount > 0, "Staking: Empty treasury");
        treasury = 0;
        (bool success, ) = payable(owner).call{value: amount}("");
        require(success, "Staking: Transfer failed");
        emit TreasuryWithdrawn(owner, amount);
    }

    // ═══════════════════════════════════════════════════════
    //  VIEWS
    // ═══════════════════════════════════════════════════════

    /**
     * @notice Returns true if the employer has staked enough to post a job.
     */
    function isEligible(address employer) external view returns (bool) {
        return employerBalance[employer] >= MIN_STAKE;
    }

    /**
     * @notice Returns true if a job's stake is slashable right now.
     */
    function isSlashable(uint256 jobId) external view returns (bool) {
        Stake storage s = jobStakes[jobId];
        return s.active && !s.slashed && s.matchTime > 0 &&
            block.timestamp >= s.matchTime + SLASH_WINDOW;
    }

    /**
     * @notice Returns how many seconds remain in the slash window for a job.
     *         Returns 0 if already slashable or no match recorded.
     */
    function slashWindowRemaining(uint256 jobId) external view returns (uint256) {
        Stake storage s = jobStakes[jobId];
        if (s.matchTime == 0) return 0;
        uint256 deadline = s.matchTime + SLASH_WINDOW;
        if (block.timestamp >= deadline) return 0;
        return deadline - block.timestamp;
    }

    receive() external payable {}
}
