// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title IGovernanceVault
 * @dev Interface for the GovernanceVault contract
 */
interface IGovernanceVault {
    struct Proposal {
        bytes32 id;
        address proposer;
        string title;
        string description;
        uint256 forVotes;
        uint256 againstVotes;
        uint256 startTime;
        uint256 endTime;
        bool executed;
        bool cancelled;
    }
    
    function createProposal(string calldata title, string calldata description, uint256 duration) external returns (bytes32);
    function vote(bytes32 proposalId, bool support) external;
    function executeProposal(bytes32 proposalId) external;
    function cancelProposal(bytes32 proposalId) external;
    function getProposal(bytes32 proposalId) external view returns (Proposal memory);
    function getUserVotingPower(address user) external view returns (uint256);
    function hasVoted(bytes32 proposalId, address user) external view returns (bool);
    function getActiveProposals() external view returns (bytes32[] memory);
}
