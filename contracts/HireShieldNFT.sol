// SPDX-License-Identifier: MIT
pragma solidity ^0.8.27;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title HireShieldNFT — Soulbound Hire Credential
 * @notice Non-transferable ERC-721 minted on a successful FHE match.
 *         Proves "hired" status without revealing salary/credentials.
 */
contract HireShieldNFT is ERC721, Ownable {
    uint256 private _nextTokenId;
    address public hireShieldContract;

    struct Credential {
        uint256 jobId;
        uint256 applicationId;
        address employer;
        uint256 matchTimestamp;
    }

    mapping(uint256 => Credential) public credentials;
    // candidate => tokenId (only one NFT per hire event, but candidates can have multiple)
    mapping(address => uint256[]) public candidateTokens;

    event CredentialMinted(
        uint256 indexed tokenId,
        address indexed candidate,
        uint256 indexed jobId,
        uint256 applicationId
    );

    constructor() ERC721("HireShield Credential", "HSCRED") Ownable(msg.sender) {}

    function setHireShieldContract(address _hireShield) external onlyOwner {
        hireShieldContract = _hireShield;
    }

    function mintCredential(
        address candidate,
        uint256 jobId,
        uint256 applicationId,
        address employer
    ) external returns (uint256 tokenId) {
        require(
            msg.sender == hireShieldContract || msg.sender == owner(),
            "Only HireShield or owner"
        );

        tokenId = ++_nextTokenId;
        _safeMint(candidate, tokenId);

        credentials[tokenId] = Credential({
            jobId: jobId,
            applicationId: applicationId,
            employer: employer,
            matchTimestamp: block.timestamp
        });

        candidateTokens[candidate].push(tokenId);

        emit CredentialMinted(tokenId, candidate, jobId, applicationId);
    }

    function getCandidateTokens(address candidate) external view returns (uint256[] memory) {
        return candidateTokens[candidate];
    }

    /// @notice Soulbound: prevent all transfers (except mint)
    function _update(
        address to,
        uint256 tokenId,
        address auth
    ) internal override returns (address) {
        address from = _ownerOf(tokenId);
        // Allow minting (from == address(0)), block all transfers
        require(from == address(0), "HireShieldNFT: Soulbound, non-transferable");
        return super._update(to, tokenId, auth);
    }

    function tokenURI(uint256 tokenId) public view override returns (string memory) {
        _requireOwned(tokenId);
        Credential memory c = credentials[tokenId];
        // On-chain SVG metadata
        return string(
            abi.encodePacked(
                "data:application/json;base64,",
                _base64Encode(
                    abi.encodePacked(
                        '{"name":"HireShield Credential #',
                        _toString(tokenId),
                        '","description":"Soulbound proof of FHE-verified hire. Job #',
                        _toString(c.jobId),
                        '","image":"data:image/svg+xml;base64,',
                        _base64Encode(_generateSVG(tokenId, c)),
                        '","attributes":[{"trait_type":"Job ID","value":"',
                        _toString(c.jobId),
                        '"},{"trait_type":"Verified","value":"FHE 4D Match"},{"trait_type":"Soulbound","value":"true"}]}'
                    )
                )
            )
        );
    }

    function _generateSVG(uint256 tokenId, Credential memory c) internal pure returns (bytes memory) {
        return abi.encodePacked(
            '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400">'
            '<defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1">'
            '<stop offset="0%" stop-color="#00d4ff"/><stop offset="100%" stop-color="#7c3aed"/>'
            '</linearGradient></defs>'
            '<rect width="400" height="400" rx="20" fill="#0a0a0f"/>'
            '<rect x="10" y="10" width="380" height="380" rx="16" fill="none" stroke="url(#g)" stroke-width="2"/>'
            '<text x="200" y="80" text-anchor="middle" fill="#00d4ff" font-size="24" font-weight="bold">HireShield</text>'
            '<text x="200" y="120" text-anchor="middle" fill="#fff" font-size="16">Verified Hire Credential</text>'
            '<circle cx="200" cy="200" r="50" fill="none" stroke="#00ff88" stroke-width="3"/>'
            '<text x="200" y="208" text-anchor="middle" fill="#00ff88" font-size="28">&#x2713;</text>'
            '<text x="200" y="290" text-anchor="middle" fill="#888" font-size="14">Job #',
            _toString(c.jobId),
            ' | Token #',
            _toString(tokenId),
            '</text>'
            '<text x="200" y="320" text-anchor="middle" fill="#7c3aed" font-size="12">4D FHE Match Verified</text>'
            '<text x="200" y="360" text-anchor="middle" fill="#555" font-size="10">SOULBOUND - NON-TRANSFERABLE</text>'
            '</svg>'
        );
    }

    function _toString(uint256 value) internal pure returns (string memory) {
        if (value == 0) return "0";
        uint256 temp = value;
        uint256 digits;
        while (temp != 0) { digits++; temp /= 10; }
        bytes memory buffer = new bytes(digits);
        while (value != 0) { digits -= 1; buffer[digits] = bytes1(uint8(48 + uint256(value % 10))); value /= 10; }
        return string(buffer);
    }

    // Base64 encoding
    function _base64Encode(bytes memory data) internal pure returns (string memory) {
        bytes memory TABLE = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
        uint256 len = data.length;
        if (len == 0) return "";
        uint256 encodedLen = 4 * ((len + 2) / 3);
        bytes memory result = new bytes(encodedLen + 32);
        assembly {
            let tablePtr := add(TABLE, 1)
            let resultPtr := add(result, 32)
            for { let i := 0 } lt(i, len) {} {
                i := add(i, 3)
                let input := and(mload(add(data, i)), 0xffffff)
                let out := mload(add(tablePtr, and(shr(18, input), 0x3F)))
                out := shl(8, out)
                out := add(out, and(mload(add(tablePtr, and(shr(12, input), 0x3F))), 0xFF))
                out := shl(8, out)
                out := add(out, and(mload(add(tablePtr, and(shr(6, input), 0x3F))), 0xFF))
                out := shl(8, out)
                out := add(out, and(mload(add(tablePtr, and(input, 0x3F))), 0xFF))
                mstore(resultPtr, shl(224, out))
                resultPtr := add(resultPtr, 4)
            }
            switch mod(len, 3)
            case 1 { mstore(sub(resultPtr, 2), shl(240, 0x3d3d)) }
            case 2 { mstore(sub(resultPtr, 1), shl(248, 0x3d)) }
            mstore(result, encodedLen)
        }
        return string(result);
    }
}
