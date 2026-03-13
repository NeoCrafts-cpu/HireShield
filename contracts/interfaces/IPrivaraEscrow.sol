// SPDX-License-Identifier: MIT
pragma solidity ^0.8.27;

/**
 * @title IPrivaraEscrow
 * @notice Interface for Privara confidential escrow integration
 * @dev Full implementation uses @reineira-os/sdk on-chain connector
 */
interface IPrivaraEscrow {
    /// @notice Fund escrow for a recipient
    function fundEscrow(address recipient, uint256 amount) external payable;

    /// @notice Release escrowed funds to candidate upon match
    function releaseToCandidate(address candidate, uint256 jobId) external;

    /// @notice Reclaim escrow if no match found
    function reclaimEscrow(uint256 jobId) external;
}
