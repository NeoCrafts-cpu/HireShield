// SPDX-License-Identifier: MIT
pragma solidity ^0.8.27;

import "./interfaces/IPrivaraEscrow.sol";

/**
 * @title HireShieldEscrow
 * @notice Escrow contract for signing bonuses, integrated with Privara confidential payments
 * @dev Holds ETH bonuses and releases them to matched candidates
 */
contract HireShieldEscrow {
    address public hireshieldContract;
    address public privaraEscrow; // Privara contract address on Sepolia

    mapping(uint256 => address) public jobEscrowRecipient;
    mapping(uint256 => uint256) public jobEscrowAmount;

    event BonusReleased(uint256 indexed jobId, address indexed candidate, uint256 amount);
    event BonusFunded(uint256 indexed jobId, address indexed candidate, uint256 amount);

    constructor(address _hireshield, address _privara) {
        hireshieldContract = _hireshield;
        privaraEscrow = _privara;
    }

    /// @notice Fund a signing bonus for a matched candidate
    /// @param jobId The job ID
    /// @param candidate The candidate address to receive the bonus
    function fundJobBonus(uint256 jobId, address candidate) external payable {
        require(msg.value > 0, "Must send ETH");
        jobEscrowRecipient[jobId] = candidate;
        jobEscrowAmount[jobId] = msg.value;
        emit BonusFunded(jobId, candidate, msg.value);
    }

    /// @notice Release the signing bonus to the matched candidate
    /// @param jobId The job ID
    function releaseBonus(uint256 jobId) external {
        require(
            msg.sender == hireshieldContract || msg.sender == jobEscrowRecipient[jobId],
            "Only HireShield or recipient"
        );
        address candidate = jobEscrowRecipient[jobId];
        uint256 amount = jobEscrowAmount[jobId];
        require(amount > 0, "No bonus");
        require(candidate != address(0), "No recipient");

        jobEscrowAmount[jobId] = 0;

        // TODO: integrate Privara SDK for confidential transfer via IPrivaraEscrow
        // For now, direct ETH transfer as fallback
        (bool success, ) = payable(candidate).call{value: amount}("");
        require(success, "Transfer failed");

        emit BonusReleased(jobId, candidate, amount);
    }
}
