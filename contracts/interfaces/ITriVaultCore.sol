// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title ITriVaultCore
 * @dev Interface for the TriVaultCore contract
 */
interface ITriVaultCore {
    function recordInteraction(address user, bytes32 actionType) external;
    function distributeFees() external payable;
    function isRegistered(address user) external view returns (bool);
    function getUserInfo(address user) external view returns (bool registered, uint256 registrationTime, uint256 interactionCount);
    function getStats() external view returns (uint256 users, uint256 interactions, uint256 fees);
    function sealVault() external view returns (address);
    function rewardsVault() external view returns (address);
    function achievementVault() external view returns (address);
    function governanceVault() external view returns (address);
}
