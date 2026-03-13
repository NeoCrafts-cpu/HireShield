// SPDX-License-Identifier: MIT
pragma solidity ^0.8.27;

import "@fhenixprotocol/cofhe-contracts/FHE.sol";

/**
 * @title HireShieldReputation
 * @notice Privacy-preserving reputation scores for candidates — inspired by the FHERC20
 *         confidential token pattern from Fhenix's awesome-fhenix examples.
 *
 * @dev Each candidate holds an encrypted reputation score (euint32 accumulation of ratings).
 *      Employers submit encrypted ratings (1–5) post-hire. Scores are summed using FHE.add.
 *      Candidates prove score >= threshold using FHE.gte without revealing the actual number.
 *      Only the candidate can decrypt (sealOutput) their own score via ACL.
 *
 * Fhenix pattern: FHERC20 — private balances that accumulate via FHE operations.
 */
contract HireShieldReputation {

    address public owner;
    address public hireshieldContract; // Only HireShield can submit ratings

    // Private score per address (euint32, accumulated via FHE.add)
    mapping(address => euint32) private _scores;
    // Has this address received at least one rating?
    mapping(address => bool) public hasScore;
    // Plaintext count of ratings received
    mapping(address => uint256) public ratingCount;
    // Authorized raters per candidate (employer => candidate => authorized)
    // Prevents employers from re-rating the same candidate repeatedly
    mapping(address => mapping(address => bool)) public hasRated;

    event ReputationUpdated(address indexed candidate, uint256 ratingCount);
    event ThresholdChecked(address indexed candidate, address indexed checker);

    modifier onlyOwner() {
        require(msg.sender == owner, "Reputation: Only owner");
        _;
    }

    modifier onlyHireShield() {
        require(
            msg.sender == hireshieldContract || msg.sender == owner,
            "Reputation: Only HireShield"
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
    //  RATING
    // ═══════════════════════════════════════════════════════

    /**
     * @notice Employer submits an encrypted rating (1–5) for a candidate post-hire.
     *         Called by HireShield contract after setMatchResult is confirmed.
     * @param candidate  The candidate's address to rate
     * @param employer   The employer's address (must not have already rated this candidate)
     * @param encRating  Encrypted rating value (1–5), encrypted client-side
     */
    function rateCandidate(
        address candidate,
        address employer,
        InEuint32 memory encRating
    ) external onlyHireShield {
        require(candidate != address(0), "Reputation: Invalid candidate");
        require(!hasRated[employer][candidate], "Reputation: Already rated this candidate");
        hasRated[employer][candidate] = true;

        euint32 rating = FHE.asEuint32(encRating);

        if (!hasScore[candidate]) {
            // First rating: set initial score
            _scores[candidate] = rating;
            hasScore[candidate] = true;
        } else {
            // Accumulate: FHE.add (same pattern as FHERC20 balance updates)
            _scores[candidate] = FHE.add(_scores[candidate], rating);
        }

        // ACL: contract can read, only candidate can sealOutput/decrypt
        FHE.allowThis(_scores[candidate]);
        FHE.allow(_scores[candidate], candidate);
        FHE.allow(_scores[candidate], owner); // Owner for analytics

        ratingCount[candidate]++;
        emit ReputationUpdated(candidate, ratingCount[candidate]);
    }

    // ═══════════════════════════════════════════════════════
    //  SCORE ACCESS (CANDIDATE ONLY)
    // ═══════════════════════════════════════════════════════

    /**
     * @notice Returns the encrypted score handle for a candidate.
     *         Only the candidate themselves or the owner can call this.
     *         Use cofhejs sealOutput/decryptForView on the returned handle.
     */
    function getScore(address candidate) external view returns (euint32) {
        require(
            msg.sender == candidate || msg.sender == owner,
            "Reputation: Not authorized"
        );
        require(hasScore[candidate], "Reputation: No score yet");
        return _scores[candidate];
    }

    // ═══════════════════════════════════════════════════════
    //  THRESHOLD PROOF (WITHOUT REVEALING SCORE)
    // ═══════════════════════════════════════════════════════

    /**
     * @notice Check if a candidate's reputation score meets a minimum threshold.
     *         Neither the score nor the threshold is revealed — only an encrypted bool.
     *         Use cofhejs decryptForView on the returned ebool to see the result.
     *
     * @param candidate    The candidate to evaluate
     * @param encThreshold Encrypted minimum threshold (encrypted by the caller)
     * @return result      Encrypted bool: true if score >= threshold
     *
     * Fhenix pattern: FHE.gte — same op as experience/skill matching in HireShield core.
     */
    function checkThreshold(
        address candidate,
        InEuint32 memory encThreshold
    ) external returns (ebool result) {
        require(hasScore[candidate], "Reputation: No score yet");

        euint32 threshold = FHE.asEuint32(encThreshold);
        result = FHE.gte(_scores[candidate], threshold);

        // Grant ACL to caller so they can decrypt the result
        FHE.allowThis(result);
        FHE.allow(result, msg.sender);

        emit ThresholdChecked(candidate, msg.sender);
    }

    /**
     * @notice Returns the plaintext rating count for a candidate (public info).
     *         Score value stays encrypted — only count is public.
     */
    function getRatingCount(address candidate) external view returns (uint256) {
        return ratingCount[candidate];
    }
}
