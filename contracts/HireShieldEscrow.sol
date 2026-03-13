// SPDX-License-Identifier: MIT
pragma solidity ^0.8.27;

/**
 * @title HireShieldEscrow
 * @notice Signing bonus escrow — bonuses are auto-locked when jobs are posted and
 *         auto-released to matched candidates when the CoFHE network confirms a match.
 * @dev HireShield contract transfers ETH here on match confirmation. Candidate claims.
 */
contract HireShieldEscrow {
    address public hireshieldContract;
    address public owner;

    // Re-entrancy guard
    uint256 private _locked = 1;
    modifier nonReentrant() {
        require(_locked == 1, "HireShieldEscrow: Reentrant call");
        _locked = 2;
        _;
        _locked = 1;
    }

    mapping(uint256 => address) public jobEscrowRecipient;
    mapping(uint256 => uint256) public jobEscrowAmount;

    event BonusReleased(uint256 indexed jobId, address indexed candidate, uint256 amount);
    event BonusFunded(uint256 indexed jobId, address indexed candidate, uint256 amount);

    constructor(address _hireshield) {
        owner = msg.sender;
        hireshieldContract = _hireshield;
    }

    /// @notice Update the HireShield contract address (for post-deployment linking)
    function setHireShieldContract(address _hireshield) external {
        require(msg.sender == owner, "Only owner");
        hireshieldContract = _hireshield;
    }

    /// @notice Fund a signing bonus — only callable by HireShield on match confirmation
    /// @param jobId The job ID
    /// @param candidate The candidate address to receive the bonus
    function fundJobBonus(uint256 jobId, address candidate) external payable {
        require(msg.sender == hireshieldContract, "Only HireShield");
        require(msg.value > 0, "Must send ETH");
        jobEscrowRecipient[jobId] = candidate;
        jobEscrowAmount[jobId] = msg.value;
        emit BonusFunded(jobId, candidate, msg.value);
    }

    /// @notice Release the signing bonus to the matched candidate
    /// @param jobId The job ID
    function releaseBonus(uint256 jobId) external nonReentrant {
        require(
            msg.sender == hireshieldContract || msg.sender == jobEscrowRecipient[jobId],
            "Only HireShield or recipient"
        );
        address candidate = jobEscrowRecipient[jobId];
        uint256 amount = jobEscrowAmount[jobId];
        require(amount > 0, "No bonus");
        require(candidate != address(0), "No recipient");

        jobEscrowAmount[jobId] = 0;

        (bool success, ) = payable(candidate).call{value: amount}("");
        require(success, "Transfer failed");

        emit BonusReleased(jobId, candidate, amount);
    }
}
